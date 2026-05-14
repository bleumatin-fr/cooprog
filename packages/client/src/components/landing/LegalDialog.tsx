import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import Markdown from "../UI/Markdown";

interface LegalDialogProps {
  open: boolean;
  onClose: () => void;
}

const LegalDialog = ({ open, onClose }: LegalDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textTransform: "uppercase" }}>
        {t("landing:legal.title")}
      </DialogTitle>
      <DialogContent sx={{ minWidth: "400px" }}>
        <DialogContentText>
          <Markdown>{t("landing:legal.text")}</Markdown>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ paddingTop: "16px" }}>
        <Button color="primary" onClick={onClose} variant="contained">
          {t("landing:legal.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LegalDialog;
