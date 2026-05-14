import Configuration from "../configuration/model";
import { mail, send } from "../mails";
import User from "../users/model";

const sendInactivityWarnings = async () => {
  const configuration = await Configuration.findOne({
    name: "inactive-account-warning-delay-days",
  });
  if (!configuration || !configuration.value || isNaN(configuration.value)) {
    throw new Error(
      "Configuration inactive-account-warning-delay-days not found"
    );
  }
  const delay = configuration.value;

  const inactiveUsers = await User.find({
    lastActive: {
      $lte: new Date(Date.now() - delay * 24 * 60 * 60 * 1000),
    },
    $or: [
      { inactivityWarningSent: false },
      { inactivityWarningSent: { $exists: false } },
    ],
  });

  console.log(
    "CRON: sendInactivityWarnings",
    inactiveUsers.map((user) => user._id)
  );
  for (let user of inactiveUsers) {
    await send({
      to: user.email,
      from: process.env.MAIL_FROM,
      ...(await mail("inactivity-removal-warning", user.language || "en", {
        user,
      })),
    });
    user.inactivityWarningSent = true;
    await user.save();
  }
};

export default sendInactivityWarnings;
