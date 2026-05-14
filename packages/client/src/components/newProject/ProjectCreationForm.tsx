import TextField from "@/components/TextField";
import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
} from "@mui/material";
import { DialogActions, DialogContent } from "@/components/UI/Dialog";
import EmailIcon from "@mui/icons-material/Email";
import RichTextEditor from "@/components/UI/RichTextEditor";
import FolderIcon from "@mui/icons-material/Folder";
import Groups3OutlinedIcon from "@mui/icons-material/Groups3Outlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";

import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/Calculate";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import HearingDisabledOutlinedIcon from "@mui/icons-material/HearingDisabledOutlined";

import { getProjects } from "../projects/useProjects";

import * as yup from "yup";

import { Project, User } from "@cooprog/core";

import { GeneralInfoProps } from "./useNewProjectForm";

import { Discipline, Role } from "@cooprog/core";
import { FormikErrors, useFormik } from "formik";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useUser from "@/components/authentication/useUser";
import DisciplineSelector from "@/components/projects/DisciplineSelector";
import UserForm from "@/components/projects/planning/UserForm";
import ProjectCard from "@/components/projects/ProjectCard";
import UserAutocomplete from "@/components/structures/UserAutocomplete";
import Explanation from "@/components/UI/Explanation";
import FormErrorNotification from "@/components/UI/FormErrorNotification";
import Markdown from "@/components/UI/Markdown";
import MultipleAddressAutocomplete from "@/components/UI/MultipleAddressAutocomplete";
import MultipleAutocomplete from "@/components/UI/MultipleAutocomplete";
import SelectableChipGroup from "@/components/UI/SelectableChipGroup";
import EmergingArtistSwitch from "@/components/UI/EmergingArtistSwitch";
import CulturalActionSwitch from "@/components/UI/CulturalActionSwitch";
import TitleWithIcon from "@/components/UI/TitleWithIcon";
import BlueInfoCard from "@/components/UI/BlueInfoCard";
import Ressources from "@/components/newProject/Ressources";
import useGenres from "@/components/projects/useGenres";
import useTargetAudiences from "@/components/projects/useTargetAudiences";
import MainTextField from "@/components/UI/MainTextField";
import { Place } from "@cooprog/core";
import { useDebounceValue } from "usehooks-ts";
import useRights, { Actions } from "../structures/useRights";

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  width: 100%;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px !important;
`;

const SimilarProjectsContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
  background-color: var(--color-light-orange);
  border-radius: var(--mui-shape-borderRadius);
  > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
`;

export const Block = styled.div`
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  > div {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
`;

const MarkdownContainer = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start !important;
  justify-content: flex-start !important;

  p {
    margin: 1rem 0 0 0;
  }
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 24px;
`;

const MessageIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-gray);
  color: var(--color-white);
  flex-shrink: 0;
  margin-top: 8px;
`;

const MessageEditorContainer = styled.div`
  flex: 1;
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

const validationSchema = yup.object({
  discipline: yup.string().required("Please select a discipline"),
  artist: yup.string().required("Artist is a mandatory field"),
  work: yup.string().when("discipline", {
    is: Discipline.PERFORMING_ARTS,
    then: (schema) => schema.required("Title of work is a mandatory field"),
    otherwise: (schema) => schema,
  }),
  genres: yup
    .array(yup.string())
    .min(1, "Select at least 1 genre")
    .required("Mandatory field"),
  complementaryGenre: yup.string(),
  targetAudiences: yup.array(yup.string()).when("discipline", {
    is: Discipline.PERFORMING_ARTS,
    then: (schema) =>
      schema
        .min(1, "Select at least 1 target audience")
        .required("Mandatory field"),
    otherwise: (schema) => schema,
  }),
  emergingArtist: yup.boolean(),
  culturalActionInterest: yup.boolean(),
  numberOfMenOnStage: yup.number().nullable(),
  numberOfWomenOnStage: yup.number().nullable(),
  numberOfNonBinaryOnStage: yup.number().nullable(),
  artisticTeam: yup
    .object({
      company: yup.string(),
      email: yup.string().email("Invalid email"),
      firstName: yup.string().optional().nullable(),
      lastName: yup.string().optional().nullable(),
      location: yup.object(),
    })
    .optional(),
  places: yup
    .array()
    .of(yup.object().shape({ city: yup.string(), country: yup.string() }))
    .when("discipline", {
      is: Discipline.MUSIC,
      then: (schema) => schema,
      otherwise: (schema) =>
        schema.test(
          "has-places",
          "Select at least one place",
          (value) => value && value.length > 0,
        ),
    }),
});

const RequiredFieldsNote = styled(FormHelperText)`
  text-align: right;
  margin-top: 4px;
  color: var(--color-gray);
