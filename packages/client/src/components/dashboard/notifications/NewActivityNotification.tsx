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
import useTour from "@/components/projects/useTour";

const NewActivityNotification = ({ notification }: NotificationProps) => {
  const { project } = useProject(notification.meta.projectId);
  const { tour } = useTour(
    notification.meta.projectId,
    notification.meta.tourId || "disabled"
  );
  const { t } = useTranslation();

  return (
    <BaseNotification
      notification={notification}
      link={`/projects/${project?._id}/tours/${tour?._id}`}
    >
      {t("notifications:new-activity.title", {
        count: notification.meta.count,
        project: project,
        tour: tour,
      })}
    </BaseNotification>
  );
};

export default NewActivityNotification;
