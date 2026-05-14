import Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { expressErrorHandler } from "@sentry/node";

import * as dotenv from "dotenv-flow";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction } from "express";
import "express-async-errors";
import boolParser from "express-query-boolean";
import expressWinston from "express-winston";
import winston from "winston";

import errorHandler from "./middlewares/errorHandler";

import projectsAdminRoutes from "./projects/adminRoutes";
import userAdminRoutes from "./users/adminRoutes";

import authenticationPublicRoutes from "./authentication/publicRoutes";
import configurationAdminRoutes from "./configuration/adminRoutes";
import configurationPublicRoutes from "./configuration/publicRoutes";
import projectsPublicRoutes from "./projects/publicRoutes";
import chatMessagesPublicRoutes from "./chatMessages/publicRoutes";
import statsAdminRoutes from "./stats/adminRoutes";
import statsPublicRoutes from "./stats/publicRoutes";
import usersPublicRoutes from "./users/publicRoutes";

import { authenticate, checkIsInRole } from "./authentication/authenticate";
import seedConfiguration from "./configuration/seed";
import connect, { up } from "./db";
import seedProjects from "./projects/seed";
import seedChatMessages from "./chatMessages/seed";
import seedUsers from "./users/seed";

import registerCrons from "./crons";
import { Role } from "@cooprog/core";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_COMMIT_SHA,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.5,
    profilesSampleRate: 0.5,
  });
}

connect().then(async ({ connection }) => {
  try {
    await up(connection);
    await seedUsers();
    await seedConfiguration();
    await seedProjects();
    seedChatMessages();
  } catch (err) {
    console.log("There was an error seeding the database");
    console.log(err);
  }
});

registerCrons();

const app: Application = express();

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    allowedHeaders: [
      "X-Total-Count",
      "Content-Type",
      "Authorization",
      "baggage",
      "sentry-trace",
      "Content-Disposition",
      "X-Selected-Profile-Id",
    ],
    exposedHeaders: ["X-Total-Count", "X-Forwarded-Host"],
  })
);

app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.startsWith("multipart/form-data")) {
    next();
  } else {
    bodyParser.json()(req, res, (err) => {
      if (err) return next(err);
      bodyParser.urlencoded({ extended: true })(req, res, next);
    });
  }
});

app.use(boolParser());
app.use(cookieParser(process.env.COOKIE_SECRET));

const logFormat =
  process.env.LOGGER_FORMAT === "json"
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      );

if (process.env.LOGGER_LEVEL) {
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: logFormat,
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      expressFormat: process.env.LOGGER_FORMAT === "json" ? true : false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: process.env.LOGGER_FORMAT === "json" ? false : true,
      level: process.env.LOGGER_LEVEL || "error",
    })
  );
}

app.use("/api/stats", statsPublicRoutes);
app.use("/api/users", usersPublicRoutes);

app.use(authenticate);
app.use("/api/authentication", authenticationPublicRoutes);

app.use(
  "/api/configuration",
  checkIsInRole(
    Role.DIFFUSION_STRUCTURE,
    Role.ARTISTIC_TEAM,
    Role.ADMIN,
    Role.SPECTATOR
  ),
  configurationPublicRoutes
);
app.use(
  "/api/projects",
  checkIsInRole(
    Role.DIFFUSION_STRUCTURE,
    Role.ARTISTIC_TEAM,
    Role.ADMIN,
    Role.SPECTATOR
  ),
  projectsPublicRoutes
);

app.use(
  "/api/chatMessages",
  checkIsInRole(
    Role.DIFFUSION_STRUCTURE,
    Role.ARTISTIC_TEAM,
    Role.ADMIN,
    Role.SPECTATOR
  ),
  chatMessagesPublicRoutes
);

app.use("/admin/api/users", checkIsInRole(Role.ADMIN), userAdminRoutes);
app.use("/admin/api/projects", checkIsInRole(Role.ADMIN), projectsAdminRoutes);
app.use(
  "/admin/api/configurations",
  checkIsInRole(Role.ADMIN),
  configurationAdminRoutes
);
app.use("/admin/api/stats", checkIsInRole(Role.ADMIN), statsAdminRoutes);

app.get("/api/500", () => {
  throw new Error("Manually threw error, everything is ok!");
});

if (process.env.SENTRY_DSN) {
  app.use(expressErrorHandler());
}

app.use(errorHandler);
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: logFormat,
  })
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
