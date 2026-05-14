import { Role } from "@cooprog/core";
import { mail, send } from "../mails";
import Project from "../projects/model";
import User from "../users/model";
import ChatMessage from "../chatMessages/model";
import { format } from "date-fns";
import { fr, enUS, de, it, es } from "date-fns/locale";
import { formatSystemMessage } from "./formatSystemMessage";
import i18next from "../middlewares/i18next";
import { ChatMessageType } from "@cooprog/core";

const getLocale = (lang: string) => {
  switch (lang) {
    case "fr":
      return fr;
    case "de":
      return de;
    case "it":
      return it;
    case "es":
      return es;
    case "en":
    default:
      return enUS;
  }
};

const sendWeeklyDigest = async () => {
  const newProjects = await Project.find({
    createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });
  const newUsers = await User.find({
    createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    role: Role.DIFFUSION_STRUCTURE,
    status: "ok",
  });

  const allUsers = await User.find({
    role: Role.DIFFUSION_STRUCTURE,
    status: "ok",
    optin: true,
  }).populate([
    { path: "notifications" },
    { path: "following", select: "_id" },
  ]);

  let sentCount = 0;
  const errors: { email: string; error: string }[] = [];

  for (const user of allUsers) {
    const notificationsWithData = await Promise.all(
      user.toObject().notifications.map(async (notification) => {
        let project = undefined;
        if (notification.meta.projectId) {
          project = await Project.findOne({ _id: notification.meta.projectId });
        }
        let user = undefined;
        if (notification.meta.from) {
          user = await User.findOne({ _id: notification.meta.from });
        }
        if (notification.meta.userId) {
          user = await User.findOne({ _id: notification.meta.userId });
        }

        return {
          ...notification,
          type: {
            [notification.type]: true,
          },
          meta: {
            ...notification.meta,
            project: project?.toObject(),
            user: user?.toObject(),
          },
        };
      })
    );

    const involvedProjects = await Project.find({
      $or: [{ "users.user": user._id }, { "tours.users.user": user._id }],
    }).populate("tours");

    const chatMessages = [];

    // change language before use of i18next in formatSystemMessage
    await i18next.changeLanguage(user.language);

    for (const project of involvedProjects) {
      const isProjectUser = project.users
        .filter((u) => u)
        .some((u) => u._id.toString() === user._id.toString());

      for (const tour of project.tours || []) {
        const isTourUser = tour.users
          ?.filter((u) => u)
          .some((u) => u._id.toString() === user._id.toString());

        // escape cases when user is only on one tour of a project
        if (!isProjectUser && !isTourUser) continue;

        const lastSeen =
          tour.lastSeenByUser?.[user._id.toString()] ?? new Date(0);

        const unseenMessages = await ChatMessage.find({
          tour: tour._id,
          createdAt: { $gt: lastSeen },
        })
          .sort({ createdAt: 1 })
          .populate("sender");

        chatMessages.push(
          ...unseenMessages.map((msg) => {
            const message = msg.toObject();
            const isSystem = message.type === ChatMessageType.SYSTEM;

            return {
              ...message,
              tourId: tour._id,
              tourName: tour.name,
              projectId: project._id,
              projectName: project.work,
              formattedMessage: isSystem
                ? formatSystemMessage(message)
                : message.message,
              formattedDate: format(new Date(message.createdAt), "Pp", {
                locale: getLocale(user.language || "en"),
              }),
            };
          })
        );
      }
    }

    // group messages by project and by tour to display messages accordingly
    const chatMessagesGrouped = chatMessages
      .filter((msg) => msg.formattedMessage)
      .reduce(
        (acc, msg) => {
          const projectGroup = acc.find((g) => g.projectId === msg.projectId);
          if (!projectGroup) {
            acc.push({
              projectId: msg.projectId,
              projectName: msg.projectName,
              tours: [
                {
                  tourId: msg.tourId,
                  tourName: msg.tourName,
                  messages: [msg],
                },
              ],
            });
          } else {
            const tourGroup = projectGroup.tours.find(
              (t) => t.tourId === msg.tourId
            );
            if (!tourGroup) {
              projectGroup.tours.push({
                tourId: msg.tourId,
                tourName: msg.tourName,
                messages: [msg],
              });
            } else {
              tourGroup.messages.push(msg);
            }
          }
          return acc;
        },
        [] as {
          projectId: string;
          projectName: string;
          tours: {
            tourId: string;
            tourName: string;
            messages: typeof chatMessages;
          }[];
        }[]
      );

    try {
      await send({
        to: user.email,
        from: process.env.MAIL_FROM,
        ...(await mail("weekly-digest", user.language || "en", {
          user: user.toObject(),
          newProjectCount: newProjects.length,
          newProjects,
          newUserCount: newUsers.length,
          newUsers,
          notifications: notificationsWithData,
          chatMessages,
          chatMessagesGrouped,
        })),
      });
      sentCount++;
    } catch (e) {
      errors.push({ email: user.email, error: e.message });
      console.error(e);
    }
  }

  await send({
    to: process.env.MAIL_TO,
    from: process.env.MAIL_FROM,
    ...(await mail("weekly-digest-admin", "en", {
      count: sentCount,
      errors,
    })),
  });
};

export default sendWeeklyDigest;
