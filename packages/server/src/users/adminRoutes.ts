import express, { Request } from "express";
import jwt from "jsonwebtoken";
import { isEqual, isObject } from "lodash";
import { Discipline, Role, User as UserType } from "@cooprog/core";
import mongoose, { FilterQuery } from "mongoose";
import {
  COOKIE_OPTIONS,
  getAccessToken,
  getRefreshToken,
} from "../authentication/authenticate";
import { mail, MailKeyType, send } from "../mails";
import { HttpError } from "../middlewares/errorHandler";
import User from "./model";
import Project from "../projects/model";

const router = express.Router();

interface RequestQuery {
  _start: number;
  _end: number;
  _order: "ASC" | "DESC";
  _sort: string;
  id?: string | string[];
  q?: string;
  status?: string;
  role?: string;
  programmingDisciplines?: string;
  "meta.queryType"?: "nearby";
}

interface UpdateUserRequest {
  company: string;
  companyDescription?: string;
  email: string;
  language: string;
  optin: boolean;
  role: Role;
  expireAt?: Date;
  profiles: {
    avatarUrl?: string;
    firstName: string;
    lastName: string;
    role?: string;
    contactInformation: {
      types?: ("email" | "phone")[];
      email?: string;
      phone?: string;
      instructions?: string;
    };
  }[];
  locations: {
    id: string;
    label: string;
    isMain: boolean;
    location: {
      geolocation: {
        type: "Point";
        coordinates: number[];
      };
      address: string;
      data: {
        city?: string;
        municipality?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
      };
    };
  }[];
  status: "awaiting-moderation" | "pending-moderation" | "ok" | "banned";
}

const addHasPassword = (user: any) => {
  user.hasPassword = user.hash !== null && user.hash !== undefined;
  return {
    ...user.toObject(),
    hasPassword: user.hash !== null && user.hash !== undefined,
  };
};

router.get("/", async (request, response) => {
  const {
    _end,
    _order,
    _sort,
    _start,
    id,
    q,
    status,
    role,
    programmingDisciplines,
    "meta.queryType": queryType,
  } = request.query as unknown as RequestQuery;

  let filter: FilterQuery<UserType> = {
    hash: { $ne: null },
  };
  if (queryType === "nearby") {
    const user = await User.findById(id);

    if (!user?.locations?.length) {
      response.json([]);
      return;
    }

    const mainLocation = user.locations.find((loc) => loc.isMain);
    if (!mainLocation?.location?.geolocation?.coordinates) {
      response.json([]);
      return;
    }

    const usersQuery = User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              mainLocation.location.geolocation.coordinates[0],
              mainLocation.location.geolocation.coordinates[1],
            ],
          },
          distanceField: "distance",
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      {
        $match: {
          distance: { $lte: 10 },
          _id: { $ne: user._id },
          role: { $ne: "admin" },
        },
      },
      {
        $sort: { ["distance"]: 1 },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          company: 1,
          role: 1,
          status: 1,
          distance: 1,
          location: 1,
        },
      },
      {
        $facet: {
          paginatedResults: [],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const result = await usersQuery;

    if (result.length !== 0) {
      const { paginatedResults, totalCount: totalCountResult } = result[0];

      response.setHeader("X-Total-Count", totalCountResult[0]?.count || 0);

      response.json(paginatedResults);
      return;
    }
  }

  if (id) {
    if (Array.isArray(id)) {
      filter = {
        _id: {
          $in: id.filter((id) => mongoose.isValidObjectId(id)),
        },
      };
    } else if (isObject(id)) {
      filter = {
        _id: {
          $in: Object.values(id).filter((id) => mongoose.isValidObjectId(id)),
        },
      };
    } else {
      filter = {
        _id: {
          $in: [id].filter((id) => mongoose.isValidObjectId(id)),
        },
      };
    }
  }

  if (q) {
    filter = {
      ...filter,
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    };
  }

  if (status) {
    switch (status) {
      case "invitation-pending":
        filter = {
          ...filter,
          hash: { $exists: false },
          email: { $exists: true },
        };
        break;
      default:
        filter = { ...filter, status };
    }
  }

  // Filtrage par discipline de programmation
  if (programmingDisciplines) {
    const disciplinesArray = Array.isArray(programmingDisciplines)
      ? programmingDisciplines
      : [programmingDisciplines];
    filter = {
      ...filter,
      programmingDisciplines: { $all: disciplinesArray },
    };
  }

  if (role) {
    filter = {
      ...filter,
      role: role,
    };
  }

  let sort = {};
  switch (_sort) {
    case "fullname":
      sort = {
        firstName: _order === "ASC" ? 1 : -1,
        lastName: _order === "ASC" ? 1 : -1,
      };
      break;
    default:
      sort = {
        [_sort]: _order === "ASC" ? 1 : -1,
      };
  }

  const foundUsers = await User.find(filter)
    .populate(["changeLog.createdBy"])
    .sort(sort)
    .skip(_start)
    .limit(_end - _start);

  const userCount = await User.count(filter);

  response.setHeader("X-Total-Count", userCount);

  response.json(foundUsers.map(addHasPassword));
});

