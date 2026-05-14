import MigrateMongo, { up as migrateUp } from "migrate-mongo";
import { connect, Connection } from "mongoose";

import User from "./users/model";
import Project from "./projects/model";

const connectionString =
  process.env.MONGO_URL || "mongodb://localhost:27017/coprog";

const replayHooks = async () => {
  await User.find().then(async (users) => {
    for (const user of users) {
      await user.save();
    }
  });
  await Project.find().then(async (projects) => {
    for (const project of projects) {
      await project.save();
    }
  });
};

export const up = async (connection: Connection) => {
  console.log("up : syncIndexes");
  await User.syncIndexes().catch((e) => console.error(e));
  await Project.syncIndexes().catch((e) => console.error(e));
  console.log("up : migrateUp");
  const migrated = await (
    await migrateUp
  )(connection.db, connection.getClient());
  if (migrated.length > 0) {
    console.log("up : replayHooks");
    await replayHooks();
  }
  return migrated;
};

export default async () => {
  return await connect(connectionString);
};
