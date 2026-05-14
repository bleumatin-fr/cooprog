import { Role } from "@cooprog/core";
import bcrypt from "bcrypt";
import crypto from "crypto";
import express, { Request } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import scmp from "scmp";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { ObjectId } from "mongodb";

import { htmlToRawText, mail, send } from "../mails";
import { sanitizeHtmlForEmail } from "../utils/sanitizeHtml";
import { HttpError } from "../middlewares/errorHandler";
import User, { Token } from "../users/model";
import Project from "../projects/model";
import {
  authenticate,
  checkIsInRole,
  COOKIE_OPTIONS,
  getAccessToken,
  getRefreshToken,
} from "./authenticate";

const router = express.Router();

// Configure multer for disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(
        process.env.UPLOAD_PATH || "uploads",
        "avatars",
      );
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExtension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${fileExtension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

const verifyOldHash = (
  password: string,
  hash: string,
  salt: string,
): boolean => {
  const hashBuffer = crypto.pbkdf2Sync(password, salt, 25000, 512, "sha256");
  return scmp(hashBuffer, Buffer.from(hash, "hex"));
};

const getGeolocation = (coordinates: number[]) => {
  if (!coordinates) return undefined;
  const lat = coordinates.length > 0 ? coordinates[0] : undefined;
  const lon = coordinates.length > 1 ? coordinates[1] : undefined;
  const geolocation =
    lat && lon && !isNaN(lat) && !isNaN(lon)
      ? {
          type: "Point",
          coordinates: [lat, lon],
        }
      : undefined;
  return geolocation;
};

const fixData = (data: any) => {
  // make sure municipality is filled with something
  let municipality = data.municipality;
  if (!municipality) {
    return {
      ...data,
      municipality: data.city || data.town || data.village || data.county,
    };
  }

  return data;
};

router.post("/register", async (request, response) => {
  try {
    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(request.body.password, salt);

    const { coordinates } = request.body;
    const geolocation = getGeolocation(coordinates);
    const location = {
      geolocation: {
        type: "Point",
        coordinates: geolocation?.coordinates || [0, 0],
      } as { type: "Point"; coordinates: number[] },
      address: request.body.address,
      data: fixData(request.body.data),
    };

    const role: Role = request.body.accountType;

    if (![Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM].includes(role)) {
      throw new HttpError(400, "Invalid role");
    }

    const userToRegister = new User({
      email: request.body.email,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      company: request.body.company,
      companyDescription: request.body.companyDescription,
      link: request.body.link,
      language: request.body.language || "en",
      role: role,
      hash: hashPassword,
      locations: [
        {
          id: new ObjectId().toString(),
          label: request.body.address || "Main location",
          isMain: true,
          location,
        },
      ],
      profiles: [
        {
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          contactInformation: request.body.contactInformation,
        },
      ],
      status: role === Role.DIFFUSION_STRUCTURE ? "awaiting-moderation" : "ok",
      programmingDisciplines: request.body.programmingDisciplines || [],
      structureTypes: request.body.structureTypes || [],
      programmingPeriods: request.body.programmingPeriods || "",
      programmingGenres: request.body.programmingGenres || [],
    });

    const savedUser = await userToRegister.save();

    response.json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(400, "Email already in use");
    }
    throw error;
  }
});

