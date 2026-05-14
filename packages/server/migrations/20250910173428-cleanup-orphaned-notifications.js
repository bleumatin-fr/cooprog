const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log("Starting cleanup of orphaned notifications...");

    // Get all existing project IDs
    const projects = await db
      .collection("projects")
      .find({}, { _id: 1 })
      .toArray();
    const existingProjectIds = new Set(projects.map((p) => p._id.toString()));

    // Get all existing tour IDs from all projects
    const projectsWithTours = await db
      .collection("projects")
      .find({ "tours._id": { $exists: true } }, { "tours._id": 1 })
      .toArray();

    const existingTourIds = new Set();
    projectsWithTours.forEach((project) => {
      if (project.tours) {
        project.tours.forEach((tour) => {
          existingTourIds.add(tour._id.toString());
        });
      }
    });

    console.log(`Found ${existingProjectIds.size} existing projects`);
    console.log(`Found ${existingTourIds.size} existing tours`);

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

    for (const user of users) {
      if (!user.notifications || user.notifications.length === 0) {
        continue;
      }

      const originalNotificationCount = user.notifications.length;
      const validNotifications = [];

      for (const notification of user.notifications) {
        let shouldKeep = true;

        // Check notifications that reference projects
        if (notification.meta && notification.meta.projectId) {
          const projectId = notification.meta.projectId.toString();
          if (!existingProjectIds.has(projectId)) {
            console.log(
              `Removing notification ${notification.type} for non-existent project ${projectId}`
            );
            shouldKeep = false;
          }
        }

        // Check notifications that reference tours
        if (notification.meta && notification.meta.tourId) {
          const tourId = notification.meta.tourId.toString();
          if (!existingTourIds.has(tourId)) {
            console.log(
              `Removing notification ${notification.type} for non-existent tour ${tourId}`
            );
            shouldKeep = false;
          }
        }

        if (shouldKeep) {
          validNotifications.push(notification);
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
          `User ${user._id}: removed ${notificationsRemoved} orphaned notifications`
        );
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Users updated: ${usersUpdated}`);
    console.log(`- Total notifications removed: ${totalNotificationsRemoved}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - orphaned notifications have been permanently removed"
    );
  },
};
