import { Profile, User, Role } from "@cooprog/core";
import { Avatar as MuiAvatar, Box, SxProps } from "@mui/material";
import useUser from "../authentication/useUser";
import UserTooltip, { UserTooltipProps } from "./UserTooltip";
import styled from "@emotion/styled";
import Link from "next/link";
import BuildingIcon from "@mui/icons-material/Festival";
import StarIcon from "@mui/icons-material/Star";
type Size = "xsmall" | "small" | "medium" | "large" | "xlarge";

const avatarSizes: Record<
  Size,
  { diameter: string; fontSize: string; profileFontSize: string }
> = {
  xsmall: {
    diameter: "24px",
    fontSize: "12px",
    profileFontSize: "6px",
  },
  small: {
    diameter: "32px",
    fontSize: "16px",
    profileFontSize: "8px",
  },
  medium: {
    diameter: "40px",
    fontSize: "20px",
    profileFontSize: "10px",
  },
  large: {
    diameter: "90px",
    fontSize: "45px",
    profileFontSize: "12px",
  },
  xlarge: {
    diameter: "120px",
    fontSize: "60px",
    profileFontSize: "16px",
  },
};

enum Shapes {
  CIRCLE = "circle",
  DECAGON = "decagon",
}

const Container = styled(Box)<{ size: Size }>`
  display: block;
  position: relative;
  ${({ size }) =>
    `width: ${avatarSizes[size].diameter}; height: ${avatarSizes[size].diameter};`}
  flex-shrink: 0;
`;

const decagonClipPath = `polygon(
        34.54915% 2.44717%,
        65.45085% 2.44717%,
        90.45085% 20.61074%,
        100% 50%,
        90.45085% 79.38926%,
        65.45085% 97.55283%,
        34.54915% 97.55283%,
        9.54915% 79.38926%,
        0% 50%,
        9.54915% 20.61074%
    )`;

const LoggedInUserCircle = styled.div`
  position: absolute;
  top: -5%;
  left: -5%;
  right: -5%;
  bottom: -5%;
  background-color: var(--color-orange);
  border-radius: 50%;
`;

const Avatar = styled(MuiAvatar)<{
  color: string | undefined;
  size: Size;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: ${({ size }) => avatarSizes[size].fontSize};
  background-color: ${({ color }) => color || "grey"};
  border-radius: 50%;
`;

const ProfileAvatar = styled(MuiAvatar)<{
  size: Size;
}>`
  background-color: grey;
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  font-size: ${({ size }) => avatarSizes[size].profileFontSize};
  border: 2px solid white;
`;

interface UserAvatarProps {
  user: Partial<User>;
  size?: Size;
  sx?: SxProps;
  showRole?: boolean;
  showProfile?: boolean;
  profile?: Profile;
  showLink?: boolean;
  showTooltip?: boolean;
}

interface SwitchableUserTooltip extends UserTooltipProps {
  showTooltip?: boolean;
}

const SwitchableUserTooltip = ({
  user,
  showProfile,
  profile,
  children,
  showTooltip,
  showLink,
}: SwitchableUserTooltip) => {
  return showTooltip ? (
    <UserTooltip
      user={user}
      showProfile={showProfile}
      profile={profile}
      showLink={showLink}
    >
      {children}
    </UserTooltip>
  ) : (
    children
  );
};

interface RoleBadgeProps {
  user: Partial<User>;
}

const RoleBadge = ({ user }: RoleBadgeProps) => {
  // Show account role badge for artistic team and diffusion structure
  if (
    user.role === Role.ARTISTIC_TEAM ||
    user.role === Role.DIFFUSION_STRUCTURE
  ) {
    const isArtisticTeam = user.role === Role.ARTISTIC_TEAM;
    return (
      <MuiAvatar
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "50%",
          height: "50%",
          "& svg": {
            width: "60%",
            height: "60%",
          },
        }}
      >
        {isArtisticTeam ? (
          <StarIcon fontSize="small" />
        ) : (
          <BuildingIcon fontSize="small" />
        )}
      </MuiAvatar>
    );
  }
  return null;
};

const UserAvatar = ({
  user,
  size = "medium",
  sx,
  showProfile = false,
  profile,
  showRole = false,
  showLink = false,
  showTooltip = false,
}: UserAvatarProps) => {
  const { user: currentUser, selectedProfileId } = useUser();
  const isCurrentUser = currentUser?._id === user._id;

  const selectedProfile =
    profile ||
    user.profiles?.find((profile) => profile._id === selectedProfileId);

  const containerProps = showLink
    ? {
        component: Link,
        href: `/users/${user._id}`,
      }
    : {};

  const avatarUrl = user.avatarUrl
    ? user.avatarChangedAt
      ? `${user.avatarUrl}?t=${new Date(user.avatarChangedAt).getTime()}`
      : user.avatarUrl
    : undefined;

  return (
    <SwitchableUserTooltip
      user={user}
      showProfile={showProfile}
      profile={profile}
      showTooltip={showTooltip}
      showLink={showLink}
    >
      <Container size={size} sx={sx} {...containerProps}>
        {isCurrentUser && <LoggedInUserCircle />}
        <Avatar
          src={avatarUrl}
          color={user.avatarUrl ? "white" : user.color}
          size={size}
        >
          {!user.avatarUrl && user.company?.[0].toUpperCase()}
        </Avatar>
        {showRole && <RoleBadge user={user} />}
        {showProfile && selectedProfile && (
          <ProfileAvatar
            color={selectedProfile.color || "var(--color-orange)"}
            size={size}
          >
            {selectedProfile.firstName?.[0].toUpperCase()}
            {selectedProfile.lastName?.[0].toUpperCase()}
          </ProfileAvatar>
        )}
      </Container>
    </SwitchableUserTooltip>
  );
};

export default UserAvatar;
