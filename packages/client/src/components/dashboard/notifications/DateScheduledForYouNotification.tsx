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
import EventIcon from "@mui/icons-material/Event";

const MessageContainer = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
  margin: 8px 0;
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f5f5f5;
`;

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 14px;
  color: var(--color-dark-green);
  font-weight: 500;
`;

const DateScheduledForYouNotification = ({
  notification,
}: {
  notification: Notification;
}) => {
  const { users } = useUsers({
    _id: notification.meta.scheduledBy as string,
  });

  const { project } = useProject(notification.meta.projectId);
  const { tour } = useTour(
    notification.meta.projectId,
    notification.meta.tourId || "disabled",
  );
  const { t } = useTranslation();

  if (!users || users.length === 0) return null;
  const schedulingUser = users[0];

  if (!project || !tour || !schedulingUser) return null;

  const programDate = new Date(notification.meta.programDate);
  const formattedDate = programDate.toLocaleDateString();

  return (
    <BaseNotification
      notification={notification}
      link={`/projects/${project?._id}/tours/${tour?._id}`}
    >
      {t("notifications:date-scheduled-for-you.title", {
        project,
        tour,
        user: schedulingUser,
        status: notification.meta.programStatus,
      })}
      <DateContainer>
        <EventIcon fontSize="small" />
        {formattedDate}
      </DateContainer>
      {notification.meta.customMessage && (
        <MessageContainer>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(notification.meta.customMessage),
            }}
          />
        </MessageContainer>
      )}
    </BaseNotification>
  );
};

export default DateScheduledForYouNotification;
