module.exports = {
  async up(db, client) {
    const users = await db.collection("users").find({}).toArray();

    for (const user of users) {
      user.profiles = [
        {
          firstName: user.firstName,
          lastName: user.lastName,
          contactInformation: {
            type: user.contactInformation.mode,
            email: user.contactInformation.email,
            phone: user.contactInformation.phone,
            instructions: user.contactInformation.description,
          },
        },
      ];

      await db.collection("users").updateOne({ _id: user._id }, { $set: user });
    }
  },

  async down(db, client) {},
};