router.get("/:id", async (request, response) => {
  const foundUser = await User.findById(request.params.id).populate([
    "changeLog.createdBy",
    "profiles",
  ]);
  if (!foundUser) {
    throw new HttpError(404, "Not found");
  }
  response.json(foundUser);
});

router.post("/:id/resend-invitation", async (request, response) => {
  const user = await User.findById(request.params.id);
  if (!user) {
    throw new HttpError(404, "Not found");
  }
  const currentUser = await User.findById(request.user._id);
  if (!currentUser) {
    throw new HttpError(404, "Not found");
  }
  const currentProfile = currentUser.profiles.find(
    (p) => p._id.toString() === currentUser.profiles[0]._id.toString(),
  );
  if (!currentProfile) {
    throw new HttpError(404, "Not found");
  }
  let project = null;
  let tour = null;
  let mailTemplate: MailKeyType | null = null;

  if (user.role === Role.ARTISTIC_TEAM) {
    mailTemplate = "invite-artistic-team";

    project = await Project.findOne({ users: { $in: [user._id] } });
    if (!project) {
      throw new HttpError(404, "Not found");
    }
  } else if (user.role === Role.DIFFUSION_STRUCTURE) {
    mailTemplate = "invite-diffusion-structure";
    project = await Project.findOne({
      tours: { $elemMatch: { users: { $in: [user._id] } } },
    });
    if (!project) {
      throw new HttpError(404, "Not found");
    }
    tour = project.tours.find((t) =>
      t.users.some((u) => u._id.toString() === user._id.toString()),
    );
    if (!tour) {
      throw new HttpError(404, "Not found");
    }
  }

  if (!mailTemplate) {
    throw new HttpError(400, "Invalid role");
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.RESET_PASSWORD_TOKEN_SECRET,
    {
      expiresIn: eval(process.env.INVITATION_TOKEN_EXPIRY),
    },
  );

  await send({
    to: user.email,
    from: process.env.MAIL_FROM,
    ...(await mail(mailTemplate, user.language || "en", {
      user: user,
      invitingUser: currentUser,
      invitingUserProfile: currentProfile,
      project: project,
      tour: tour,
      link: `${process.env.FRONTEND_URL}/authentication/confirm-account/${token}`,
    })),
  });

  response.json({ success: true });
  return;
});

router.post("/:id/impersonate", async (request, response) => {
  const user = await User.findById(request.params.id);
  if (!user) {
    throw new HttpError(404, "Not found");
  }

  const accessToken = getAccessToken(user);
  const refreshToken = await getRefreshToken(user);

  response.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  response.cookie("accessToken", accessToken, COOKIE_OPTIONS);
  response.send({
    success: true,
    token: accessToken,
    url: `${process.env.FRONTEND_URL}/home`,
  });
});

