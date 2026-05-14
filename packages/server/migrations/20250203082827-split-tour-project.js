const { ObjectId } = require("mongodb");

async function extractToursFromSchedule(db, owner, schedule) {
  // sort all schedules in groups of consecutive dates separated by maximum 30 days
  const sortedSchedule = schedule
    .sort((a, b) => a.date - b.date)
    .filter((event) => event.date >= new Date());

  if (!sortedSchedule.length) {
    return [];
  }

  let tours = [];
  let currentTour = [];
  let lastDate = null;
  for (const event of sortedSchedule) {
    if (!lastDate || event.date - lastDate <= 30 * 24 * 60 * 60 * 1000) {
      currentTour.push(event);
    } else {
      tours.push(currentTour);
      currentTour = [event];
    }
    lastDate = event.date;
  }
  tours.push(currentTour);

  tours = await Promise.all(
    tours.map(async (tour) => {
      const startDate = new Date(
        tour.sort((a, b) => a.date - b.date)[0]?.date.getTime() -
          6 * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        tour.sort((a, b) => b.date - a.date)[0]?.date.getTime() +
          8 * 24 * 60 * 60 * 1000
      );

      const tourOwner = await getOwner(db, owner, tour);

      let newUsers = [
        { user: tourOwner, role: "pilot", _id: new ObjectId() },
        ...tour.map((event) => ({
          user: event.user,
          role: "partner",
          _id: new ObjectId(),
        })),
      ].filter(
        (user, index, self) =>
          index ===
          self.findIndex((t) => t.user === user.user && t.role === user.role)
      );

      const startMonth = new Date(
        startDate.getTime() + 1 * 24 * 60 * 60 * 1000
      ).toLocaleString("fr-FR", { month: "long" });
      const endMonth = new Date(endDate).toLocaleString("fr-FR", {
        month: "long",
      });
      const startYear = startDate.getFullYear();
      const endYear = new Date(endDate).getFullYear();
      const tourName =
        startMonth === endMonth
          ? `Tournée ${startMonth} ${startYear}`
          : `Tournée ${startMonth} ${startYear} - ${endMonth} ${endYear}`;

      return {
        name: tourName,
        start: startDate,
        end: endDate,
        schedule: tour,
        users: newUsers,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    })
  );

  return tours.filter((tour) => tour.schedule.length);
}

async function doesUserExist(db, userId) {
  const docCount = await db
    .collection("users")
    .countDocuments({ _id: ObjectId(userId.toString()) });
  return docCount > 0;
}

async function getOwner(db, owner, schedule) {
  if (await doesUserExist(db, owner)) {
    return owner;
  }

  const users = schedule.map((event) => event.user);
  for (const user of users) {
    if (await doesUserExist(db, user)) {
      return user;
    }
  }

  const admin = await db
    .collection("users")
    .findOne({ role: "admin", email: "florian@bleumatin.fr" });

  return admin._id;
}

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const documents = await db
          .collection("projects")
          .find({
            "schedule.0": { $exists: true },
            // _id: ObjectId("65318ebb24545bd53eaf78a5"),
          })
          .toArray();

        for (const doc of documents) {
          let newSchedule = [];
          for (const program of doc.schedule.sort(
            (a, b) => a.date.start - b.date.start
          )) {
            const userExists = await doesUserExist(db, program.user);
            if (!userExists) {
              continue;
            }
            const start = program.date.start;
            const end = program.date.end;
            const base = {
              _id: new ObjectId(),
              user: program.user,
              location: program.location,
              status: program.status,
              createdAt: program.createdAt,
              updatedAt: program.updatedAt,
            };
            if (end) {
              const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
              for (let i = 0; i <= days; i++) {
                newSchedule.push({
                  ...base,
                  _id: new ObjectId(),
                  date: new Date(start.getTime() + i * (1000 * 60 * 60 * 24)),
                });
              }
            } else {
              newSchedule.push({ ...base, date: start });
            }
          }

          if (!newSchedule.length) {
            db.collection("projects").deleteOne({ _id: doc._id });
            continue;
          }

          const tours = await extractToursFromSchedule(
            db,
            doc.owner,
            newSchedule
          );

          if (!tours.length) {
            db.collection("projects").deleteOne({ _id: doc._id });
            continue;
          }

          const newDoc = {
            artist: doc.artist,
            work: doc.work,
            users: [
              { user: doc.owner, role: "initiator", _id: new ObjectId() },
            ],
            tours: tours,
            genre: doc.genre || [],
            targetAudience: doc.targetAudience || [],
            description: doc.description,
            favoritedBy: doc.favoritedBy || [],
            hiddenBy: doc.hiddenBy || [],
            createdAt: doc.createdAt || new Date(),
            updatedAt: doc.updatedAt || new Date(),
            __v: (doc.__v || 0) + 1,
            _original: doc,
          };

          await db.collection("projects").replaceOne({ _id: doc._id }, newDoc);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const documents = await db
          .collection("projects")
          .find({ _original: { $exists: true } })
          .toArray();

        for (const doc of documents) {
          const originalDoc = doc._original;
          delete originalDoc._original; // Remove rollback helper field

          await db
            .collection("projects")
            .replaceOne({ _id: doc._id }, originalDoc);
        }
      });
    } finally {
      await session.endSession();
    }
  },
};
