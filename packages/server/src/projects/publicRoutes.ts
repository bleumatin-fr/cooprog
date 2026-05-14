import express, { Request } from "express";
import mongoose, { isValidObjectId } from "mongoose";

import {
  Discipline,
  Link,
  Place,
  Program,
  ProgramStatuses,
  Project as ProjectType,
  Role,
  Tour as TourType,
  User as UserType,
  NotificationType,
  Location,
  Tour,
  LabeledLocation,
} from "@cooprog/core";
import fs from "fs";
import { Feature, Point } from "geojson";
import jwt from "jsonwebtoken";
import { isSameDay } from "date-fns";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import Supercluster from "supercluster";
import { checkIsInRole } from "../authentication/authenticate";
import ChatMessageModel from "../chatMessages/model";
import { mail, send, htmlToRawText } from "../mails";
import { sanitizeHtmlForEmail } from "../utils/sanitizeHtml";
import { HttpError } from "../middlewares/errorHandler";
import User, { Profile } from "../users/model";
import Project from "./model";
import {
  getPatchProjectSystemMessages,
  getPatchTourSystemMessages,
  saveNewFileMessage,
  saveNewInterestMessage,
  saveNewProgramMessage,
  saveNewTourMessage,
  saveRemoveInterestMessage,
  saveUnscheduleMessage,
  saveUpdatedProgramMessage,
} from "./systemMessagesUtils";
import sendNotification from "../users/sendNotification";

const router = express.Router();

const populatePaths = [
  {
    path: "tours.schedule.user",
    select:
      "_id firstName lastName company locations contactInformation color email profiles avatarUrl role",
  },
  {
    path: "tours.users",
    select:
      "_id firstName lastName company locations contactInformation color email profiles avatarUrl role",
  },
  {
    path: "users",
    select:
      "_id firstName lastName company locations contactInformation color email profiles avatarUrl role",
  },
  {
    path: "favoritedBy",
    select: "_id firstName lastName company locations",
  },
];

export const diacriticInsensitiveRegex = (value: string) => {
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

const findProject = async (projectId: string, user: UserType) => {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new HttpError(400, "Invalid project id");
  }
  return await Project.findOne({
    _id: projectId,
  })
    .select("-files.path")
    .populate(populatePaths);
};

const addViewedIndicator = (user: UserType) => (project: ProjectType) => {
  const viewed = user.viewedProjects.find(
    (viewedProject) => viewedProject.toString() === project._id.toString(),
  );
  project.viewed = !!viewed;
};

interface RequestQuery {
  q?: string;
  limit?: string;
  userId?: string;
  sort?: string;
  genres?: string[];
  targetAudiences?: string[];
  gauge?: string[];
  minimumStageSize?: string[];
  averagePerformanceFee?: string[];
  venueConfigurationType?: string[];
  venueConfigurationSpace?: string[];
  venueConfigurationAudience?: string[];
  performanceLanguages?: string[];
  accessibilityVisual?: boolean | string;
  accessibilityAudio?: boolean | string;
  minimumPeopleOnTour?: string;
  maximumPeopleOnTour?: string;
  minimumArtistOnStage?: string;
  maximumArtistOnStage?: string;
  favorite?: boolean;
  distanceMax?: string;
  dateMin?: Date;
  dateMax?: Date;
  offset?: string;
  artist?: string;
  work?: string;
  countries?: string[];
  regions?: string[];
  cities?: string[];
  boundingCenter?: string;
  boundingRadius?: string;
  zoom?: number;
  disciplines?: Discipline;
  complementaryGenre?: string;
  emergingArtist?: boolean;
  culturalActionInterest?: boolean;
  minGenderPercentage?: number;
  maxGenderPercentage?: number;
  minGenderType?: string;
  maxGenderType?: string;
  upcomingOnly?: boolean;
  interestOnly?: boolean;
  projectIds?: string[];
  published?: boolean;
}

const getDateFilter = (dateMin?: Date, dateMax?: Date) => {
  if (dateMin && dateMax) {
    return {
      $or: [
        {
          "tours.start": {
            $gte: new Date(dateMin),
            $lte: new Date(dateMax),
          },
        },
        {
          "tours.end": {
            $gte: new Date(dateMin),
            $lte: new Date(dateMax),
          },
        },
        {
          $and: [
            {
              "tours.start": {
                $lte: new Date(dateMin),
              },
            },
            {
              "tours.end": {
                $gte: new Date(dateMax),
              },
            },
          ],
        },
      ],
    };
  }
  if (dateMin) {
    return {
      $or: [
        {
          "tours.start": {
            $gte: new Date(dateMin),
          },
        },
        {
          "tours.end": {
            $gte: new Date(dateMin),
          },
        },
      ],
    };
  }
  if (dateMax) {
    return {
      $or: [
        {
          "tours.start": {
            $lte: new Date(dateMax),
          },
        },
        {
          "tours.end": {
            $lte: new Date(dateMax),
          },
        },
      ],
    };
  }
};

export const getSortField = (sort?: string) => {
  if (/^(\+|\-).*/.test(sort)) {
    return sort.slice(1);
  }
  return sort;
};

export const getSortDirection = (sort?: string) => {
  if (sort && sort.startsWith("-")) {
    return -1;
  }
  return 1;
};

const sortSchedule = (project: ProjectType) => {
  project.tours?.forEach((tour) => {
    tour.schedule.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      }
      if (a.date > b.date) {
        return 1;
      }
      return 0;
    });
  });
};

