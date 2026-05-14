import Configuration from "../configuration/model";
import Project from "../projects/model";
import User from "../users/model";

const removeInactiveAccounts = async () => {
  const configuration = await Configuration.findOne({
    name: "inactive-account-delete-delay-days",
  });
  if (!configuration || !configuration.value || isNaN(configuration.value)) {
    throw new Error(
      "Configuration inactive-account-delete-delay-days not found",
    );
  }
  const delay = configuration.value;
  const filter = {
    lastActive: {
      $lte: new Date(Date.now() - delay * 24 * 60 * 60 * 1000),
    },
    inactivityWarningSent: true,
  };
  const inactiveUsers = await User.find(filter);

  if (inactiveUsers.length > 0) {
    const inactiveUserIds = inactiveUsers.map((user) => user._id);
    console.log(
      "CRON: removeInactiveAccounts",
      inactiveUsers.map((user) => user._id.toString()),
    );
    await Project.updateMany(
      {},
      {
        $pull: {
          users: { user: { $in: inactiveUserIds } },
          "tours.$[].users": { user: { $in: inactiveUserIds } },
          favoritedBy: { $in: inactiveUserIds },
        },
      },
    );
    await User.deleteMany(filter);
  } else {
    console.log("CRON: removeInactiveAccounts", "no user to delete");
  }
};

export default removeInactiveAccounts;
