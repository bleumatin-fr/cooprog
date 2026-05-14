import { ProgramStatuses, User } from "@cooprog/core";
import FlagIcon from "@mui/icons-material/Flag";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import { Avatar, Box, Tooltip } from "@mui/material";
import { snakeCase } from "lodash";
import UserAvatar from "./UserAvatar";
import { useRecordContext } from "react-admin";

interface ParticipantListProps {
  source: string;
  size?: "xsmall" | "small" | "medium";
}

const avatarSizes = {
  diameter: {
    xsmall: "24px",
    small: "32px",
    medium: "40px",
  },
  fontSize: {
    xsmall: "12px",
    small: "16px",
    medium: "20px",
  },
};

const ParticipantList = ({ source, size = "medium" }: ParticipantListProps) => {
  const record = useRecordContext();
  const users: User[] = record?.[source] || [];

  const uniqueUsers = users.filter(
    (user, index, self) => index === self.findIndex((t) => t._id === user._id)
  );
  const MAX_DISPLAY_USERS = 10;
  const displayedUsers = uniqueUsers.slice(0, MAX_DISPLAY_USERS);
  const nbAdditionalUsers = uniqueUsers.length - MAX_DISPLAY_USERS;

  return (
    <>
      <Box
        display="flex"
        gap={1}
        flexWrap="wrap"
        alignItems="center"
        minWidth={200}
      >
        {displayedUsers.map((user) =>
          user ? (
            <UserAvatar
              key={user._id}
              user={user}
              role={user.role}
              size={size}
            />
          ) : null
        )}

        {nbAdditionalUsers > 0 && (
          <Tooltip title={`${nbAdditionalUsers} more participants`}>
            <Avatar
              sx={{
                bgcolor: "grey",
                width: avatarSizes.diameter[size],
                height: avatarSizes.diameter[size],
                fontSize: avatarSizes.fontSize[size],
              }}
            >
              +{nbAdditionalUsers}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    </>
  );
};

export default ParticipantList;
