import { Tour } from "@cooprog/core";
import { Close } from "@mui/icons-material";
import { IconButton, Toolbar, Typography } from "@mui/material";
import Dialog, { DialogTitle } from "@/components/UI/Dialog";
import { isEmpty, isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { useTranslation } from "next-i18next";
import PageBar from "../UI/PageBar";
import TourEditForm, { TourInformationProps } from "./TourEditForm";

interface ModalProps {
  open: boolean;
  tour: Tour;
  onClose: () => void;
  onValidate: (update: Partial<Tour>) => void;
}

const TourEditDialog = ({ open, tour, onClose, onValidate }: ModalProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnValidate = (values: TourInformationProps) => {
    const update = getUpdate(values, tour);
    if (isEmpty(update)) {
      enqueueSnackbar(t("common:dialogs.update-tour.no-changes"), {
        variant: "error",
      });
      return;
    }
    onValidate(update);
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
              {t("common:dialogs.update-tour.title", {
                name: tour.name,
              })}
            </Typography>
          </Toolbar>
        </PageBar>
      </DialogTitle>

      <TourEditForm
        generalInfos={{
          name: tour.name,
          start: tour.start,
          end: tour.end,
          artisticTeamPlace: tour.artisticTeamPlace,
          peopleTransportMode: tour.peopleTransportMode,
          decorationsTransportMode: tour.decorationsTransportMode,
          decorationsWeight: tour.decorationsWeight,
          schedule: tour.schedule?.map((s) => ({
            date: s.date,
            status: s.status,
          })),
        }}
        onCancel={onClose}
        onValidate={handleOnValidate}
        submitButtonText="common:dialogs.update-tour.submit"
      />
    </Dialog>
  );
};

const keysToCheck: (keyof Tour)[] = [
  "name",
  "start",
  "end",
  "peopleTransportMode",
  "decorationsTransportMode",
  "decorationsWeight",
  "artisticTeamPlace",
];

const getUpdate = (values: TourInformationProps, tour: Tour) => {
  let update: Partial<Tour> = {};

  for (const [key, value] of Object.entries(values) as [keyof Tour, any][]) {
    if (!keysToCheck.includes(key)) continue;

    const original = tour[key];

    const isPrimitive =
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean";

    const areDifferent = isPrimitive
      ? value !== original
      : !isEqual(value, original);

    if (areDifferent) {
      update[key] = value;
    }
  }

  return update;
};

export default TourEditDialog;
