const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log(
      "Starting migration: remove-non-artistic-team-users-from-projects"
    );

    // Get all projects that have users
    const projects = await db
      .collection("projects")
      .find({ users: { $exists: true, $ne: [] } })
      .toArray();

    console.log(`Found ${projects.length} projects with users`);

    let projectsUpdated = 0;
    let totalUsersRemoved = 0;

    for (const project of projects) {
      if (!project.users || project.users.length === 0) {
        continue;
      }

      // Get all users for this project to check their roles
      const userIds = project.users.map((id) => new ObjectId(id));
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .toArray();

      // Filter to keep only artistic team users
      const artisticTeamUserIds = users
        .filter((user) => user.role === "artistic_team")
        .map((user) => user._id.toString());

      // Calculate how many users we're removing
      const usersToRemove = project.users.length - artisticTeamUserIds.length;
      totalUsersRemoved += usersToRemove;

      if (usersToRemove > 0) {
        // Update the project to only include artistic team users
        await db
          .collection("projects")
          .updateOne(
            { _id: project._id },
            { $set: { users: artisticTeamUserIds } }
          );

        projectsUpdated++;
        console.log(
          `Project ${project._id}: removed ${usersToRemove} non-artistic team users, kept ${artisticTeamUserIds.length} artistic team users`
        );
      } else {
        console.log(
          `Project ${project._id}: no changes needed (all users are artistic team)`
        );
      }
    }

    // Also handle tours within projects
    const projectsWithTours = await db
      .collection("projects")
      .find({ "tours.users": { $exists: true, $ne: [] } })
      .toArray();

    let toursUpdated = 0;
    let totalTourUsersRemoved = 0;

    for (const project of projectsWithTours) {
      const updatedTours = project.tours.map((tour) => {
        if (!tour.users || tour.users.length === 0) {
          return tour;
        }

        // Get all users for this tour to check their roles
        const userIds = tour.users.map((id) => new ObjectId(id));
        return db
          .collection("users")
          .find({ _id: { $in: userIds } })
          .toArray()
          .then((users) => {
            // Filter to keep only artistic team users
            const artisticTeamUserIds = users
              .filter((user) => user.role === "artistic_team")
              .map((user) => user._id.toString());

            const usersToRemove =
              tour.users.length - artisticTeamUserIds.length;
            totalTourUsersRemoved += usersToRemove;

            if (usersToRemove > 0) {
              console.log(
                `Tour ${tour._id} in project ${project._id}: removed ${usersToRemove} non-artistic team users, kept ${artisticTeamUserIds.length} artistic team users`
              );
            }

            return { ...tour, users: artisticTeamUserIds };
          });
      });

      // Wait for all tour updates to complete
      const resolvedTours = await Promise.all(updatedTours);

      // Check if any tours were actually updated
      const hasChanges = resolvedTours.some(
        (tour, index) =>
          JSON.stringify(tour.users) !==
          JSON.stringify(project.tours[index].users)
      );

      if (hasChanges) {
        await db
          .collection("projects")
          .updateOne({ _id: project._id }, { $set: { tours: resolvedTours } });

        toursUpdated++;
        console.log(`Project ${project._id}: updated tours users arrays`);
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Projects updated: ${projectsUpdated}`);
    console.log(`- Total users removed from projects: ${totalUsersRemoved}`);
    console.log(`- Tours updated: ${toursUpdated}`);
    console.log(`- Total users removed from tours: ${totalTourUsersRemoved}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - non-artistic team users have been permanently removed from projects"
    );
  },
};

