import { ProgramStatuses, Role, User } from "@cooprog/core";
import { Avatar, Badge, Box, SxProps } from "@mui/material";
import React from "react";
import UserTooltip from "./UserTooltip";
import StarIcon from "@mui/icons-material/Star";
import AdminIcon from "@mui/icons-material/SettingsSuggest";
import SpectatorIcon from "@mui/icons-material/Visibility";
import BuildingIcon from "@mui/icons-material/Festival";

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

interface UserAvatarProps {
  user: User;
  role: Role;
  size?: "xsmall" | "small" | "medium";
  sx?: SxProps;
}

const UserAvatar = ({ user, role, size = "medium", sx }: UserAvatarProps) => {
  let roleIcon = null;
  switch (role) {
    case Role.ARTISTIC_TEAM:
      roleIcon = <StarIcon />;
      break;
    case Role.DIFFUSION_STRUCTURE:
      roleIcon = <BuildingIcon />;
      break;
    case Role.ADMIN:
      roleIcon = <AdminIcon />;
      break;
    case Role.SPECTATOR:
      roleIcon = <SpectatorIcon />;
      break;
  }
  return (
    <UserTooltip user={user}>
      <Box position="relative" display="inline-block">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          badgeContent={
            roleIcon
              ? React.cloneElement(roleIcon, {
                  sx: { fontSize: "14px" },
                  style: { color: "white" },
                })
              : null
          }
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "black",
              color: "white",
              width: "20px",
              height: "20px",
            },
          }}
        >
          <Avatar
            sx={{
              ...sx,
              bgcolor: user.color || "grey",
              width: avatarSizes.diameter[size],
              height: avatarSizes.diameter[size],
              fontSize: avatarSizes.fontSize[size],
            }}
          >
            {user.company?.[0].toUpperCase()}
          </Avatar>
        </Badge>
      </Box>
    </UserTooltip>
  );
};

export default UserAvatar;
