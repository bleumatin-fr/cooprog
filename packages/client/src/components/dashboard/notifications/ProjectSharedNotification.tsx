import useUser from "@/components/authentication/useUser";
import useUsers from "@/components/authentication/useUsers";
import useProject from "@/components/projects/useProject";
import { Notification } from "@cooprog/core";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useSnackbar } from "notistack";
import BaseNotification, {
  NotificationActions,
  RightActions,
} from "./BaseNotification";

import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import useTour from "@/components/projects/useTour";

const MessageContainer = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
  margin: 8px 0;
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f5f5f5;
`;

const ProjectSharedNotification = ({
  notification,
}: {
  notification: Notification;
}) => {
  const { users } = useUsers({
    _id: notification.meta.userId as string,
  });

  const { project } = useProject(notification.meta.projectId);
  const { t } = useTranslation();
  const { tour } = useTour(
    notification.meta.projectId,
    notification.meta.tourId
  );
  if (!users || users.length === 0) return null;
  const requestingUser = users[0];

  if (!project) return null;

  return (
    <BaseNotification
      notification={notification}
      link={
        tour
          ? `/projects/${project?._id}/tours/${tour?._id}`
          : `/projects/${project?._id}`
      }
    >
      {t(`notifications:${tour ? "tour" : "project"}-shared.title`, {
        project,
        tour,
        user: requestingUser,
      })}
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

export default ProjectSharedNotification;
