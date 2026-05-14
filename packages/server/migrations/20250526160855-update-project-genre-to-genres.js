module.exports = {
  async up(db, client) {
    await db.collection("projects").updateMany({}, [
      {
        $set: {
          genres: "$genre",
        },
      },
    ]);
  },

  async down(db, client) {
    await db.collection("projects").updateMany({}, [
      {
        $set: {
          genre: "$genres",
        },
      },
    ]);
  },
};
