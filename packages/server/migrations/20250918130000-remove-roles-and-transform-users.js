const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log("Starting migration: remove-roles-and-transform-users");

    // Transform projects
    const projects = await db
      .collection("projects")
      .find({ users: { $exists: true, $ne: [] } })
      .toArray();

    let projectsUpdated = 0;

    for (const project of projects) {
      const newUsers = project.users
        .map((userWithRole) => {
          if (typeof userWithRole === "string") {
            // Already transformed
            return userWithRole;
          }
          if (userWithRole.user) {
            return userWithRole.user;
          }
          return userWithRole;
        })
        .filter(Boolean);

      await db
        .collection("projects")
        .updateOne({ _id: project._id }, { $set: { users: newUsers } });
      projectsUpdated++;
      console.log(`Project ${project._id}: transformed users array`);
    }

    // Transform tours within projects
    const projectsWithTours = await db
      .collection("projects")
      .find({ "tours.users": { $exists: true, $ne: [] } })
      .toArray();

    let toursUpdated = 0;

    for (const project of projectsWithTours) {
      const updatedTours = project.tours.map((tour) => {
        if (tour.users && Array.isArray(tour.users)) {
          const newUsers = tour.users
            .map((userWithRole) => {
              if (typeof userWithRole === "string") {
                // Already transformed
                return userWithRole;
              }
              if (userWithRole.user) {
                return userWithRole.user;
              }
              return userWithRole;
            })
            .filter(Boolean);

          return { ...tour, users: newUsers };
        }
        return tour;
      });

      await db
        .collection("projects")
        .updateOne({ _id: project._id }, { $set: { tours: updatedTours } });
      toursUpdated++;
      console.log(`Project ${project._id}: transformed tours users arrays`);
    }

    console.log(`Migration completed:`);
    console.log(`- Projects updated: ${projectsUpdated}`);
    console.log(`- Tours updated: ${toursUpdated}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - user roles have been permanently removed"
    );
  },
};
