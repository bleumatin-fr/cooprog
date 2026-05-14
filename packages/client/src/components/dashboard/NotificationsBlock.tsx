import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import useUser from "../authentication/useUser";
import NotificationBoundary from "./notifications/NotificationBoundary";
import PeopleJoinedNotification from "./notifications/PeopleJoinedNotification";
import ProjectSharedNotification from "./notifications/ProjectSharedNotification";
import ProjectUserAddedNotification from "./notifications/ProjectUserAddedNotification";
import DateScheduledForYouNotification from "./notifications/DateScheduledForYouNotification";
import { Notification, NotificationType } from "@cooprog/core";
import NewActivityNotification from "./notifications/NewActivityNotification";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 0;
  padding-right: 0;

  > a {
    padding-top: 12px;
    padding-bottom: 12px;
    padding: 12px 24px 12px 24px;
    border-bottom: 1px solid #ddd;
  }
`;
// for debug purposes
// const fakeNotifications: Notification[] = [
//   {
//     type: "follow_request",
//     meta: {
//       from: "6540cb2ed34f15ac35e768d0",
//       message: "koukou",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "follow_request_accepted",
//     meta: {
//       from: "6540cb2ed34f15ac35e768d0",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "follow_request_accepted_and_back",
//     meta: {
//       from: "6540cb2ed34f15ac35e768d0",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "people_joined",
//     meta: {
//       projectId: "652548d5c4d7c9bdfcdce5d1",
//       count: 17,
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "project_edition",
//     meta: {
//       projectId: "652548d5c4d7c9bdfcdce5d1",
//       userId: "6540cb2ed34f15ac35e768d0",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "project_edition_accepted",
//     meta: {
//       projectId: "652548d5c4d7c9bdfcdce5d1",
//       userId: "6540cb2ed34f15ac35e768d0",
//       responseMessage: "msg",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "project_edition_rejected",
//     meta: {
//       projectId: "652548d5c4d7c9bdfcdce5d1",
//       userId: "6540cb2ed34f15ac35e768d0",
//       responseMessage: "msg",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
//   {
//     type: "project_shared",
//     meta: {
//       projectId: "652548d5c4d7c9bdfcdce5d1",
//       userId: "6540cb2ed34f15ac35e768d0",
//       responseMessage: "msg",
//     },
//     createdAt: new Date(),
//     seen: false,
//   },
// ];

const NotificationsBlock = () => {
  const { user, deleteNotification } = useUser();
  const { t } = useTranslation();

  const handleNotificationError = async (notification: Notification) => {
    if (notification._id) {
      try {
        await deleteNotification(notification._id);
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  return (
    <>
      {user?.notifications?.length === 0 && (
        <div>{t("notifications:no-notifications")}</div>
      )}
      <Container>
        {/* {fakeNotifications.map((notification, index) => { */}
        {user?.notifications
          ?.sort((a: Notification, b: Notification) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          })
          .map((notification, index) => {
            switch (notification.type) {
              case NotificationType.PEOPLE_JOINED:
                return (
                  <NotificationBoundary
                    key={index}
                    onError={() => handleNotificationError(notification)}
                  >
                    <PeopleJoinedNotification
                      notification={notification}
                    />
                  </NotificationBoundary>
                );
              case NotificationType.PROJECT_SHARED:
                return (
                  <NotificationBoundary
                    key={index}
                    onError={() => handleNotificationError(notification)}
                  >
                    <ProjectSharedNotification
                      notification={notification}
                    />
                  </NotificationBoundary>
                );
              case NotificationType.PROJECT_USER_ADDED:
                return (
                  <NotificationBoundary
                    key={index}
                    onError={() => handleNotificationError(notification)}
                  >
                    <ProjectUserAddedNotification
                      notification={notification}
                    />
                  </NotificationBoundary>
                );
              case NotificationType.DATE_SCHEDULED_FOR_YOU:
                return (
                  <NotificationBoundary
                    key={index}
                    onError={() => handleNotificationError(notification)}
                  >
                    <DateScheduledForYouNotification
                      notification={notification}
                    />
                  </NotificationBoundary>
                );
              case NotificationType.NEW_ACTIVITY:
                return (
                  <NotificationBoundary
                    key={index}
                    onError={() => handleNotificationError(notification)}
                  >
                    <NewActivityNotification
                      notification={notification}
                    />
                  </NotificationBoundary>
                );
              default:
                return null;
            }
          })}
      </Container>
    </>
  );
};

export default NotificationsBlock;
