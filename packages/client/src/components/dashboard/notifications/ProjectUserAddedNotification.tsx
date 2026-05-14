import useUser from "@/components/authentication/useUser";
import useUsers from "@/components/authentication/useUsers";
import useProject from "@/components/projects/useProject";
import useTour from "@/components/projects/useTour";
import { Notification } from "@cooprog/core";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import BaseNotification, {
  NotificationActions,
  RightActions,
} from "./BaseNotification";

import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

const MessageContainer = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
  margin: 8px 0;
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f5f5f5;
`;

const ProjectUserAddedNotification = ({
  notification,
}: {
  notification: Notification;
}) => {
  const { users } = useUsers({
    _id: notification.meta.userId as string,
    limit: 1,
  });

  const { project } = useProject(notification.meta.projectId);

  // Only fetch tour data if we have a valid tourId
  const tourId = notification.meta.tourId;
  const tourQuery = useTour(notification.meta.projectId, tourId || "disabled");
  const tour = tourId ? tourQuery.tour : null;
  const { t } = useTranslation();

  if (!users || users.length === 0) return null;
  const addingUser = users[0];

  if (!project || !addingUser) return null;

  const isTourNotification = !!notification.meta.tourId && !!tour;
  const linkUrl = isTourNotification
    ? `/projects/${project?._id}/tours/${tour?._id}`
    : `/projects/${project?._id}`;

  return (
    <BaseNotification notification={notification} link={linkUrl}>
      {t(
        `notifications:project-user-added.${
          isTourNotification ? "tour" : "project"
        }.title`,
        {
          project,
          tour,
          user: addingUser,
          role: notification.meta.role,
        },
      )}
      {notification.meta.message && (
        <MessageContainer>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(notification.meta.message),
            }}
          />
        </MessageContainer>
      )}
    </BaseNotification>
  );
};

export default ProjectUserAddedNotification;
