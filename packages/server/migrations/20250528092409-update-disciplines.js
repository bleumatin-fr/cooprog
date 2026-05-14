module.exports = {
  async up(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $set: { programmingDisciplines: ["performingArts"] },
      }
    );

    await db.collection("projects").updateMany(
      {},
      {
        $set: { discipline: "performingArts" },
      }
    );
  },

  async down(db, client) {
    await db.collection("users").updateMany(
      {},
      {
        $unset: { programmingDisciplines: "" },
      }
    );

    await db.collection("projects").updateMany(
      {},
      {
        $unset: { discipline: "" },
      }
    );
  },
};