const addDistance =
  (projectClosestDistances: { [key: string]: number }) =>
  (project: ProjectType) => {
    project.distance = projectClosestDistances[project._id];
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

const getMainLocation = (user: UserType): Location => {
  let mainLocation = user.locations?.find((loc) => loc.isMain);
  if (!mainLocation) {
    if (user.locations?.length) {
      mainLocation = user.locations[0];
    } else {
      return PARIS_LOCATION;
    }
  }
  return mainLocation.location;
};

const getMarkers = async (
  filter: any,
  user: UserType,
  zoom: number,
  published?: boolean,
) => {
  const mainLocation = getMainLocation(user);
  let features: Feature<Point>[] = [];
  if (published === true || published === undefined) {
    const allSchedule = await Project.aggregate([
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
        $unwind: "$tours",
      },
      {
        $match: {
          "tours.archived": { $ne: true },
        },
      },
      {
        $unwind: "$tours.schedule",
      },
      {
        $match: {
          "tours.schedule.location": { $exists: true },
          "tours.schedule.archived": { $ne: true },
        },
      },
      {
        $project: {
          _id: "$tours.schedule._id",
          location: "$tours.schedule.location",
          start: "$tours.schedule.date.start",
          status: "$tours.schedule.status",
          userId: "$tours.schedule.user",
          distance: "$distance",
          projectId: "$_id",
        },
      },
    ]);

    features.push(
      ...(allSchedule.map((schedule) => ({
        type: "Feature",
        properties: {
          projectIds: [schedule.projectId],
          statuses: [schedule.status],
          userIds: [schedule.userId],
          distances: [schedule.distance],
        },
        geometry: schedule.location.geolocation,
      })) as Feature<Point>[]),
    );

    // Also include projects where user is in project.users but not in any tour schedule
    // This handles the case where an artistic team member is in project.users but hasn't been scheduled yet
    // Extract userId from filter if it exists
    let userIdFromFilter: ObjectId | null = null;
    const extractUserId = (f: any): ObjectId | null => {
      if (f.$or && Array.isArray(f.$or)) {
        const usersCondition = f.$or.find((condition: any) => condition.users);
        if (usersCondition) {
          return usersCondition.users;
        }
      }
      if (f.users) {
        return f.users;
      }
      if (f.$and && Array.isArray(f.$and)) {
        for (const condition of f.$and) {
          const userId = extractUserId(condition);
          if (userId) return userId;
        }
      }
      return null;
    };
    userIdFromFilter = extractUserId(filter);

    if (userIdFromFilter) {
      // Find projects where user is in project.users or tours.users, has non-archived tours, but user is not in any schedule
      // This handles cases where the user is associated with the project but hasn't been scheduled yet
      const projectsWithUserButNoSchedule = await Project.aggregate([
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
        { $match: filter },
        {
          $match: {
            $or: [
              { users: userIdFromFilter },
              { "tours.users": userIdFromFilter },
            ],
            tours: {
              $elemMatch: {
                archived: { $ne: true },
              },
            },
          },
        },
        {
          $addFields: {
            userInSchedule: {
              $anyElementTrue: {
                $map: {
                  input: {
                    $filter: {
                      input: "$tours",
                      as: "tour",
                      cond: { $ne: ["$$tour.archived", true] },
                    },
                  },
                  as: "tour",
                  in: {
                    $anyElementTrue: {
                      $map: {
                        input: {
                          $ifNull: ["$$tour.schedule", []],
                        },
                        as: "schedule",
                        in: {
                          $eq: ["$$schedule.user", userIdFromFilter],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            userInSchedule: false,
          },
        },
        {
          $project: {
            _id: 1,
            distance: 1,
          },
        },
      ]);

      features.push(
        ...(projectsWithUserButNoSchedule.map((project) => ({
          type: "Feature",
          properties: {
            projectIds: [project._id],
            statuses: [] as any[],
            userIds: [userIdFromFilter],
            distances: [project.distance],
          },
          geometry: {
            type: "Point",
            coordinates: [0, 0],
          },
        })) as Feature<Point>[]),
      );
    }
  }

  if (published === false || published === undefined) {
    const allProjects = await Project.find({
      $and: [
        filter,
        {
          $or: [
            {
              "tours.0": { $exists: false },
            },
            {
              $and: [
                { "tours.0": { $exists: true } },
                {
                  tours: { $not: { $elemMatch: { archived: { $ne: true } } } },
                },
              ],
            },
          ],
        },
      ],
    });

    features.push(
      ...(allProjects.map((project) => ({
        type: "Feature",
        properties: {
          projectIds: [project._id],
          statuses: [] as any[],
          userIds: project.users,
        },
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
      })) as Feature<Point>[]),
    );
  }

  const index = new Supercluster({
    radius: 100,
    extent: 512,
    maxZoom: 18,
    reduce: (accumulated, props) => {
      if (!props.projectIds) {
        return;
      }
      props.projectIds.forEach((projectId: string, index: number) => {
        if (
          accumulated.projectIds.some((accProjectId: any) => {
            return accProjectId.toString() === projectId.toString();
          })
        ) {
          return;
        }
        accumulated.projectIds = [...accumulated.projectIds, projectId];
        accumulated.statuses = [...accumulated.statuses, props.statuses[index]];
        accumulated.userIds = [...accumulated.userIds, props.userIds[index]];
        accumulated.distances = [
          ...(accumulated.distances || []),
          props.distances?.[index] ?? 0,
        ];
      });
    },
  });
  index.load(features);

  const clusters = index.getClusters([-180, -85, 180, 85], zoom);

  return clusters;
};

const addArrayFilter = (filter: any, field: string, values: any) => {
  if (values && values.length > 0) {
    filter[field] = { $in: Array.isArray(values) ? values : [values] };
  }
  return filter;
};

const addRole = (project: ProjectType) => {
  if (!project.users) {
    project.users = [];
  }
  project.tours?.forEach((tour) => {
    if (!tour.users) {
      tour.users = [];
    }
    tour.schedule.forEach((program) => {
      if (!program.user || !program.user._id) {
        return;
      }
      const foundProjectUser = project.users.find(
        (user) => user && user.toString() === program.user._id.toString(),
      );
      const foundTourUser = tour.users.find(
        (user) => user && user.toString() === program.user._id.toString(),
      );
    });
  });
};

const addNumericRangeFilter = (
  filter: any,
  fieldName: string,
  minValue?: string,
  maxValue?: string,
) => {
  if (minValue !== undefined || maxValue !== undefined) {
    return {
      ...filter,
      [fieldName]: {
        ...(minValue !== undefined ? { $gte: parseInt(minValue) } : {}),
        ...(maxValue !== undefined ? { $lte: parseInt(maxValue) } : {}),
      },
    };
  }
  return filter;
};

router.get(
  "/",
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    const {
      q,
      limit,
      offset,
      userId,
      sort,
      genres,
      targetAudiences,
      gauge,
      minimumStageSize,
      averagePerformanceFee,
      venueConfigurationAudience,
      venueConfigurationSpace,
      venueConfigurationType,
      performanceLanguages,
      minimumPeopleOnTour,
      maximumPeopleOnTour,
      minimumArtistOnStage,
      maximumArtistOnStage,
      favorite,
      distanceMax,
      dateMin,
      dateMax,
      artist,
      work,
      countries,
      regions,
      cities,
      boundingCenter,
      boundingRadius,
      zoom,
      disciplines,
      complementaryGenre,
      emergingArtist,
      culturalActionInterest,
      accessibilityVisual,
      accessibilityAudio,
      minGenderPercentage,
      maxGenderPercentage,
      minGenderType,
      maxGenderType,
      upcomingOnly,
      interestOnly,
      projectIds: projectIdsQuery,
      published,
    } = request.query;

    let filter: any = {};
    const isSearchingForDupes = !!q && !!limit && parseInt(limit) === 2;

    if (request.user.role === Role.ARTISTIC_TEAM && !isSearchingForDupes) {
      filter = {
        ...filter,
        users: request.user._id,
      };
    }

    if (projectIdsQuery) {
      if (Array.isArray(projectIdsQuery)) {
        filter = {
          ...filter,
          _id: { $in: projectIdsQuery.map((id) => new ObjectId(id)) },
        };
      } else {
        filter = {
          ...filter,
          _id: new ObjectId(projectIdsQuery),
        };
      }
    }

    // Store relevance scores for text search
    const relevanceScores: { [key: string]: number } = {};

    // Only apply artist/work filters if q is not provided (text search takes priority)
    if (!q) {
      if (artist) {
        filter = {
          ...filter,
          artist: { $regex: new RegExp(`.*${artist}.*`, "i") },
        };
      }
      if (work) {
        filter = {
          ...filter,
          work: { $regex: new RegExp(`.*${work}.*`, "i") },
        };
      }
    }

    if (q) {
      let words = q.split(" ").filter((w) => w.length > 2);

      if (!words.length) {
        words = q.split(" ");
      }

      let searchQuery = words.join(" ");

      const numberOfWord = words.length;

      const similarProjects: any[] = await Project.find(
        {
          $text: {
            $search: searchQuery,
          },
        },
        { score: { $meta: "textScore" }, _id: 1, artist: 1, work: 1 },
      ).lean();

      // Store relevance scores
      similarProjects.forEach((p) => {
        if (p.score && p._id) {
          relevanceScores[p._id.toString()] = p.score;
        }
      });

      const dupeIds = similarProjects
        // .filter((p) => p.score >= numberOfWord / 3)
        .map((p) => p._id);

      if (dupeIds.length > 0) {
        filter = {
          ...filter,
          _id: { $in: dupeIds },
        };
      } else {
        const filters = words.reduce((acc, word) => {
          return [
            ...acc,
            {
              artist: {
                $regex: diacriticInsensitiveRegex(word),
                $options: "i",
              },
            },
            {
              work: {
                $regex: diacriticInsensitiveRegex(word),
                $options: "i",
              },
            },
            {
              complementaryGenre: {
                $regex: diacriticInsensitiveRegex(word),
                $options: "i",
              },
            },
          ];
        }, []);

        if (filters.length !== 0) {
          filter = {
            ...filter,
            $or: filters,
          };
        }
      }
    }

    if (userId && userId !== "undefined") {
      if (interestOnly) {
        filter = {
          ...filter,
          $and: [
            {
              "tours.users": new ObjectId(userId),
            },
            {
              "tours.schedule.user": { $ne: new ObjectId(userId) },
            },
          ],
        };
      } else {
        filter = {
          ...filter,
          $or: [
            {
              "tours.schedule.user": new ObjectId(userId),
            },
            {
              users: new ObjectId(userId),
            },
            {
              "tours.users": new ObjectId(userId),
            },
          ],
        };
      }
    }
    filter = addArrayFilter(filter, "discipline", disciplines);

    // Only apply filters if q is not provided (text search takes priority)
    if (!q) {
      filter = addArrayFilter(filter, "places.country", countries);
      filter = addArrayFilter(filter, "places.region", regions);
      filter = addArrayFilter(filter, "places.city", cities);
      filter = addArrayFilter(filter, "genres", genres);
      filter = addArrayFilter(filter, "targetAudiences", targetAudiences);
      filter = addArrayFilter(filter, "gauge", gauge);
      filter = addArrayFilter(filter, "minimumStageSize", minimumStageSize);
      filter = addArrayFilter(
        filter,
        "averagePerformanceFee",
        averagePerformanceFee,
      );
      filter = addArrayFilter(
        filter,
        "venueConfigurationType",
        venueConfigurationType,
      );
      filter = addArrayFilter(
        filter,
        "venueConfigurationSpace",
        venueConfigurationSpace,
      );
      filter = addArrayFilter(
        filter,
        "venueConfigurationAudience",
        venueConfigurationAudience,
      );
      filter = addArrayFilter(
        filter,
        "performanceLanguages",
        performanceLanguages,
      );
      filter = addArrayFilter(filter, "complementaryGenre", complementaryGenre);

      filter = addNumericRangeFilter(
        filter,
        "numberOfPeopleOnTour",
        minimumPeopleOnTour,
        maximumPeopleOnTour,
      );
      filter = addNumericRangeFilter(
        filter,
        "numberOfArtistOnStage",
        minimumArtistOnStage,
        maximumArtistOnStage,
      );

      if (favorite) {
        filter = {
          ...filter,
          favoritedBy: request.user._id,
        };
      }

      if (dateMin || dateMax) {
        filter = {
          ...filter,
          ...getDateFilter(dateMin, dateMax),
        };
      }

      if (distanceMax) {
        const maxRange = parseInt(distanceMax);

        filter = {
          ...filter,
          distance: {
            $lte: maxRange,
          },
        };
      }

      if (emergingArtist) {
        filter = {
          ...filter,
          emergingArtist: true,
        };
      }

      if (culturalActionInterest) {
        filter = {
          ...filter,
          culturalActionInterest: true,
        };
      }

      if (accessibilityVisual === "true" || accessibilityVisual === true) {
        filter = {
          ...filter,
          accessibilityVisual: true,
        };
      }

      if (accessibilityAudio === "true" || accessibilityAudio === true) {
        filter = {
          ...filter,
          accessibilityAudio: true,
        };
      }

      if (minGenderPercentage !== undefined && minGenderType) {
        if (minGenderType === "men") {
          filter = {
            ...filter,
            $expr: {
              $gte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfMenOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(minGenderPercentage),
              ],
            },
          };
        } else if (minGenderType === "women") {
          filter = {
            ...filter,
            $expr: {
              $gte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfWomenOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(minGenderPercentage),
              ],
            },
          };
        } else if (minGenderType === "nonBinary") {
          filter = {
            ...filter,
            $expr: {
              $gte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfNonBinaryOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(minGenderPercentage),
              ],
            },
          };
        }
      }

      if (maxGenderPercentage !== undefined && maxGenderType) {
        if (maxGenderType === "men") {
          filter = {
            ...filter,
            $expr: {
              $lte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfMenOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(maxGenderPercentage),
              ],
            },
          };
        } else if (maxGenderType === "women") {
          filter = {
            ...filter,
            $expr: {
              $lte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfWomenOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(maxGenderPercentage),
              ],
            },
          };
        } else if (maxGenderType === "nonBinary") {
          filter = {
            ...filter,
            $expr: {
              $lte: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$numberOfNonBinaryOnStage",
                        {
                          $sum: [
                            "$numberOfMenOnStage",
                            "$numberOfWomenOnStage",
                            "$numberOfNonBinaryOnStage",
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                Number(maxGenderPercentage),
              ],
            },
          };
        }
      }

      if (upcomingOnly) {
        const user = await User.findById(userId);
        if (user?.role === Role.ARTISTIC_TEAM) {
          filter = {
            ...filter,
            "tours.schedule": {
              $elemMatch: {
                date: { $gt: new Date() },
              },
            },
          };
        } else {
          filter = {
            ...filter,
            "tours.schedule": {
              $elemMatch: {
                date: { $gt: new Date() },
                user: request.user._id,
              },
            },
          };
        }
      }
    }
    const totalCountFilterClauses = [
      ...(disciplines && (Array.isArray(disciplines) ? disciplines.length : 1)
        ? [
            {
              discipline: {
                $in: Array.isArray(disciplines) ? disciplines : [disciplines],
              },
            },
          ]
        : []),
      request.user.role === Role.ARTISTIC_TEAM && !isSearchingForDupes
        ? { users: request.user._id }
        : {},
    ].filter((clause) => Object.keys(clause).length > 0);

    console.log(
      "TOTAL COUNT FILTER CLAUSES",
      JSON.stringify(totalCountFilterClauses),
    );

    const totalCountFilter =
      totalCountFilterClauses.length > 0
        ? { $and: totalCountFilterClauses }
        : {};

    // Convert published query param to boolean
    // Handle both boolean (if Express parsed it) and string (raw query param) cases
    // If q is present, ignore published filter (text search takes priority)
    let publishedBoolean: boolean | undefined = undefined;
    if (published !== undefined) {
      if (typeof published === "boolean") {
        publishedBoolean = published;
      } else {
        publishedBoolean = String(published).toLowerCase() === "true";
      }
    }
    if (q) {
      publishedBoolean = undefined;
    }

    const publishedFilter = (() => {
      if (publishedBoolean === true) {
        // Projects with at least one non-archived tour
        return {
          tours: {
            $elemMatch: {
              archived: { $ne: true },
            },
          },
        };
      } else if (publishedBoolean === false) {
        // Projects with all tours archived OR no tours at all
        return {
          $or: [
            { "tours.0": { $exists: false } },
            {
              tours: {
                $not: {
                  $elemMatch: {
                    archived: { $ne: true },
                  },
                },
              },
            },
          ],
        };
      }
      // published === undefined: no filter
      return {};
    })();

    console.log("PROJECTS", JSON.stringify(filter), publishedBoolean);

    // For relevance sorting, always use descending order (highest score first)
    let sortField = getSortField(sort);
    if (q) {
      sortField = "relevance";
    }
    const sortDirection =
      sortField === "relevance" ? -1 : getSortDirection(sort);
    console.log("SORT FIELD", filter);
    const getUniqueProjectIdKeys = (markerList: any[]) => {
      return Array.from(
        new Set(
          markerList.flatMap((marker) =>
            Array.isArray(marker.properties?.projectIds)
              ? marker.properties.projectIds.map((id: unknown) =>
                  id?.toString?.() ?? String(id),
                )
              : [],
          ),
        ),
      );
    };

    const getUniqueProjectIdsRaw = (markerList: any[]) => {
      return Array.from(
        new Map(
          markerList.flatMap((marker) =>
            Array.isArray(marker.properties?.projectIds)
              ? marker.properties.projectIds.map((id: unknown) => [
                  id?.toString?.() ?? String(id),
                  id,
                ])
              : [],
          ),
        ).values(),
      );
    };

    const totalCountWithoutFiltersMarkers = await getMarkers(
      totalCountFilter,
      request.user,
      zoom || 5,
      publishedBoolean,
    );

    const totalCountWithoutFilters = getUniqueProjectIdKeys(
      totalCountWithoutFiltersMarkers,
    ).length;

    const markers = await getMarkers(
      filter,
      request.user,
      zoom || 5,
      publishedBoolean,
    );

    let projectIds: any[] = [];

    if (boundingCenter && boundingRadius) {
      const marker = markers.find(
        (marker) => marker.geometry.coordinates.join(",") === boundingCenter,
      );
      projectIds = marker?.properties.projectIds || [];
    } else {
      projectIds = getUniqueProjectIdsRaw(markers);
    }
    const projectClosestDistances: { [key: string]: number } =
      projectIds.reduce(
        (acc, projectId) => {
          const projectIdStr = projectId?.toString?.() ?? String(projectId);
          const filteredMarkers =
            markers?.filter((marker) =>
              marker.properties.projectIds?.some(
                (id: any) => (id?.toString?.() ?? String(id)) === projectIdStr,
              ),
            ) || [];

          if (filteredMarkers.length > 0) {
            const distancesForProject = filteredMarkers
              .map((marker) => {
                const idx = marker.properties.projectIds?.findIndex(
                  (id: any) =>
                    (id?.toString?.() ?? String(id)) === projectIdStr,
                );
                if (idx === undefined || idx < 0) return undefined;
                return marker.properties.distances?.[idx];
              })
              .filter((d): d is number => d !== undefined && d !== null);

            const closestDistance =
              distancesForProject.length > 0
                ? Math.min(...distancesForProject)
                : undefined;

            if (closestDistance !== undefined) {
              acc[projectIdStr] = closestDistance;
            }
          }
          return acc;
        },
        {} as { [key: string]: number },
      );

    // Build a $switch expression for distance mapping
    // For projects with tours, use the calculated distance from projectClosestDistances
    // For projects without tours, use Infinity
    const distanceCases = Object.entries(projectClosestDistances).map(
      ([projectId, distance]) => ({
        case: { $eq: [{ $toString: "$_id" }, projectId] },
        then: distance,
      }),
    );

    // Build a $switch expression for relevance score mapping
    const relevanceCases = Object.entries(relevanceScores).map(
      ([projectId, score]) => ({
        case: { $eq: [{ $toString: "$_id" }, projectId] },
        then: score,
      }),
    );

    const projectQuery = await Project.aggregate([
      {
        $match: {
          _id: {
            $in: projectIds,
          },
        },
      },
      {
        $addFields: {
          distance: {
            $cond: {
              if: { $gt: [{ $size: "$tours" }, 0] },
              then:
                distanceCases.length > 0
                  ? {
                      $switch: {
                        branches: distanceCases,
                        default: Infinity,
                      },
                    }
                  : Infinity,
              else: Infinity, // Projects without tours get high distance to sort them last
            },
          },
          relevance:
            relevanceCases.length > 0
              ? {
                  $switch: {
                    branches: relevanceCases,
                    default: 0,
                  },
                }
              : 0,
        },
      },
      {
        $project: {
          _id: 1,
          artist: 1,
          work: 1,
          genres: 1,
          complementaryGenre: 1,
          targetAudiences: 1,
          description: 1,
          favoritedBy: 1,
          distance: 1,
          relevance: 1,
          accessibilityVisual: 1,
          accessibilityAudio: 1,
          discipline: 1,
          "tours._id": 1,
          "tours.name": 1,
          "tours.start": 1,
          "tours.end": 1,
          "tours.color": 1,
          "tours.archived": 1,
          "tours.perimeter": 1,
          "tours.users": 1,
          "tours.schedule._id": 1,
          "tours.schedule.user": 1,
          "tours.schedule.date": 1,
          "tours.schedule.status": 1,
          "tours.schedule.location": 1,
          "tours.numberOfPeopleOnTour": 1,
          allDates: {
            $reduce: {
              input: "$tours.schedule.date",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          artist: 1,
          work: 1,
          genres: 1,
          complementaryGenre: 1,
          targetAudiences: 1,
          description: 1,
          favoritedBy: 1,
          distance: 1,
          relevance: 1,
          accessibilityVisual: 1,
          accessibilityAudio: 1,
          discipline: 1,
          "tours._id": 1,
          "tours.name": 1,
          "tours.start": 1,
          "tours.end": 1,
          "tours.color": 1,
          "tours.archived": 1,
          "tours.perimeter": 1,
          "tours.users": 1,
          "tours.schedule._id": 1,
          "tours.schedule.user": 1,
          "tours.schedule.date": 1,
          "tours.schedule.status": 1,
          "tours.schedule.location": 1,
          "tours.numberOfPeopleOnTour": 1,
          allDates: "allDates",
          minDate: {
            $min: "$allDates",
          },
          maxDate: {
            $max: "$allDates",
          },
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

    let projects: ProjectType[] = [];
    let totalCount: number = 0;

    if (projectQuery.length !== 0) {
      const { paginatedResults, totalCount: totalCountResult } =
        projectQuery[0];
      projects = paginatedResults;
      totalCount = totalCountResult[0]?.count || 0;
    }

    await Project.populate(projects, populatePaths);

    projects.forEach(addViewedIndicator(request.user));
    projects.forEach(addRole);
    projects.forEach(sortSchedule);
    projects.forEach(addDistance(projectClosestDistances));

    response.setHeader(
      "X-Total-Count",
      `${totalCount}/${totalCountWithoutFilters || 0}`,
    );

    response.json({
      projects,
      markers,
    });
  },
);

interface PostProjectBody {
  artist: string;
  work: string;
  places: Place[];
  genres: string[];
  targetAudiences: string[];
  description: string;
  artisticTeam?: UserType;
  artisticTeamCustomMessage?: string;
  financialSupport?: string;
  gauge?: string[];
  minimumStageSize?: string[];
  averagePerformanceFee?: string[];
  numberOfPeopleOnTour?: number;
  numberOfArtistOnStage?: number;
  venueConfigurationType?: string[];
  venueConfigurationSpace?: string[];
  venueConfigurationAudience?: string[];
  performanceLanguages?: string[];
  accessibilityVisual?: boolean;
  accessibilityAudio?: boolean;
  tourName?: string;
  start?: Date;
  end?: Date;
  artisticTeamPlace?: Place;
  links?: Link[];
  schedule: {
    date: Date;
    status: string;
    user: UserType;
  }[];
  notify?: string[];
  discipline: Discipline;
  complementaryGenre: string;
  emergingArtist: boolean;
  culturalActionInterest: boolean;
  numberOfMenOnStage: number;
  numberOfWomenOnStage: number;
  numberOfNonBinaryOnStage: number;
  customMessage?: string;
}

router.post(
  "/",
  async (request: Request<{}, {}, PostProjectBody>, response, next) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );
    let savedProject: InstanceType<typeof Project> | null = null;
    try {
      const {
        artist,
        work,
        genres,
        description,
        targetAudiences,
        artisticTeam,
        artisticTeamCustomMessage,
        places,
        tourName,
        start,
        end,
        artisticTeamPlace,
        schedule,
        financialSupport,
        gauge,
        minimumStageSize,
        averagePerformanceFee,
        numberOfPeopleOnTour,
        numberOfArtistOnStage,
        venueConfigurationType,
        venueConfigurationSpace,
        venueConfigurationAudience,
        performanceLanguages,
        accessibilityVisual,
        accessibilityAudio,
        links,
        notify,
        discipline,
        complementaryGenre,
        emergingArtist,
        culturalActionInterest,
        numberOfMenOnStage,
        numberOfWomenOnStage,
        numberOfNonBinaryOnStage,
        customMessage,
      } = request.body;

      const project = {
        artist: artist,
        work,
        places,
        genres,
        targetAudiences,
        description,
        financialSupport,
        gauge,
        links,
        minimumStageSize,
        averagePerformanceFee,
        numberOfPeopleOnTour,
        numberOfArtistOnStage,
        venueConfigurationType,
        venueConfigurationSpace,
        venueConfigurationAudience,
        performanceLanguages,
        accessibilityVisual,
        accessibilityAudio,
        discipline,
        complementaryGenre,
        emergingArtist,
        culturalActionInterest,
        numberOfMenOnStage,
        numberOfWomenOnStage,
        numberOfNonBinaryOnStage,
        users:
          request.user.role === Role.ARTISTIC_TEAM ? [request.user._id] : [],
        tours:
          request.user.role === Role.ARTISTIC_TEAM
            ? []
            : [
                {
                  name: tourName,
                  start,
                  end,
                  artisticTeamPlace,
                  users: [request.user._id],
                  schedule: await Promise.all(
                    schedule.map(async (program) => {
                      let user: UserType | null = null;
                      if (!!program.user._id) {
                        user = await User.findById(program.user._id);
                      } else {
                        user = await findOrInviteUser(program.user, {
                          currentUser: request.user,
                          currentProfile: request.profile,
                          project: savedProject,
                          message: sanitizeHtmlForEmail(customMessage),
                        });
                      }

                      return {
                        user: user._id,
                        location: getMainLocation(user),
                        date: program.date,
                        status: program.status,
                      };
                    }),
                  ),
                },
              ],
      };
      savedProject = await Project.create(project);
      if (request.user.role !== Role.ARTISTIC_TEAM) {
        if (artisticTeam) {
          const artisticTeamUser = await findOrInviteUser(
            { ...artisticTeam, role: Role.ARTISTIC_TEAM },
            {
              currentUser: request.user,
              currentProfile: request.profile,
              project: savedProject,
              message: sanitizeHtmlForEmail(
                artisticTeamCustomMessage || customMessage,
              ),
            },
          );

          savedProject.users.push(artisticTeamUser);

          await savedProject.save();
        }

        await Promise.allSettled(
          (notify || []).map(async (userId) => {
            if (!isValidObjectId(userId)) {
              const recipient = userId;

              // Generate registration link for new users
              const registrationLink = `${process.env.FRONTEND_URL}/authentication/register`;

              await send({
                to: recipient,
                from: process.env.MAIL_FROM,
                ...(await mail("invite-tour", request.user.language || "en", {
                  invitingUser: request.user,
                  invitingUserProfile: request.profile,
                  project: savedProject!,
                  tour: savedProject!.tours[0],
                  link: registrationLink,
                  ...(customMessage
                    ? {
                        message: {
                          html: sanitizeHtmlForEmail(customMessage),
                          raw: htmlToRawText(
                            sanitizeHtmlForEmail(customMessage),
                          ),
                        },
                      }
                    : {}),
                })),
              });
            } else {
              const user = await User.findById(userId);
              await sendNotification(
                user!._id,
                NotificationType.PROJECT_SHARED,
                {
                  projectId: savedProject!._id,
                  userId: request.user._id,
                  message: sanitizeHtmlForEmail(customMessage),
                },
              );
            }
          }),
        );
      }

      response.json(savedProject);
    } catch (error) {
      if (savedProject != null) {
        try {
          await Project.findByIdAndDelete(savedProject._id);
        } catch (deleteError) {
          console.error(
            "Rollback: failed to delete project after create error",
            savedProject._id,
            deleteError,
          );
        }
      }
      next(error);
    }
  },
);

router.delete("/:projectId/files", async (request, response, next) => {
  try {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );

    const { projectId } = request.params;
    const { fileIds } = request.body as { fileIds: string[] };

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new HttpError(400, "No file IDs provided");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const filesToDelete = project.files.filter((file) =>
      fileIds.includes(file._id.toString()),
    );

    filesToDelete.forEach((file) => {
      const filePath = file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    project.files = project.files.filter(
      (file) => !fileIds.includes(file._id.toString()),
    );

    const updatedProject = await project.save();

    response.json({ updatedProject });
  } catch (error) {
    console.error("Delete files error:", error);
    next(error);
  }
});

router.get(
  "/:projectId/files/:fileId/download",
  async (request, response, next) => {
    try {
      const { projectId, fileId } = request.params;

      const project = await Project.findById(projectId);
      if (!project) {
        throw new HttpError(404, "Project not found");
      }

      const file = project.files.find((f) => f._id.toString() === fileId);

      if (!file) {
        throw new HttpError(404, "File not found");
      }

      const filePath = file.path;

      if (!fs.existsSync(filePath)) {
        throw new HttpError(404, "File does not exist on server");
      }

      response.download(filePath, file.name, (err) => {
        if (err) {
          console.error("Download error:", err);
          next(err);
        }
      });
    } catch (error) {
      console.error("Download route error:", error);
      next(error);
    }
  },
);

router.post("/:projectId/files", async (request, response, next) => {
  try {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );
    const { projectId } = request.params;

    const projectDir = path.join(
      process.env.UPLOAD_PATH,
      "projects",
      projectId,
    );

    // Ensure the directories exist
    fs.mkdirSync(projectDir, { recursive: true });

    // Dynamic multer storage per projectId
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, projectDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
      },
    });

    const upload = multer({ storage }).array("files", 10);

    upload(request, response, async (err) => {
      if (err) {
        console.error("Upload Error:", err);
        return next(err);
      }

      try {
        const files = request.files as Express.Multer.File[];
        const names = request.body.names as string[];
        const originalFilenames = request.body.originalFilenames as string[];

        if (!files || files.length === 0) {
          return response.status(400).json({ error: "No files uploaded." });
        }

        const uploadedFiles = files.map((file, index) => ({
          name: names[index] || file.filename,
          originalFilename: originalFilenames[index] || file.originalname,
          extension: path.extname(file.filename),
          path: `${projectDir}/${file.filename}`,
          userId: request.user._id,
          mimetype: file.mimetype,
          size: file.size,
          projectId,
          uploadedAt: new Date(),
        }));

        const updatedProject = await Project.findByIdAndUpdate(
          projectId,
          { $push: { files: { $each: uploadedFiles } } },
          { new: true },
        );

        if (!updatedProject) {
          return response.status(404).json({ error: "Project not found." });
        }

        const fileNames = uploadedFiles
          .map((file) => `${file.name}${file.extension}`)
          .join(", ");

        updatedProject.tours.forEach(async (tour) => {
          await saveNewFileMessage(tour._id, fileNames, uploadedFiles.length);
        });

        response.json({ updatedProject });
      } catch (innerError) {
        console.error("Processing Error:", innerError);
        next(innerError);
      }
    });
  } catch (error) {
    console.error("Route Error:", error);
    next(error);
  }
});

router.get("/:projectId/tours/:tourId", async (request, response) => {
  const foundProject = (
    await findProject(request.params.projectId, request.user)
  ).toJSON();

  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }

  const tour = foundProject.tours.find(
    (tour) => tour._id.toString() === request.params.tourId.toString(),
  );

  if (!tour) {
    throw new HttpError(404, "Not found");
  }

  tour.projectUsers = foundProject.users;

  response.json({
    _id: tour._id,
    name: tour.name,
    start: tour.start,
    end: tour.end,
    color: tour.color,
    archived: tour.archived,
    perimeter: tour.perimeter,
    schedule: tour.schedule.map((program) => {
      if (!program.user) {
        return {
          ...program,
          role: undefined,
        };
      }
      const foundProjectUser = foundProject.users.find(
        (user) => user._id.toString() === program.user._id.toString(),
      );
      const foundTourUser = tour.users.find(
        (user) => user._id.toString() === program.user._id.toString(),
      );
      return {
        ...program,
        role: foundProjectUser?.role || foundTourUser?.role,
      };
    }),
    users: tour.users,
    projectUsers: tour.projectUsers,
    artisticTeamPlace: tour.artisticTeamPlace,
    peopleTransportMode: tour.peopleTransportMode,
    decorationsTransportMode: tour.decorationsTransportMode,
    decorationsWeight: tour.decorationsWeight,
    lastSeenByUser: tour.lastSeenByUser,
    createdAt: tour.createdAt,
    numberOfPeopleOnTour: foundProject.numberOfPeopleOnTour,
  });
});

interface PostTourBody {
  name: string;
  start: Date;
  end: Date;
  artisticTeamPlace?: Place;
  peopleTransportMode: string;
  decorationsTransportMode: string;
  decorationsWeight: number;
  schedule: {
    date: Date;
    status: string;
    user?: UserType;
    customMessage?: string;
  }[];
}

router.post(
  "/:projectId/tours",
  async (
    request: Request<
      {
        projectId: string;
      },
      {},
      PostTourBody
    >,
    response,
  ) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );
    const foundProject = await findProject(
      request.params.projectId,
      request.user,
    );

    if (!foundProject) {
      throw new HttpError(404, "Not found");
    }

    const {
      name,
      start,
      end,
      schedule,
      artisticTeamPlace,
      peopleTransportMode,
      decorationsTransportMode,
      decorationsWeight,
    } = request.body;

    const tourSchedule = await Promise.all(
      schedule.map(async (program) => {
        let user: UserType | null = null;
        if (!!program.user._id) {
          user = await User.findById(program.user._id);
        } else if (program.user) {
          user = await findOrInviteUser(program.user, {
            currentUser: request.user,
            currentProfile: request.profile,
            project: foundProject,
            message: sanitizeHtmlForEmail(program.customMessage),
          });
        } else {
          user = request.user;
        }

        return {
          user: user,
          location: getMainLocation(user),
          date: program.date,
          status: program.status as ProgramStatuses,
        };
      }),
    );

    const tourUsers = tourSchedule
      .map((program) => program.user)
      .filter((user) => user !== null)
      .filter((user, index, self) => self.indexOf(user) === index);

    const tour = {
      name,
      start,
      end,
      artisticTeamPlace,
      peopleTransportMode,
      decorationsTransportMode,
      decorationsWeight,
      users: tourUsers,
      schedule: tourSchedule,
    };

    foundProject.tours.push(tour);

    await foundProject.save();

    foundProject.tours.forEach(async (tour) => {
      await saveNewTourMessage(tour._id, tour.name, request.user);
    });

    response.json(foundProject);
  },
);

