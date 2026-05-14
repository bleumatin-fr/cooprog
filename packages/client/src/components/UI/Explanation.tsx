import HelpIcon from "@mui/icons-material/Help";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { ReactElement, useState } from "react";
import Markdown from "./Markdown";

interface ExplanationProps {
  title: string;
  handle?: ReactElement;
  children: string;
}

const Explanation = ({ title, children, handle }: ExplanationProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => setOpen(false);

  return (
    <>
      {handle && <span onClick={() => setOpen(true)}>{handle}</span>}
      <IconButton
        aria-label="delete"
        size="small"
        onClick={() => setOpen(true)}
      >
        <HelpIcon fontSize="inherit" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          zIndex: 9999,
        }}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <Markdown>{children}</Markdown>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" autoFocus>
            {t("common:close-explanation")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Explanation;
