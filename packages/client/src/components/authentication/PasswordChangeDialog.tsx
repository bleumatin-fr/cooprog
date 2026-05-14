import styled from "@emotion/styled";
import { useSnackbar } from "notistack";
import * as yup from "yup";

import { useFormik } from "formik";
import { useTranslation } from "next-i18next";
import { default as BaseBlock } from "@/components/layout/Block";
import PasswordField from "@/components/UI/PasswordField";
import useUser from "./useUser";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/UI/Dialog";
import { Button } from "@mui/material";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 300px;
`;

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px 38px;
  width: 100%;
`;

const validationSchema = yup.object({
  formerPassword: yup.string().required("Required field"),
  password: yup
    .string()
    .min(8, "Your password must be at least 8 characters long")
    .required("Required field"),
});

interface PasswordChangeDialogProps {
  open: boolean;
  handleClose: () => void;
}

const PasswordChangeDialog = ({
  open,
  handleClose,
}: PasswordChangeDialogProps) => {
  const { t } = useTranslation();
  const { loading, error, changePassword } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      formerPassword: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await changePassword({
        formerPassword: values.formerPassword,
        password: values.password,
      });

      enqueueSnackbar(t("common:dialogs.password-change.success"), {
        variant: "success",
      });
      onClose();
    },
  });

  const onClose = () => {
    formik.resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose} showCloseButton={true}>
      <DialogTitle>{t("common:dialogs.password-change.title")}</DialogTitle>
      <DialogContent>
        <Container>
          {!!error && <Block>{`${error}`}</Block>}
          <PasswordField
            id="formerPassword"
            name="formerPassword"
            label={t("common:dialogs.password-change.current-password")}
            value={formik.values.formerPassword}
            onChange={formik.handleChange}
            error={
              formik.touched.formerPassword &&
              Boolean(formik.errors.formerPassword)
            }
            helperText={
              formik.touched.formerPassword && formik.errors.formerPassword
            }
            disabled={loading}
            fullWidth
          ></PasswordField>
          <PasswordField
            id="password"
            name="password"
            label={t("common:dialogs.password-change.new-password")}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={
              formik.touched.password && <div>{formik.errors.password}</div>
            }
            disabled={loading}
            fullWidth
          ></PasswordField>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("common:cancel")}
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={loading}
        >
          {t("common:dialogs.password-change.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;