`;

const ProjectCreationForm = ({
  generalInfos,
  onChange,
  onCancel,
  onValidate,
  loading,
}: {
  generalInfos?: GeneralInfoProps;
  onChange?: (values: GeneralInfoProps) => void;
  onCancel: () => void;
  onValidate: (values: GeneralInfoProps) => void;
  loading?: boolean;
}) => {
  const [closeSimilarProjects, setCloseSimilarProjects] =
    useState<boolean>(false);
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [totalSimilarProjects, setTotalSimilarProjects] = useState<number>(0);
  const { t } = useTranslation();
  const fieldToFocus = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { can } = useRights({ user });
  const [userInputValue, setUserInputValue] = useState<string>("");
  const router = useRouter();

  let initialDiscipline = null;
  if (user?.programmingDisciplines?.length) {
    if (user?.programmingDisciplines.length === 1) {
      initialDiscipline = user.programmingDisciplines[0];
    }
  }

  const genres = useGenres();
  const targetAudiences = useTargetAudiences();

  const formik = useFormik({
    initialValues: {
      ...generalInfos,
      places: generalInfos?.places || [],
      discipline: generalInfos?.discipline || initialDiscipline || undefined,
      complementaryGenre: generalInfos?.complementaryGenre || "",
      emergingArtist: generalInfos?.emergingArtist || false,
      culturalActionInterest: generalInfos?.culturalActionInterest || false,
      accessibilityVisual: generalInfos?.accessibilityVisual || false,
      accessibilityAudio: generalInfos?.accessibilityAudio || false,
      numberOfMenOnStage: generalInfos?.numberOfMenOnStage || undefined,
      numberOfWomenOnStage: generalInfos?.numberOfWomenOnStage || undefined,
      numberOfNonBinaryOnStage:
        generalInfos?.numberOfNonBinaryOnStage || undefined,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        onValidate(values as GeneralInfoProps);
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (
      user?.role === Role.ARTISTIC_TEAM &&
      formik.values.places.length === 0
    ) {
      const mainUserLocation = user?.locations?.find(
        (location) => location.isMain,
      );
      const initialPlaces = mainUserLocation
        ? [
            {
              id: mainUserLocation.location._id,
              country: mainUserLocation.location.data.country,
              region: mainUserLocation.location.data.state,
              city: mainUserLocation.location.data.city,
              geolocation: {
                coordinates: mainUserLocation.location.geolocation.coordinates,
              },
            } as Place,
          ]
        : [];
      formik.setFieldValue("places", initialPlaces);
    }
  }, [user]);

  useEffect(() => {
    if (!formik.dirty) {
      return;
    }
    onChange?.(formik.values as unknown as GeneralInfoProps);
  }, [formik.values]);

  const [dupesSearchValues] = useDebounceValue(
    {
      artist: formik.values.artist,
      work: formik.values.work,
      discipline: formik.values.discipline,
    },
    500,
    {
      equalityFn: (a, b) =>
        a.artist === b.artist &&
        a.work === b.work &&
        a.discipline === b.discipline,
    },
  );

  useEffect(() => {
    const fetchSimilarProjects = async () => {
      const artist = dupesSearchValues.artist;
      const work = dupesSearchValues.work;
      const discipline = dupesSearchValues.discipline;

      if ((!artist && !work) || `${artist} ${work}`.trim().length < 1) {
        setSimilarProjects([]);
        setTotalSimilarProjects(0);
        return;
      }

      try {
        const response = await getProjects({
          q: [artist, work].filter(Boolean).join(" "),
          disciplines: discipline,
          limit: 2,
        });
        const {
          data: { projects: similarProjects },
          totalCount: totalSimilarProjects,
        } = response;
        setTotalSimilarProjects(totalSimilarProjects);
        setSimilarProjects(similarProjects);
      } catch (error) {
        console.error("Error fetching similar projects:", error);
      }
    };

    fetchSimilarProjects();
  }, [dupesSearchValues]);

  const handleSeeSimilarProjects = () => {
    const artist = formik.values.artist;
    const work = formik.values.work;
    const discipline = formik.values.discipline;

    // Construire l'URL avec les paramètres de recherche
    const searchParams = new URLSearchParams();
    if (artist) searchParams.append("q", `${artist} ${work}`.trim());
    if (discipline) searchParams.append("disciplines", discipline);

    const queryString = searchParams.toString();

    router.push(`/projects?${queryString}`);
    if (router.route === "/projects") {
      router.reload();
      onCancel();
    } else {
      router.push(`/projects?${queryString}`);
    }
  };

  return (
    <Container>
      <Form onSubmit={formik.handleSubmit}>
        <FormErrorNotification formik={formik} />
        <DialogContent>
          <BlueInfoCard icon={<AddCircleOutlineIcon sx={{ fontSize: 64, color: "white" }} />}>
            <MarkdownContainer>
              <Markdown>
                {t(
                  user?.role === Role.ARTISTIC_TEAM
                    ? "common:dialogs.new-project.project-information.description-artistic-team"
                    : "common:dialogs.new-project.project-information.description",
                )}
              </Markdown>
            </MarkdownContainer>
          </BlueInfoCard>

          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.project-information.discipline",
              )}
              icon={TheaterComedyOutlinedIcon}
            />
            <FormControl fullWidth>
              <DisciplineSelector
                value={formik.values.discipline}
                setValue={(newDiscipline) => {
                  const previousDiscipline = formik.values.discipline;

                  if (previousDiscipline !== newDiscipline) {
                    formik.setFieldValue("gauge", []);
                    formik.setFieldValue("minimumStageSize", []);
                    formik.setFieldValue("averagePerformanceFee", []);
                    formik.setFieldValue("genres", []);
                  }

                  formik.setFieldValue("discipline", newDiscipline);
                  formik.setFieldTouched("discipline", true, false);
                }}
                error={Boolean(
                  formik.touched.discipline && formik.errors.discipline,
                )}
              />
              {formik.touched.discipline &&
                Boolean(formik.errors.discipline) && (
                  <FormHelperText error={true}>
                    {formik.errors.discipline as string}
                  </FormHelperText>
                )}
            </FormControl>
          </Block>

          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.subtitles.generalInformations",
              )}
              icon={InfoOutlinedIcon}
            />
            <div>
              <MainTextField
                id="artist"
                name="artist"
                label={
                  t("common:dialogs.new-project.project-information.artist") +
                  " *"
                }
                value={formik.values.artist}
                onChange={formik.handleChange}
                error={formik.touched.artist && Boolean(formik.errors.artist)}
                helperText={formik.touched.artist && formik.errors.artist}
                fullWidth
                inputRef={fieldToFocus}
                InputLabelProps={{
                  shrink:
                    formik.touched.artist && Boolean(formik.errors.artist)
                      ? true
                      : undefined,
                }}
              />
              <MainTextField
                id="work"
                name="work"
                label={
                  t(
                    "common:dialogs.new-project.project-information.titleOfWork",
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
                InputLabelProps={{
                  shrink:
                    formik.touched.work && Boolean(formik.errors.work)
                      ? true
                      : undefined,
                }}
              />
            </div>
            {!closeSimilarProjects && totalSimilarProjects > 0 && (
              <SimilarProjectsContainer>
                <div>
                  {t(
                    "common:dialogs.new-project.project-information.similarity-description",
                    { count: totalSimilarProjects },
                  )}
                </div>
                <div>
                  {similarProjects.map((project, i) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
                {totalSimilarProjects > 2 && (
                  <div>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setCloseSimilarProjects(true)}
                    >
                      {t("common:close")}
                    </Button>
                    {can(Actions.PAGES_ACCESS_PROJECTS) && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSeeSimilarProjects}
                      >
                        {t(
                          "common:dialogs.new-project.project-information.button",
                          { count: totalSimilarProjects },
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </SimilarProjectsContainer>
            )}
            <div>
              <FormControl fullWidth data-testid="genre-selector">
                <SelectableChipGroup
                  label={t(
                    "common:dialogs.new-project.project-information.genre",
                  )}
                  name="genres"
                  sortFunction={(a, b) => a[1].localeCompare(b[1])}
                  items={genres
                    .filter(
                      (genre) => genre.discipline === formik.values.discipline,
                    )
                    .reduce(
                      (acc, genre) => {
                        acc[genre.id] = genre.name;
                        return acc;
                      },
                      {} as Record<string, string>,
                    )}
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
                  label={t(
                    "common:dialogs.new-project.project-information.complementaryGenre",
                  )}
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
                      "common:dialogs.new-project.project-information.complementaryGenreHelper",
                    )
                  }
                />
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth data-testid="target-audience-selector">
                <SelectableChipGroup
                  label={t(
                    "common:dialogs.new-project.project-information.target-audience",
                  )}
                  name="targetAudiences"
                  items={targetAudiences.reduce(
                    (acc, targetAudience) => {
                      acc[targetAudience.id] = targetAudience.name;
                      return acc;
                    },
                    {} as Record<string, string>,
                  )}
                  selectedItems={formik.values.targetAudiences || []}
                  onChange={(updatedAudiences) => {
                    formik.setFieldValue("targetAudiences", updatedAudiences);
                  }}
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                <FormLabel htmlFor="description">
                  {t(
                    "common:dialogs.new-project.project-information.description-label",
                  )}
                </FormLabel>
                <Explanation
                  title={t(
                    "common:dialogs.new-project.project-information.description-label",
                  )}
                >
                  {t(
                    "common:dialogs.new-project.project-information.description-placeholder",
                  )}
                </Explanation>
              </div>
              <FormControl fullWidth>
                <TextField
                  id="description"
                  name="description"
                  multiline
                  value={formik.values.description || ""}
                  placeholder={t(
                    "common:dialogs.new-project.project-information.description-placeholder",
                  )}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    (formik.touched.description && formik.errors.description) ||
                    t(
                      "common:dialogs.new-project.project-information.description-helper",
                    )
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
                userId={user?._id!}
                links={formik.values.links || []}
                setLinks={(updatedLinks) =>
                  formik.setFieldValue("links", updatedLinks)
                }
                newFiles={formik.values.files || []}
                setNewFiles={(updatedFiles) =>
                  formik.setFieldValue("files", updatedFiles)
                }
              />
            </div>
          </Block>
          <Block>
            <TitleWithIcon
              title={t(
                "common:dialogs.new-project.subtitles.representationConditions",
              )}
              icon={TheaterComedyOutlinedIcon}
            />
            <Markdown>
              {t(
                "common:dialogs.new-project.project-information.representationConditionsHelper",
              )}
            </Markdown>
            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  label={t("common:dialogs.new-project.gauge.label")}
                  items={
                    t(
                      formik.values.discipline === Discipline.MUSIC
                        ? "projects:gaugesMusic"
                        : "projects:gauges",
                      {
                        returnObjects: true,
                      },
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.gauge || []}
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
            <InputGroup
              style={{
                width: "fit-content",
              }}
            >
              <FormControl fullWidth>
                <SelectableChipGroup
                  label={t(
                    "common:dialogs.new-project.venueConfigurationType.label",
                  )}
                  items={
                    t("projects:venueConfigurationTypes", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationType || []}
                  onChange={(updatedVenueConfigurationTypes) =>
                    formik.setFieldValue(
                      "venueConfigurationType",
                      updatedVenueConfigurationTypes,
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
                  label=""
                  items={
                    t("projects:venueConfigurationSpaces", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationSpace || []}
                  onChange={(updatedVenueConfigurationSpace) =>
                    formik.setFieldValue(
                      "venueConfigurationSpace",
                      updatedVenueConfigurationSpace,
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
                  label=""
                  items={
                    t("projects:venueConfigurationAudiences", {
                      returnObjects: true,
                    }) as Record<string, string>
                  }
                  selectedItems={formik.values.venueConfigurationAudience || []}
                  onChange={(updatedVenueConfigurationAudience) =>
                    formik.setFieldValue(
                      "venueConfigurationAudience",
                      updatedVenueConfigurationAudience,
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
            <div>
              <FormControl fullWidth>
                <SelectableChipGroup
                  label={t("common:dialogs.new-project.minimumStageSize.label")}
                  items={
                    t(
                      formik
                        ? "projects:minimumStageSizesMusic"
                        : "projects:minimumStageSizes",
                      {
                        returnObjects: true,
                      },
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.minimumStageSize || []}
                  onChange={(updatedMinimumStageSizes) => {
                    formik.setFieldValue(
                      "minimumStageSize",
                      updatedMinimumStageSizes,
                    );
                  }}
                  error={
                    formik.touched.minimumStageSize &&
                    Boolean(formik.errors.minimumStageSize)
                  }
                  helperText={
                    formik.touched.minimumStageSize
                      ? formik.errors.minimumStageSize
                      : undefined
                  }
                  exclusiveLastOption
                />
              </FormControl>
            </div>
            <>
              {formik.values.discipline === Discipline.PERFORMING_ARTS && (
                <div>
                <FormControl fullWidth>
                  <FormLabel>
                    {t("common:dialogs.new-project.performanceLanguages.label")}
                  </FormLabel>
                  <MultipleAutocomplete
                    options={Object.entries(
                      t("projects:performanceLanguages", {
                        returnObjects: true,
                      }) as Record<string, string>,
                    )
                      .sort(
                        ([, a]: [string, string], [, b]: [string, string]) =>
                          a.localeCompare(b),
                      )
                      .reduce(
                        (
                          acc: Record<string, string>,
                          [key, value]: [string, string],
                        ) => {
                          acc[key] = value;
                          return acc;
                        },
                        {} as Record<string, string>,
                      )}
                    value={formik.values.performanceLanguages || []}
                    onChange={(updatedPerformanceLanguages) =>
                      formik.setFieldValue(
                        "performanceLanguages",
                        updatedPerformanceLanguages,
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
                  label={t(
                    "common:dialogs.new-project.averagePerformanceFee.label",
                  )}
                  items={
                    t(
                      formik.values.discipline === Discipline.MUSIC
                        ? "projects:averagePerformanceFeesMusic"
                        : "projects:averagePerformanceFees",
                      {
                        returnObjects: true,
                      },
                    ) as Record<string, string>
                  }
                  selectedItems={formik.values.averagePerformanceFee || []}
                  onChange={(updatedAveragePerformanceFees) =>
                    formik.setFieldValue(
                      "averagePerformanceFee",
                      updatedAveragePerformanceFees,
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
                    <FormHelperText>
                      {t(
                        "common:dialogs.new-project.averagePerformanceFee.disabled",
                      )}
                    </FormHelperText>
                  )}
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth>
                <FormLabel>
                  {t("common:dialogs.new-project.financialSupport.label")}
                </FormLabel>
                <TextField
                  value={formik.values.financialSupport || ""}
                  id="financialSupport"
                  name="financialSupport"
                  multiline
                  placeholder={t(
                    "common:dialogs.new-project.financialSupport.placeholder",
                  )}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.financialSupport &&
                    Boolean(formik.errors.financialSupport)
                  }
                  helperText={
                    (formik.touched.financialSupport &&
                      formik.errors.financialSupport) ||
                    t(
                      "common:dialogs.new-project.project-information.description-helper",
                    )
                  }
                  fullWidth
                />
              </FormControl>
            </div>
          </Block>
          <Block id="artisticTeam">
            <TitleWithIcon
              title={t("common:dialogs.new-project.subtitles.artisticTeam")}
              icon={Groups3OutlinedIcon}
            />
            <div style={{ marginBottom: "30px" }}>
              <div></div>
              <FormControl fullWidth>
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
                  <FormLabel
                    error={Boolean(
                      formik.touched.places && formik.errors.places,
                    )}
                    htmlFor="places"
                  >
                    {t(
                      "common:dialogs.new-project.project-information.places",
                    ) +
                      (formik.values.discipline === Discipline.MUSIC
                        ? ""
                        : " *")}
                  </FormLabel>
                  <Markdown>
                    {t(
                      "common:dialogs.new-project.project-information.places-explanation",
                    )}
                  </Markdown>
                  <FormControl fullWidth sx={{ marginBottom: "16px" }}>
                    <MultipleAddressAutocomplete
                      id="places"
                      name="places"
                      value={formik.values.places}
                      onChange={(value) => {
                        return formik.setFieldValue("places", value);
                      }}
                      error={Boolean(
                        formik.touched.places && formik.errors.places,
                      )}
                      multiple={true}
                    />
                    {Boolean(formik.touched.places && formik.errors.places) && (
                      <FormHelperText error={true}>
                        {formik.errors.places as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormLabel
                    error={
                      (formik.touched.numberOfPeopleOnTour &&
                        Boolean(formik.errors.numberOfPeopleOnTour)) ||
                      (formik.touched.numberOfArtistOnStage &&
                        Boolean(formik.errors.numberOfArtistOnStage))
                    }
                  >
                    {t("common:dialogs.new-project.numberOfPeople.label")}
                  </FormLabel>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <FormControl>
                      <FormLabel sx={{ fontSize: "14px" }}>
                        {t(
                          "common:dialogs.new-project.numberOfPeopleOnTour.label",
                        )}
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
                        inputProps={{ min: 0 }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel sx={{ fontSize: "14px" }}>
                        {t(
                          "common:dialogs.new-project.numberOfArtistOnStage.label",
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
                        inputProps={{ min: 0 }}
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
                  <FormLabel
                    error={
                      (formik.touched.numberOfMenOnStage &&
                        Boolean(formik.errors.numberOfMenOnStage)) ||
                      (formik.touched.numberOfWomenOnStage &&
                        Boolean(formik.errors.numberOfWomenOnStage)) ||
                      (formik.touched.numberOfNonBinaryOnStage &&
                        Boolean(formik.errors.numberOfNonBinaryOnStage))
                    }
                  >
                    {t("common:dialogs.new-project.genderDistribution.label")}
                  </FormLabel>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <FormControl>
                      <FormLabel
                        sx={{ fontSize: "14px" }}
                        error={
                          formik.touched.numberOfMenOnStage &&
                          Boolean(formik.errors.numberOfMenOnStage)
                        }
                      >
                        {t(
                          "common:dialogs.new-project.numberOfMenOnStage.label",
                        )}
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
                        inputProps={{ min: 0 }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel sx={{ fontSize: "14px" }}>
                        {t(
                          "common:dialogs.new-project.numberOfWomenOnStage.label",
                        )}
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
                        inputProps={{ min: 0 }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel sx={{ fontSize: "14px" }}>
                        {t(
                          "common:dialogs.new-project.numberOfNonBinaryOnStage.label",
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
                        inputProps={{ min: 0 }}
                      />
                    </FormControl>
                  </div>
                </div>

                <div
                  style={{ marginBottom: "24px", display: "flex", gap: "16px" }}
                >
                  <FormControl>
                    <FormControlLabel
                      control={
                        <EmergingArtistSwitch
                          checked={Boolean(formik.values.emergingArtist)}
                          onChange={(e) => {
                            formik.setFieldValue(
                              "emergingArtist",
                              e.target.checked,
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
                          checked={Boolean(
                            formik.values.culturalActionInterest,
                          )}
                          onChange={(e) => {
                            formik.setFieldValue(
                              "culturalActionInterest",
                              e.target.checked,
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
                            "common:dialogs.new-project.culturalActionInterest.label",
                          )}
                        </div>
                      }
                    />
                  </FormControl>
                </div>

                {user?.role !== Role.ARTISTIC_TEAM && (
                  <>
                    {!formik.values.artisticTeam && (
                      <div
                        style={{
                          opacity: formik.values.discipline ? 1 : 0.5,
                          pointerEvents: formik.values.discipline
                            ? "auto"
                            : "none",
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            margin: "0 0 16px 0",
                          }}
                        >
                          <Markdown>
                            {t(
                              "common:dialogs.new-project.project-information.artistic-team-description",
                            )}
                          </Markdown>
                        </div>
                        <UserAutocomplete
                          onInputChange={(event, newInputValue, reason) => {
                            setUserInputValue(newInputValue);
                          }}
                          onChange={(value) => {
                            if (!value) {
                              return;
                            }
                            formik.setFieldValue("artisticTeam", {
                              ...value,
                              shouldInvite: true,
                            });
                          }}
                          label={t(
                            "common:dialogs.new-project.project-information.artistic-team-field-label",
                          )}
                          placeholder={
                            formik.values.discipline
                              ? t(
                                  "common:dialogs.new-project.project-information.artistic-team-field-placeholder",
                                )
                              : "Veuillez d'abord sélectionner une discipline"
                          }
                          inviteText={t(
                            "common:dialogs.new-project.project-information.artistic-team-invite-text",
                          )}
                          showResults={false}
                          touched={!!formik.touched.artisticTeam}
                          errors={formik.errors}
                          role={[Role.ARTISTIC_TEAM]}
                          // discipline={formik.values.discipline}
                          required
                        />
                      </div>
                    )}
                    {formik.values.artisticTeam && (
                      <>
                        <UserForm
                          namePrefix="artisticTeam."
                          user={formik.values.artisticTeam}
                          onChange={(value: Partial<User> | null) => {
                            if (!value) {
                              return;
                            }
                            formik.setFieldValue("artisticTeam", value);
                          }}
                          disabled={!!formik.values.artisticTeam._id}
                          touched={formik.touched.artisticTeam}
                          required={{
                            company: true,
                            email: true,
                            firstName: false,
                            lastName: false,
                            location: false,
                          }}
                          errors={{
                            user: formik.errors
                              .artisticTeam as unknown as FormikErrors<any>,
                          }}
                        />
                        <MessageContainer>
                          <MessageIconContainer>
                            <EmailIcon fontSize="small" />
                          </MessageIconContainer>
                          <MessageEditorContainer>
                            <RichTextEditor
                              label={t(
                                "projects:dialogs.add-date-for-others.message-label",
                              )}
                              value={
                                formik.values.artisticTeamCustomMessage || ""
                              }
                              onChange={(value) => {
                                formik.setFieldValue(
                                  "artisticTeamCustomMessage",
                                  value,
                                );
                              }}
                              placeholder={t(
                                "projects:dialogs.add-date-for-others.message-placeholder",
                              )}
                            />
                          </MessageEditorContainer>
                        </MessageContainer>
                      </>
                    )}
                  </>
                )}
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
              <Button onClick={onCancel} startIcon={<CloseIcon />}>
                {t("common:cancel")}
              </Button>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    user?.role === Role.ARTISTIC_TEAM ? (
                      <AddCircleOutlineIcon />
                    ) : undefined
                  }
                  endIcon={
                    user?.role === Role.ARTISTIC_TEAM ? undefined : (
                      <ArrowForwardIcon />
                    )
                  }
                >
                  {user?.role === Role.ARTISTIC_TEAM
                    ? t("common:dialogs.new-project.submit")
                    : t("common:next")}
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

export default ProjectCreationForm;