router.post("/login", async (request, response) => {
  const { token } = request.body;
  let user = await User.findOne({ email: request.body.email });
  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  let verifiedPassword = await bcrypt.compare(request.body.password, user.hash);
  if (!verifiedPassword && user.salt) {
    // migration of pw encrypted with former system
    verifiedPassword = verifyOldHash(
      request.body.password,
      user.hash,
      user.salt,
    );

    if (!verifiedPassword) {
      throw new HttpError(401, "Unauthorized");
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(request.body.password, salt);
    user.salt = undefined;
    user.hash = hashPassword;
    user = await user.save();
  }
  if (!verifiedPassword) {
    throw new HttpError(401, "Unauthorized");
  }

  if (user.status !== "ok") {
    throw new HttpError(401, "Awaiting moderation");
  }

  if (token) {
    // a user invited someone that already has an account
    // the invited user chose to login instead of creating a new account
    // we need to delete the user created for the invitation and link
    // every entity to the logged in user
    let payload: any = null;
    payload = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);
    const invitedUserId = payload.id;
    const invitedUser = await User.findById(invitedUserId);

    if (!invitedUser) {
      throw new HttpError(401, "Invalid token, user not found");
    }
    if (user.role !== invitedUser.role) {
      throw new HttpError(401, "Invalid token, role mismatch");
    }

    // Update all project references
    await Project.updateMany(
      { "users.user": invitedUserId },
      { $set: { "users.$.user": user._id } },
    );

    await Project.updateMany(
      { "tours.users.user": invitedUserId },
      { $set: { "tours.$[].users.$[user].user": user._id } },
      { arrayFilters: [{ "user.user": invitedUserId }] },
    );

    await Project.updateMany(
      { "tours.schedule.user": invitedUserId },
      { $set: { "tours.$[].schedule.$[schedule].user": user._id } },
      { arrayFilters: [{ "schedule.user": invitedUserId }] },
    );

    // Delete the invited user since we're using the existing account
    await User.findByIdAndDelete(invitedUserId);
  }

  const accessToken = getAccessToken(user);
  const refreshToken = await getRefreshToken(user);

  const now = new Date();

  // do not await here, we want to send the response as fast as possible
  User.findOneAndUpdate(
    { _id: user._id },
    {
      lastLogin: now,
      lastActive: now,
    },
  ).exec();

  response.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  response.cookie("accessToken", accessToken, COOKIE_OPTIONS);
  response.send({ success: true, token: accessToken });
});

router.delete(
  "/me/notifications/:notificationId",
  authenticate,
  async (request, response) => {
    const user = await User.findById(request.user._id).populate([
      { path: "notifications" },
    ]);

    user.notifications = user.notifications.filter(
      (notification) =>
        notification._id.toString() !== request.params.notificationId,
    );

    await user.save();
  },
);

router.get("/me", authenticate, async (request, response) => {
  if (!request.user) {
    throw new HttpError(401, "Unauthorized");
  }
  const user = await User.findById(request?.user?._id).populate([
    { path: "notifications" },
    {
      path: "following",
      select: "_id firstName lastName company",
    },
  ]);

  response.send(user);
});

router.put("/me", authenticate, async (request, response) => {
  const user = await User.findById(request.user._id).populate([
    { path: "notifications" },
    { path: "following", select: "_id" },
  ]);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (request.body.password && request.body.formerPassword) {
    let verifiedPassword = await bcrypt.compare(
      request.body.formerPassword,
      user.hash,
    );
    if (!verifiedPassword) {
      throw new HttpError(401, "Unauthorized");
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(request.body.password, salt);
    user.hash = hashPassword;
  } else {
    if (request.body.company !== user.company) {
      user.company = request.body.company;
    }
    if (request.body.email !== user.email) {
      user.email = request.body.email;
    }
    if (request.body.companyDescription !== user.companyDescription) {
      user.companyDescription = request.body.companyDescription;
    }
    if (request.body.locations) {
      // Clean locations data to remove any _id fields that shouldn't be there
      const cleanedLocations = request.body.locations.map((location: any) => {
        const { _id, ...cleanLocation } = location;
        return cleanLocation;
      });
      user.locations = cleanedLocations;
      user.markModified("locations");
    }

    response.send(await user.save());
  }
});

router.post("/recover", async (request, response) => {
  const user = await User.findOne({
    email: new RegExp(`^${request.body.email}$`, "i"),
  });

  if (!user) {
    // always return success, even if the email is not registered
    // to prevent email enumeration
    response.send({ success: true });
    return;
  }

  const payload = {
    id: user._id,
    reason: "recover",
  };
  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error("Environment variable RESET_PASSWORD_TOKEN_SECRET not set");
  }
  if (!process.env.RESET_PASSWORD_TOKEN_EXPIRY) {
    throw new Error("Environment variable RESET_PASSWORD_TOKEN_EXPIRY not set");
  }

  const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: eval(process.env.RESET_PASSWORD_TOKEN_EXPIRY),
  });

  user.resetPasswordToken = token;
  await user.save();

  await send({
    to: user.email,
    from: process.env.MAIL_FROM,
    ...(await mail("recover", user.language || "en", {
      user,
      link: `${process.env.FRONTEND_URL}/authentication/reset-password/${token}`,
    })),
  });

  response.send({ success: true, user });

  return;
});