router.get("/:id", async (request, response) => {
  const foundProject = (
    await findProject(request.params.id, request.user)
  ).toJSON();
  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }

  const project = await Project.findById(request.params.id);
  const user = await User.findById(request.user._id).populate("viewedProjects");
  if (!user) {
    throw new HttpError(404, "Not found");
  }
  if (!user.viewedProjects) {
    user.viewedProjects = [];
  }
  if (
    !user.viewedProjects.find(
      (p) => p._id.toString() === project._id.toString(),
    )
  ) {
    user.viewedProjects.push(project);
    user.save();
  }

  addRole(foundProject);
  sortSchedule(foundProject);
  response.json(foundProject);
});

interface PatchTourBody {
  name: string;
  start: Date;
  end: Date;
  artisticTeamPlace?: Place;
  peopleTransportMode: string;
  decorationsTransportMode: string;
  decorationsWeight: number;
  schedule: {
    date: Date;
    status: ProgramStatuses;
  }[];
}

router.patch(
  "/:projectId/tours/:tourId",
  async (
    request: Request<
      {
        projectId: string;
        tourId: string;
      },
      {},
      PatchTourBody
    >,
    response,
  ) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );
    const tourId = request.params.tourId.toString();

    const foundProject = await findProject(
      request.params.projectId,
      request.user,
    );

    if (!foundProject) {
      throw new HttpError(404, "Not found");
    }

    const tour = foundProject.tours.find(
      (tour) => tour._id.toString() === tourId,
    );

    if (!tour) {
      throw new HttpError(404, "Not found");
    }

    const updatableFields = [
      "name",
      "start",
      "end",
      "artisticTeamPlace",
      "peopleTransportMode",
      "decorationsTransportMode",
      "decorationsWeight",
    ];

    const messages = [];

    for (const [key, value] of Object.entries(request.body)) {
      if (value !== undefined && updatableFields.includes(key)) {
        (tour as any)[key] = value;
        messages.push(getPatchTourSystemMessages(tourId, key, value));
      }
    }

    if (messages.length > 0) {
      await ChatMessageModel.insertMany(messages);
    }

    await foundProject.save();

    response.json(foundProject);
  },
);

