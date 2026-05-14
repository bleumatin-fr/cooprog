const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const users = await db
          .collection("users")
          .find({
            location: { $exists: true },
            locations: { $exists: false },
          })
          .toArray();

        for (const user of users) {
          // Create a new locations array with the current location as main
          const locations = [
            {
              id: new ObjectId().toString(),
              label:
                user.language === "fr" ? "Lieu principal" : "Main Location",
              isMain: true,
              location: user.location,
            },
          ];

          // Update the user document
          await db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: {
                locations: locations,
                __v: (user.__v || 0) + 1,
                _original: user,
              },
              $unset: { location: "" },
            }
          );
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
        const users = await db
          .collection("users")
          .find({ _original: { $exists: true } })
          .toArray();

        for (const user of users) {
          const originalDoc = user._original;
          delete originalDoc._original; // Remove rollback helper field

          await db
            .collection("users")
            .replaceOne({ _id: user._id }, originalDoc);
        }
      });
    } finally {
      await session.endSession();
    }
  },
};
