const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    await db
      .collection("users")
      .updateMany({ "profiles._id": { $exists: false } }, [
        {
          $set: {
            profiles: {
              $map: {
                input: "$profiles",
                in: {
                  $mergeObjects: [
                    "$$this",
                    { _id: { $ifNull: ["$$this._id", new ObjectId()] } },
                  ],
                },
              },
            },
          },
        },
      ]);
  },

  async down(db, client) {
    // No rollback needed as adding IDs is a non-destructive operation
  },
};
