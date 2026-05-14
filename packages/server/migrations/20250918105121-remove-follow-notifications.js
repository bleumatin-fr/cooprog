const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log("Starting removal of FOLLOW_* notifications...");

    // Get all users with notifications
    const users = await db
      .collection("users")
      .find({
        notifications: { $exists: true, $ne: [] },
      })
      .toArray();

    console.log(`Found ${users.length} users with notifications`);

    let totalNotificationsRemoved = 0;
    let usersUpdated = 0;

    // Define the FOLLOW_* notification types to remove
    const followNotificationTypes = [
      "follow_request",
      "follow_request_accepted",
      "follow_request_accepted_and_back",
    ];

    for (const user of users) {
      if (!user.notifications || user.notifications.length === 0) {
        continue;
      }

      const originalNotificationCount = user.notifications.length;
      const validNotifications = [];

      for (const notification of user.notifications) {
        // Keep notification if it's not a FOLLOW_* type
        if (!followNotificationTypes.includes(notification.type)) {
          validNotifications.push(notification);
        } else {
          console.log(
            `Removing FOLLOW notification ${notification.type} from user ${user._id}`
          );
        }
      }

      const notificationsRemoved =
        originalNotificationCount - validNotifications.length;

      if (notificationsRemoved > 0) {
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { notifications: validNotifications } }
          );
        totalNotificationsRemoved += notificationsRemoved;
        usersUpdated++;
        console.log(
          `User ${user._id}: removed ${notificationsRemoved} FOLLOW notifications`
        );
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Users updated: ${usersUpdated}`);
    console.log(
      `- Total FOLLOW notifications removed: ${totalNotificationsRemoved}`
    );
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - FOLLOW notifications have been permanently removed"
    );
  },
};
