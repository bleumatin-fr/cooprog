import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Switch as MuiSwitch,
} from "@mui/material";
import { DialogActions, DialogContent } from "@/components/UI/Dialog";

import FolderIcon from "@mui/icons-material/Folder";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import Groups3OutlinedIcon from "@mui/icons-material/Groups3Outlined";
import { Block, InputGroup } from "@/components/newProject/ProjectCreationForm";
import SavingsOutlinedIcon from "@mui/icons-material/Calculate";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import HearingDisabledOutlinedIcon from "@mui/icons-material/HearingDisabledOutlined";

import TextField from "@/components/TextField";
import { Discipline, FileType, User, Role } from "@cooprog/core";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import FormErrorNotification from "@/components/UI/FormErrorNotification";
import Markdown from "@/components/UI/Markdown";
import MultipleAddressAutocomplete from "@/components/UI/MultipleAddressAutocomplete";
import MultipleAutocomplete from "@/components/UI/MultipleAutocomplete";
import SelectableChipGroup from "@/components/UI/SelectableChipGroup";
import TitleWithIcon from "@/components/UI/TitleWithIcon";
import BlueInfoCard from "@/components/UI/BlueInfoCard";
import useUser from "@/components/authentication/useUser";
import Ressources from "@/components/newProject/Ressources";
import DisciplineSelector from "./DisciplineSelector";
import { ParticipantDetails } from "./ParticipantList";
import useGenres from "./useGenres";
import useTargetAudiences from "./useTargetAudiences";
import { useSnackbar } from "notistack";

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  width: 100%;
`;

const MarkdownContainer = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start !important;
  justify-content: flex-start !important;

  > p {
    margin: 1rem 0 0 0;
  }
`;

const AccessibilityOptionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;

  svg {
    display: block;
  }
`;

// Création des switchs personnalisés avec icônes
const CulturalActionSwitch = styled(MuiSwitch)({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="white" d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>')`,
      left: 12,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="#888" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
});

const EmergingArtistSwitch = styled(MuiSwitch)({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="white" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>')`,
      left: 12,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="#888" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
});
const RequiredFieldsNote = styled(FormHelperText)`
  text-align: right;
  margin-top: 4px;
  color: var(--color-gray);
`;

