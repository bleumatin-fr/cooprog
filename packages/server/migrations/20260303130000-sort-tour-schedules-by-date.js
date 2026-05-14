const getProgramTimestamp = (program) => {
  const timestamp = new Date(program?.date).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

module.exports = {
  async up(db, client) {
    console.log("Starting migration: sort-tour-schedules-by-date");

    const projects = await db
      .collection("projects")
      .find({ "tours.0": { $exists: true } })
      .toArray();

    let projectsUpdated = 0;
    let toursUpdated = 0;

    for (const project of projects) {
      let projectNeedsUpdate = false;

      const updatedTours = (project.tours || []).map((tour) => {
        if (!Array.isArray(tour.schedule) || tour.schedule.length < 2) {
          return tour;
        }

        const sortedSchedule = [...tour.schedule].sort(
          (a, b) => getProgramTimestamp(a) - getProgramTimestamp(b),
        );

        const hasChanged =
          JSON.stringify(sortedSchedule) !== JSON.stringify(tour.schedule);

        if (hasChanged) {
          projectNeedsUpdate = true;
          toursUpdated += 1;
          return {
            ...tour,
            schedule: sortedSchedule,
          };
        }

        return tour;
      });

      if (projectNeedsUpdate) {
        await db
          .collection("projects")
          .updateOne({ _id: project._id }, { $set: { tours: updatedTours } });
        projectsUpdated += 1;
      }
    }

    console.log("Migration completed:");
    console.log(`- Projects checked: ${projects.length}`);
    console.log(`- Projects updated: ${projectsUpdated}`);
    console.log(`- Tours updated: ${toursUpdated}`);
  },

  async down(db, client) {
    console.log(
      "This migration cannot be reversed safely - original schedule ordering is unknown.",
    );
  },
};
