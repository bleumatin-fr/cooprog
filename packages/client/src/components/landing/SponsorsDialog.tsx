/* eslint-disable @next/next/no-img-element */
import styled from "@emotion/styled";
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

interface SponsorsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SponsorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > h3 {
    text-align: center;
    margin-bottom: 20px;
  }

  > img {
    width: inherit;
    height: inherit;
    max-width: 400px;
    max-height: 200px;
    margin-bottom: 80px;
  }
`;

const SponsorsDialog = ({ open, onClose }: SponsorsDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ textTransform: "uppercase" }}>
        {t("landing:sponsors.title")}
      </DialogTitle>
      <DialogContent sx={{ minWidth: "400px" }}>
        <DialogContentText>
          <Markdown>{t("landing:sponsors.text")}</Markdown>
        </DialogContentText>
        <SponsorsContainer>
          <h3>{t("landing:sponsors.names.0.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.0.image")}`}
            alt={t("landing:sponsors.names.0.label")}
            width={400}
            height={400}
          />
          <h3>{t("landing:sponsors.names.1.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.1.image")}`}
            alt={t("landing:sponsors.names.1.label")}
            width={400}
            height={400}
          />
          <h3>{t("landing:sponsors.names.2.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.2.image")}`}
            alt={t("landing:sponsors.names.2.label")}
            width={400}
            height={400}
          />
          <h3>{t("landing:sponsors.names.3.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.3.image")}`}
            alt={t("landing:sponsors.names.3.label")}
            width={400}
            height={400}
          />
          <h3>{t("landing:sponsors.names.4.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.4.image")}`}
            alt={t("landing:sponsors.names.4.label")}
            width={400}
            height={400}
          />
          <h3>{t("landing:sponsors.names.5.label")}</h3>
          <img
            src={`/sponsors/${t("landing:sponsors.names.5.image")}`}
            alt={t("landing:sponsors.names.4.label")}
            width={400}
            height={400}
          />
        </SponsorsContainer>
      </DialogContent>
      <DialogActions sx={{ paddingTop: "16px" }}>
        <Button color="primary" onClick={onClose} variant="contained">
          {t("landing:sponsors.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SponsorsDialog;