router.patch("/:id", async (request, response) => {
  checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
    request,
    response,
  );

  const projectId = request.params.id;
  const foundProject = await Project.findById(projectId);

  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }
  const loggedUser = request.user;

  if (
    !foundProject.users.some(
      (user) => user._id.toString() === loggedUser._id.toString(),
    ) &&
    !foundProject.tours.some((tour) =>
      tour.users.some(
        (user) => user._id.toString() === loggedUser._id.toString(),
      ),
    )
  ) {
    throw new HttpError(403, "Forbidden");
  }

  const updatableFields = [
    "artist",
    "description",
    "financialSupport",
    "genres",
    "complementaryGenre",
    "targetAudiences",
    "work",
    "places",
    "gauge",
    "links",
    "minimumStageSize",
    "averagePerformanceFee",
    "numberOfPeopleOnTour",
    "numberOfArtistOnStage",
    "venueConfigurationType",
    "venueConfigurationSpace",
    "venueConfigurationAudience",
    "performanceLanguages",
    "accessibilityVisual",
    "accessibilityAudio",
    "discipline",
    "emergingArtist",
    "culturalActionInterest",
    "numberOfMenOnStage",
    "numberOfWomenOnStage",
    "numberOfNonBinaryOnStage",
    "users",
  ];

  const tourIds = foundProject.tours.map((tour) => tour._id);
  const messages = [];

  for (const [key, value] of Object.entries(request.body)) {
    if (value !== undefined && updatableFields.includes(key)) {
      if (key === "users") {
        // Validate that each user in the array has the required fields
        if (!Array.isArray(value)) {
          throw new HttpError(400, "Users must be an array");
        }

        // Replace user IDs with actual user objects
        const updatedUsers = await Promise.all(
          value.map(async (user) => {
            if (!user.user) {
              throw new HttpError(400, "Each user must have a user field");
            }

            // Get or create the user
            const userToAdd = await findOrInviteUser(user.user, {
              currentUser: request.user,
              currentProfile: request.profile,
              project: foundProject,
              message: sanitizeHtmlForEmail(user.customMessage),
            });
            if (!userToAdd || userToAdd.role !== Role.ARTISTIC_TEAM) {
              return null;
            }
            await sendNotification(
              userToAdd._id,
              NotificationType.PROJECT_USER_ADDED,
              {
                projectId: foundProject._id,
                userId: request.user._id,
                message: sanitizeHtmlForEmail(user.customMessage),
              },
            );

            return userToAdd._id;
          }),
        );

        (foundProject as any)[key] = updatedUsers.filter(
          (user) => user !== null,
        );
      } else {
        (foundProject as any)[key] = value;
      }

      messages.push(...getPatchProjectSystemMessages(tourIds, key, value));
    }
  }

  if (messages.length > 0) {
    await ChatMessageModel.insertMany(messages);
  }

  await foundProject.save();

  response.json(foundProject);
});

