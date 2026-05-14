module.exports = {
  async up(db, client) {
    console.log("Starting migration: update-music-projects-gauge-0-to-minus1-and-0");

    // Find all music projects that have gauge containing "0"
    const projects = await db
      .collection("projects")
      .find({
        discipline: "music",
        gauge: { $in: ["0"] },
      })
      .toArray();

    console.log(`Found ${projects.length} music projects with gauge "0"`);

    let projectsUpdated = 0;

    for (const project of projects) {
      // Check if gauge contains "0" and doesn't already contain "-1"
      const gauge = project.gauge || [];
      if (gauge.includes("0") && !gauge.includes("-1")) {
        // Add "-1" to the gauge array while keeping "0"
        const updatedGauge = [...new Set([...gauge, "-1"])];

        await db.collection("projects").updateOne(
          { _id: project._id },
          {
            $set: {
              gauge: updatedGauge,
            },
          }
        );

        projectsUpdated++;
        console.log(
          `Updated project ${project._id}: gauge changed from [${gauge.join(", ")}] to [${updatedGauge.join(", ")}]`
        );
      }
    }

    console.log(`Migration completed: ${projectsUpdated} projects updated`);
  },

  async down(db, client) {
    console.log("Starting rollback: remove -1 from music projects gauge");

    // Find all music projects that have both "-1" and "0" in gauge
    const projects = await db
      .collection("projects")
      .find({
        discipline: "music",
        gauge: { $all: ["-1", "0"] },
      })
      .toArray();

    console.log(
      `Found ${projects.length} music projects with both "-1" and "0" in gauge`
    );

    let projectsUpdated = 0;

    for (const project of projects) {
      const gauge = project.gauge || [];
      // Remove "-1" but keep "0"
      const updatedGauge = gauge.filter((g) => g !== "-1");

      await db.collection("projects").updateOne(
        { _id: project._id },
        {
          $set: {
            gauge: updatedGauge,
          },
        }
      );

      projectsUpdated++;
      console.log(
        `Rolled back project ${project._id}: gauge changed from [${gauge.join(", ")}] to [${updatedGauge.join(", ")}]`
      );
    }

    console.log(`Rollback completed: ${projectsUpdated} projects updated`);
  },
};

