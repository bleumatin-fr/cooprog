import express, { Request, Response } from "express";
import ChatMessage from "./model";
import User from "../users/model";
import Project from "../projects/model";
import { HttpError } from "../middlewares/errorHandler";
import { checkIsInRole } from "../authentication/authenticate";
import { Role, ChatMessageType, NotificationType } from "@cooprog/core";
import sendNotification from "../users/sendNotification";

const router = express.Router();

// Get chat messages for a specific tour
router.get("/:tourId", async (req: Request, res: Response, next) => {
  try {
    const { tourId } = req.params;
    const messages = await ChatMessage.find({ tour: tourId })
      .populate(
        "sender",
        "_id firstName lastName email color company location avatarUrl role"
      )
      .populate("reactions.sender", "_id firstName lastName email role")
      .sort({ createdAt: 1 });

    const project = await Project.findOne({ "tours._id": tourId });

    if (!project) {
      throw new HttpError(404, "Tour not found in any project");
    }

    const tour = project.tours.find((t) => t._id.toString() === tourId);

    if (!tour) {
      throw new HttpError(404, "Tour not found");
    }

    const enrichedMessages = messages.map((msg) => {
      const userWithRole = tour.users.find(
        (u) => u._id.toString() === msg.sender?._id.toString()
      );

      const message = msg.toObject();

      if (!message.sender) {
        return {
          ...message,
          tourRole: userWithRole ? userWithRole.role : null,
        };
      }

      return {
        ...message,
        sender: {
          ...message.sender,
          avatarUrl: message.sender.avatarUrl
            ? `/api/users/${message.sender._id}/avatar`
            : undefined,
        },
        tourRole: userWithRole ? userWithRole.role : null,
      };
    });

    res.json(enrichedMessages);
  } catch (error) {
    next(error);
  }
});

router.post("/:tourId", async (req: Request, res: Response, next) => {
  try {
    checkIsInRole(Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM)(req, res);

    const { tourId } = req.params;
    const { message, profileId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!message || message.trim() === "") {
      throw new HttpError(400, "Message cannot be empty");
    }

    let profile;
    if (profileId && user.profiles) {
      profile = user.profiles.find((p) => p._id?.toString() === profileId);
    }

    const project = await Project.findOne({ "tours._id": tourId });

    if (!project) {
      throw new HttpError(404, "Project not found");
    }

    const tour = project.tours.find((t) => t._id.toString() === tourId);

    if (!tour) {
      throw new HttpError(404, "Tour not found");
    }

    const chatMessage = new ChatMessage({
      type: ChatMessageType.USER,
      tour,
      message,
      sender: user._id,
      reactions: [],
      profile: profile,
    });

    await chatMessage.save();
    await chatMessage.populate(
      "sender",
      "_id firstName lastName email role avatarUrl"
    );

    const projectUsers = project.users.map((user) => user._id) ?? [];
    const tourUsers = tour.users.map((user) => user._id) ?? [];

    const notifiedUsers = [...projectUsers, ...tourUsers].filter(
      (userId) => userId.toString() !== user._id.toString()
    );
    notifiedUsers.forEach(async (userId) => {
      await sendNotification(userId, NotificationType.NEW_ACTIVITY, {
        projectId: project._id,
        tourId: tourId,
        count: 1,
      });
    });

    res.status(201).json(chatMessage);
  } catch (error) {
    next(error);
  }
});

export default router;