router.get("/invite/:token", async (request, response) => {
  const { token } = request.params;
  let user = await User.findOne(
    { resetPasswordToken: token },
    {
      email: 1,
      _id: 1,
      language: 1,
      firstName: 1,
      lastName: 1,
      company: 1,
      link: 1,
    },
  );

  try {
    const payload = jwt.verify(
      token,
      process.env.RESET_PASSWORD_TOKEN_SECRET,
    ) as { id?: string };
    if (payload.id) {
      user = await User.findById(payload.id, {
        email: 1,
        _id: 1,
        language: 1,
        company: 1,
        link: 1,
        locations: 1,
        profiles: 1,
        resetPasswordToken: 1,
      });
    }
    response.send({ user, payload });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      response.status(401).send({ error: "Token expired" });
    } else {
      response.status(401).send({ error: "Invalid token" });
    }
  }
});

router.post("/reset-password", async (request, response) => {
  const {
    token: resetPasswordToken,
    user: userData,
    password: newPassword,
  } = request.body;
  const user = await User.findOne({ resetPasswordToken });

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  if (user.status !== "ok") {
    throw new HttpError(401, "Awaiting moderation");
  }

  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error("Environment variable RESET_PASSWORD_TOKEN_SECRET not set");
  }

  try {
    let payload: any = null;
    payload = jwt.verify(
      resetPasswordToken,
      process.env.RESET_PASSWORD_TOKEN_SECRET,
    );
    if (payload.id !== user._id.toString()) {
      throw new HttpError(401, "Invalid token");
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(
      newPassword || userData?.password,
      salt,
    );
    user.hash = hashPassword;
    user.resetPasswordToken = undefined;
    if (userData) {
      user.programmingDisciplines = userData.programmingDisciplines;
      user.email = userData.email;

      if (userData.firstName && userData.lastName) {
        if (!user.profiles || !user.profiles.length) {
          user.profiles = [];
        }
        user.profiles[0].firstName = userData.firstName;
        user.profiles[0].lastName = userData.lastName;
        user.profiles[0].role = userData.role;
        user.profiles[0].contactInformation = userData.contactInformation;
      }
      user.company = userData.company;
      user.companyDescription = userData.companyDescription;
      user.link = userData.link;
      user.structureTypes = userData.structureTypes;
      user.programmingGenres = userData.programmingGenres;
      user.programmingPeriods = userData.programmingPeriods;

      if (userData.place) {
        const geolocation = getGeolocation([
          userData.place.lon,
          userData.place.lat,
        ]);
        const location = {
          geolocation: {
            type: "Point",
            coordinates: geolocation?.coordinates || [0, 0],
          } as { type: "Point"; coordinates: number[] },
          address: userData.place?.display_name,
          data: userData.place?.address,
        };
        user.locations = [
          {
            _id: new ObjectId().toString(),
            label: userData.place?.display_name || "Main location",
            isMain: true,
            location,
          },
        ];
        user.markModified("locations");
      }
    }

    await user.save();

    response.send({ success: true, user });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new HttpError(401, "Token expired");
    }
    throw error;
  }
});