router.post("/", async (request, response) => {
  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error("Environment variable RESET_PASSWORD_TOKEN_SECRET not set");
  }
  if (!process.env.INVITATION_TOKEN_EXPIRY) {
    throw new Error("Environment variable INVITATION_TOKEN_EXPIRY not set");
  }

  try {
    const userToRegister = new User({
      email: request.body.email,
      company: request.body.company,
      role: request.body.role,
      expireAt: request.body.expireAt,
      language: request.body.language,
      optin: request.body.optin,
      programmingDisciplines: request.body.programmingDisciplines,
      status: "ok",
      changeLog: [],
      profiles: [
        {
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          role: request.body.userRole,
        },
      ],
    });

    await userToRegister.save();

    const payload = {
      id: userToRegister._id,
      reason: "invited-by-admin",
    };

    const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET, {
      expiresIn: eval(process.env.INVITATION_TOKEN_EXPIRY),
    });

    userToRegister.resetPasswordToken = token;
    await userToRegister.save();

    await send({
      to: userToRegister.email,
      from: process.env.MAIL_FROM,
      ...(await mail("init-account", "en", {
        user: userToRegister,
        link: `${process.env.FRONTEND_URL}/authentication/confirm-account/${token}`,
      })),
    });

    response.json(userToRegister);
  } catch (error) {
    //E11000 duplicate key error
    if (error.code === 11000) {
      throw new HttpError(400, "Email already exists");
    }
    throw error;
  }
});

