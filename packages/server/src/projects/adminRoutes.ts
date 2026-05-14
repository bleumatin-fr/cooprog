import { Genre, Program, TargetAudience, Tour } from "@cooprog/core";
import express, { Request } from "express";
import mongoose, { SortOrder } from "mongoose";
import { HttpError } from "../middlewares/errorHandler";
import User from "../users/model";
import Project from "./model";
import { ObjectId } from "mongodb";

const router = express.Router();

const replaceOutgoingDates = (project: any) => {
  return {
    ...project,
    schedule: project.schedule.map((program: any) => {
      return {
        ...program,
        date_start: program.date.start,
        date_end: program.date.end,
      };
    }),
  };
};

interface RequestQuery {
  _start: number;
  _end: number;
  genres: string | string[];
  discipline?: string | string[];
  disciplines?: string | string[];
  _order: "ASC" | "DESC";
  _sort: "name" | "startDate" | "endDate" | "programCount" | "favoriteCount";
  users: string | string[];
  q?: string;
}

router.get(
  "/",
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    const { _end, _order, _sort, _start, q, users, genres } =
      request.query;
    const disciplineFilter =
      request.query.discipline ?? request.query.disciplines;

    let filter = {};

    if (q) {
      filter = {
        ...filter,
        $or: [
          { artist: { $regex: q, $options: "i" } },
          { work: { $regex: q, $options: "i" } },
        ],
      };
    }

    if (users) {
      if (Array.isArray(users)) {
        filter = {
          ...filter,
          $or: [{ users: { $in: users } }, { "tours.users": { $in: users } }],
        };
      } else {
        filter = {
          ...filter,
          $or: [
            { users: { $in: [users] } },
            { "tours.users": { $in: [users] } },
          ],
        };
      }
    }

    if (genres) {
      if (Array.isArray(genres)) {
        filter = { ...filter, genres: { $in: genres } };
      } else {
        filter = { ...filter, genres: { $in: [genres] } };
      }
    }

    if (disciplineFilter) {
      if (Array.isArray(disciplineFilter)) {
        filter = { ...filter, discipline: { $in: disciplineFilter } };
      } else {
        filter = { ...filter, discipline: { $in: [disciplineFilter] } };
      }
    }

    let sort: { [key: string]: SortOrder } = {
      [_sort]: _order === "ASC" ? 1 : -1,
      name: _sort === "name" ? (_order === "ASC" ? 1 : -1) : 1,
    };

    const foundProjects = await Project.find(
      filter,
      {},
      { sort, skip: _start, limit: _end - _start },
    ).populate([
      { path: "users" },
      { path: "tours.users" },
      { path: "tours.schedule.user" },
    ]);
    const projectsCount = await Project.count(filter);

    response.setHeader("X-Total-Count", projectsCount);

    response.json(foundProjects);
  },
);

router.get("/:id", async (request, response) => {
  const foundProject = await Project.findOne(
    mongoose.isValidObjectId(request.params.id)
      ? { _id: new ObjectId(request.params.id) }
      : { spreadsheetId: request.params.id },
  );
  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }
  response.json(foundProject);
});

router.post("/", async (request, response) => {
  const newProject = new Project(replaceIncomingDates(request.body));
  response.json(await newProject.save());
});

const updateLocation = async (modifications: { [key: string]: any }) => {
  if (modifications.tours) {
    for (const tour of modifications.tours) {
      // Never pass through tour._id from admin payload: omit so we don't persist null (new tours)
      // and don't trust client ids (existing behavior). Mongoose keeps existing _ids when merging.
      delete tour._id;
      if (tour.schedule) {
        for (const program of tour.schedule) {
          const user = await User.findById(program.user);
          if (program._id === "") {
            delete program._id;
          }
          if (user) {
            const mainLocation = user.locations.find((loc: any) => loc.isMain);
            if (mainLocation && mainLocation.location) {
              program.location = mainLocation.location;
            }
          }
        }
      }
    }
  }
};

const replaceIncomingDates = (modifications: { [key: string]: any }) => {
  if (modifications.schedule) {
    for (const modification of modifications.schedule) {
      modification.date = {
        start: modification.date_start,
        end: modification.date_end,
      };
    }
  }
};

router.put(
  "/:id",
  async (
    request: Request<{ id: string }, {}, { name: string; tours: Tour[] }>,
    response,
  ) => {
    const modifications = request.body;

    await updateLocation(modifications);
    replaceIncomingDates(modifications);

    const project = await Project.findById(request.params.id);
    if (!project) {
      throw new HttpError(404, "Not found");
    }
    project.set(modifications);
    const newProject = await project.save();

    if (!newProject) {
      throw new HttpError(404, "Not found");
    }
    response.json(newProject);
  },
);

router.delete("/:id", async (request, response) => {
  const foundProject = await Project.findById(request.params.id);
  if (!foundProject) {
    throw new HttpError(404, "Not found");
  }

  await foundProject.delete();

  response.json(foundProject);
});

export default router;
