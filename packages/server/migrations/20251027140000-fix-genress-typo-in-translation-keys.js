const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log(
      "Starting migration to fix typo in ChatMessage translationKey from 'projects:genress' to 'projects:genres'..."
    );

    // Find all ChatMessage documents that have systemData with translationKey containing "projects:genress"
    const chatMessages = await db
      .collection("chatmessages")
      .find({
        systemData: { $exists: true, $ne: null },
        systemData: {
          $elemMatch: {
            translationKey: { $regex: /projects:genress/ },
          },
        },
      })
      .toArray();

    console.log(
      `Found ${chatMessages.length} ChatMessage documents with translationKey containing "projects:genress"`
    );

    let messagesUpdated = 0;

    for (const chatMessage of chatMessages) {
      if (!chatMessage.systemData || !Array.isArray(chatMessage.systemData)) {
        continue;
      }

      let hasChanges = false;
      const updatedSystemData = chatMessage.systemData.map((dataItem) => {
        if (
          dataItem.translationKey &&
          dataItem.translationKey.includes("projects:genress")
        ) {
          hasChanges = true;
          return {
            ...dataItem,
            translationKey: dataItem.translationKey.replace(
              /projects:genress/g,
              "projects:genres"
            ),
          };
        }
        return dataItem;
      });

      if (hasChanges) {
        await db
          .collection("chatmessages")
          .updateOne(
            { _id: chatMessage._id },
            { $set: { systemData: updatedSystemData } }
          );

        messagesUpdated++;
        console.log(
          `Updated ChatMessage ${chatMessage._id}: fixed typo from 'projects:genress' to 'projects:genres'`
        );
      }
    }

    console.log(`Migration completed:`);
    console.log(`- ChatMessage documents updated: ${messagesUpdated}`);
  },

  async down(db, client) {
    console.log(
      "Starting rollback to change translationKey from 'projects:genres' back to 'projects:genress'..."
    );

    // Find all ChatMessage documents that have systemData with translationKey containing "projects:genres"
    const chatMessages = await db
      .collection("chatmessages")
      .find({
        systemData: { $exists: true, $ne: null },
        systemData: {
          $elemMatch: {
            translationKey: { $regex: /projects:genres/ },
          },
        },
      })
      .toArray();

    console.log(
      `Found ${chatMessages.length} ChatMessage documents with translationKey containing "projects:genres"`
    );

    let messagesUpdated = 0;

    for (const chatMessage of chatMessages) {
      if (!chatMessage.systemData || !Array.isArray(chatMessage.systemData)) {
        continue;
      }

      let hasChanges = false;
      const updatedSystemData = chatMessage.systemData.map((dataItem) => {
        if (
          dataItem.translationKey &&
          dataItem.translationKey.includes("projects:genres")
        ) {
          hasChanges = true;
          return {
            ...dataItem,
            translationKey: dataItem.translationKey.replace(
              /projects:genres/g,
              "projects:genress"
            ),
          };
        }
        return dataItem;
      });

      if (hasChanges) {
        await db
          .collection("chatmessages")
          .updateOne(
            { _id: chatMessage._id },
            { $set: { systemData: updatedSystemData } }
          );

        messagesUpdated++;
        console.log(
          `Rolled back ChatMessage ${chatMessage._id}: changed translationKey from 'projects:genres' to 'projects:genress'`
        );
      }
    }

    console.log(`Rollback completed:`);
    console.log(`- ChatMessage documents updated: ${messagesUpdated}`);
  },
};
