import { Discipline, FileType, Project, User } from "@cooprog/core";
import { Close } from "@mui/icons-material";
import { IconButton, Toolbar, Typography } from "@mui/material";
import Dialog, { DialogContent, DialogTitle } from "@/components/UI/Dialog";
import { useFormik } from "formik";
import { isEmpty, isEqual } from "lodash";
import { useTranslation } from "next-i18next";
import { useSnackbar } from "notistack";
import { useState } from "react";
import * as yup from "yup";
import { TempFile } from "@/components/newProject/useNewProjectForm";
import PageBar from "@/components/UI/PageBar";
import ProjectEditForm from "./ProjectEditForm";

// Extended User type that includes custom message attribute
interface UserWithMessage {
  user: User;
  customMessage?: string;
}

export type ProjectUpdate = Omit<Partial<Project>, "users"> & {
  users?: UserWithMessage[];
};

export const validationSchema = yup.object({
  discipline: yup.string().required("Mandatory field"),
  artist: yup.string().required("Mandatory field"),
  work: yup.string().when("discipline", {
    is: Discipline.PERFORMING_ARTS,
    then: (schema) => schema.required("Mandatory field"),
    otherwise: (schema) => schema,
  }),
  genres: yup
    .array(yup.string())
    .required("Mandatory field")
    .min(1, "Select at least 1 genre"),
  complementaryGenre: yup.string(),
  targetAudiences: yup.array(yup.string()).when("discipline", {
    is: Discipline.PERFORMING_ARTS,
    then: (schema) =>
      schema
        .min(1, "Select at least 1 target audience")
        .required("Mandatory field"),
    otherwise: (schema) => schema,
  }),
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
          (value) => value && value.length > 0
        ),
    }),
});

interface ModalProps {
  open: boolean;
  isMissingRequiredFields: boolean;
  project: Project;
  onClose: () => void;
  onValidate: (
    update: ProjectUpdate,
    newFiles: TempFile[],
    deletedFiles: string[]
  ) => void;
}

const ProjectEditDialog = ({
  open,
  project,
  onClose,
  onValidate,
  isMissingRequiredFields,
}: ModalProps) => {
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileType[]>(
    project.files || []
  );
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      artist: project.artist,
      work: project.work,
      places: project.places,
      genres: project.genres ? [...project.genres] : [],
      complementaryGenre: project.complementaryGenre || "",
      targetAudiences: [...project.targetAudiences],
      description: project.description,
      gauge: project.gauge,
      minimumStageSize: project.minimumStageSize,
      averagePerformanceFee: project.averagePerformanceFee,
      numberOfPeopleOnTour: project.numberOfPeopleOnTour,
      venueConfigurationType: project.venueConfigurationType,
      venueConfigurationSpace: project.venueConfigurationSpace,
      venueConfigurationAudience: project.venueConfigurationAudience,
      performanceLanguages: project.performanceLanguages,
      accessibilityVisual: project.accessibilityVisual || false,
      accessibilityAudio: project.accessibilityAudio || false,
      numberOfArtistOnStage: project.numberOfArtistOnStage,
      numberOfMenOnStage: project.numberOfMenOnStage || undefined,
      numberOfWomenOnStage: project.numberOfWomenOnStage || undefined,
      numberOfNonBinaryOnStage: project.numberOfNonBinaryOnStage || undefined,
      emergingArtist: project.emergingArtist || false,
      culturalActionInterest: project.culturalActionInterest || false,
      discipline: project.discipline,
      financialSupport: project.financialSupport,
      links: project.links,
      files: [],
      users: project.users.map((user) => ({
        user,
        customMessage: "",
      })),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const update = getUpdate(values, project);
      const isDeletedFilesUpdated = deletedFiles.length > 0;
      if (isEmpty(update) && !isDeletedFilesUpdated) {
        enqueueSnackbar(t("common:dialogs.update-project.no-changes"), {
          variant: "error",
        });
      } else {
        onValidate(update, values.files, deletedFiles);
      }
    },
  });

  const handleDeleteFile = (fileId: string) => {
    setDeletedFiles([...deletedFiles, fileId]);
    setExistingFiles(
      existingFiles.filter((file) => {
        return file._id !== fileId;
      })
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>
        <PageBar sx={{ position: "relative" }} className="app-bar">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {"Edition du projet"}
            </Typography>
          </Toolbar>
        </PageBar>
      </DialogTitle>

      <ProjectEditForm
        formik={formik}
        onClose={onClose}
        existingFiles={existingFiles}
        onDeleteFile={handleDeleteFile}
        isMissingRequiredFields={isMissingRequiredFields}
        projectId={project._id}
      />
    </Dialog>
  );
};

const keysToCheck: (keyof Project)[] = [
  "artist",
  "work",
  "places",
  "genres",
  "gauge",
  "averagePerformanceFee",
  "minimumStageSize",
  "targetAudiences",
  "description",
  "numberOfPeopleOnTour",
  "venueConfigurationType",
  "venueConfigurationSpace",
  "venueConfigurationAudience",
  "performanceLanguages",
  "accessibilityVisual",
  "accessibilityAudio",
  "numberOfArtistOnStage",
  "financialSupport",
  "links",
  "files",
  "users",
  "complementaryGenre",
  "numberOfMenOnStage",
  "numberOfWomenOnStage",
  "numberOfNonBinaryOnStage",
  "emergingArtist",
  "culturalActionInterest",
  "discipline",
];

// Custom comparison for users array
function areUsersEqual(a: any[] | undefined, b: any[] | undefined): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const userA = a[i];
    const userB = b[i];
    if (
      userA._id !== userB._id ||
      userA.role !== userB.role ||
      (userA.user?._id || null) !== (userB.user?._id || null)
    ) {
      return false;
    }
  }
  return true;
}

const getUpdate = (values: ProjectUpdate, project: Project) => {
  let update: ProjectUpdate = {};

  for (const [key, value] of Object.entries(values) as [keyof Project, any][]) {
    if (!keysToCheck.includes(key)) continue;

    const original = project[key];

    const isPrimitive =
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean";

    let areDifferent;
    if (key === "users") {
      areDifferent = !(
        Array.isArray(value) &&
        Array.isArray(original) &&
        areUsersEqual(value, original)
      );
    } else {
      areDifferent = isPrimitive
        ? value !== original
        : !isEqual(value, original);
    }

    if (areDifferent) {
      update[key] = value;
    }
  }

  return update;
};

export default ProjectEditDialog;