const EditProjectForm = ({
  projectId,
  onClose,
  existingFiles,
  onDeleteFile,
  formik,
  isMissingRequiredFields,
}: {
  projectId?: string;
  onClose: () => void;
  existingFiles: FileType[];
  onDeleteFile: (fileId: string) => void;
  formik: any;
  isMissingRequiredFields: boolean;
}) => {
  const { t } = useTranslation();
  const { user } = useUser();

  const genres = useGenres();
  const targetAudiences = useTargetAudiences();
  const { enqueueSnackbar } = useSnackbar();

  const handleAddParticipants = (
    user: Partial<User>,
    customMessage?: string
  ): void => {
    const foundUser = formik.values.users.find(
      (u: any) => u.user.email === user.email || u.user._id === user._id
    );
    if (foundUser) {
      enqueueSnackbar(t("projects:edit.user-already-added"), {
        variant: "error",
      });
      return;
    }
    formik.setFieldValue("users", [
      ...formik.values.users,
      {
        user: {
          ...user,
          role: Role.ARTISTIC_TEAM,
        },
        customMessage,
      },
    ]);
  };

  return (
    <Container>
      <Form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <FormErrorNotification formik={formik} />
          <BlueInfoCard icon={<EditNoteIcon sx={{ fontSize: 64, color: "white" }} />}>
            <MarkdownContainer>
              <Markdown>{t("projects:edit.introduction")}</Markdown>
            </MarkdownContainer>
          </BlueInfoCard>
          {isMissingRequiredFields && (
            <Alert
              severity="warning"
              sx={{ width: "100%", textAlign: "center" }}
            >
              {t("projects:edit.alert-force-edit")}
            </Alert>
          )}

          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.project-information.discipline"
              )}
              icon={TheaterComedyOutlinedIcon}
            />
            <div>
              <FormControl
                fullWidth
                error={
                  formik.touched.discipline && Boolean(formik.errors.discipline)
                }
              >
                <DisciplineSelector
                  value={formik.values.discipline || ""}
                  setValue={(newDiscipline) => {
                    const previousDiscipline = formik.values.discipline;

                    // Réinitialisation des valeurs liées au changement de discipline
                    if (previousDiscipline !== newDiscipline) {
                      formik.setFieldValue("genres", []);
                      formik.setFieldValue("gauge", []);
                      formik.setFieldValue("minimumStageSize", []);
                      formik.setFieldValue("averagePerformanceFee", []);
                    }

                    formik.setFieldValue("discipline", newDiscipline);
                    // Marquer le champ comme touché pour déclencher la validation
                    formik.setFieldTouched("discipline", true, false);
                  }}
                />
                {formik.touched.discipline &&
                  Boolean(formik.errors.discipline) && (
                    <FormHelperText error={true}>
                      {formik.errors.discipline as string}
                    </FormHelperText>
                  )}
              </FormControl>
            </div>
          </Block>

          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.subtitles.generalInformations"
              )}
              icon={InfoOutlinedIcon}
            />
            <div>
              <TextField
                id="artist"
                name="artist"
                label={
                  t("common:dialogs.new-project.project-information.artist") +
                  "*"
                }
                value={formik.values.artist}
                onChange={formik.handleChange}
                error={formik.touched.artist && Boolean(formik.errors.artist)}
                helperText={formik.touched.artist && formik.errors.artist}
                fullWidth
              ></TextField>
              <TextField
                id="work"
                name="work"
                label={
                  t(
                    "common:dialogs.new-project.project-information.titleOfWork"
                  ) +
                  (formik.values.discipline === Discipline.PERFORMING_ARTS
                    ? " *"
                    : "")
                }
                value={formik.values.work}
                onChange={formik.handleChange}
                error={formik.touched.work && Boolean(formik.errors.work)}
                helperText={formik.touched.work && formik.errors.work}
                fullWidth
              ></TextField>
            </div>
            <FormLabel
              error={Boolean(formik.touched.places && formik.errors.places)}
            >
              {t("common:dialogs.new-project.project-information.places") +
                (formik.values.discipline === Discipline.MUSIC ? "" : " *")}
            </FormLabel>
            <Markdown>
              {t(
                "common:dialogs.new-project.project-information.places-explanation"
              )}
            </Markdown>
            <div>
              <FormControl fullWidth>
                <MultipleAddressAutocomplete
                  id="places"
                  name="places"
                  onChange={(value) => formik.setFieldValue("places", value)}
                  value={formik.values.places}
                  error={Boolean(formik.touched.places && formik.errors.places)}
                  multiple={true}
                />
                {formik.touched.places && Boolean(formik.errors.places) && (
                  <FormHelperText>{formik.errors.places}</FormHelperText>
                )}
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="genres"
                  name="genres"
                  label={t(
                    "common:dialogs.new-project.project-information.genre"
                  )}
                  sortFunction={(a, b) => a[1].localeCompare(b[1])}
                  items={genres
                    .filter(
                      (genre) => genre.discipline === formik.values.discipline
                    )
                    .reduce((acc, genre) => {
                      acc[genre.id] = genre.name;
                      return acc;
                    }, {} as Record<string, string>)}
                  selectedItems={formik.values.genres || []}
                  onChange={(updatedGenres) =>
                    formik.setFieldValue("genres", updatedGenres)
                  }
                  error={formik.touched.genres && Boolean(formik.errors.genres)}
                  helperText={
                    formik.touched.genres && formik.errors.genres
                      ? formik.errors.genres
                      : undefined
                  }
                  required
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <TextField
                  id="complementaryGenre"
                  name="complementaryGenre"
                  label={t("Complementary Genre")}
                  value={formik.values.complementaryGenre || ""}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.complementaryGenre &&
                    Boolean(formik.errors.complementaryGenre)
                  }
                  helperText={
                    (formik.touched.complementaryGenre &&
                      formik.errors.complementaryGenre) ||
                    t(
                      "Use this field to specify additional genre information if needed"
                    ) ||
                    "Use this field to specify additional genre information if needed"
                  }
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="targetAudiences"
                  name="targetAudiences"
                  label={t(
                    "common:dialogs.new-project.project-information.target-audience"
                  )}
                  items={targetAudiences.reduce((acc, targetAudience) => {
                    acc[targetAudience.id] = targetAudience.name;
                    return acc;
                  }, {} as Record<string, string>)}
                  selectedItems={formik.values.targetAudiences}
                  onChange={(updatedAudiences) =>
                    formik.setFieldValue("targetAudiences", updatedAudiences)
                  }
                  error={
                    formik.touched.targetAudiences &&
                    Boolean(formik.errors.targetAudiences)
                  }
                  helperText={
                    formik.touched.targetAudiences &&
                    formik.errors.targetAudiences
                      ? formik.errors.targetAudiences
                      : undefined
                  }
                  required={formik.values.discipline !== Discipline.MUSIC}
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <FormLabel htmlFor="description">
                  {t(
                    "common:dialogs.new-project.project-information.description-label"
                  )}
                </FormLabel>
                <TextField
                  id="description"
                  name="description"
                  placeholder={t(
                    "common:dialogs.new-project.project-information.description-placeholder"
                  )}
                  multiline
                  maxRows={8}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  fullWidth
                />
              </FormControl>
            </div>
          </Block>
          <Block>
            <TitleWithIcon
              title={t("common:dialogs.new-project.subtitles.ressources")}
              icon={FolderIcon}
            />
            <div>
              <Ressources
                id="ressources"
                name="ressources"
                userId={user?._id!}
                links={formik.values.links || []}
                setLinks={(updatedLinks) =>
                  formik.setFieldValue("links", updatedLinks)
                }
                newFiles={formik.values.files || []}
                setNewFiles={(updatedFiles) =>
                  formik.setFieldValue("files", updatedFiles)
                }
                existingFiles={existingFiles}
                onDeleteFile={onDeleteFile}
              />
            </div>
          </Block>
          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.subtitles.representationConditions"
              )}
              icon={TheaterComedyOutlinedIcon}
            />
            <Markdown>
              {t(
                "common:dialogs.new-project.project-information.representationConditionsHelper"
              )}
            </Markdown>
            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="gauge"
                  name="gauge"
                  label={t("common:dialogs.new-project.gauge.label")}
                  items={
                    t(
                      formik.values.discipline === Discipline.MUSIC
                        ? "projects:gaugesMusic"
                        : "projects:gauges",
                      {
                        returnObjects: true,
                      }
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.gauge}
                  onChange={(updatedGauges) =>
                    formik.setFieldValue("gauge", updatedGauges)
                  }
                  error={formik.touched.gauge && Boolean(formik.errors.gauge)}
                  helperText={
                    formik.touched.gauge ? formik.errors.gauge : undefined
                  }
                />
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="minimumStageSize"
                  name="minimumStageSize"
                  label={t("common:dialogs.new-project.minimumStageSize.label")}
                  items={
                    t(
                      formik.values.discipline === Discipline.MUSIC
                        ? "projects:minimumStageSizesMusic"
                        : "projects:minimumStageSizes",
                      {
                        returnObjects: true,
                      }
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.minimumStageSize}
                  onChange={(updatedMinimumStageSizes) =>
                    formik.setFieldValue(
                      "minimumStageSize",
                      updatedMinimumStageSizes
                    )
                  }
                  error={
                    formik.touched.minimumStageSize &&
                    Boolean(formik.errors.minimumStageSize)
                  }
                  helperText={
                    formik.touched.minimumStageSize
                      ? formik.errors.minimumStageSize
                      : undefined
                  }
                />
              </FormControl>
            </div>
            <InputGroup
              style={{
                width: "fit-content",
              }}
            >
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="venueConfigurationType"
                  name="venueConfigurationType"
                  label={t(
                    "common:dialogs.new-project.venueConfigurationType.label"
                  )}
                  items={
                    t("projects:venueConfigurationTypes", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationType}
                  onChange={(updatedVenueConfigurationTypes) =>
                    formik.setFieldValue(
                      "venueConfigurationType",
                      updatedVenueConfigurationTypes
                    )
                  }
                  error={
                    formik.touched.venueConfigurationType &&
                    Boolean(formik.errors.venueConfigurationType)
                  }
                  helperText={
                    formik.touched.venueConfigurationType
                      ? formik.errors.venueConfigurationType
                      : undefined
                  }
                />
              </FormControl>
              <Divider
                sx={{
                  width: "100%",
                }}
              />
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="venueConfigurationSpace"
                  name="venueConfigurationSpace"
                  label=""
                  items={
                    t("projects:venueConfigurationSpaces", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationSpace}
                  onChange={(updatedVenueConfigurationSpaces) =>
                    formik.setFieldValue(
                      "venueConfigurationSpace",
                      updatedVenueConfigurationSpaces
                    )
                  }
                  error={
                    formik.touched.venueConfigurationSpace &&
                    Boolean(formik.errors.venueConfigurationSpace)
                  }
                  helperText={
                    formik.touched.venueConfigurationSpace
                      ? formik.errors.venueConfigurationSpace
                      : undefined
                  }
                  exclusiveLastOption
                />
              </FormControl>
              <Divider
                sx={{
                  width: "100%",
                }}
              />
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="venueConfigurationAudience"
                  name="venueConfigurationAudience"
                  label=""
                  items={
                    t("projects:venueConfigurationAudiences", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationAudience}
                  onChange={(updatedVenueConfigurationAudiences) =>
                    formik.setFieldValue(
                      "venueConfigurationAudience",
                      updatedVenueConfigurationAudiences
                    )
                  }
                  error={
                    formik.touched.venueConfigurationAudience &&
                    Boolean(formik.errors.venueConfigurationAudience)
                  }
                  helperText={
                    formik.touched.venueConfigurationAudience
                      ? formik.errors.venueConfigurationAudience
                      : undefined
                  }
                />
              </FormControl>
            </InputGroup>
            <>
              {formik.values.discipline === Discipline.PERFORMING_ARTS && (
                <div>
                <FormControl fullWidth>
                  <FormLabel>
                    {t("common:dialogs.new-project.performanceLanguages.label")}
                  </FormLabel>
                  <MultipleAutocomplete
                    id="performanceLanguages"
                    name="performanceLanguages"
                    options={Object.entries(
                      t("projects:performanceLanguages", {
                        returnObjects: true,
                      }) as Record<string, string>
                    )
                      .sort((a, b) => a[1].localeCompare(b[1]))
                      .reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                      }, {} as Record<string, string>)}
                    value={formik.values.performanceLanguages}
                    onChange={(updatedPerformanceLanguages) =>
                      formik.setFieldValue(
                        "performanceLanguages",
                        updatedPerformanceLanguages
                      )
                    }
                    error={
                      formik.touched.performanceLanguages &&
                      Boolean(formik.errors.performanceLanguages)
                    }
                    helperText={
                      formik.touched.performanceLanguages
                        ? (formik.errors.performanceLanguages as string)
                        : undefined
                    }
                  />
                </FormControl>
                </div>
              )}
              <div>
                <FormControl fullWidth>
                  <FormLabel>
                    {t(
                      "common:dialogs.new-project.performanceLanguages.accessibility-label",
                    )}
                  </FormLabel>
                  <FormControlLabel
                    sx={{
                      alignItems: "center",
                      ".MuiFormControlLabel-label": {
                        display: "inline-flex",
                        alignItems: "center",
                      },
                    }}
                    control={
                      <Checkbox
                        checked={Boolean(formik.values.accessibilityVisual)}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "accessibilityVisual",
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label={
                      <AccessibilityOptionLabel>
                        <VisibilityOffOutlinedIcon fontSize="small" />
                        {t(
                          "common:dialogs.new-project.performanceLanguages.accessibility-visual",
                        )}
                      </AccessibilityOptionLabel>
                    }
                  />
                  <FormControlLabel
                    sx={{
                      alignItems: "center",
                      ".MuiFormControlLabel-label": {
                        display: "inline-flex",
                        alignItems: "center",
                      },
                    }}
                    control={
                      <Checkbox
                        checked={Boolean(formik.values.accessibilityAudio)}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "accessibilityAudio",
                            event.target.checked,
                          )
                        }
                      />
                    }
                    label={
                      <AccessibilityOptionLabel>
                        <HearingDisabledOutlinedIcon fontSize="small" />
                        {t(
                          "common:dialogs.new-project.performanceLanguages.accessibility-audio",
                        )}
                      </AccessibilityOptionLabel>
                    }
                  />
                </FormControl>
              </div>
            </>
          </Block>
          <Block>
            <TitleWithIcon
              title={t("common:dialogs.new-project.subtitles.budget")}
              icon={SavingsOutlinedIcon}
            />
            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  id="averagePerformanceFee"
                  name="averagePerformanceFee"
                  label={t(
                    "common:dialogs.new-project.averagePerformanceFee.label"
                  )}
                  items={
                    t(
                      formik.values.discipline === Discipline.MUSIC
                        ? "projects:averagePerformanceFeesMusic"
                        : "projects:averagePerformanceFees",
                      {
                        returnObjects: true,
                      }
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.averagePerformanceFee}
                  onChange={(updatedAveragePerformanceFees) =>
                    formik.setFieldValue(
                      "averagePerformanceFee",
                      updatedAveragePerformanceFees
                    )
                  }
                  error={
                    formik.touched.averagePerformanceFee &&
                    Boolean(formik.errors.averagePerformanceFee)
                  }
                  helperText={
                    formik.touched.averagePerformanceFee
                      ? formik.errors.averagePerformanceFee
                      : undefined
                  }
                  disabled={
                    formik.values.discipline === Discipline.MUSIC &&
                    user?.role !== Role.ARTISTIC_TEAM
                  }
                />
                {formik.values.discipline === Discipline.MUSIC &&
                  user?.role !== Role.ARTISTIC_TEAM && (
                    <FormHelperText
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        margin: "12px 0 0 0",
                        backgroundColor: "var(--color-light-blue)",
                        borderRadius: "8px",
                        border: "1px solid var(--color-dark-blue)",
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                      {t(
                        "common:dialogs.new-project.averagePerformanceFee.disabled"
                      )}
                    </FormHelperText>
                  )}
              </FormControl>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "4px",
                marginBottom: "24px",
              }}
            >
              <FormLabel>
                {t("common:dialogs.new-project.numberOfPeople.label")}
              </FormLabel>
              <div style={{ display: "flex", gap: "16px" }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontSize: "14px" }}>
                    {t("common:dialogs.new-project.numberOfPeopleOnTour.label")}
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="numberOfPeopleOnTour"
                    name="numberOfPeopleOnTour"
                    value={formik.values.numberOfPeopleOnTour}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.numberOfPeopleOnTour &&
                      Boolean(formik.errors.numberOfPeopleOnTour)
                    }
                    helperText={
                      formik.touched.numberOfPeopleOnTour &&
                      formik.errors.numberOfPeopleOnTour
                    }
                    type="number"
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel sx={{ fontSize: "14px" }}>
                    {t(
                      "common:dialogs.new-project.numberOfArtistOnStage.label"
                    )}
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="numberOfArtistOnStage"
                    name="numberOfArtistOnStage"
                    value={formik.values.numberOfArtistOnStage}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.numberOfArtistOnStage &&
                      Boolean(formik.errors.numberOfArtistOnStage)
                    }
                    helperText={
                      formik.touched.numberOfArtistOnStage &&
                      formik.errors.numberOfArtistOnStage
                    }
                    type="number"
                  />
                </FormControl>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "4px",
                marginBottom: "24px",
              }}
            >
              <FormLabel>
                {t("common:dialogs.new-project.genderDistribution.label")}
              </FormLabel>
              <div style={{ display: "flex", gap: "16px" }}>
                <FormControl>
                  <FormLabel sx={{ fontSize: "14px" }}>
                    {t("common:dialogs.new-project.numberOfMenOnStage.label")}
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="numberOfMenOnStage"
                    name="numberOfMenOnStage"
                    value={formik.values.numberOfMenOnStage}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.numberOfMenOnStage &&
                      Boolean(formik.errors.numberOfMenOnStage)
                    }
                    helperText={
                      formik.touched.numberOfMenOnStage &&
                      formik.errors.numberOfMenOnStage
                    }
                    type="number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel sx={{ fontSize: "14px" }}>
                    {t("common:dialogs.new-project.numberOfWomenOnStage.label")}
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="numberOfWomenOnStage"
                    name="numberOfWomenOnStage"
                    value={formik.values.numberOfWomenOnStage}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.numberOfWomenOnStage &&
                      Boolean(formik.errors.numberOfWomenOnStage)
                    }
                    helperText={
                      formik.touched.numberOfWomenOnStage &&
                      formik.errors.numberOfWomenOnStage
                    }
                    type="number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel sx={{ fontSize: "14px" }}>
                    {t(
                      "common:dialogs.new-project.numberOfNonBinaryOnStage.label"
                    )}
                  </FormLabel>
                  <TextField
                    fullWidth
                    id="numberOfNonBinaryOnStage"
                    name="numberOfNonBinaryOnStage"
                    value={formik.values.numberOfNonBinaryOnStage}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.numberOfNonBinaryOnStage &&
                      Boolean(formik.errors.numberOfNonBinaryOnStage)
                    }
                    helperText={
                      formik.touched.numberOfNonBinaryOnStage &&
                      formik.errors.numberOfNonBinaryOnStage
                    }
                    type="number"
                  />
                </FormControl>
              </div>
            </div>

            <div style={{ marginBottom: "24px", display: "flex", gap: "16px" }}>
              <FormControl>
                <FormControlLabel
                  control={
                    <EmergingArtistSwitch
                      checked={Boolean(formik.values.emergingArtist)}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "emergingArtist",
                          e.target.checked
                        );
                      }}
                      name="emergingArtist"
                      color="primary"
                    />
                  }
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {t("common:dialogs.new-project.emergingArtist.label")}
                    </div>
                  }
                />
              </FormControl>

              <FormControl>
                <FormControlLabel
                  control={
                    <CulturalActionSwitch
                      checked={Boolean(formik.values.culturalActionInterest)}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "culturalActionInterest",
                          e.target.checked
                        );
                      }}
                      name="culturalActionInterest"
                      color="primary"
                    />
                  }
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {t(
                        "common:dialogs.new-project.culturalActionInterest.label"
                      )}
                    </div>
                  }
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth>
                <FormLabel>
                  {t("common:dialogs.new-project.financialSupport.label")}
                </FormLabel>
                <TextField
                  id="financialSupport"
                  name="financialSupport"
                  multiline
                  placeholder={t(
                    "common:dialogs.new-project.financialSupport.placeholder"
                  )}
                  value={formik.values.financialSupport}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.financialSupport &&
                    Boolean(formik.errors.financialSupport)
                  }
                  helperText={
                    (formik.touched.financialSupport &&
                      formik.errors.financialSupport) ||
                    t(
                      "common:dialogs.new-project.project-information.description-helper"
                    )
                  }
                  fullWidth
                />
              </FormControl>
            </div>
          </Block>
          <Block>
            <TitleWithIcon
              title={t("common:dialogs.new-project.subtitles.artisticTeam")}
              icon={Groups3OutlinedIcon}
              id="artisticTeam"
            />
            <div style={{ marginBottom: "30vh" }}>
              <FormControl
                fullWidth
                error={formik.touched && Boolean(formik.errors.artisticTeam)}
              >
                <div
                  style={{
                    margin: "0 0 24px 0",
                  }}
                >
                  <Markdown>
                    {t(
                      "common:dialogs.new-project.project-information.artistic-team-description"
                    )}
                  </Markdown>
                </div>
                <ParticipantDetails
                  users={formik.values.users.map((user: any) => user.user)}
                  projectId={projectId ?? ""}
                  onAddParticipants={handleAddParticipants}
                  showTitle={false}
                  showCopyEmailButton={false}
                  userRoles={[Role.ARTISTIC_TEAM]}
                  sx={{
                    dialogContentSxProps: {
                      maxWidth: "100%",
                      width: "100%",
                      paddingBottom: "0 !important",
                    },
                    dialogActionsSxProps: {
                      width: "100%",
                      position: "relative !important",
                    },
                  }}
                  translationKey="project-edit"
                  showFullExplanation={false}
                />
              </FormControl>
            </div>
          </Block>
        </DialogContent>
        <DialogActions>
          <div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Button onClick={onClose} startIcon={<CloseIcon />}>
                {t("common:cancel")}
              </Button>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button type="submit" variant="contained" color="primary">
                  {t("common:dialogs.project-edit.submit")}
                </Button>
              </div>
            </div>
            <RequiredFieldsNote>
              {t("common:required-fields")}
            </RequiredFieldsNote>
          </div>
        </DialogActions>
      </Form>
    </Container>
  );
};

export default EditProjectForm;
