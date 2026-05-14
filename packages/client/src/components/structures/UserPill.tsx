import { Program, Location } from "@cooprog/core";
import { Chip, CircularProgress, SxProps } from "@mui/material";
import UserTooltip from "./UserTooltip";
import UserAvatar from "./UserAvatar";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import useRights, { Actions } from "./useRights";
import useUser from "../authentication/useUser";
import { useRouter } from "next/router";

interface UserPillProps {
  user: Program["user"];
  status: Program["status"];
  sx?: SxProps & { backgroundColor?: string };
  onDelete?: (event: any) => Promise<void> | void;
  location?: Location;
}

const LoadingIcon = () => (
  <div
    style={{
      width: 22,
      paddingRight: 5,
      paddingTop: 5,
    }}
  >
    <CircularProgress size={16} />
  </div>
);

const UserPill = ({ user, status, sx, onDelete, location }: UserPillProps) => {
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useUser();
  const { can } = useRights({ user: currentUser });
  const router = useRouter();
  if (!user) return null;
  let name = user.company;
  const city = location?.data?.city;
  if (city && !name.includes(city)) {
    name = `${name}, ${city}`;
  }

  const handleClick = async (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();
    if (loading) {
      return;
    }
    setLoading(true);
    await onDelete?.(event);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <UserTooltip user={user} location={location}>
      <Chip
        avatar={
          <UserAvatar
            user={user}
            size="xsmall"
            sx={{ marginLeft: 0.5 }}
            showTooltip={false}
            showLink={can(Actions.PAGES_ACCESS_STRUCTURE)}
          />
        }
        onClick={
          can(Actions.PAGES_ACCESS_STRUCTURE)
            ? () => {
                router.push(`/users/${user._id}`);
              }
            : undefined
        }
        label={name}
        variant="outlined"
        sx={{
          maxWidth: 200,
          "&.MuiChip-outlined:hover": {
            opacity: 0.8,
            backgroundColor: sx?.backgroundColor,
          },
          ...sx,
        }}
        deleteIcon={
          !!onDelete ? loading ? <LoadingIcon /> : <CancelIcon /> : undefined
        }
        onDelete={!!onDelete ? handleClick : undefined}
      />
    </UserTooltip>
  );
};

export default UserPill;
