import { Role, User, User as UserType } from "@cooprog/core";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  SxProps,
  Tooltip,
} from "@mui/material";
import Dialog, {
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@/components/UI/Dialog";
import { useTranslation } from "next-i18next";
import { useSnackbar } from "notistack";
import { useState } from "react";
import UserAvatar from "@/components/structures/UserAvatar";
import AddParticipantsDialog from "./AddParticipantsDialog";
import ParticipantListItem from "./ParticipantListItem";
import useProject from "./useProject";

interface ParticipantListProps {
  users: UserType[];
  accessUserPage?: boolean;
  size?: "small" | "medium";
  translationKey?: string;
  projectId: string;
  tourId?: string;
  sx?: SxProps;
}

const avatarSizes = {
  diameter: {
    small: "32px",
    medium: "40px",
  },
  fontSize: {
    small: "16px",
    medium: "20px",
  },
};

const ParticipantList = ({
  users,
  translationKey = "participants",
  size = "medium",
  accessUserPage = false,
  projectId,
  tourId,
  sx,
}: ParticipantListProps) => {
  const { t } = useTranslation(["projects"]);
  const [isParticipantsDetailsDialogOpen, setIsParticipantsDetailsDialogOpen] =
    useState(false);
  const [isAddParticipantsDialogOpen, setIsAddParticipantsDialogOpen] =
    useState(false);

  const handleOpenParticipantsDetailsDialog = () =>
    setIsParticipantsDetailsDialogOpen(true);
  const handleCloseParticipantsDetailsDialog = () =>
    setIsParticipantsDetailsDialogOpen(false);

  const MAX_DISPLAY_USERS = 10;

  const uniqueUsers = users
    .filter((user) => !!user)
    .filter(
      (user, index, self) =>
        index ===
        self.findIndex((t) => t._id === user._id && t.role === user.role)
    );
  const displayedUsers = uniqueUsers.slice(0, MAX_DISPLAY_USERS);
  const nbAdditionalUsers = uniqueUsers.length - MAX_DISPLAY_USERS;

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" sx={sx}>
        {displayedUsers.map((user) => (
          <UserAvatar
            key={user._id}
            user={user}
            showRole
            showTooltip
            showLink={accessUserPage}
            size={size}
          />
        ))}

        {nbAdditionalUsers > 0 && (
          <Tooltip
            title={t(`projects:${translationKey}.more_participants_text`, {
              nbAdditionalUsers,
            })}
          >
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
        {size !== "small" && (
          <>
            <SeeDetailsButton
              size={size}
              onClick={handleOpenParticipantsDetailsDialog}
              translationKey={translationKey}
            />
          </>
        )}
      </Box>

      <Dialog
        open={isParticipantsDetailsDialogOpen}
        onClose={handleCloseParticipantsDetailsDialog}
        showCloseButton={true}
        maxWidth="lg"
        fullWidth
      >
        <ParticipantDetails
          users={users}
          projectId={projectId}
          translationKey={translationKey}
          tourId={tourId}
        />
      </Dialog>
    </>
  );
};

interface SeeDetailsButtonProps {
  size?: "small" | "medium";
  onClick: () => void;
  translationKey: string;
}

const SeeDetailsButton = ({
  size = "medium",
  onClick,
  translationKey,
}: SeeDetailsButtonProps) => {
  const { t } = useTranslation(["projects"]);
  return (
    <Tooltip title={t(`projects:${translationKey}.see_details`)}>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          padding: 0,
          color: "var(--color-orange)",
          border: "1px solid",
          borderColor: "var(--color-orange)",
          width: "30px",
          height: "30px",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        i
      </IconButton>
    </Tooltip>
  );
};

interface AddMoreButtonProps {
  size?: "small" | "medium";
  onClick: () => void;
  translationKey: string;
}

interface ParticipantDetailsProps {
  users: UserType[];
  translationKey?: string;
  projectId: string;
  tourId?: string;
  onAddParticipants?: (user: Partial<UserType>, customMessage?: string) => void;
  showTitle?: boolean;
  userFilterFunction?: (user: UserType) => boolean;
  userRoles?: Role[];
  showCopyEmailButton?: boolean;
  sx?: {
    dialogContentSxProps?: SxProps;
    dialogActionsSxProps?: SxProps;
  };
  showFullExplanation?: boolean;
}

export const ParticipantDetails = ({
  users,
  translationKey = "participants",
  projectId,
  tourId,
  onAddParticipants,
  showTitle = true,
  userFilterFunction,
  userRoles,
  showCopyEmailButton = true,
  sx,
}: ParticipantDetailsProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(["projects"]);
  const [addParticipantsOpen, setAddParticipantsOpen] = useState(false);

  const copyEmailsToClipboard = () => {
    const emails = users
      .filter((user) => !!user)
      .map((user) => user.email)
      .join(", ");
    navigator.clipboard
      .writeText(emails)
      .then(() =>
        enqueueSnackbar("Emails copied to clipboard!", { variant: "success" })
      )
      .catch(() =>
        enqueueSnackbar("Failed to copy emails.", { variant: "error" })
      );
  };

  let dialog;
  if (onAddParticipants) {
    if (tourId) {
      dialog = (
        <AddParticipantsDialog
          entity="tour"
          open={addParticipantsOpen}
          userRoles={userRoles}
          translationKey={translationKey}
          onClose={(user?: Partial<User>, customMessage?: string) => {
            if (user && onAddParticipants) {
              onAddParticipants(user, customMessage);
            }
            setAddParticipantsOpen(false);
          }}
        />
      );
    } else if (projectId) {
      dialog = (
        <AddParticipantsDialog
          entity="project"
          open={addParticipantsOpen}
          // discipline={project?.discipline}
          userRoles={userRoles}
          translationKey={translationKey}
          onClose={(user?: Partial<User>, customMessage?: string) => {
            if (user && onAddParticipants) {
              onAddParticipants(user, customMessage);
            }
            setAddParticipantsOpen(false);
          }}
        />
      );
    }
  }

  return (
    <>
      {dialog}
      {showTitle && (
        <DialogTitle>{t(`projects:${translationKey}.modal-title`)}</DialogTitle>
      )}
      <DialogContent sx={sx?.dialogContentSxProps}>
        {users
          .filter((user) => !!user)
          .filter(userFilterFunction ?? (() => true))
          .map((user) => {
            return (
              <ParticipantListItem
                key={user._id}
                user={user}
                showContactInformation
              />
            );
          })}
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "var(--color-white) !important",
          borderTop: "none !important",
          ...sx?.dialogActionsSxProps,
        }}
      >
        {showCopyEmailButton && (
          <Button
            variant="outlined"
            size="small"
            onClick={copyEmailsToClipboard}
            fullWidth
          >
            {t(`projects:${translationKey}.copy_email`)}
          </Button>
        )}
        {!!onAddParticipants && (
          <Button
            variant="contained"
            onClick={() => setAddParticipantsOpen(true)}
            fullWidth
          >
            {t(`projects:${translationKey}.add`)}
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export default ParticipantList;
