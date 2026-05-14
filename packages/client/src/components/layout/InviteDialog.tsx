import styled from "@emotion/styled";
import SendIcon from "@mui/icons-material/Send";
import { Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useSnackbar } from "notistack";
import { FormEvent, useState, useEffect } from "react";
import { invite } from "../authentication/useAuthentication";
import useUser from "../authentication/useUser";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RichTextEditor,
  MultipleEmailInput,
} from "../UI";
import { getUsers } from "../authentication/useUsers";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  max-width: 600px;
`;

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteDialog = ({ open, onClose }: InviteDialogProps) => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user, selectedProfileId } = useUser();
  const [emails, setEmails] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (emails.length === 0) {
      return;
    }

    try {
      if (!selectedProfileId) {
        return;
      }
      await invite(selectedProfileId, emails, customMessage);

      setEmails([]);
      setCustomMessage("");
      enqueueSnackbar(t("common:dialogs.invite-people.success"), {
        variant: "success",
      });
      onClose();
    } catch (e) {
      console.log(e);
      enqueueSnackbar(t("common:dialogs.invite-people.error"), {
        variant: "error",
      });
    }
  };

  const handleValidateEmail = async (email: string): Promise<string | null> => {
    const users = await getUsers({
      email,
      limit: 1,
    });
    if (users.data.users.length > 0) {
      return t("common:dialogs.invite-people.error-email-already-exists");
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("common:dialogs.invite-people.title")}</DialogTitle>

        <DialogContent>
          <Container>
            <MultipleEmailInput
              label={t("common:dialogs.invite-people.field-label")}
              placeholder={t("common:dialogs.invite-people.field-placeholder")}
              value={emails}
              onChange={setEmails}
              required
              validateEmail={handleValidateEmail}
            />

            <RichTextEditor
              label={t("common:dialogs.invite-people.message-label")}
              value={customMessage}
              onChange={setCustomMessage}
              placeholder={t(
                "common:dialogs.invite-people.message-placeholder"
              )}
            />
          </Container>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary">
            {t("common:cancel")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={emails.length === 0}
          >
            {t("common:dialogs.invite-people.submit", {
              count: emails.length,
            })}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteDialog;
