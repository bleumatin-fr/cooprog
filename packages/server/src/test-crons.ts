import * as dotenv from "dotenv-flow";
dotenv.config();

import { launchTasks } from "./crons";
import connect from "./db";

connect().then(async ({ connection }) => {
  launchTasks().then(() => {
    process.exit(0);
  });
});
