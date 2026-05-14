import { Role, User } from "@cooprog/core";
import { Box, Tooltip } from "@mui/material";
import styled from "@emotion/styled";
import { PeopleOutline } from "@mui/icons-material";
import React from "react";
import StarIcon from "@mui/icons-material/Star";
import BuildingIcon from "@mui/icons-material/Festival";
import AdminIcon from "@mui/icons-material/SettingsSuggest";
import SpectatorIcon from "@mui/icons-material/Visibility";

interface UserTooltipContentProps {
  user: User;
}

const UserTooltipContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

export const UserTooltipContent = ({ user }: UserTooltipContentProps) => {
  let roleIcon = null;
  switch (user.role) {
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
    <UserTooltipContentContainer>
      <div
        style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}
      >
        {user.company}
      </div>
      {roleIcon && (
        <Box display="flex" gap={1} alignItems="center">
          {roleIcon}
          {user.role && <span>{user.role}</span>}
        </Box>
      )}
      <Box display="flex" gap={1} alignItems="center">
        <PeopleOutline fontSize="small" />
        {user.profiles && user.profiles.length > 0 ? (
          <span>
            {user.profiles.map((profile, index) => (
              <React.Fragment key={profile._id}>
                {`${profile.firstName || ""} ${profile.lastName || ""}`}
                {index < (user.profiles?.length || 0) - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          </span>
        ) : (
          <span>No profiles</span>
        )}
      </Box>
    </UserTooltipContentContainer>
  );
};

interface UserTooltipProps {
  user: User;
  title?: React.ReactNode;
  children: React.ReactElement;
}

export const UserTooltip = ({ user, title, children }: UserTooltipProps) => {
  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      title={title || <UserTooltipContent user={user} />}
    >
      {children}
    </Tooltip>
  );
};
export default UserTooltip;
