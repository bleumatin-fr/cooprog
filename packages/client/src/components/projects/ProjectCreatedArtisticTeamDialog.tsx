import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "../UI";
import Markdown from "../UI/Markdown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ProjectCreatedArtisticTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProjectCreatedArtisticTeamDialog = ({
  open,
  onClose,
}: ProjectCreatedArtisticTeamDialogProps) => {
  const { t } = useTranslation();

  const handleSubmit = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {t("common:dialogs.project-created-artistic-team.title")}
        </DialogTitle>

        <DialogContent>
          <Markdown
            components={{
              em(props) {
                return <ContentCopyIcon fontSize="small" />;
              },
            }}
          >
            {t("common:dialogs.project-created-artistic-team.description")}
          </Markdown>
        </DialogContent>

        <DialogActions>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            startIcon={<CloseIcon />}
          >
            {t("common:dialogs.project-created-artistic-team.submit")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectCreatedArtisticTeamDialog;
