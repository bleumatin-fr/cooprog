import {
  ChatMessage as ChatMessageType,
  ChatMessageType as ChatMessageTypology,
} from "@cooprog/core";
import ChatMessage from "./model";
import User from "../users/model";
import Project from "../projects/model";
import { Types } from "mongoose";

const projectName = "Germinal";
const tourName = "Tournée automne 2025";

const seed = async () => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const existingMessages = await ChatMessage.countDocuments();
  if (existingMessages > 0) {
    console.log("Messages already exist. Skipping seeding.");
    return;
  }

  const project = await Project.findOne({ work: projectName });
  if (!project) {
    console.error("Project not found");
    return;
  }

  const tour = project.tours.find((t) => t.name === tourName);
  if (!tour) {
    console.error("Tour not found");
    return;
  }

  const userEmails = [
    "hlugan@yahoo.fr",
    "direction@centremalraux.com",
    "m.dupont@opera-paris.fr",
  ];

  const users = await User.find({ email: { $in: userEmails } });
  const type = ChatMessageTypology.USER;

  const messages: ChatMessageType[] = [
    {
      type,
      message: "Hello my friend",
      sender: users?.find((u) => u.email === "hlugan@yahoo.fr")!,
      createdAt: new Date(Date.now() - 3600000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "Hi there! How's the project going?",
      sender: users?.find((u) => u.email === "direction@centremalraux.com")!,
      createdAt: new Date(Date.now() - 3000000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "We need to discuss the schedule for next week",
      sender: users?.find((u) => u.email === "hlugan@yahoo.fr")!,
      createdAt: new Date(Date.now() - 1800000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "I've updated the technical requirements document",
      sender: users?.find((u) => u.email === "m.dupont@opera-paris.fr")!,
      createdAt: new Date(Date.now() - 900000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "Thanks Alex, I'll take a look at it right away",
      sender: users?.find((u) => u.email === "hlugan@yahoo.fr")!,
      createdAt: new Date(Date.now() - 600000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "I've updated the technical requirements document",
      sender: users?.find((u) => u.email === "m.dupont@opera-paris.fr")!,
      createdAt: new Date(Date.now() - 900000),
      reactions: [],
      tour,
    },
    {
      type,
      message: "I've updated the technical requirements document",
      sender: users?.find((u) => u.email === "m.dupont@opera-paris.fr")!,
      createdAt: new Date(Date.now() - 900000),
      reactions: [],
      tour,
    },
  ];

  await ChatMessage.insertMany(messages);
  console.log("Messages seeded successfully");
};

export default seed;
