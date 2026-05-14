module.exports = {
  async up(db, client) {
    console.log(
      "Starting migration: update-contact-information-type-to-types"
    );

    // Find all users with profiles that have contactInformation with type field
    const users = await db.collection("users").find({}).toArray();

    console.log(`Found ${users.length} users to process.`);

    let usersUpdated = 0;
    let profilesUpdated = 0;

    for (const user of users) {
      if (!user.profiles || !Array.isArray(user.profiles)) {
        continue;
      }

      let userNeedsUpdate = false;
      const updatedProfiles = user.profiles.map((profile) => {
        if (
          profile.contactInformation &&
          profile.contactInformation.type &&
          !profile.contactInformation.types
        ) {
          userNeedsUpdate = true;
          profilesUpdated++;

          // Convert type to types array
          const oldType = profile.contactInformation.type;
          const newTypes =
            oldType === "none" || oldType === undefined
              ? []
              : oldType === "email" || oldType === "phone"
              ? [oldType]
              : [];

          return {
            ...profile,
            contactInformation: {
              ...profile.contactInformation,
              types: newTypes,
              // Remove the old type field
              type: undefined,
            },
          };
        }
        return profile;
      });

      if (userNeedsUpdate) {
        // Clean up the type field from each profile's contactInformation
        const cleanedProfiles = updatedProfiles.map((profile) => {
          if (profile.contactInformation && profile.contactInformation.type !== undefined) {
            const { type, ...restContactInfo } = profile.contactInformation;
            return {
              ...profile,
              contactInformation: restContactInfo,
            };
          }
          return profile;
        });

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              profiles: cleanedProfiles,
            },
          }
        );

        usersUpdated++;
        console.log(
          `Updated user ${user._id}: converted ${updatedProfiles.filter((p) => p.contactInformation?.types).length} profiles`
        );
      }
    }

    console.log(
      `Migration completed: ${usersUpdated} users updated, ${profilesUpdated} profiles updated`
    );
  },

  async down(db, client) {
    console.log(
      "Starting rollback: update-contact-information-types-to-type"
    );

    // Find all users with profiles that have contactInformation with types field
    const users = await db.collection("users").find({}).toArray();

    console.log(`Found ${users.length} users to process.`);

    let usersUpdated = 0;
    let profilesUpdated = 0;

    for (const user of users) {
      if (!user.profiles || !Array.isArray(user.profiles)) {
        continue;
      }

      let userNeedsUpdate = false;
      const updatedProfiles = user.profiles.map((profile) => {
        if (
          profile.contactInformation &&
          profile.contactInformation.types &&
          Array.isArray(profile.contactInformation.types)
        ) {
          userNeedsUpdate = true;
          profilesUpdated++;

          // Convert types array back to single type
          const types = profile.contactInformation.types;
          const newType =
            types.length === 0
              ? "none"
              : types.length === 1
              ? types[0]
              : types[0]; // Take first type if multiple

          return {
            ...profile,
            contactInformation: {
              ...profile.contactInformation,
              type: newType,
              // Remove the types field
              types: undefined,
            },
          };
        }
        return profile;
      });

      if (userNeedsUpdate) {
        // Clean up the types field from each profile's contactInformation
        const cleanedProfiles = updatedProfiles.map((profile) => {
          if (profile.contactInformation && profile.contactInformation.types !== undefined) {
            const { types, ...restContactInfo } = profile.contactInformation;
            return {
              ...profile,
              contactInformation: restContactInfo,
            };
          }
          return profile;
        });

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              profiles: cleanedProfiles,
            },
          }
        );

        usersUpdated++;
        console.log(
          `Rolled back user ${user._id}: converted ${updatedProfiles.filter((p) => p.contactInformation?.type).length} profiles`
        );
      }
    }

    console.log(
      `Rollback completed: ${usersUpdated} users updated, ${profilesUpdated} profiles updated`
    );
  },
};

