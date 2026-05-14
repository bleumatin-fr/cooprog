const { ObjectId } = require("mongodb");

module.exports = {
  async up(db, client) {
    console.log(
      "Starting migration to update ChatMessage translationKey from 'genres' to 'genre'..."
    );

    // Find all ChatMessage documents that have systemData with translationKey containing "genres"
    const chatMessages = await db
      .collection("chatmessages")
      .find({
        systemData: { $exists: true, $ne: null },
        $or: [
          {
            "systemData.newValues": "genres",
          },
          {
            "systemData.newValues": "targetAudiences",
          },
        ],
      })
      .toArray();

    console.log(
      `Found ${chatMessages.length} ChatMessage documents with newValues containing "genres"`
    );

    let messagesUpdated = 0;

    for (const chatMessage of chatMessages) {
      if (!chatMessage.systemData || !Array.isArray(chatMessage.systemData)) {
        continue;
      }

      let hasChanges = false;
      const updatedSystemData = chatMessage.systemData.map((dataItem) => {
        if (
          dataItem.newValues &&
          (dataItem.newValues.includes("genres") ||
            dataItem.newValues.includes("targetAudiences"))
        ) {
          hasChanges = true;
          return {
            ...dataItem,
            newValues: dataItem.newValues.map((value) =>
              value
                .replace("genres", "genre")
                .replace("targetAudiences", "targetAudience")
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
          `Updated ChatMessage ${chatMessage._id}: changed translationKey from 'genres' to 'genre'`
        );
      }
    }

    console.log(`Migration completed:`);
    console.log(`- ChatMessage documents updated: ${messagesUpdated}`);
  },

  async down(db, client) {},
};