router.delete("/:id", async (request, response) => {
  checkIsInRole(Role.DIFFUSION_STRUCTURE)(request, response);
  const foundProject = await findProject(request.params.id, request.user);
  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }

  if (
    !foundProject.users.find(
      (user) => user._id.toString() === request.user._id.toString(),
    )
  ) {
    throw new HttpError(403, "Forbidden");
  }

  await foundProject.delete();

  response.json(foundProject);
});

router.post("/:id/favorite", async (request, response) => {
  checkIsInRole(Role.DIFFUSION_STRUCTURE)(request, response);
  const project = await findProject(request.params.id, request.user);
  if (!project) {
    throw new HttpError(404, "Not found");
  }

  const user = await User.findById(request.user._id);

  if (!user) {
    throw new HttpError(404, "Not found");
  }

  const favoriteIndex = project.favoritedBy.findIndex(
    (favorite) => favorite._id.toString() === user._id.toString(),
  );

  if (favoriteIndex !== -1) {
    project.favoritedBy.splice(favoriteIndex, 1);
  } else {
    project.favoritedBy.push(user);
  }

  await project.save();

  response.json(project);
});

router.post("/:id/claim", async (request, response) => {
  checkIsInRole(Role.ARTISTIC_TEAM)(request, response);
  const project = await findProject(request.params.id, request.user);
  if (!project) {
    throw new HttpError(404, "Not found");
  }

  const user = await User.findById(request.user._id);

  if (!user) {
    throw new HttpError(404, "Not found");
  }

  project.users.push(user);

  await project.save();

  response.json(project);
});

