import {
  User as UserType,
  Role,
  NotificationType,
  Discipline,
  Location,
} from "@cooprog/core";
import express, { Request } from "express";
import { Feature, Point } from "geojson";
import { ObjectId } from "mongodb";
import Supercluster from "supercluster";
import { authenticate, checkIsInRole } from "../authentication/authenticate";
import { HttpError } from "../middlewares/errorHandler";
import Project from "../projects/model";
import User from "./model";

import fs from "fs";
import { FilterQuery } from "mongoose";
import path from "path";
import { getSortDirection, getSortField } from "../projects/publicRoutes";
import sendNotification from "./sendNotification";
import mongoose from "mongoose";

const router = express.Router();

interface RequestQuery {
  q?: string;
  _id?: string;
  limit?: string;
  userId?: string;
  sort?: string;
  role?: Role[] | Role;
  following?: boolean;
  followers?: boolean;
  distanceMax?: string;
  offset?: string;
  email?: string[] | string;
  notIds?: string[] | string;
  zoom?: number;
  discipline?: string;
  genre?: string[] | string;
  genres?: string[] | string;
  structureTypes?: string[] | string;
  countries?: string[] | string;
  regions?: string[] | string;
  cities?: string[] | string;
}

const diacriticInsensitiveRegex = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/a/g, "[a,á,à,ä,â]")
    .replace(/A/g, "[A,a,á,à,ä,â]")
    .replace(/e/g, "[e,é,ë,è]")
    .replace(/E/g, "[E,e,é,ë,è]")
    .replace(/i/g, "[i,í,ï,ì]")
    .replace(/I/g, "[I,i,í,ï,ì]")
    .replace(/o/g, "[o,ó,ö,ò]")
    .replace(/O/g, "[O,o,ó,ö,ò]")
    .replace(/u/g, "[u,ü,ú,ù]")
    .replace(/U/g, "[U,u,ü,ú,ù]");
};

const addAccessInformation = (connectedUser: UserType) => (user: UserType) => {
  const accessInformation = {
    isFollowing: (connectedUser.following || []).some(
      (following) => following._id.toString() === user._id.toString(),
    ),
    isFollower: (user.following || []).some(
      (following) => following._id.toString() === connectedUser._id.toString(),
    ),
    isSelf: connectedUser._id.toString() === user._id.toString(),
  };

  user.accessInformation = accessInformation;
};

// Paris - used as fallback when user has no locations
const PARIS_LOCATION: Location = {
  geolocation: {
    type: "Point",
    coordinates: [2.3522, 48.8566],
  },
  address: "Paris",
  data: {},
};

const getMainLocation = (user: any): Location => {
  const main = user.locations?.find((loc: any) => loc.isMain);
  if (!main) {
    if (user.locations?.length) {
      return user.locations[0].location;
    }
    return PARIS_LOCATION;
  }
  return main.location;
};

const getMarkers = async (filter: any, user: UserType, zoom: number) => {
  const mainLocation = getMainLocation(user);
  const allUsers = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [
            mainLocation.geolocation.coordinates[0],
            mainLocation.geolocation.coordinates[1],
          ],
        },
        distanceField: "distance",
        spherical: true,
        distanceMultiplier: 0.001,
      },
    },
    {
      $match: filter,
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        company: 1,
        distance: 1,
        locations: 1,
      },
    },
  ]);

  const index = new Supercluster({
    radius: 100,
    extent: 512,
    maxZoom: 9,
    minPoints: 1,
    reduce: (accumulated, props) => {
      if (!props.userIds) {
        return;
      }
      props.userIds.forEach((userId: string, index: number) => {
        if (
          accumulated.userIds.some((accUserId: any) => {
            return accUserId.toString() === userId.toString();
          })
        ) {
          return;
        }
        accumulated.userIds = [...accumulated.userIds, userId];
      });
    },
  });

  allUsers.forEach(addAccessInformation(user));

  const features: Feature<Point>[] = allUsers
    .map((currentUser) => {
      const hasMainLocation = currentUser.locations?.some(
        (loc: any) => loc.isMain,
      );
      if (!hasMainLocation) {
        return null;
      }
      return {
        type: "Feature" as const,
        properties: {
          userIds: [currentUser._id],
          ...currentUser,
        },
        geometry: getMainLocation(currentUser).geolocation,
      };
    })
    .filter((o) => !!o);
  index.load(features);

  const clusters = index.getClusters([-180, -85, 180, 85], zoom);

  return clusters;
};

