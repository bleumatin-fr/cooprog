import {
  Box,
  Typography,
  Avatar,
  Grid,
  IconButton,
  useTheme,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import Dialog, { DialogContent } from "@/components/UI/Dialog";
import { User, Profile } from "@cooprog/core";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import Markdown from "@/components/UI/Markdown";
import UserAvatar from "@/components/structures/UserAvatar";
import { useState, useEffect } from "react";
import ProfileCreateDialog from "./ProfileCreateDialog";
import ProfileEditDialog from "./ProfileEditDialog";
import UserEditDialog from "./UserEditDialog";
import logo from "@/components/layout/logo_black.svg";
import useUser from "./useUser";
import { useRouter } from "next/router";
interface ProfileSelectDialogProps {
  open: boolean;
  user: User | null;
  onSelectProfile: (profileId: string) => void;
  onClose: () => void;
}

export const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.primary.main,
  fontSize: "1.5rem",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const ProfileName = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: "center",
  fontSize: "1.2rem",
  lineHeight: 1,
}));

const CreateProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.action.hover,
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  border: `2px dashed ${theme.palette.divider}`,
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor: theme.palette.action.selected,
  },
}));

const ProfileSelectDialog = ({
  open,
  user,
  onSelectProfile,
  onClose,
}: ProfileSelectDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const {
    previouslySelectedProfileId,
    selectedProfileId,
    openUserEditTabOnNextOpen,
    setOpenUserEditTabOnNextOpen,
  } = useUser();
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [updateUserOpen, setUpdateUserOpen] = useState(false);
  const [userEditInitialTab, setUserEditInitialTab] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (open && openUserEditTabOnNextOpen !== null) {
      setUserEditInitialTab(openUserEditTabOnNextOpen);
      setUpdateUserOpen(true);
      setOpenUserEditTabOnNextOpen(null);
    }
  }, [open, openUserEditTabOnNextOpen, setOpenUserEditTabOnNextOpen]);

  const handleEditProfile = (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation();
    setSelectedProfile(profile);
    setUpdateProfileOpen(true);
  };

  const handleEditUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserEditInitialTab(0);
    setUpdateUserOpen(true);
  };

  const canCreateProfile = (user?.profiles?.length ?? 0) < 5;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen showCloseButton={false}>
        <DialogContent>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              p: 4,
              pt: 4,
              position: "relative",
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: theme.spacing(2),
                right: theme.spacing(2),
                zIndex: 1,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  backgroundColor: "var(--color-light-gray)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: theme.spacing(1),
                mb: theme.spacing(2),
              }}
            >
              <Image
                src={logo}
                alt="Cooprog"
                height={150}
                style={{
                  alignSelf: "center",
                  justifySelf: "flex-start",
                  cursor: "pointer",
                  marginBottom: theme.spacing(4),
                }}
                onClick={() => {
                  router.push("/");
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: "2rem",
                  fontWeight: 500,
                }}
              >
                {t("common:dialogs.profile-selection.introduction")}
              </Typography>
            </Box>
            {user && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: theme.spacing(2),
                  }}
                >
                  <UserAvatar
                    user={user}
                    size="large"
                    showTooltip={false}
                    showLink={false}
                    showProfile={false}
                    sx={{
                      marginBottom: theme.spacing(2),
                    }}
                  />
                  <Tooltip
                    title={t("common:dialogs.profile-selection.editUser")}
                  >
                    <Button
                      onClick={handleEditUser}
                      startIcon={<EditIcon />}
                      sx={{
                        bottom: theme.spacing(2),
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        "&:hover": {
                          backgroundColor: "var(--color-light-gray)",
                        },
                        borderRadius: "35px",
                        height: 35,
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.5rem",
                        },
                      }}
                    >
                      {t("common:dialogs.profile-selection.editUser")}
                    </Button>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    textAlign: "center",
                    mb: 2,
                  }}
                >
                  {user.company}
                </Typography>
              </>
            )}
            <Divider
              sx={{
                width: "100%",
                marginBottom: theme.spacing(3),
                marginTop: theme.spacing(5),
              }}
            />

            <Typography
              variant="h1"
              sx={{
                color: theme.palette.text.primary,
                fontSize: "2rem",
                fontWeight: 500,
                marginBottom: theme.spacing(3),
                marginTop: theme.spacing(5),
              }}
            >
              {t("common:dialogs.profile-selection.title")}
            </Typography>
            <Markdown
              style={{
                color: theme.palette.text.secondary,
                fontSize: "1.2rem",
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(3),
              }}
            >
              {t("common:dialogs.profile-selection.helperText")}
            </Markdown>
            <Grid
              container
              spacing={3}
              justifyContent="center"
              alignItems="flex-start"
              sx={{ maxWidth: 1200, width: "100%" }}
            >
              {user?.profiles?.map((profile) => (
                <Grid
                  size={{
                    xs: 6,
                    sm: 4,
                    md: 3,
                  }}
                  key={profile._id}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      onSelectProfile(profile._id?.toString() ?? "")
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: theme.spacing(2),
                      }}
                    >
                      <Tooltip
                        title={t(
                          "common:dialogs.profile-selection.selectProfile"
                        )}
                      >
                        <ProfileAvatar
                          sx={{
                            bgcolor: profile.color || "var(--color-orange)",
                            border:
                              profile._id === previouslySelectedProfileId
                                ? `2px solid var(--color-orange)`
                                : "none",
                          }}
                          alt={`${profile.firstName} ${profile.lastName}`}
                        >
                          {profile.firstName?.[0].toUpperCase()}
                          {profile.lastName?.[0].toUpperCase()}
                        </ProfileAvatar>
                      </Tooltip>
                      <Tooltip
                        title={t(
                          "common:dialogs.profile-selection.editProfile"
                        )}
                      >
                        <Button
                          onClick={(e) => handleEditProfile(e, profile)}
                          sx={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            "&:hover": {
                              backgroundColor: "var(--color-light-gray)",
                            },
                            height: 24,
                            "& .MuiSvgIcon-root": {
                              fontSize: "1rem",
                            },
                            borderRadius: "24px",
                          }}
                          startIcon={<EditIcon />}
                        >
                          {t("common:dialogs.profile-selection.editProfile")}
                        </Button>
                      </Tooltip>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <ProfileName>
                          {profile.firstName} {profile.lastName}
                        </ProfileName>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.8rem",
                            maxWidth: "100%",
                            textAlign: "center",
                          }}
                        >
                          {profile.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}

              <Grid
                size={{
                  xs: 6,
                  sm: 4,
                  md: 3,
                }}
              >
                <Tooltip
                  title={
                    canCreateProfile
                      ? t("common:dialogs.profile-selection.createNew")
                      : t("common:dialogs.profile-selection.maxProfilesReached")
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: canCreateProfile ? "pointer" : "not-allowed",
                      opacity: canCreateProfile ? 1 : 0.5,
                      gap: theme.spacing(2),
                    }}
                    onClick={() =>
                      canCreateProfile && setCreateProfileOpen(true)
                    }
                  >
                    <CreateProfileAvatar
                      sx={{
                        backgroundColor: canCreateProfile
                          ? theme.palette.action.hover
                          : theme.palette.action.disabled,
                        "&:hover": {
                          transform: canCreateProfile ? "scale(1.1)" : "none",
                          backgroundColor: canCreateProfile
                            ? theme.palette.action.selected
                            : theme.palette.action.disabled,
                        },
                      }}
                    >
                      <AddIcon
                        sx={{
                          fontSize: 40,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </CreateProfileAvatar>

                    <Tooltip
                      title={t("common:dialogs.profile-selection.editProfile")}
                    >
                      <Button
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          "&:hover": {
                            backgroundColor: "var(--color-light-gray)",
                          },
                          height: 24,
                          "& .MuiSvgIcon-root": {
                            fontSize: "1rem",
                          },
                          borderRadius: "24px",
                        }}
                      >
                        {t("common:dialogs.profile-selection.createNew")}
                      </Button>
                    </Tooltip>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {createProfileOpen && (
        <ProfileCreateDialog
          open={createProfileOpen}
          onClose={() => setCreateProfileOpen(false)}
        />
      )}

      {selectedProfile && (
        <ProfileEditDialog
          open={updateProfileOpen}
          onClose={() => {
            setUpdateProfileOpen(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
        />
      )}

      {updateUserOpen && user && (
        <UserEditDialog
          open={updateUserOpen}
          onClose={() => {
            setUpdateUserOpen(false);
            setUserEditInitialTab(0);
          }}
          user={user}
          initialTab={userEditInitialTab}
        />
      )}
    </>
  );
};

export default ProfileSelectDialog;