type ShareProjectParams = {
  id: string;
};

type ShareProjectBody = {
  users: ({ _id: string } | string)[];
  message: string;
  tourId?: string;
};

router.post(
  "/:id/share",
  async (
    request: Request<ShareProjectParams, {}, ShareProjectBody>,
    response,
  ) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE)(request, response);
    const project = await findProject(request.params.id, request.user);
    if (!project) {
      console.error("Project not found", {
        projectId: request.params.id,
        userId: request.user._id,
      });
      throw new HttpError(404, "Not found");
    }

    let tour: Tour | null = null;
    if (request.body.tourId) {
      tour = project.tours.find(
        (tour) => tour._id.toString() === request.body.tourId,
      );
      if (!tour) {
        throw new HttpError(404, "Tour not found");
      }
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new HttpError(404, "Not found");
    }

    request.body.users.forEach(async (recipient) => {
      if (typeof recipient === "string") {
        // Generate registration link for new users
        const registrationLink = `${process.env.FRONTEND_URL}/authentication/register`;

        send({
          to: recipient,
          from: process.env.MAIL_FROM,
          ...(await mail(
            tour ? "invite-tour" : "invite-project",
            user.language || "en",
            {
              invitingUser: user,
              invitingUserProfile: request.profile,
              project,
              tour,
              link: registrationLink,
              ...(request.body.message
                ? {
                    message: {
                      html: request.body.message,
                      raw: htmlToRawText(request.body.message),
                    },
                  }
                : {}),
            },
          )),
        });
        return;
      }

      await sendNotification(recipient._id, NotificationType.PROJECT_SHARED, {
        projectId: project._id,
        userId: user._id,
        message: request.body.message,
        tourId: request.body.tourId,
      });
    });

    response.json(project);
  },
);

type PostUsersParams = {
  id: string;
};

type PostUsersBody = {
  user: Partial<UserType>;
  customMessage?: string;
};

router.post(
  "/:id/users",
  async (request: Request<PostUsersParams, {}, PostUsersBody>, response) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );

    const project = await findProject(request.params.id, request.user);
    if (!project) {
      throw new HttpError(404, "Not found");
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new HttpError(404, "Not found");
    }

    const userToAdd = await findOrInviteUser(request.body.user, {
      currentUser: request.user,
      currentProfile: request.profile,
      project,
      message: sanitizeHtmlForEmail(request.body.customMessage),
    });

    if (
      !project.users.find((u) => u._id.toString() === userToAdd._id.toString())
    ) {
      if (!userToAdd) {
        console.error("Failed to find or invite user when adding to project", {
          requestUser: request.body.user,
          currentUser: request.user._id,
          projectId: project._id,
        });
      }

      project.users.push(userToAdd);

      await project.save();

      // Send notification to the user being added
      await sendNotification(
        userToAdd._id,
        NotificationType.PROJECT_USER_ADDED,
        {
          projectId: project._id,
          userId: request.user._id,
          message: sanitizeHtmlForEmail(request.body.customMessage),
        },
      );
    }

    response.json(project);
  },
);

