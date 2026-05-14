module.exports = {
  async up(db, client) {
    const users = await db.collection("users").find({}).toArray();
    const userIds = users.map((u) => u._id);
    await db.collection("projects").updateMany(
      {},
      {
        $pull: {
          users: { user: { $not: { $in: userIds } } },
        },
      }
    );
    await db.collection("projects").updateMany(
      { tours: { $exists: true } },
      {
        $pull: {
          "tours.$[].users": { user: { $not: { $in: userIds } } },
          "tours.$[].schedule": {
            user: { $not: { $in: userIds } },
            status: { $in: ["pending", "confirmed"] },
          },
        },
      }
    );
  },
};
