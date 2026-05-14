import express from "express";

import Configuration from "../configuration/model";
import Project from "../projects/model";
import User from "../users/model";
import { Role } from "@cooprog/core";

const router = express.Router();

router.get("/", async (request, response) => {
  const projectCount = await Project.count();
  const lastMonthProjectCount = await Project.count({
    createdAt: {
      $gt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    },
  });
  const usersCount = await User.count({
    role: Role.DIFFUSION_STRUCTURE,
    status: "ok",
  });
  const lastMonthUserCount = await User.count({
    role: Role.DIFFUSION_STRUCTURE,
    status: "ok",
    createdAt: {
      $gt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    },
  });
  const artisticTeamsCount = await User.count({
    role: Role.ARTISTIC_TEAM,
    status: "ok",
  });
  const artisticTeamsLastMonthCount = await User.count({
    role: Role.ARTISTIC_TEAM,
    status: "ok",
    createdAt: {
      $gt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    },
  });
  const tonsCount = await Configuration.findOne({
    name: "total-avoided-km",
  });
  response.json({
    projectCount,
    lastMonthProjectCount,
    usersCount,
    lastMonthUserCount,
    tonsCount: parseFloat(tonsCount?.value || "0"),
    artisticTeamsCount,
    artisticTeamsLastMonthCount,
  });
});

export default router;
