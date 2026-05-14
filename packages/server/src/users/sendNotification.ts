import {
  User as UserType,
  Notification,
  NotificationType,
} from "@cooprog/core";
import User from "./model";

// FOLLOW_REQUEST = "follow_request",
// meta : {
//   from: string,
//   message: string,
// }
// FOLLOW_REQUEST_ACCEPTED = "follow_request_accepted",
// meta : {
//   from: string,
// }
// FOLLOW_REQUEST_ACCEPTED_AND_BACK = "follow_request_accepted_and_back",
// meta : {
//   from: string,
// }
// PEOPLE_JOINED = "people_joined",
// meta : {
//   projectId: string,
//   count: number,
// }
// NEW_ACTIVITY = "new_activity",
// meta : {
//   projectId: string,
//   tourId: string,
//   count: number,
// }
// PROJECT_SHARED = "project_shared",
// meta : {
//   projectId: string,
//   userId: string,
// }
//

const mergeNotifications = (
  notifications: Notification[],
  notification: Notification
): Notification[] => {
  switch (notification.type) {
    case NotificationType.PEOPLE_JOINED:
    case NotificationType.NEW_ACTIVITY:
      const twentyFourHoursAgo = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24
      );

      const mostRecentNotificationOfSameType = notifications.find((n) => {
        const sameType = n.type === notification.type;
        const sameProject =
          n.meta.projectId?.toString() ===
          notification.meta.projectId?.toString();
        const sameTour =
          (n.meta.tourId?.toString() ?? null) ===
          (notification.meta.tourId?.toString() ?? null);
        const within24Hours =
          n.createdAt &&
          new Date(n.createdAt).getTime() >= twentyFourHoursAgo.getTime();
        return sameType && sameProject && sameTour && within24Hours;
      });
      if (mostRecentNotificationOfSameType) {
        mostRecentNotificationOfSameType.meta.count += notification.meta.count;
        mostRecentNotificationOfSameType.seen = false;
        return notifications;
      }
      return [...notifications, notification];
    default:
      return [...notifications, notification];
  }
};

const sendNotification = async (
  userId: string,
  type: NotificationType,
  meta: any
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.notifications) {
    user.notifications = [];
  }

  const mergedNotifications = mergeNotifications(user.notifications, {
    type,
    meta,
    seen: false,
  });

  // If a notification was merged (not added), update the existing one
  if (mergedNotifications.length === user.notifications.length) {
    // Find the notification that was updated
    const updatedNotification = mergedNotifications.find(
      (n, index) => n !== user.notifications[index]
    );
    if (updatedNotification) {
      // Update the specific notification using array index
      const notificationIndex = mergedNotifications.findIndex(
        (n) => n === updatedNotification
      );
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            [`notifications.${notificationIndex}.meta.count`]:
              updatedNotification.meta.count,
            [`notifications.${notificationIndex}.seen`]:
              updatedNotification.seen,
          },
        }
      );
    }
  } else {
    // A new notification was added, push it to the array
    const newNotification = mergedNotifications[mergedNotifications.length - 1];
    console.log("newNotification", newNotification);
    await User.updateOne(
      { _id: userId },
      { $push: { notifications: newNotification } }
    );
  }
};

export default sendNotification;
