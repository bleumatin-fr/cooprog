import cron from "node-cron";
import removeInactiveAccounts from "./removeInactiveAccounts";
import removeInactiveTours from "./removeInactiveTours";
import sendInactivityWarnings from "./sendInactivityWarnings";
import sendModerationEmails from "./sendModerationEmails";
import sendProjectDupesSummary from "./sendProjectDupesSummary";
import sendWeeklyDigest from "./sendWeeklyDigest";

/**
 * This is used for debug purposes only
 * yarn run test-cron
 */
export const launchTasks = async () => {
  // await removeInactiveAccounts();
  // await sendInactivityWarnings();
  // await removeInactiveTours();
  // await sendPeopleJoinedProjectNotifications();
  // await sendWeeklyDigest();
  // await sendProjectDupesSummary();
  await removeInactiveTours();
};

export const launchWeeklyDigest = async () => {};

const registerCrons = () => {
  console.log("CRON: registerCrons");

  if (!process.env.CRON_SCHEDULE) {
    throw new Error("Environment variable CRON_SCHEDULE not set");
  }
  cron.schedule(process.env.CRON_SCHEDULE, async () => {
    await removeInactiveAccounts();
    await sendInactivityWarnings();
    await removeInactiveTours();
  });

  if (!process.env.CRON_MODERATION_SCHEDULE) {
    throw new Error("Environment variable CRON_MODERATION_SCHEDULE not set");
  }
  cron.schedule(process.env.CRON_MODERATION_SCHEDULE, async () => {
    // await sendModerationEmails();
  });

  if (!process.env.CRON_WEEKLY_DIGEST_SCHEDULE) {
    throw new Error("Environment variable CRON_WEEKLY_DIGEST_SCHEDULE not set");
  }
  cron.schedule(process.env.CRON_WEEKLY_DIGEST_SCHEDULE, async () => {
    await sendWeeklyDigest();
    await sendProjectDupesSummary();
  });
};

export default registerCrons;
