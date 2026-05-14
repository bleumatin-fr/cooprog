const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log("Starting migration: sync-tour-schedule-users");

    // Get all projects that have tours
    const projects = await db
      .collection("projects")
      .find({ "tours.0": { $exists: true } })
      .toArray();

    console.log(`Found ${projects.length} projects with tours`);

    let projectsUpdated = 0;
    let toursUpdated = 0;
    let totalUsersAdded = 0;

    for (const project of projects) {
      if (!project.tours || project.tours.length === 0) {
        continue;
      }

      let projectNeedsUpdate = false;
      const updatedTours = [];

      for (const tour of project.tours) {
        if (!tour.schedule || tour.schedule.length === 0) {
          updatedTours.push(tour);
          continue;
        }

        // Extract all unique user IDs from the schedule
        const scheduleUserIds = tour.schedule
          .map((program) => program.user)
          .filter((userId) => userId) // Remove null/undefined users
          .map((userId) => userId.toString()) // Convert to string for comparison
          .filter((userId) => {
            // Filter out invalid ObjectIds
            try {
              new ObjectId(userId);
              return true;
            } catch (error) {
              console.warn(`Invalid ObjectId found in schedule: ${userId}`);
              return false;
            }
          });
        // Get current tour users as strings and validate ObjectIds
        const currentTourUsers = (tour.users || [])
          .map((userId) => userId.toString())
          .filter((userId) => {
            // Filter out invalid ObjectIds
            try {
              new ObjectId(userId);
              return true;
            } catch (error) {
              console.warn(`Invalid ObjectId found in tour.users: ${userId}`);
              return false;
            }
          });

        // Find users that are in schedule but not in tour.users
        const missingUsers = scheduleUserIds.filter(
          (userId) => !currentTourUsers.includes(userId)
        );

        // Combine current users with missing users and remove duplicates
        const allUserIds = [...new Set([...currentTourUsers, ...missingUsers])];

        // Convert back to ObjectIds
        const updatedTourUsers = allUserIds.map(
          (userId) => new ObjectId(userId)
        );

        const usersAdded = missingUsers.length;
        totalUsersAdded += usersAdded;

        if (usersAdded > 0) {
          console.log(
            `Tour ${tour._id} in project ${project._id}: added ${usersAdded} users from schedule to tour.users`
          );
          toursUpdated++;
          projectNeedsUpdate = true;
        }

        updatedTours.push({
          ...tour,
          users: updatedTourUsers,
        });
      }

      if (projectNeedsUpdate) {
        await db
          .collection("projects")
          .updateOne({ _id: project._id }, { $set: { tours: updatedTours } });
        projectsUpdated++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Projects updated: ${projectsUpdated}`);
    console.log(`- Tours updated: ${toursUpdated}`);
    console.log(`- Total users added to tour.users: ${totalUsersAdded}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - users added from schedule to tour.users cannot be automatically removed"
    );
  },
};