router.post("/invite", authenticate, async (request, response) => {
  checkIsInRole(Role.ADMIN, Role.DIFFUSION_STRUCTURE)(request, response);
  const {
    profileId,
    emails,
    customMessage,
  }: { profileId: string | null; emails: string[]; customMessage?: string } =
    request.body;

  const user = await User.findById(request.user._id);

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const profile = user.profiles.find((p) => p._id.toString() === profileId);

  if (!profile) {
    throw new HttpError(400, "Profile not found");
  }

  if (!emails.length) {
    throw new HttpError(400, "Emails are required");
  }

  try {
    for (let email of emails) {
      await send({
        to: email,
        from: process.env.MAIL_FROM,
        ...(await mail("invite-people", user.language || "en", {
          invitingUser: user,
          invitingUserProfile: profile,
          link: process.env.FRONTEND_URL,
          ...(customMessage
            ? {
                message: {
                  html: sanitizeHtmlForEmail(customMessage),
                  raw: htmlToRawText(sanitizeHtmlForEmail(customMessage)),
                },
              }
            : {}),
        })),
      });
    }
    response.send({ success: true });
  } catch (error) {
    throw error;
  }
});

interface SendMessageRequestBody {
  subject: string;
  message: string;
  url: string;
  email?: string;
}

router.post(
  "/send-message",
  async (request: Request<{}, {}, SendMessageRequestBody>, response) => {
    const { subject, message, url } = request.body;
    try {
      let user: Partial<{
        email: string;
        firstName: string;
        lastName: string;
        company: string;
      }> = request.user;
      if (!user) {
        user = {
          email: request.body.email || "No email",
          firstName: "Anonymous",
          lastName: "visitor",
          company: "",
        };
      }

      await send({
        to: process.env.MAIL_TO,
        from: process.env.MAIL_FROM,
        ...(await mail("send-message", "en", {
          subject,
          message,
          url,
          user,
        })),
      });
      response.send({ success: true });
    } catch (error) {
      throw error;
    }
  },
);

interface SetLanguageRequestBody {
  language: string;
}
router.post(
  "/set-language",
  async (request: Request<{}, {}, SetLanguageRequestBody>, response) => {
    const { language } = request.body;
    try {
      const user = await User.findById(request.user._id);
      if (!user) {
        throw new HttpError(401, "Unauthorized");
      }
      const languages = ["en", "fr"];
      if (!languages.includes(language)) {
        throw new HttpError(400, "Language not available");
      }
      user.language = language;
      await user.save();
      response.send({ success: true });
    } catch (error) {
      throw error;
    }
  },
);

router.post("/refresh", async (request, response, next) => {
  const { signedCookies = {} } = request;
  const { refreshToken } = signedCookies;

  if (!refreshToken) {
    throw new HttpError(401, "Unauthorized");
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Environment variable REFRESH_TOKEN_SECRET not set");
  }

  const payload: any = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const userId = payload._id;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const token = await Token.find({
    value: refreshToken,
    user: user._id,
  });
  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  const newToken = getAccessToken(user);
  const newRefreshToken = await getRefreshToken(user);

  // do not await here, we want to send the response as fast as possible
  User.findOneAndUpdate(
    { _id: user._id },
    {
      inactivityWarningSent: false,
      lastActive: new Date(),
    },
  ).exec();

  response.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
  response.send({ success: true, token: newToken });
});

router.get("/logout", async (request, response, next) => {
  const { signedCookies = {} } = request;
  const { refreshToken } = signedCookies;

  if (!request.user) {
    throw new Error("No user given");
  }

  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const token = await Token.findOne({
    value: refreshToken,
    user: user._id,
  });

  if (token) {
    await token.remove();
  }

  response.clearCookie("refreshToken", COOKIE_OPTIONS);
  response.send({ success: true });
});

router.post("/me/profiles", authenticate, async (request, response) => {
  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const { firstName, lastName, role, contactInformation } = request.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !contactInformation?.types ||
    contactInformation.types.length === 0 ||
    (contactInformation.types.includes("email") && !contactInformation.email) ||
    (contactInformation.types.includes("phone") && !contactInformation.phone)
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  // Add new profile to user
  user.profiles.push({
    firstName,
    lastName,
    role,
    contactInformation,
  });

  await user.save();
  response.json(user);
});

