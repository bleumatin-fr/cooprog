const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log("Starting transformation of project users structure...");

    // Get all projects
    const projects = await db.collection("projects").find({}).toArray();

    console.log(`Found ${projects.length} projects to transform`);

    let projectsUpdated = 0;

    for (const project of projects) {
      if (!project.users || project.users.length === 0) {
        continue;
      }

      // Transform users from UserWithRole structure to simple user IDs
      const transformedUsers = project.users
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

      // Update the project
      await db
        .collection("projects")
        .updateOne({ _id: project._id }, { $set: { users: transformedUsers } });

      projectsUpdated++;
      console.log(
        `Transformed project ${project._id}: ${transformedUsers.length} users`
      );
    }

    console.log(`Migration completed:`);
    console.log(`- Projects updated: ${projectsUpdated}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed - project users structure has been permanently transformed"
    );
  },
};
