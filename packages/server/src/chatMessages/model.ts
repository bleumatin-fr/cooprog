import { Reaction, ChatMessage, ChatMessageType } from "@cooprog/core";
import { Schema, model } from "mongoose";

const reactionSchema = new Schema<Reaction>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reaction: { type: String, required: true },
  },
  { timestamps: true }
);

const chatMessageSchema = new Schema<ChatMessage>(
  {
    message: { type: String, required: true },
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    reactions: [reactionSchema],
    type: {
      type: String,
      enum: Object.values(ChatMessageType),
      required: true,
    },
    systemData: { type: Schema.Types.Mixed },
    profile: {
      _id: String,
      firstName: String,
      lastName: String,
      role: String,
      color: String,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ message: "text" }, { weights: { message: 5 } });

export default model<ChatMessage>("ChatMessage", chatMessageSchema);
