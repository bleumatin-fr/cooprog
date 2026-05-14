import { Role, User } from "@cooprog/core";
import styled from "@emotion/styled";
import EmailIcon from "@mui/icons-material/Email";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import * as yup from "yup";
import UserAutocomplete from "@/components/structures/UserAutocomplete";
import Markdown from "@/components/UI/Markdown";
import RichTextEditor from "@/components/UI/RichTextEditor";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/UI/Dialog";
import UserForm from "./planning/UserForm";

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

const userFormValidationSchema = {
  user: yup.object().shape({
    company: yup.string().required(),
    email: yup.string().email().required(),
    location: yup.object(),
    shouldInvite: yup.boolean(),
    profiles: yup.array().of(
      yup.object().shape({
        firstName: yup.string(),
        lastName: yup.string(),
      })
    ),
  }),
  customMessage: yup.string(),
};

interface AddParticipantsDialogProps {
  open: boolean;
  onClose: (user?: Partial<User>, customMessage?: string) => void;
  entity: "project" | "tour";
  discipline?: string;
  userRoles?: Role[];
  translationKey?: string;
}

const AddParticipantsDialog = ({
  open,
  onClose,
  entity,
  discipline,
  userRoles: userRolesProp,
  translationKey = "add-participants",
}: AddParticipantsDialogProps) => {
  const { t } = useTranslation(["projects"]);

  const userRoles = useMemo(() => {
    const roles = !!userRolesProp
      ? userRolesProp
      : entity === "project"
      ? [Role.ARTISTIC_TEAM, Role.DIFFUSION_STRUCTURE]
      : [Role.DIFFUSION_STRUCTURE];
    return roles;
  }, [entity, userRolesProp]);

  const formik = useFormik({
    initialValues: {
      user: {
        role: userRoles.length === 1 ? userRoles[0] : undefined,
      } as User | undefined,
      customMessage: "",
    },
    validationSchema: yup.object().shape(userFormValidationSchema),
    onSubmit: (values) => {
      onClose(values.user, values.customMessage);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const selectedUserRoleNameKey = useMemo(() => {
    if (formik.values.user?.role) {
      let nameKey;
      if (formik.values.user?.role === Role.ARTISTIC_TEAM) {
        nameKey = "artistic_team";
      } else if (formik.values.user?.role === Role.DIFFUSION_STRUCTURE) {
        nameKey = "venue";
      }
      return nameKey;
    }
    return null;
  }, [formik.values.user?.role]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {t(`common:dialogs.${translationKey}-${entity}.title`)}
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              margin: "0 0 24px 0",
            }}
          >
            <Markdown>
              {t(`common:dialogs.${translationKey}-${entity}.description`)}
            </Markdown>
          </div>
          {!formik.values.user?.company && !formik.values.user?.email && (
            <UserAutocomplete
              onChange={(value) => {
                if (!value) {
                  return;
                }
                formik.setFieldValue("user", value);
              }}
              // discipline={discipline}
              role={userRoles}
              label={t(
                `common:dialogs.${translationKey}-${entity}.field-label`
              )}
              placeholder={t(
                `common:dialogs.${translationKey}-${entity}.field-placeholder`
              )}
              inviteText={t(
                `common:dialogs.${translationKey}-${entity}.invite-text`
              )}
              showResults={false}
            />
          )}
          {(formik.values.user?.company || formik.values.user?.email) && (
            <>
              <UserForm
                user={formik.values.user}
                onChange={(value: Partial<User> | null) => {
                  if (!value) {
                    return;
                  }
                  formik.setFieldValue("user", {
                    ...value,
                    shouldInvite: true,
                  });
                }}
                required={{
                  company: true,
                  email: true,
                  firstName: false,
                  lastName: false,
                  location: false,
                }}
                errors={formik.errors}
                touched={formik.touched.user}
                disabled={!!formik.values.user._id}
                shouldInvite={false}
              />
              <MessageContainer>
                <MessageIconContainer>
                  <EmailIcon fontSize="small" />
                </MessageIconContainer>
                <MessageEditorContainer>
                  <RichTextEditor
                    label={t(
                      `common:dialogs.${translationKey}-${entity}.message-label`
                    )}
                    value={formik.values.customMessage}
                    onChange={(value) =>
                      formik.setFieldValue("customMessage", value)
                    }
                    placeholder={t(
                      `common:dialogs.${translationKey}-${entity}.message-placeholder`
                    )}
                  />
                </MessageEditorContainer>
              </MessageContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            {t(`common:dialogs.${translationKey}-${entity}.cancel`)}
          </Button>
          <Button type="submit" variant="contained">
            {t(`common:dialogs.${translationKey}-${entity}.submit`)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddParticipantsDialog;