router.get(
  "/",
  authenticate,
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    const {
      q,
      _id,
      limit,
      offset,
      role,
      sort,
      following,
      followers,
      distanceMax,
      email,
      notIds,
      zoom,
      discipline,
      genre,
      genres,
      structureTypes,
      countries,
      regions,
      cities,
    } = request.query;

    if (!request.user) {
      throw new HttpError(401, "Unauthorized");
    }
    const isSearchingForSelf =
      request.query._id === request.user._id.toString();
    const isSearchingForSpecificUser =
      (!!q || !!_id) && !!limit && parseInt(limit) <= 8;
    const isSearchingForSpecificUserWithQuery = !!q && q.length >= 5;

    if (
      request.user.role === Role.ARTISTIC_TEAM &&
      !isSearchingForSelf &&
      !isSearchingForSpecificUser &&
      !isSearchingForSpecificUserWithQuery
    ) {
      response.setHeader("X-Total-Count", `0/0`);
      response.json({
        users: [],
        markers: [],
      });
      return;
      // throw new HttpError(401, "Unauthorized");
    }

    let filter: FilterQuery<UserType> = {
      status: "ok",
      hash: { $ne: null },
    };

    let totalCountWithoutFilters = await User.count(filter);

    if (request.query._id && request.query._id !== "undefined") {
      if (mongoose.isValidObjectId(request.query._id)) {
        filter = {
          _id: new ObjectId(request.query._id),
        };
      } else {
        filter = {
          email: request.query._id,
        };
      }
    } else {
      if (role) {
        if (Array.isArray(role)) {
          filter = {
            ...filter,
            role: { $in: role },
          };
        } else {
          filter = {
            ...filter,
            role: role,
          };
        }
      }
      if (discipline) {
        filter = {
          ...filter,
          programmingDisciplines: discipline,
        };
      }

      totalCountWithoutFilters = await User.count(filter);

      if (q) {
        filter = {
          ...filter,
          $or: [
            {
              firstName: {
                $regex: diacriticInsensitiveRegex(q),
                $options: "i",
              },
            },
            {
              lastName: { $regex: diacriticInsensitiveRegex(q), $options: "i" },
            },
            {
              company: { $regex: diacriticInsensitiveRegex(q), $options: "i" },
            },
            {
              email: { $regex: diacriticInsensitiveRegex(q), $options: "i" },
            },
          ],
        };
      }

      if (notIds) {
        if (typeof notIds === "string") {
          filter = {
            ...filter,
            _id: { $nin: [notIds] },
          };
        } else {
          filter = {
            ...filter,
            _id: { $nin: notIds },
          };
        }
      }

      if (genre) {
        if (Array.isArray(genre)) {
          filter = {
            ...filter,
            programmingGenres: { $in: genre },
          };
        } else {
          filter = {
            ...filter,
            programmingGenres: genre,
          };
        }
      }

      if (genres) {
        if (Array.isArray(genres)) {
          filter = {
            ...filter,
            programmingGenres: { $in: genres },
          };
        } else {
          filter = {
            ...filter,
            programmingGenres: genres,
          };
        }
      }

      if (structureTypes) {
        if (Array.isArray(structureTypes)) {
          filter = {
            ...filter,
            structureTypes: { $in: structureTypes },
          };
        } else {
          filter = {
            ...filter,
            structureTypes: structureTypes,
          };
        }
      }

      if (countries) {
        const countryValues = Array.isArray(countries) ? countries : [countries];
        filter = {
          ...filter,
          $and: [
            ...(filter.$and || []),
            {
              $or: countryValues.map((country) => ({
                "locations.location.data.country": {
                  $regex: diacriticInsensitiveRegex(country),
                  $options: "i",
                },
              })),
            },
          ],
        };
      }

      if (regions) {
        const regionValues = Array.isArray(regions) ? regions : [regions];
        filter = {
          ...filter,
          $and: [
            ...(filter.$and || []),
            {
              $or: regionValues.flatMap((region) => {
                const pattern = diacriticInsensitiveRegex(region);
                return [
                  {
                    "locations.location.data.state": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                  {
                    "locations.location.data.county": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                ];
              }),
            },
          ],
        };
      }

      if (cities) {
        const cityValues = Array.isArray(cities) ? cities : [cities];
        filter = {
          ...filter,
          $and: [
            ...(filter.$and || []),
            {
              $or: cityValues.flatMap((city) => {
                const pattern = diacriticInsensitiveRegex(city);
                return [
                  {
                    "locations.location.data.city": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                  {
                    "locations.location.data.town": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                  {
                    "locations.location.data.village": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                  {
                    "locations.location.data.municipality": {
                      $regex: pattern,
                      $options: "i",
                    },
                  },
                ];
              }),
            },
          ],
        };
      }

      if (email) {
        if (Array.isArray(email)) {
          filter = {
            ...filter,
            email: { $in: email },
          };
        } else {
          filter = {
            ...filter,
            email: { $regex: diacriticInsensitiveRegex(email), $options: "i" },
          };
        }
      }

      if (following) {
        filter = {
          ...filter,
          _id: { $in: [request.user.following] },
        };
      }
      if (followers) {
        filter = {
          ...filter,
          following: request.user._id,
        };
      }

      if (distanceMax && !isNaN(parseInt(distanceMax))) {
        const maxRange = parseInt(distanceMax);

        filter = {
          ...filter,
          distance: {
            $lte: maxRange,
          },
        };
      }
    }

    console.log("USERS", JSON.stringify(filter));

    const sortField = getSortField(sort);
    const sortDirection = getSortDirection(sort);

    const markers = await getMarkers(filter, request.user, zoom || 5);

    const userIds = markers.reduce((acc, marker) => {
      if (marker.properties.userIds) {
        return [...acc, ...marker.properties.userIds];
      }
      return acc;
    }, [] as string[]);

    const mainLocation = getMainLocation(request.user);

    const usersQuery = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [
              mainLocation.geolocation.coordinates[0],
              mainLocation.geolocation.coordinates[1],
            ],
          },
          distanceField: "distance",
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      {
        $match: {
          _id: {
            $in: userIds,
          },
        },
      },
      {
        $lookup: {
          from: Project.collection.name,
          localField: "_id",
          foreignField: "users.user",
          as: "projects",
        },
      },
      {
        $addFields: {
          projectCount: { $size: "$projects" },
        },
      },
      {
        $lookup: {
          from: Project.collection.name,
          localField: "_id",
          foreignField: "tours.users.user",
          as: "userProjects",
        },
      },
      { $unwind: { path: "$userProjects", preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: "$userProjects.tours",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userProjects.tours.users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          profiles: { $first: "$profiles" },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          company: { $first: "$company" },
          companyDescription: { $first: "$companyDescription" },
          locations: { $first: "$locations" },
          distance: { $first: "$distance" },
          color: { $first: "$color" },
          role: { $first: "$role" },
          programmingDisciplines: { $first: "$programmingDisciplines" },
          programmingGenres: { $first: "$programmingGenres" },
          programmingPeriods: { $first: "$programmingPeriods" },
          following: { $first: "$following" },
          projects: { $first: "$projects" },
          projectCount: { $first: "$projectCount" },
          contactInformation: { $first: "$contactInformation" },
          avatarUrl: { $first: "$avatarUrl" },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          company: 1,
          companyDescription: 1,
          locations: 1,
          distance: 1,
          color: 1,
          role: 1,
          programmingDisciplines: 1,
          programmingGenres: 1,
          programmingPeriods: 1,
          projectCount: 1,
          contactInformation: 1,
          profiles: 1,
          avatarUrl: 1,
        },
      },
      {
        $sort: { [sortField]: sortDirection },
      },
      {
        $facet: {
          paginatedResults: !isNaN(parseInt(limit))
            ? [
                { $skip: parseInt(offset || "0") },
                { $limit: parseInt(limit || "1") },
              ]
            : [],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    let users: UserType[] = [];
    let totalCount: number = 0;

    if (usersQuery.length !== 0) {
      const { paginatedResults, totalCount: totalCountResult } = usersQuery[0];
      users = paginatedResults;
      totalCount = totalCountResult[0]?.count || 0;
    }

    await User.populate(users, [
      {
        path: "following",
        select: "_id firstName lastName company",
      },
    ]);

    users.forEach(addAccessInformation(request.user));
    users.forEach((user) => {
      if (user.avatarUrl) {
        user.avatarUrl = `/api/users/${user._id}/avatar`;
      }
    });

    response.setHeader(
      "X-Total-Count",
      `${totalCount}/${totalCountWithoutFilters || 0}`,
    );

    response.json({
      users,
      markers,
    });
  },
);

interface NearbyPostRequestBody {
  coordinates: [number, number];
}

router.post(
  "/nearby",
  async (request: Request<{}, {}, NearbyPostRequestBody>, response) => {
    const { coordinates } = request.body;

    const usersQuery = User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates,
          },
          distanceField: "distance",
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      {
        $match: {
          distance: { $lte: 0.01 },
          role: { $ne: "admin" },
          status: "ok",
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
          locations: 1,
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
      const count = totalCountResult[0]?.count || 0;

      // response.setHeader("X-Total-Count", totalCountResult[0]?.count || 0);

      response.json({ count });
      return;
    }
  },
);

router.get("/:id", authenticate, async (request, response) => {
  const id = request.params.id;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "Invalid user id");
  }
  const foundUser = await User.findOne(
    { _id: id },
    {
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      company: 1,
      companyDescription: 1,
      locations: 1,
      distance: 1,
      color: 1,
      role: 1,
      programmingDisciplines: 1,
      programmingGenres: 1,
      programmingPeriods: 1,
      projectCount: 1,
      contactInformation: 1,
      profiles: 1,
      avatarUrl: 1,
    },
  );
  response.json(foundUser);
});

// Nouvelle route pour mettre à jour uniquement la discipline d'un utilisateur
router.put("/update-discipline", authenticate, async (request, response) => {
  const { discipline } = request.body;

  if (!discipline) {
    throw new HttpError(400, "Discipline is required");
  }

  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Mettre à jour la discipline de l'utilisateur
  user.programmingDisciplines = [discipline];
  user.markModified("programmingDisciplines");

  await user.save();
  response.json(user);
});

router.post(
  "/:userId/follow-request",
  authenticate,
  async (request, response) => {
    checkIsInRole(Role.ADMIN, Role.DIFFUSION_STRUCTURE)(request, response);
    const loggedUser = await User.findById(request.user._id).populate([
      { path: "notifications" },
      { path: "following", select: "_id" },
    ]);
    if (!loggedUser) {
      throw new HttpError(404, "User not found");
    }
    const toBeFollowedUser = await User.findById(request.params.userId);
    if (!toBeFollowedUser) {
      throw new HttpError(404, "User not found");
    }

    if (!loggedUser.following) {
      loggedUser.following = [];
    }

    const alreadyRequested = toBeFollowedUser.notifications.find(
      (notification) =>
        notification.type === "follow_request" &&
        notification.meta.from.toString() === loggedUser._id.toString(),
    );

    if (alreadyRequested) {
      throw new HttpError(400, "Already requested");
    }

    const alreadyFollowing = loggedUser.following.find(
      (user) => user._id.toString() === toBeFollowedUser._id.toString(),
    );
    if (alreadyFollowing) {
      loggedUser.following = loggedUser.following.filter(
        (user) => user._id.toString() !== toBeFollowedUser._id.toString(),
      );
      await loggedUser.save();
    } else {
      await sendNotification(
        toBeFollowedUser._id,
        NotificationType.FOLLOW_REQUEST,
        {
          from: loggedUser._id,
          message: "",
        },
      );
    }

    response.send(loggedUser);
  },
);

type AcceptRequest = Request<
  {
    userId: string;
  },
  {},
  {
    followBack: boolean;
  }
>;
router.post(
  "/:userId/accept",
  authenticate,
  async (request: AcceptRequest, response) => {
    checkIsInRole(Role.ADMIN, Role.DIFFUSION_STRUCTURE)(request, response);
    const { followBack } = request.body;
    const loggedUser = await User.findById(request.user._id).populate([
      { path: "notifications" },
      { path: "following", select: "_id" },
    ]);
    if (!loggedUser) {
      throw new HttpError(404, "User not found");
    }
    const userAskingForFollow = await User.findById(request.params.userId);
    if (!userAskingForFollow) {
      throw new HttpError(404, "User not found");
    }

    if (!loggedUser.following) {
      loggedUser.following = [];
    }

    const alreadyFollowing = userAskingForFollow.following.find(
      (user) => user._id.toString() === loggedUser._id.toString(),
    );

    if (!alreadyFollowing) {
      userAskingForFollow.following.push(loggedUser);
      loggedUser.notifications = loggedUser.notifications.filter(
        (notification) =>
          notification.type !== "follow_request" ||
          notification.meta.from.toString() !==
            userAskingForFollow._id.toString(),
      );
    }

    if (followBack) {
      loggedUser.following.push(userAskingForFollow);
    }

    await sendNotification(
      userAskingForFollow._id,
      followBack
        ? NotificationType.FOLLOW_REQUEST_ACCEPTED_AND_BACK
        : NotificationType.FOLLOW_REQUEST_ACCEPTED,
      {
        from: loggedUser._id,
      },
    );

    await userAskingForFollow.save();
    await loggedUser.save();

    response.json(loggedUser);
  },
);

router.post("/:userId/refuse", authenticate, async (request, response) => {
  checkIsInRole(Role.ADMIN, Role.DIFFUSION_STRUCTURE)(request, response);
  const loggedUser = await User.findById(request.user._id).populate([
    { path: "notifications" },
    { path: "following", select: "_id" },
  ]);
  if (!loggedUser) {
    throw new HttpError(404, "User not found");
  }
  const userAskingForFollow = await User.findById(request.params.userId);
  if (!userAskingForFollow) {
    throw new HttpError(404, "User not found");
  }

  if (!loggedUser.following) {
    loggedUser.following = [];
  }

  loggedUser.notifications = loggedUser.notifications.filter(
    (notification) =>
      notification.type !== "follow_request" ||
      notification.meta.from.toString() !== userAskingForFollow._id.toString(),
  );

  await loggedUser.save();

  response.json(loggedUser);
});

router.get("/:userId/avatar", authenticate, async (request, response, next) => {
  try {
    const { userId } = request.params;
    let user;

    if (userId === "me") {
      user = request.user;
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.avatarUrl) {
      throw new HttpError(404, "User has no avatar");
    }

    // Remove the leading slash from the avatarUrl to get the correct path
    const filePath = path.join(
      process.env.UPLOAD_PATH,
      user.avatarUrl.replace(/^\//, ""),
    );

    if (!fs.existsSync(filePath)) {
      throw new HttpError(404, "Avatar file does not exist on server");
    }

    response.download(filePath, `avatar${path.extname(filePath)}`, (err) => {
      if (err) {
        console.error("Download error:", err);
        next(err);
      }
    });
  } catch (error) {
    console.error("Avatar download route error:", error);
    next(error);
  }
});

export default router;
