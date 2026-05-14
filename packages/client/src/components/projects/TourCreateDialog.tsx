import { Close } from "@mui/icons-material";
import { IconButton, Toolbar, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import PageBar from "@/components/UI/PageBar";
import { useTranslation } from "next-i18next";
import useProject from "./useProject";
import TourCreateForm, {
  TourInformationProps,
} from "@/components/newProject/TourCreateForm";
import { useRouter } from "next/router";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Dialog, { DialogTitle } from "@/components/UI/Dialog";

interface TourCreateDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
}

const TourCreateDialog = ({
  open,
  projectId,
  onClose,
}: TourCreateDialogProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { project, createTour } = useProject(projectId);
  const { enqueueSnackbar } = useSnackbar();

  if (!project) return null;

  const handleValidateForm = async (values: TourInformationProps) => {
    if (!values.start) {
      enqueueSnackbar("Start date is required", { variant: "error" });
      return;
    }
    const tour = {
      name: values.tourName || "",
      start: values.start,
      end: values.end,
      artisticTeamPlace: values.artisticTeamPlace,
      peopleTransportMode: values.peopleTransportMode,
      decorationsTransportMode: values.decorationsTransportMode,
      decorationsWeight: values.decorationsWeight,
      schedule: values.schedule?.map((s) => ({
        date: s.date,
        status: s.status,
        user: s.user,
        customMessage: s.customMessage,
      })),
    };
    const project = await createTour(tour);
    if (project && project.tours) {
      const lastTour = project.tours[project.tours?.length - 1];
      if (lastTour) {
        router.push(`/projects/${projectId}/tours/${lastTour._id}`);
      }
    }
    enqueueSnackbar("Tour created", { variant: "success" });
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
              {t("common:dialogs.create-tour.title", {
                project: `${project.artist} - ${project.work}`,
              })}
            </Typography>
          </Toolbar>
        </PageBar>
      </DialogTitle>
      <TourCreateForm
        onCancel={onClose}
        submitButtonText="common:dialogs.create-tour.submit"
        onValidate={handleValidateForm}
        onChange={() => {}}
        showPreviousButton={false}
        submitButtonEndIcon={<></>}
        submitButtonStartIcon={<AddCircleOutlineIcon />}
      />
    </Dialog>
  );
};

export default TourCreateDialog;
