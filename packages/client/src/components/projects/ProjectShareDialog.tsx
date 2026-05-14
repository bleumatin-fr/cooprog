import styled from "@emotion/styled";
import { useSnackbar } from "notistack";
import { Button } from "@mui/material";

import { User } from "@cooprog/core";
import SendIcon from "@mui/icons-material/Send";
import { useTranslation } from "next-i18next";
import { FormEvent, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RichTextEditor,
  MultipleEmailInput,
} from "../UI";
import useUser from "../authentication/useUser";
import { shareProject } from "./useProject";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

interface ProjectShareDialogProps {
  projectId: string;
  tourId?: string;
  open: boolean;
  handleClose: () => void;
}

const ProjectShareDialog = ({
  projectId,
  tourId,
  open,
  handleClose,
}: ProjectShareDialogProps) => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();
  const [users, setUsers] = useState<(User | string)[]>([]);
  const [customMessage, setCustomMessage] = useState("");

  const handleUsersChanged = (value: (User | string)[]) => {
    setUsers(value);
  };

  const onClose = () => {
    handleClose();
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (users.length === 0) {
      return;
    }

    const userIds = users.map((user) => {
      if (typeof user !== "string") {
        return { _id: user._id };
      }
      return user;
    });

    try {
      await shareProject(projectId, userIds, customMessage, tourId);

      setUsers([]);
      setCustomMessage("");
      enqueueSnackbar(t("projects:dialogs.share-project.success"), {
        variant: "success",
      });
      onClose();
    } catch (e) {
      console.log(e);
      enqueueSnackbar(t("projects:dialogs.share-project.error"), {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("projects:dialogs.share-project.title")}</DialogTitle>

        <DialogContent>
          <Container>
            <MultipleEmailInput
              enableUsers={true}
              label={t("projects:dialogs.share-project.field-label")}
              placeholder={t(
                "projects:dialogs.share-project.field-placeholder"
              )}
              value={users}
              onChange={handleUsersChanged}
              required
            />

            <RichTextEditor
              label={t("projects:dialogs.share-project.message-label")}
              value={customMessage}
              onChange={setCustomMessage}
              placeholder={t(
                "projects:dialogs.share-project.message-placeholder"
              )}
            />
          </Container>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t("common:cancel")}</Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={users.length === 0}
          >
            {t("projects:dialogs.share-project.submit", {
              count: users.length,
            })}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectShareDialog;
