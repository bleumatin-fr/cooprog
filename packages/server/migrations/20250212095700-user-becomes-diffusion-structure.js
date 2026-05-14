module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db
          .collection("users")
          .updateMany(
            { role: "user" },
            { $set: { role: "diffusion_structure" } }
          );
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db
          .collection("users")
          .updateMany(
            { role: "diffusion_structure" },
            { $set: { role: "user" } }
          );
      });
    } finally {
      await session.endSession();
    }
  },
};
