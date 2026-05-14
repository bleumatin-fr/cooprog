const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log(
      "Starting migration to update ChatMessage translationKey from modals to dialogs..."
    );

    // Find all ChatMessage documents that have systemData with translationKey starting with "modals"
    const chatMessages = await db
      .collection("chatmessages")
      .find({
        systemData: { $exists: true, $ne: null },
        systemData: {
          $elemMatch: {
            translationKey: { $regex: /^common:modals/ },
          },
        },
      })
      .toArray();

    console.log(
      `Found ${chatMessages.length} ChatMessage documents with translationKey starting with "modals"`
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
          dataItem.translationKey.startsWith("common:modals")
        ) {
          hasChanges = true;
          return {
            ...dataItem,
            translationKey: dataItem.translationKey.replace(
              /^common:modals/,
              "common:dialogs"
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
          `Updated ChatMessage ${chatMessage._id}: changed translationKey from modals to dialogs`
        );
      }
    }

    console.log(`Migration completed:`);
    console.log(`- ChatMessage documents updated: ${messagesUpdated}`);
  },

  async down(db, client) {
    console.log(
      "Starting rollback to change translationKey from dialogs back to modals..."
    );

    // Find all ChatMessage documents that have systemData with translationKey starting with "dialogs"
    const chatMessages = await db
      .collection("chatmessages")
      .find({
        systemData: { $exists: true, $ne: null },
        systemData: {
          $elemMatch: {
            translationKey: { $regex: /^common:dialogs/ },
          },
        },
      })
      .toArray();

    console.log(
      `Found ${chatMessages.length} ChatMessage documents with translationKey starting with "dialogs"`
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
          dataItem.translationKey.startsWith("common:dialogs")
        ) {
          hasChanges = true;
          return {
            ...dataItem,
            translationKey: dataItem.translationKey.replace(
              /^common:dialogs/,
              "common:modals"
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
          `Rolled back ChatMessage ${chatMessage._id}: changed translationKey from dialogs to modals`
        );
      }
    }

    console.log(`Rollback completed:`);
    console.log(`- ChatMessage documents updated: ${messagesUpdated}`);
  },
};