type PostTourUsersParams = {
  projectId: string;
  tourId: string;
};
type PostTourUsersBody = {
  user: Partial<UserType>;
  customMessage?: string;
};

router.post(
  "/:projectId/tours/:tourId/users",
  async (
    request: Request<PostTourUsersParams, {}, PostTourUsersBody>,
    response,
  ) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );

    const project = await findProject(request.params.projectId, request.user);
    if (!project) {
      throw new HttpError(404, "Not found");
    }

    const tour = project.tours.find(
      (tour) => tour._id.toString() === request.params.tourId,
    );

    if (!tour) {
      throw new HttpError(404, "Not found");
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new HttpError(404, "Not found");
    }

    const userToAdd = await findOrInviteUser(request.body.user, {
      currentUser: request.user,
      currentProfile: request.profile,
      project,
      message: sanitizeHtmlForEmail(request.body.customMessage),
    });

    if (!userToAdd) {
      console.error("Failed to find or invite user when adding to tour", {
        requestUser: request.body.user,
        currentUser: request.user._id,
        projectId: project._id,
        tourId: tour._id,
      });
    }

    tour.users.push(userToAdd);

    await project.save();

    // Send notification to the user being added to the tour
    await sendNotification(userToAdd._id, NotificationType.PROJECT_USER_ADDED, {
      projectId: project._id,
      tourId: tour._id,
      userId: request.user._id,
      message: sanitizeHtmlForEmail(request.body.customMessage),
    });

    response.json(project);
  },
);

router.post("/:projectId/tours/:tourId/interest", async (request, response) => {
  checkIsInRole(Role.DIFFUSION_STRUCTURE)(request, response);

  const project = await findProject(request.params.projectId, request.user);
  if (!project) {
    throw new HttpError(404, "Not found");
  }

  const tour = project.tours.find(
    (tour) => tour._id.toString() === request.params.tourId,
  );

  if (!tour) {
    throw new HttpError(404, "Not found");
  }

  const user = await User.findById(request.user._id);

  if (!user) {
    throw new HttpError(404, "Not found");
  }

  const userIndex = tour.users.findIndex(
    (u) => u._id.toString() === user._id.toString(),
  );

  if (userIndex !== -1) {
    throw new HttpError(400, "Already interested");
  }
  tour.users.push(user);

  await project.save();

  await saveNewInterestMessage(tour._id, user);

  response.json(tour);
});

router.delete(
  "/:projectId/tours/:tourId/interest",
  async (request, response) => {
    checkIsInRole(Role.ADMIN, Role.DIFFUSION_STRUCTURE)(request, response);

    const project = await findProject(request.params.projectId, request.user);
    if (!project) {
      throw new HttpError(404, "Not found");
    }

    const tour = project.tours.find(
      (tour) => tour._id.toString() === request.params.tourId,
    );

    if (!tour) {
      throw new HttpError(404, "Not found");
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new HttpError(404, "Not found");
    }

    const userIndex = tour.users.findIndex(
      (u) => u._id.toString() === user._id.toString(),
    );

    if (userIndex === -1) {
      throw new HttpError(400, "Not interested");
    }
    tour.users.splice(userIndex, 1);

    tour.schedule = tour.schedule.filter(
      (program) => program.user?._id.toString() !== user._id.toString(),
    );

    await project.save();

    await saveRemoveInterestMessage(tour._id, user);

    response.json(tour);
  },
);

interface UserToFindOrInvite {
  company?: string;
  _id?: string;
  role?: Role;
  email?: string;
  firstName?: string;
  lastName?: string;
  shouldInvite?: boolean;
  customMessage?: string;
  // location?: Location;
  locations?: LabeledLocation[];
}

const findOrInviteUser = async (
  user: UserToFindOrInvite,
  options: {
    currentUser: UserType;
    currentProfile?: Profile;
    project?: ProjectType;
    tour?: TourType;
    message?: string;
  },
  sendMail: boolean = true,
) => {
  let existingUser: UserType | null = null;
  if (user._id) {
    existingUser = await User.findOne({
      _id: user._id,
    });
  } else if (user.email) {
    existingUser = await User.findOne({
      email: user.email,
    });
  } else if (user.company && user.locations?.length > 0) {
    const locationCoordinates =
      user.locations[0].location.geolocation.coordinates;
    const radiusRadians = 10 / 6378100;
    existingUser = await User.findOne({
      company: user.company,
      locations: {
        $elemMatch: {
          "location.geolocation": {
            $geoWithin: {
              $centerSphere: [
                [locationCoordinates[0], locationCoordinates[1]],
                radiusRadians,
              ],
            },
          },
        },
      },
    });
  }
  if (existingUser) {
    const mailTemplate =
      existingUser.role === Role.ARTISTIC_TEAM
        ? "added-artistic-team"
        : "added-diffusion-structure";
    if (sendMail) {
      send({
        to: existingUser.email,
        from: process.env.MAIL_FROM,
        ...(await mail(mailTemplate, existingUser.language || "en", {
          existingUser: existingUser,
          invitingUser: options.currentUser,
          invitingUserProfile: options.currentProfile,
          project: options.project,
          tour: options.tour,
          ...(options.message
            ? {
                message: {
                  html: sanitizeHtmlForEmail(options.message),
                  raw: htmlToRawText(sanitizeHtmlForEmail(options.message)),
                },
              }
            : {}),
        })),
      });
    }
    return existingUser;
  }

  const userToRegister = new User({
    ...user,
    language: options.currentUser.language,
    role: user.role || Role.DIFFUSION_STRUCTURE,
    locations: user.locations ? user.locations : [],
    profiles: [
      {
        firstName: user.firstName,
        lastName: user.lastName,
        contactInformation: {
          type: "email",
          value: user.email,
        },
      },
    ],
    status: user.role === Role.ARTISTIC_TEAM ? "ok" : "awaiting-moderation",
  });

  await userToRegister.save();

  const payload = {
    id: userToRegister._id,
    reason: "invited-by-user",
    role: userToRegister.role,
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

  userToRegister.resetPasswordToken = token;

  await userToRegister.save();

  if (user.shouldInvite) {
    const mailTemplate =
      userToRegister.role === Role.ARTISTIC_TEAM
        ? "invite-artistic-team"
        : "invite-diffusion-structure";
    if (sendMail) {
      send({
        to: userToRegister.email,
        from: process.env.MAIL_FROM,
        ...(await mail(mailTemplate, userToRegister.language || "en", {
          user: userToRegister,
          invitingUser: options.currentUser,
          invitingUserProfile: options.currentProfile,
          project: options.project,
          tour: options.tour,
          link: `${process.env.FRONTEND_URL}/authentication/confirm-account/${token}`,
          ...(options.message
            ? {
                message: {
                  html: sanitizeHtmlForEmail(options.message),
                  raw: htmlToRawText(sanitizeHtmlForEmail(options.message)),
                },
              }
            : {}),
        })),
      });
    }
  }
  return userToRegister;
};

router.post("/:projectId/tours/:tourId/schedule", async (request, response) => {
  checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
    request,
    response,
  );
  const project = await findProject(request.params.projectId, request.user);
  if (!project) {
    throw new HttpError(404, "Not found");
  }

  const tour = project.tours.find(
    (tour) => tour._id.toString() === request.params.tourId,
  );

  if (!tour) {
    throw new HttpError(404, "Not found");
  }

  if (!Object.values(ProgramStatuses).includes(request.body.status)) {
    throw new HttpError(400, "Invalid status");
  }

  const loggedUser = request.user;

  const usersThatCanEdit = [...project.users, ...tour.users];

  if (
    !usersThatCanEdit.find(
      (user) => user._id.toString() === loggedUser._id.toString(),
    )
  ) {
    throw new HttpError(403, "Forbidden");
  }

  // let userToFindOrInvite: UserToFindOrInvite | null = null;
  // if (request.body.user) {
  //   userToFindOrInvite = request.body.user;
  //   if (request.body.location) {
  //     userToFindOrInvite.locations = [
  //       {
  //         location: request.body.location,
  //         label: request.body.location.address || "Main location",
  //         isMain: true,
  //       },
  //     ];
  //   }
  // } else {
  //   userToFindOrInvite = request.user;
  // }

  const user = await findOrInviteUser(
    request.body.user || request.user,
    {
      currentUser: request.user,
      currentProfile: request.profile,
      project,
      tour,
      message: sanitizeHtmlForEmail(request.body.customMessage),
    },
    false,
  );

  if (
    !user &&
    [ProgramStatuses.SHOW_PENDING, ProgramStatuses.SHOW_CONFIRMED].includes(
      request.body.status,
    )
  ) {
    console.error(
      "Failed to find or invite user in schedule route for pending/confirmed program",
      {
        requestUser: request.body.user,
        fallbackUser: request.user,
        tourId: tour._id,
        projectId: project._id,
        status: request.body.status,
      },
    );
  }

  let location: Location | null = null;

  if (request.body.location) {
    location = request.body.location;
  } else if (request.body.user) {
    const userMainLocation = user.locations?.find(
      (loc) => loc.isMain,
    )?.location;
    if (userMainLocation) {
      location = userMainLocation;
    } else {
      location = getMainLocation(user);
    }
  } else {
    location = getMainLocation(user);
  }

  const program = {
    date: new Date(request.body.date),
    location,
    user: user,
    status: request.body.status,
  } as Program;

  switch (program.status) {
    case ProgramStatuses.BLOCKED:
    case ProgramStatuses.UNAVAILABLE:
      tour.schedule = tour.schedule.filter(
        (p) =>
          !isSameDay(p.date, program.date) ||
          ![
            ProgramStatuses.SHOW_CONFIRMED,
            ProgramStatuses.SHOW_PENDING,
            ProgramStatuses.SHOW_WISHED,
          ].includes(p.status),
      );
      break;
  }

  tour.schedule.push(program);

  if (
    !tour.users.find((u) => u._id.toString() === user._id.toString()) &&
    [ProgramStatuses.SHOW_PENDING, ProgramStatuses.SHOW_CONFIRMED].includes(
      program.status,
    )
  ) {
    tour.users.push(user);
  }

  await project.save();

  await saveNewProgramMessage(tour._id, request.user, program);

  // Send notification to the person for whom the date was scheduled
  if (user._id.toString() !== request.user._id.toString()) {
    await sendNotification(user._id, NotificationType.DATE_SCHEDULED_FOR_YOU, {
      projectId: project._id,
      tourId: tour._id,
      programDate: program.date,
      programStatus: program.status,
      scheduledBy: request.user._id,
      customMessage: request.body.customMessage,
    });
  }

  if (user.email) {
    if (user.status === "awaiting-moderation") {
      const payload = {
        id: user._id,
        reason: "invited-by-user",
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET, {
        expiresIn: eval(process.env.INVITATION_TOKEN_EXPIRY),
      });

      send({
        to: user.email,
        from: process.env.MAIL_FROM,
        ...(await mail("invite-schedule-tour", user.language || "en", {
          user,
          invitingUser: request.user,
          invitingUserProfile: request.profile,
          project,
          tour,
          program,
          link: `${process.env.FRONTEND_URL}/authentication/confirm-account/${token}`,
          ...(request.body.customMessage
            ? {
                message: {
                  html: sanitizeHtmlForEmail(request.body.customMessage),
                  raw: htmlToRawText(
                    sanitizeHtmlForEmail(request.body.customMessage),
                  ),
                },
              }
            : {}),
        })),
      });
    } else if (user._id.toString() !== request.user._id.toString()) {
      send({
        to: user.email,
        from: process.env.MAIL_FROM,
        ...(await mail("schedule-tour", user.language || "en", {
          user,
          invitingUser: request.user,
          invitingUserProfile: request.profile,
          project,
          tour,
          program,
          ...(request.body.customMessage
            ? {
                message: {
                  html: sanitizeHtmlForEmail(request.body.customMessage),
                  raw: htmlToRawText(
                    sanitizeHtmlForEmail(request.body.customMessage),
                  ),
                },
              }
            : {}),
        })),
      });
    }
  }
  response.json(tour);
});

