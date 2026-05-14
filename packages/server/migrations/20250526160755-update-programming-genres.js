module.exports = {
  async up(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $set: {
          formerProgrammingGenres: "$programmingGenres",
          programmingGenres: [],
        },
      }
    );
  },

  async down(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $set: {
          programmingGenres: "$formerProgrammingGenres",
        },
        $unset: {
          formerProgrammingGenres: "",
        },
      }
    );
  },
};
