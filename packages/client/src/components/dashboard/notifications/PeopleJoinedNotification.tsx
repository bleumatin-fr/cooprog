import useUser from "@/components/authentication/useUser";
import useProject from "@/components/projects/useProject";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { IconButton } from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { useTranslation } from "next-i18next";
import BaseNotification, {
  NotificationActions,
  RightActions,
} from "./BaseNotification";
import NotificationProps from "./NotificationProps";

const PeopleJoinedNotification = ({ notification }: NotificationProps) => {
  const { project } = useProject(notification.meta.projectId);
  const { t } = useTranslation();
  
  return (
    <BaseNotification
      notification={notification}
      link={`/projects/${project?._id}`}
    >
      {t("notifications:people-joined.title", {
        count: notification.meta.count,
        project: project,
      })}
    </BaseNotification>
  );
};

export default PeopleJoinedNotification;
