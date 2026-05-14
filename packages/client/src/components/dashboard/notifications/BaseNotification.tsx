import { Notification } from "@cooprog/core";
import styled from "@emotion/styled";
import { Badge, Divider } from "@mui/material";
import BaseLink from "next/link";
import useUser from "@/components/authentication/useUser";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "next-i18next";

interface BaseNotificationProps {
  notification: Notification;
  link: string;
  children: React.ReactNode;
}

const BaseNotificationContainer = styled.div`
  span {
    margin-left: -5px;
    margin-right: 5px;
  }
`;

const DateContainer = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
`;

const DateText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #999;
  font-style: italic;
  padding: 4px 8px;
  transition: color 0.2s ease;

  &:hover {
    color: #666;
  }

  svg {
    font-size: 14px;
  }
`;

const ContentContainer = styled.div`
  font-size: 14px;
  padding: 8px 0 0 0;
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

export const RightActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
  justify-content: flex-end;
`;

export const NotificationActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
`;

const Link = styled(BaseLink)`
  text-decoration: none;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: var(--weekend-background-color);
  }
`;

const BaseNotification = ({
  notification,
  link,
  children,
}: BaseNotificationProps) => {
  const { deleteNotification } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!notification._id) return;
    
    try {
      await deleteNotification(notification._id);
    } catch (error) {
      enqueueSnackbar(`${error}`, {
        variant: "error",
      });
    }
  };

  return (
    <Link href={link} passHref>
      <BaseNotificationContainer>
        <DateContainer>
          <DateText>
            <Badge color="primary" variant="dot"></Badge>
            {notification.createdAt &&
              new Date(notification.createdAt).toLocaleString()}
          </DateText>
        </DateContainer>
        <ContentContainer>{children}</ContentContainer>
        <BottomActions>
          <DeleteButton
            onClick={handleDelete}
          >
            <DeleteIcon fontSize="small" />
            {t("common:delete")}
          </DeleteButton>
        </BottomActions>
      </BaseNotificationContainer>
    </Link>
  );
};

export default BaseNotification;
