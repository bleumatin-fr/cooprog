import {
  Discipline,
  LabeledLocation,
  Profile,
  Role,
  StructureType,
  User,
} from "@cooprog/core";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import Dialog, {
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@/components/UI/Dialog";
import { useTranslation } from "next-i18next";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import ProgrammingDisciplineSection from "@/components/discipline/ProgrammingDisciplineSection";
import DisciplineSelector from "@/components/projects/DisciplineSelector";
import UserAvatar from "@/components/structures/UserAvatar";
import Markdown from "@/components/UI/Markdown";
import useUser from "./useUser";
import { useSnackbar } from "notistack";
import LocationFormDialog from "./LocationFormDialog";

interface UserData {
  company: string;
  companyDescription?: string;
  link?: string;
  email: string;
  role: Role;
  color?: string;
  locations: LabeledLocation[];
  language?: string;
  profiles?: Profile[];
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
}

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  initialTab?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-profile-tabpanel-${index}`}
      aria-labelledby={`user-profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-profile-tab-${index}`,
    "aria-controls": `user-profile-tabpanel-${index}`,
  };
}

const UserEditDialog = ({
  open,
  onClose,
  user,
  initialTab = 0,
}: UserEditDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    uploadAvatar,
    loading: uploadLoading,
    updateUser,
    updateProgrammingFields,
  } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(initialTab);
  const { enqueueSnackbar } = useSnackbar();
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LabeledLocation | null>(null);

  const [formData, setFormData] = useState<UserData>({
    company: "",
    companyDescription: "",
    link: "",
    email: "",
    role: Role.SPECTATOR,
    color: "",
    locations: [],
    language: "",
    profiles: [],
    programmingDisciplines: [],
    structureTypes: [],
    programmingPeriods: "",
    programmingGenres: [],
  });

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Cleanup preview URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (user) {
      setFormData({
        company: user.company,
        companyDescription: user.companyDescription,
        link: user.link,
        email: user.email,
        role: user.role,
        color: user.color,
        locations: user.locations,
        language: user.language,
        profiles: user.profiles,
        programmingDisciplines: user.programmingDisciplines,
        structureTypes: user.structureTypes,
        programmingPeriods: user.programmingPeriods,
        programmingGenres: user.programmingGenres,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mise à jour des informations générales de l'utilisateur
      const result = await updateUser({
        company: formData.company,
        companyDescription: formData.companyDescription,
        locations: formData.locations,
        email: formData.email,
      });

      // Mise à jour des champs de programmation
      await updateProgrammingFields({
        programmingDisciplines: formData.programmingDisciplines,
        structureTypes: formData.structureTypes,
        programmingPeriods: formData.programmingPeriods,
        programmingGenres: formData.programmingGenres,
      });

      // Nettoyer l'URL de prévisualisation après une soumission réussie
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Afficher un message de succès
      setError(null);

      enqueueSnackbar(t("common:dialogs.user-edition.success"), {
        variant: "success",
      });
      // Wait a moment to show the updated avatar before closing
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationDialogOpen(true);
  };

  const handleEditLocation = (location: LabeledLocation) => {
    setEditingLocation(location);
    setLocationDialogOpen(true);
  };

  const handleLocationSubmit = (location: LabeledLocation) => {
    if (editingLocation) {
      setFormData({
        ...formData,
        locations: formData.locations.map((loc) =>
          loc._id === location._id ? location : loc
        ),
      });
    } else {
      setFormData({
        ...formData,
        locations: [...formData.locations, location],
      });
    }
    setLocationDialogOpen(false);
    setEditingLocation(null);
  };

  const handleDeleteLocation = (locationId: string) => {
    const locationToDelete = formData.locations.find(
      (loc) => loc._id === locationId
    );
    if (!locationToDelete || locationToDelete.isMain) return;

    setFormData({
      ...formData,
      locations: formData.locations.filter((loc) => loc._id !== locationId),
    });
  };

  const handleSetMainLocation = (locationId: string) => {
    setFormData({
      ...formData,
      locations: formData.locations.map((loc) => ({
        ...loc,
        isMain: loc._id === locationId,
      })),
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadAvatar({ file });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      enqueueSnackbar(t("common:dialogs.user-edition.avatar-success"), {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(
        t("common:dialogs.user-edition.avatar-error", {
          error: error instanceof Error ? error.message : String(error),
        }),
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire pour les changements dans les champs de programmation
  const handleProgrammingFieldChange = (field: string, value: any) => {
    if (field === "programmingDisciplines") {
      setFormData({
        ...formData,
        programmingDisciplines: value,
      });
    } else if (field === "structureTypes") {
      setFormData({
        ...formData,
        structureTypes: value,
      });
    } else if (field === "programmingPeriods") {
      setFormData({
        ...formData,
        programmingPeriods: value,
      });
    } else if (field === "programmingGenres") {
      setFormData({
        ...formData,
        programmingGenres: value,
      });
    }
  };

  const handleDisciplineChange = (newDisciplines: Discipline[]) => {
    setFormData({
      ...formData,
      programmingDisciplines: newDisciplines,
      programmingGenres: formData.programmingGenres,
      structureTypes: newDisciplines.includes(Discipline.MUSIC)
        ? formData.structureTypes || []
        : [],
    });
  };

  const handleDisciplinesChange = (newDisciplines: string[]) => {
    const typedDisciplines = newDisciplines as Discipline[];

    setFormData({
      ...formData,
      programmingDisciplines: typedDisciplines,
      programmingGenres: formData.programmingGenres,
      structureTypes: typedDisciplines.includes(Discipline.MUSIC)
        ? formData.structureTypes || []
        : [],
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t("common:dialogs.user-edition.title")}</DialogTitle>
      <DialogContent sx={{ paddingBottom: 0, paddingTop: 0 }}>
        <Box>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Box
            sx={{
              width: "calc(100% + 48px)",
              mb: 3,
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
              marginBottom: 0,
              marginLeft: "-24px",
              marginRight: "-24px",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="user profile tabs"
              centered
            >
              <Tab
                label={t("common:dialogs.profile.tabs.general-information")}
                {...a11yProps(0)}
              />
              <Tab
                label={t("common:dialogs.profile.tabs.address")}
                {...a11yProps(1)}
              />
              <Tab
                label={t("common:dialogs.profile.tabs.discipline")}
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ width: "100%" }}>
                <FormLabel sx={{ mb: 2, display: "block" }}>
                  {t("common:dialogs.user-edition.avatar")}
                </FormLabel>
                <Markdown>
                  {t("common:dialogs.user-edition.avatarHelperText")}
                </Markdown>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <UserAvatar
                      user={{
                        ...user,
                        ...formData,
                        avatarUrl: previewUrl || user.avatarUrl,
                        avatarChangedAt: undefined,
                      }}
                      size="xlarge"
                      sx={{
                        width: 120,
                        height: 120,
                        opacity: uploadLoading ? 0.5 : 1,
                        transition: "opacity 0.2s",
                      }}
                      showTooltip={false}
                      showLink={false}
                      showProfile={false}
                    />
                    {uploadLoading && (
                      <Backdrop
                        open={true}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          borderRadius: "50%",
                        }}
                      >
                        <CircularProgress size={40} />
                      </Backdrop>
                    )}
                  </Box>
                  <Tooltip
                    title={t("common:dialogs.user-edition.avatarButton")}
                  >
                    <Button
                      onClick={handleAvatarClick}
                      startIcon={<EditIcon />}
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      disabled={uploadLoading}
                    >
                      {uploadLoading
                        ? t("common:dialogs.user-edition.uploading")
                        : t("common:dialogs.user-edition.avatarButton")}
                    </Button>
                  </Tooltip>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/jpeg,image/png,image/gif"
                    style={{ display: "none" }}
                  />
                </Box>
              </Box>

              <Box sx={{ width: "100%" }}>
                <FormLabel sx={{ mb: 2, display: "block" }}>
                  {t("common:dialogs.user-edition.email")}
                </FormLabel>

                <TextField
                  required
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ width: "100%" }}>
                <FormLabel sx={{ mb: 2, display: "block" }}>
                  {t("common:dialogs.user-edition.company")}
                </FormLabel>

                <TextField
                  required
                  fullWidth
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <FormLabel sx={{ mb: 2, display: "block" }}>
                  {t("common:dialogs.user-edition.companyDescription")}
                </FormLabel>
                <Markdown style={{ marginBottom: "1rem" }}>
                  {t("common:dialogs.user-edition.companyDescriptionHelper")}
                </Markdown>

                <TextField
                  fullWidth
                  value={formData.companyDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyDescription: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Box sx={{ width: "100%" }}>
                <FormLabel sx={{ mb: 2, display: "block" }}>
                  {t("common:dialogs.user-edition.locations")}
                </FormLabel>

                <List>
                  {formData.locations.map((location) => (
                    <ListItem
                      key={location._id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={location.label}
                        secondary={location.location.address}
                        sx={{ pr: 12 }}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          {location._id && (
                            <Tooltip
                              title={
                                location.isMain
                                  ? t(
                                      "common:dialogs.user-edition.main-location"
                                    )
                                  : t(
                                      "common:dialogs.user-edition.set-main-location"
                                    )
                              }
                            >
                              <IconButton
                                onClick={() =>
                                  handleSetMainLocation(location._id!)
                                }
                                disabled={location.isMain}
                              >
                                {location.isMain ? (
                                  <StarIcon sx={{ color: "#FFD700" }} />
                                ) : (
                                  <StarBorderIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip
                            title={t(
                              "common:dialogs.user-edition.edit-location"
                            )}
                          >
                            <IconButton
                              onClick={() => handleEditLocation(location)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {location._id && (
                            <Tooltip
                              title={t(
                                "common:dialogs.user-edition.delete-location"
                              )}
                            >
                              <IconButton
                                onClick={() =>
                                  handleDeleteLocation(location._id!)
                                }
                                disabled={location.isMain}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddLocation}
                  sx={{ mb: 2 }}
                >
                  {t("common:dialogs.user-edition.add-location")}
                </Button>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Stack spacing={4}>
              <Box sx={{ width: "100%" }}>
                <FormLabel
                  sx={{
                    mb: 2,
                    display: "block",
                    color: "#333",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  {t("common:dialogs.user-edition.programmingDisciplines")}
                </FormLabel>
                <DisciplineSelector
                  value={formData.programmingDisciplines}
                  setValue={handleDisciplineChange}
                  multiSelect={true}
                />
              </Box>

              {formData.programmingDisciplines &&
                formData.programmingDisciplines.length > 0 && (
                  <ProgrammingDisciplineSection
                    role={user.role}
                    values={{
                      programmingDisciplines:
                        formData.programmingDisciplines || [],
                      structureTypes: formData.structureTypes || [],
                      programmingPeriods: formData.programmingPeriods || "",
                      programmingGenres: formData.programmingGenres || [],
                    }}
                    labels={{
                      structureTypes: t(
                        "common:dialogs.user-edition.structureTypes"
                      ),
                      programmingPeriods: t(
                        "common:dialogs.user-edition.programmingPeriods"
                      ),
                      programmingPeriodsHelper: t(
                        "common:dialogs.user-edition.programmingPeriodsHelper"
                      ),
                      genres: t("common:dialogs.user-edition.genres"),
                    }}
                    onChange={handleProgrammingFieldChange}
                  />
                )}
            </Stack>
          </TabPanel>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          gap: 2,
        }}
      >
        <Button onClick={onClose} disabled={loading}>
          {t("common:cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {t("common:dialogs.user-edition.submit")}
        </Button>
      </DialogActions>

      <LocationFormDialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        onSubmit={handleLocationSubmit}
        editingLocation={editingLocation}
      />
    </Dialog>
  );
};

export default UserEditDialog;
