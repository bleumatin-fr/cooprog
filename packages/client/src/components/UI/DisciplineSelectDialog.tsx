import { Discipline } from "@cooprog/core";
import styled from "@emotion/styled";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import useUser from "../authentication/useUser";
import Markdown from "./Markdown";

const DisciplineButton = styled(Button)(({ theme }) => ({
  padding: "16px 24px",
  fontSize: "16px",
  fontWeight: 600,
  margin: "8px",
  minWidth: "250px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  height: "120px",
  borderRadius: "8px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)",
  },
}));

const IconWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  marginBottom: "8px",
});

const ButtonsContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "24px",
  margin: "32px 0",
});

const disciplineStyles = {
  [Discipline.PERFORMING_ARTS]: {
    backgroundColor: "#FF8A47",
    color: "#FFFFFF",
    hoverBackground: "#E67D3A",
  },
  [Discipline.MUSIC]: {
    backgroundColor: "#6BAF48",
    color: "#FFFFFF",
    hoverBackground: "#5A9C3A",
  },
};

interface DisciplineSelectionDialogProps {
  onSelect?: (discipline: Discipline) => void;
}

const DisciplineSelectionDialog = ({
  onSelect,
}: DisciplineSelectionDialogProps) => {
  const { t } = useTranslation();
  const { user, updateDiscipline } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      const hasDisciplines =
        user.programmingDisciplines && user.programmingDisciplines.length > 0;
      if (!hasDisciplines) {
        setOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user]);

  const handleClose = () => setOpen(false);

  const handleSelectDiscipline = async (discipline: Discipline) => {
    try {
      await updateDiscipline(discipline);
      onSelect?.(discipline);
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la discipline:", error);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ style: { padding: "16px" } }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {t("dialogs.discipline-selection.title")}
      </DialogTitle>
      <DialogContent>
        <Markdown>{t("dialogs.discipline-selection.content")}</Markdown>

        <ButtonsContainer>
          <DisciplineButton
            variant="contained"
            style={{
              backgroundColor:
                disciplineStyles[Discipline.PERFORMING_ARTS].backgroundColor,
              color: disciplineStyles[Discipline.PERFORMING_ARTS].color,
            }}
            onClick={() => handleSelectDiscipline(Discipline.PERFORMING_ARTS)}
          >
            <IconWrapper>
              <TheaterComedyIcon fontSize="large" />
            </IconWrapper>
            <Typography variant="h6" component="span">
              {t("dialogs.discipline-selection.spectacle-vivant")}
            </Typography>
          </DisciplineButton>

          <DisciplineButton
            variant="contained"
            style={{
              backgroundColor:
                disciplineStyles[Discipline.MUSIC].backgroundColor,
              color: disciplineStyles[Discipline.MUSIC].color,
            }}
            onClick={() => handleSelectDiscipline(Discipline.MUSIC)}
          >
            <IconWrapper>
              <MusicNoteIcon fontSize="large" />
            </IconWrapper>
            <Typography variant="h6" component="span">
              {t("dialogs.discipline-selection.musiques-actuelles")}
            </Typography>
          </DisciplineButton>
        </ButtonsContainer>
      </DialogContent>
    </Dialog>
  );
};

export default DisciplineSelectionDialog;
