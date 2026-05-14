import styled from "@emotion/styled";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, IconButton, Popover } from "@mui/material";
import { useEffect, useState } from "react";
import useUser from "../authentication/useUser";
import NotificationsBlock from "../dashboard/NotificationsBlock";

const NotificationsBlockContainer = styled.div`
  padding: 24px 0 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 550px;
`;

const NotificationButton = () => {
  const { user } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = () => {};

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadNotifications =
    user?.notifications?.filter((notification) => !notification.seen).length ||
    0;

  useEffect(() => {
    if (unreadNotifications === 0) {
      handleClose();
    }
  }, [unreadNotifications]);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadNotifications} color="primary">
          <NotificationsNoneIcon
            color={unreadNotifications > 0 ? "primary" : "secondary"}
          />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 60,
          horizontal: -115,
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <NotificationsBlockContainer>
          <NotificationsBlock />
        </NotificationsBlockContainer>
      </Popover>
    </>
  );
};

export default NotificationButton;