interface PatchProgramBody {
  status?: ProgramStatuses;
  date?: Date;
  note?: string;
}

router.patch(
  "/:projectId/tours/:tourId/programs/:programId",
  async (
    request: Request<
      { projectId: string; tourId: string; programId: string },
      {},
      PatchProgramBody
    >,
    response,
  ) => {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(
      request,
      response,
    );
    const project = await findProject(request.params.projectId, request.user);
    if (!project) {
      throw new HttpError(404, "Not found");
    }

    const tour = project.tours.find(
      (tour) => tour._id.toString() === request.params.tourId,
    );

    if (!tour) {
      throw new HttpError(404, "Not found");
    }

    const program = tour.schedule.find(
      (program) => program._id.toString() === request.params.programId,
    );

    if (!program) {
      throw new HttpError(404, "Not found");
    }

    const loggedUser = request.user;

    const usersThatCanEdit = [...project.users, ...tour.users];

    if (
      !usersThatCanEdit.find(
        (user) => user._id.toString() === loggedUser._id.toString(),
      )
    ) {
      throw new HttpError(403, "Forbidden");
    }

    let programUpdated = false;

    if (
      typeof request.body.status !== "undefined" &&
      program.status !== request.body.status
    ) {
      if (!Object.values(ProgramStatuses).includes(request.body.status)) {
        throw new HttpError(400, "Invalid status");
      }

      program.status = request.body.status;
    }

    if (
      typeof request.body.date !== "undefined" &&
      program.date !== request.body.date
    ) {
      program.date = new Date(request.body.date);
    }

    if (
      typeof request.body.note !== "undefined" &&
      program.note !== request.body.note
    ) {
      program.note = request.body.note;
      programUpdated = true;
    }

    if (programUpdated) {
      await project.save();
      await saveUpdatedProgramMessage(tour._id, request.user, program);
    }

    response.json(tour);
  },
);

router.post(
  "/:projectId/tours/:tourId/unschedule",
  async (request, response) => {
    checkIsInRole(
      Role.ADMIN,
      Role.DIFFUSION_STRUCTURE,
      Role.ARTISTIC_TEAM,
    )(request, response);
    const project = await findProject(request.params.projectId, request.user);
    if (!project) {
      throw new HttpError(404, "Not found");
    }

    const tour = project.tours.find(
      (tour) => tour._id.toString() === request.params.tourId,
    );

    if (!tour) {
      throw new HttpError(404, "Not found");
    }

    const user = await User.findById(request.user._id);

    if (!user) {
      throw new HttpError(404, "Not found");
    }

    const loggedUser = request.user;

    const usersThatCanEdit = [...project.users, ...tour.users];
    if (
      !usersThatCanEdit.find(
        (user) => user._id.toString() === loggedUser._id.toString(),
      )
    ) {
      throw new HttpError(403, "Forbidden");
    }

    const program = tour.schedule.find(
      (program) => program._id.toString() === request.body.id,
    );

    if (!program) {
      throw new HttpError(404, "Not found");
    }

    project.tours = project.tours.map((t) => {
      if (t._id.toString() === tour._id.toString()) {
        // Log the program being removed
        const programBeingRemoved = t.schedule.find(
          (program) => program._id.toString() === request.body.id,
        );
        if (
          programBeingRemoved &&
          !programBeingRemoved.user &&
          [
            ProgramStatuses.SHOW_PENDING,
            ProgramStatuses.SHOW_CONFIRMED,
          ].includes(programBeingRemoved.status)
        ) {
          console.error(
            "Removing pending/confirmed program that has null user",
            {
              tourId: tour._id,
              programId: request.body.id,
              date: programBeingRemoved.date,
              status: programBeingRemoved.status,
            },
          );
        }

        t.schedule = t.schedule.filter(
          (program) => program._id.toString() !== request.body.id,
        );
      }
      return t;
    });

    await project.save();

    const updatedProject = await findProject(
      request.params.projectId,
      request.user,
    );

    const updatedTour = updatedProject.tours.find(
      (tour) => tour._id.toString() === request.params.tourId,
    );

    await saveUnscheduleMessage(tour._id, request.user, program);

    response.json(updatedTour);
  },
);

router.patch(
  "/:projectId/tours/:tourId/last-seen",
  async (request, response) => {
    const project = await findProject(request.params.projectId, request.user);
    if (!project) throw new HttpError(404, "Project not found");

    const tour = project.tours.find(
      (t) => t._id.toString() === request.params.tourId,
    );
    if (!tour) throw new HttpError(404, "Tour not found");

    tour.lastSeenByUser = {
      ...tour.lastSeenByUser,
      [request.user._id.toString()]: new Date(),
    };

    await project.save();
    response.json(tour);
  },
);

export default router;
