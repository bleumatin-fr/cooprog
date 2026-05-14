import { Alert, AlertTitle, Button } from "@mui/material";
import { FormEvent, useState } from "react";
import { Role, User } from "@cooprog/core";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import UserAutocomplete from "@/components/structures/UserAutocomplete";
import { useTranslation } from "next-i18next";
import RichTextEditor from "@/components/UI/RichTextEditor";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/UI/Dialog";
import styled from "@emotion/styled";
import UserForm from "./UserForm";
import Markdown from "react-markdown";

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

interface AddDateForOthersDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    user: Partial<User>,
    customMessage?: string
  ) => Promise<void> | void;
}

const AddDateForOthersDialog = ({
  open,
  onClose,
  onSubmit,
}: AddDateForOthersDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  const handleUserChanged = (value: Partial<User> | null) => {
    if (!value) {
      return;
    }
    setUser(value);
  };

  const handleClose = () => {
    if (user) {
      setUser(null);
      setCustomMessage("");
      return;
    }
    setCustomMessage("");
    onClose();
  };

  const handleSubmit = async (e?: FormEvent<Element>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) {
      return;
    }

    if (!user.locations || user.locations.length === 0) {
      enqueueSnackbar(
        t("projects:dialogs.add-date-for-others.error-location"),
        {
          variant: "error",
        }
      );
      return;
    }
    setLoading(true);
    try {
      await onSubmit(user, customMessage);
      setTimeout(() => {
        setLoading(false);
        setUser(null);
        setCustomMessage("");
        onClose();
      }, 1000);
    } catch (e) {
      console.log(e);
      enqueueSnackbar(t("projects:dialogs.add-date-for-others.error"), {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {t("projects:dialogs.add-date-for-others.title")}
        </DialogTitle>

        <DialogContent sx={{ minWidth: "600px" }}>
          <Alert severity="warning" sx={{ marginBottom: "24px" }}>
            <AlertTitle>
              {t("projects:dialogs.add-date-for-others.alert-title")}
            </AlertTitle>
            <Markdown>
              {t("projects:dialogs.add-date-for-others.alert-description")}
            </Markdown>
          </Alert>
          {!user && (
            <UserAutocomplete
              onChange={handleUserChanged}
              label={t("projects:dialogs.add-date-for-others.field-label")}
              placeholder={t(
                "projects:dialogs.add-date-for-others.field-placeholder"
              )}
              inviteText={t("projects:dialogs.add-date-for-others.invite-text")}
              showResults={false}
              role={[Role.DIFFUSION_STRUCTURE]}
            />
          )}
          {user && (
            <>
              <UserForm
                user={user}
                onChange={setUser}
                disabled={!!user._id}
                required={{
                  company: true,
                  email: user.shouldInvite || false,
                  firstName: false,
                  lastName: false,
                  location: true,
                }}
              />
              <MessageContainer>
                <MessageIconContainer>
                  <EmailIcon fontSize="small" />
                </MessageIconContainer>
                <MessageEditorContainer>
                  <RichTextEditor
                    label={t(
                      "projects:dialogs.add-date-for-others.message-label"
                    )}
                    value={customMessage}
                    onChange={setCustomMessage}
                    placeholder={t(
                      "projects:dialogs.add-date-for-others.message-placeholder"
                    )}
                  />
                </MessageEditorContainer>
              </MessageContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {t("common:cancel")}
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!user || loading}
            loading={loading}
          >
            {t("projects:dialogs.add-date-for-others.submit")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDateForOthersDialog;