router.put(
  "/me/profiles/:profileId",
  authenticate,
  async (request, response) => {
    const user = await User.findById(request.user._id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const { firstName, lastName, role, contactInformation } = request.body;
    const profileId = request.params.profileId;

    // Find the profile to update
    const profileIndex = user.profiles.findIndex(
      (p) => p._id.toString() === profileId,
    );

    if (profileIndex === -1) {
      throw new HttpError(404, "Profile not found");
    }

    // Update the profile
    user.profiles[profileIndex] = {
      ...user.profiles[profileIndex],
      firstName,
      lastName,
      role,
      contactInformation,
    };

    await user.save();
    response.json(user);
  },
);

router.delete(
  "/me/profiles/:profileId",
  authenticate,
  async (request, response) => {
    const user = await User.findById(request.user._id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const profileId = request.params.profileId;

    // Remove the profile
    user.profiles = user.profiles.filter((p) => p._id.toString() !== profileId);

    await user.save();
    response.json(user);
  },
);

router.post(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  async (request, response) => {
    try {
      if (!request.file) {
        throw new HttpError(400, "No file uploaded");
      }

      // Validate file size
      if (request.file.size > 5 * 1024 * 1024) {
        throw new HttpError(400, "File size exceeds 5MB limit");
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(request.file.mimetype)) {
        throw new HttpError(
          400,
          "Invalid file type. Only JPEG, PNG and GIF are allowed.",
        );
      }

      // Validate file dimensions (optional)
      const metadata = await sharp(request.file.path).metadata();
      if (metadata.width > 2000 || metadata.height > 2000) {
        throw new HttpError(
          400,
          "Image dimensions too large. Maximum size is 2000x2000 pixels.",
        );
      }

      // Resize and optimize the image
      const optimizedPath = path.join(
        path.dirname(request.file.path),
        `optimized-${path.basename(request.file.path)}`,
      );

      try {
        await sharp(request.file.path)
          .resize(400, 400, {
            fit: "cover",
            position: "center",
          })
          .png({ quality: 80 })
          .toFile(optimizedPath);
      } catch (error) {
        // Clean up the original file if optimization fails
        fs.unlinkSync(request.file.path);
        throw new HttpError(
          500,
          "Failed to process image. Please try a different image.",
        );
      }

      // Delete the original file
      fs.unlinkSync(request.file.path);

      // Update user with new avatar URL and set avatarChangedAt timestamp
      const user = await User.findByIdAndUpdate(
        request.user._id,
        {
          avatarUrl: `/avatars/${path.basename(optimizedPath)}`,
          avatarChangedAt: new Date(), // Add timestamp when avatar changes
        },
        { new: true },
      );

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      response.json({
        avatarUrl: `/api/users/${user._id}/avatar`,
        avatarChangedAt: user.avatarChangedAt, // Include the timestamp in the response
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      if (error instanceof HttpError) {
        throw error;
      }
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          throw new HttpError(400, "File size exceeds 5MB limit");
        }
        throw new HttpError(400, error.message);
      }
      throw new HttpError(
        500,
        "Failed to upload avatar. Please try again later.",
      );
    }
  },
);

// Nouvelle route pour mettre à jour les champs sans créer d'enregistrements dans l'historique
router.put("/me/update-fields", authenticate, async (request, response) => {
  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Mise à jour des champs, sans créer d'entrée dans l'historique
  const updateFields = [
    "programmingDisciplines",
    "structureTypes",
    "programmingPeriods",
    "programmingGenres",
  ];

  for (const field of updateFields) {
    if (request.body[field] !== undefined) {
      if (field === "programmingDisciplines") {
        user.programmingDisciplines = Array.isArray(
          request.body.programmingDisciplines,
        )
          ? [...request.body.programmingDisciplines]
          : [];
        user.markModified("programmingDisciplines");
      } else if (field === "structureTypes") {
        user.structureTypes = Array.isArray(request.body.structureTypes)
          ? [...request.body.structureTypes]
          : [];
        user.markModified("structureTypes");
      } else if (field === "programmingPeriods") {
        user.programmingPeriods = request.body.programmingPeriods || "";
        user.markModified("programmingPeriods");
      } else if (field === "programmingGenres") {
        user.programmingGenres = request.body.programmingGenres;
        user.markModified("programmingGenres");
      }
    }
  }

  await user.save();
  response.send(user);
});

export default router;
