import styled from "@emotion/styled";
import * as yup from "yup";

import { useFormik } from "formik";
import Link from "next/link";
import { useSnackbar } from "notistack";

import { useRouter } from "next/router";

import { useAuthentication } from "@/components/authentication/useAuthentication";
import { default as BaseBlock } from "@/components/layout/Block";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";
import LoadingButton from "@/components/UI/LoadingButton";
import PasswordField from "../UI/PasswordField";
import { Button } from "@mui/material";

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px 38px;
  width: 400px;
`;

const ErrorBlock = styled(BaseBlock)`
  width: 100%;
`;

const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, "Votre mot de passe doit contenir au moins 8 caractères")
    .required("Champ obligatoire"),
});

interface ResetPasswordProps {
  title: string;
  fieldLabel: string;
  successMessage: string;
  buttonLabel: string;
}

const ResetPassword = ({
  title,
  fieldLabel,
  successMessage,
  buttonLabel,
}: ResetPasswordProps) => {
  const { loading, error, resetPassword } = useAuthentication();
  const router = useRouter();
  const { token } = router.query;
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!token) return;
      await resetPassword(token as string, values.password);
      enqueueSnackbar(successMessage, {
        variant: "success",
      });
      router.push("/");
    },
  });

  return (
    <Dialog open showCloseButton={false} hideBackdrop>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent
          sx={{
            minWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {!!error && <ErrorBlock>{`${error}`}</ErrorBlock>}
          <PasswordField
            id="password"
            name="password"
            label={fieldLabel}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={loading}
            fullWidth
          ></PasswordField>
        </DialogContent>
        <DialogActions>
          <div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                loading={loading}
              >
                {buttonLabel}
              </Button>
            </div>
            <SideActionsContainer>
              <Link href="/authentication/login">Connexion</Link>
            </SideActionsContainer>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPassword;
