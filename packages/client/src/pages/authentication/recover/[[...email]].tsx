import { useRouter } from "next/router";

import styled from "@emotion/styled";
import * as yup from "yup";

import { useFormik } from "formik";
import { useSnackbar } from "notistack";

import TextField from "@/components/TextField";

import { useAuthentication } from "@/components/authentication/useAuthentication";
import {
  CenteredContainer,
  default as BaseBlock,
} from "@/components/layout/Block";
import Page from "@/components/layout/Page";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";
import LoadingButton from "@/components/UI/LoadingButton";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { dehydrate, QueryClient } from "react-query";
import { Button } from "@mui/material";

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

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

const namespaces = ["common", "authentication"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;
  const queryClient = new QueryClient();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};
const RecoverPassword = () => {
  const { t } = useTranslation(namespaces);
  const { loading, error, recover } = useAuthentication();
  const router = useRouter();
  const { email } = router.query;
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = yup.object({
    email: yup
      .string()
      .email(t("authentication:register.errors.email-invalid"))
      .required(t("common:required-field")),
  });

  const formik = useFormik({
    initialValues: {
      email: Array.isArray(email) ? email[0] : email || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await recover(values.email! as string);

      enqueueSnackbar(t("authentication:recover.success"), {
        variant: "success",
      });
    },
  });

  return (
    <Page>
      <Dialog open showCloseButton={false} hideBackdrop>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{t("authentication:recover.title")}</DialogTitle>
          <DialogContent sx={{ minWidth: "400px" }}>
            {!!error && <ErrorBlock>{`${error}`}</ErrorBlock>}
            <TextField
              id="email"
              name="email"
              label={t("authentication:email")}
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
              fullWidth
            ></TextField>
          </DialogContent>
          <DialogActions>
            <div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  loading={loading}
                >
                  {t("authentication:recover.submit")}
                </Button>
              </div>
              <SideActionsContainer>
                <Link href="/authentication/login">
                  {t("authentication:actions.account-already-exists-login")}
                </Link>
              </SideActionsContainer>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </Page>
  );
};

export default RecoverPassword;
