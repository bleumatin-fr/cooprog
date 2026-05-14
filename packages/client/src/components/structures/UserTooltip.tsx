import { User, Profile, Location, Role } from "@cooprog/core";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Box, Tooltip } from "@mui/material";
import Link from "next/link";
import { getCity } from "../projects/ProjectCard";
import styled from "@emotion/styled";
import { PeopleOutline, RouteOutlined } from "@mui/icons-material";
import useUser from "../authentication/useUser";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "next-i18next";
import BuildingIcon from "@mui/icons-material/Festival";
import AdminIcon from "@mui/icons-material/SettingsSuggest";
import SpectatorIcon from "@mui/icons-material/Visibility";

interface UserTooltipContentProps {
  user: Partial<User>;
  location?: Location;
  profile?: Profile;
  showProfile?: boolean;
  showLink?: boolean;
}

const UserTooltipContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

export const UserTooltipContent = ({
  user,
  location,
  showProfile = false,
  profile,
  showLink = false,
}: UserTooltipContentProps) => {
  const { t } = useTranslation();
  const { selectedProfileId } = useUser();
  const selectedProfile =
    profile ||
    user.profiles?.find((profile) => profile._id === selectedProfileId);

  const mainUserLocation = user.locations?.find((loc) => loc.isMain);

  const isPropsLocationSameAsMainLocation =
    !location ||
    (location?.geolocation.coordinates[0] ===
      mainUserLocation?.location?.geolocation.coordinates[0] &&
      location?.geolocation.coordinates[1] ===
        mainUserLocation?.location?.geolocation.coordinates[1]);

  const displayedLocation = location || mainUserLocation?.location;

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
      {showLink ? (
        <Link
          href={`/users/${user._id}`}
          style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}
        >
          {user.company}
        </Link>
      ) : (
        <span>{user.company}</span>
      )}
      {showProfile && selectedProfile && (
        <Box display="flex" gap={1} alignItems="center">
          <PeopleOutline fontSize="small" />
          <span>{`${selectedProfile.firstName} ${selectedProfile.lastName}`}</span>
          {selectedProfile.role && <span>({selectedProfile.role})</span>}
        </Box>
      )}
      {roleIcon && (
        <Box display="flex" gap={1} alignItems="center">
          {roleIcon}
          {user.role && (
            <span>{t(`projects:participants.role.${user.role}`)}</span>
          )}
        </Box>
      )}
      {displayedLocation && (
        <Box display="flex" gap={1} alignItems="center">
          <LocationOnOutlinedIcon fontSize="small" />
          <>
            <span>{`${getCity(displayedLocation) || ""}`}</span>
            {isPropsLocationSameAsMainLocation && (
              <StarIcon
                sx={{
                  color: "#FFD700",
                  fontSize: "1rem",
                  display: "inline-block",
                }}
              />
            )}
            {!isPropsLocationSameAsMainLocation && (
              <RouteOutlined
                sx={{
                  color: "var(--primary-color)",
                  fontSize: "1rem",
                  display: "inline-block",
                }}
              />
            )}
          </>
        </Box>
      )}
    </UserTooltipContentContainer>
  );
};

export interface UserTooltipProps {
  user: Partial<User>;
  title?: React.ReactNode;
  children: React.ReactNode;
  showProfile?: boolean;
  profile?: Profile;
  showLink?: boolean;
  location?: Location;
}

export const UserTooltip = ({
  user,
  title,
  children,
  showProfile = false,
  showLink = false,
  profile,
  location,
}: UserTooltipProps) => {
  return (
    <Tooltip
      title={
        title || (
          <UserTooltipContent
            user={user}
            showProfile={showProfile}
            showLink={showLink}
            profile={profile}
            location={location}
          />
        )
      }
    >
      {/* {showLink ? (
        <Link href={`/users/${user._id}`}>{children}</Link>
      ) : ( */}
      <span>{children}</span>
      {/* )} */}
    </Tooltip>
  );
};

export default UserTooltip;