router.put(
  "/:id",
  async (request: Request<{ id: string }, {}, UpdateUserRequest>, response) => {
    const foundUser = await User.findById(request.params.id);
    if (!foundUser) {
      throw new HttpError(404, "Not found");
    }
    let mailToSend: MailKeyType | null = null;
    switch (`${foundUser.status}-${request.body.status}`) {
      case "awaiting-moderation-ok":
      case "pending-moderation-ok":
        mailToSend = "moderation-accepted";
        foundUser.link = "";
        break;
      case "awaiting-moderation-banned":
      case "pending-moderation-banned":
        mailToSend = "moderation-rejected";
        break;
    }

    const changed = [];
    if (foundUser.email !== request.body.email) {
      changed.push({
        field: "Email",
        oldValue: foundUser.email,
        newValue: request.body.email,
      });
      foundUser.email = request.body.email;
    }

    if (foundUser.company !== request.body.company) {
      changed.push({
        field: "Company",
        oldValue: foundUser.company,
        newValue: request.body.company,
      });
      foundUser.company = request.body.company;
    }

    if (foundUser.companyDescription !== request.body.companyDescription) {
      changed.push({
        field: "Company Description",
        oldValue: foundUser.companyDescription,
        newValue: request.body.companyDescription,
      });
      foundUser.companyDescription = request.body.companyDescription;
    }

    if (foundUser.role !== request.body.role) {
      changed.push({
        field: "Role",
        oldValue: foundUser.role,
        newValue: request.body.role,
      });
      foundUser.role = request.body.role;
    }

    if (foundUser.status !== request.body.status) {
      changed.push({
        field: "Status",
        oldValue: foundUser.status,
        newValue: request.body.status,
      });
      foundUser.status = request.body.status;
    }

    // Handle locations array changes
    if (request.body.locations) {
      const newLocations = request.body.locations;
      const oldLocations = foundUser.locations || [];

      // Check if locations have changed
      if (!isEqual(newLocations, oldLocations)) {
        changed.push({
          field: "Locations",
          oldValue: oldLocations,
          newValue: newLocations,
        });
        foundUser.locations = newLocations;
      }
    }

    if (foundUser.language !== request.body.language) {
      changed.push({
        field: "Language",
        oldValue: foundUser.language,
        newValue: request.body.language,
      });
      foundUser.language = request.body.language;
    }

    // Handle profiles array changes
    const maxProfiles = Math.max(
      foundUser.profiles?.length || 0,
      request.body.profiles?.length || 0,
    );

    for (let i = 0; i < maxProfiles; i++) {
      const existingProfile = foundUser.profiles?.[i];
      const newProfile = request.body.profiles?.[i];

      if (!existingProfile && newProfile) {
        // Validate required fields for new profile
        if (
          !newProfile.firstName ||
          !newProfile.lastName ||
          !newProfile.contactInformation?.types ||
          newProfile.contactInformation.types.length === 0 ||
          (newProfile.contactInformation.types.includes("email") &&
            !newProfile.contactInformation.email) ||
          (newProfile.contactInformation.types.includes("phone") &&
            !newProfile.contactInformation.phone)
        ) {
          throw new HttpError(
            400,
            `Profile ${i + 1} is missing required fields`,
          );
        }

        // New profile added
        changed.push({
          field: `Profile ${i + 1}`,
          oldValue: "Not present",
          newValue: `${newProfile.firstName} ${newProfile.lastName}`,
        });
        if (!foundUser.profiles) {
          foundUser.profiles = [];
        }
        foundUser.profiles.push({
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          role: newProfile.role,
          avatarUrl: newProfile.avatarUrl,
          contactInformation: {
            types: newProfile.contactInformation.types,
            email: newProfile.contactInformation.email,
            phone: newProfile.contactInformation.phone,
            instructions: newProfile.contactInformation.instructions,
          },
        });
        continue;
      }

      if (existingProfile && !newProfile) {
        // Profile removed
        changed.push({
          field: `Profile ${i + 1}`,
          oldValue: `${existingProfile.firstName} ${existingProfile.lastName}`,
          newValue: "Removed",
        });
        foundUser.profiles.splice(i, 1);
        continue;
      }

      if (existingProfile && newProfile) {
        // Validate required fields for updated profile
        if (
          !newProfile.firstName ||
          !newProfile.lastName ||
          !newProfile.contactInformation?.types ||
          newProfile.contactInformation.types.length === 0 ||
          (newProfile.contactInformation.types.includes("email") &&
            !newProfile.contactInformation.email) ||
          (newProfile.contactInformation.types.includes("phone") &&
            !newProfile.contactInformation.phone)
        ) {
          throw new HttpError(
            400,
            `Profile ${i + 1} is missing required fields`,
          );
        }

        // Profile updated
        if (existingProfile.firstName !== newProfile.firstName) {
          changed.push({
            field: `Profile ${i + 1} - First name`,
            oldValue: existingProfile.firstName,
            newValue: newProfile.firstName,
          });
          existingProfile.firstName = newProfile.firstName;
        }

        if (existingProfile.lastName !== newProfile.lastName) {
          changed.push({
            field: `Profile ${i + 1} - Last name`,
            oldValue: existingProfile.lastName,
            newValue: newProfile.lastName,
          });
          existingProfile.lastName = newProfile.lastName;
        }

        if (existingProfile.role !== newProfile.role) {
          changed.push({
            field: `Profile ${i + 1} - Role`,
            oldValue: existingProfile.role,
            newValue: newProfile.role,
          });
          existingProfile.role = newProfile.role;
        }

        if (existingProfile.avatarUrl !== newProfile.avatarUrl) {
          changed.push({
            field: `Profile ${i + 1} - Avatar URL`,
            oldValue: existingProfile.avatarUrl,
            newValue: newProfile.avatarUrl,
          });
          existingProfile.avatarUrl = newProfile.avatarUrl;
        }

        // Handle contact information changes
        const existingTypes = existingProfile.contactInformation?.types || [];
        const newTypes = newProfile.contactInformation?.types || [];
        const typesEqual =
          existingTypes.length === newTypes.length &&
          existingTypes.every((t) => newTypes.includes(t)) &&
          newTypes.every((t) => existingTypes.includes(t));
        if (!typesEqual) {
          changed.push({
            field: `Profile ${i + 1} - Preferred contact modes`,
            oldValue: existingTypes.join(", ") || "none",
            newValue: newTypes.join(", ") || "none",
          });
          existingProfile.contactInformation.types = newTypes;
        }

        if (
          existingProfile.contactInformation.email !==
          newProfile.contactInformation.email
        ) {
          changed.push({
            field: `Profile ${i + 1} - Contact email`,
            oldValue: existingProfile.contactInformation.email,
            newValue: newProfile.contactInformation.email,
          });
          existingProfile.contactInformation.email =
            newProfile.contactInformation.email;
        }

        if (
          existingProfile.contactInformation.phone !==
          newProfile.contactInformation.phone
        ) {
          changed.push({
            field: `Profile ${i + 1} - Contact phone`,
            oldValue: existingProfile.contactInformation.phone,
            newValue: newProfile.contactInformation.phone,
          });
          existingProfile.contactInformation.phone =
            newProfile.contactInformation.phone;
        }

        if (
          existingProfile.contactInformation.instructions !==
          newProfile.contactInformation.instructions
        ) {
          changed.push({
            field: `Profile ${i + 1} - Contact instructions`,
            oldValue: existingProfile.contactInformation.instructions,
            newValue: newProfile.contactInformation.instructions,
          });
          existingProfile.contactInformation.instructions =
            newProfile.contactInformation.instructions;
        }
      }
    }

    if (foundUser.expireAt !== request.body.expireAt) {
      changed.push({
        field: "Expire at",
        oldValue: foundUser.expireAt,
        newValue: request.body.expireAt,
      });
      foundUser.expireAt = request.body.expireAt;
    }

    if (foundUser.optin !== request.body.optin) {
      changed.push({
        field: "Optin",
        oldValue: foundUser.optin,
        newValue: request.body.optin,
      });
      foundUser.optin = request.body.optin;
    }

    if ("programmingDisciplines" in request.body) {
      const newProgrammingDisciplines = Array.isArray(
        request.body.programmingDisciplines,
      )
        ? [...request.body.programmingDisciplines]
        : [];

      if (
        !isEqual(newProgrammingDisciplines, foundUser.programmingDisciplines)
      ) {
        changed.push({
          field: "Programming Disciplines",
          oldValue: foundUser.programmingDisciplines,
          newValue: newProgrammingDisciplines,
        });
        foundUser.programmingDisciplines =
          newProgrammingDisciplines as unknown as Discipline[];
      }
    }

    // Gérer les types de structure
    if ("structureTypes" in request.body) {
      const newStructureTypes = Array.isArray(request.body.structureTypes)
        ? [...request.body.structureTypes]
        : [];

      if (!isEqual(newStructureTypes, foundUser.structureTypes)) {
        changed.push({
          field: "Structure Types",
          oldValue: foundUser.structureTypes,
          newValue: newStructureTypes,
        });
        foundUser.structureTypes = newStructureTypes;
      }
    }

    // Gérer les périodes de programmation
    if ("programmingPeriods" in request.body) {
      if (foundUser.programmingPeriods !== request.body.programmingPeriods) {
        changed.push({
          field: "Programming Periods",
          oldValue: foundUser.programmingPeriods,
          newValue: request.body.programmingPeriods,
        });
        foundUser.programmingPeriods = request.body
          .programmingPeriods as string;
      }
    }

    // Gérer les genres de programmation
    if ("programmingGenres" in request.body) {
      if (
        !isEqual(request.body.programmingGenres, foundUser.programmingGenres)
      ) {
        changed.push({
          field: "Programming Genres",
          oldValue: foundUser.programmingGenres,
          newValue: request.body.programmingGenres,
        });
        const typedGenres = request.body.programmingGenres as string[];
        foundUser.programmingGenres = typedGenres;
      }
    }

    if (foundUser.role !== "spectator") {
      foundUser.expireAt = undefined;
    }

    foundUser.changeLog.push({
      changes: changed,
      createdAt: new Date(),
      createdBy: request.user,
    });
    const savedUser = await foundUser.save();
    if (!savedUser) {
      throw new HttpError(404, "Not found");
    }

    if (mailToSend) {
      await send({
        to: foundUser.email,
        from: process.env.MAIL_FROM,
        ...(await mail(mailToSend, foundUser.language || "en", {
          user: savedUser,
        })),
      });
    }

    response.json(savedUser);
  },
);

router.delete("/:id", async (request, response) => {
  const foundUser = await User.findById(request.params.id);
  if (!foundUser) {
    throw new HttpError(404, "Not found");
  }
  await User.deleteOne({ _id: request.params.id });

  response.json(foundUser);
});

export default router;
