import Configuration from "../configuration/model";
import Project from "../projects/model";

const removeInactiveTours = async () => {
  const configuration = await Configuration.findOne({
    name: "inactive-project-delete-delay-days",
  });
  if (!configuration || !configuration.value || isNaN(configuration.value)) {
    throw new Error(
      "Configuration inactive-project-delete-delay-days not found"
    );
  }
  const delay = parseInt(configuration.value);

  const maxDate = new Date(Date.now() - delay * 24 * 60 * 60 * 1000);

  const tours = await Project.aggregate([
    {
      $match: {
        "tours.end": { $lt: maxDate },
      },
    },
    {
      $unwind: "$tours",
    },
    {
      $match: {
        "tours.end": { $lt: maxDate },
      },
    },
    {
      $project: {
        projectId: "$_id",
        tourId: "$tours._id",
        schedule: "$tours.schedule",
      },
    },
  ]);

  // Update each project to remove the inactive tour and update totalAvoidKm
  for (const tour of tours) {
    await Project.updateOne(
      { _id: tour.projectId, "tours._id": tour.tourId },
      {
        $set: { "tours.$.archived": true },
      }
    );
  }

  console.log(
    "CRON: removeInactiveTours",
    tours.map((tour) => ({
      projectId: tour.projectId.toString(),
      tourId: tour.tourId.toString(),
    }))
  );
};

export default removeInactiveTours;
