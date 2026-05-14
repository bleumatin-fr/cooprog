import styled from "@emotion/styled";
import { SyntheticEvent, useEffect, useState } from "react";

import { useAuthentication } from "@/components/authentication/useAuthentication";
import useUser from "@/components/authentication/useUser";
import { default as BaseBlock } from "@/components/layout/Block";
import Page from "@/components/layout/Page";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";
import TextField from "@/components/TextField";
import PasswordField from "@/components/UI/PasswordField";
import BlueInfoCard from "@/components/UI/BlueInfoCard";
import { Button, Divider } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "react-query";

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

const Login = () => {
  const { t } = useTranslation(namespaces);
  const { auth, loading, login } = useAuthentication();
  const router = useRouter();
  const { params } = router.query;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const { user } = useUser({
    useErrorBoundary: false,
  });

  const getPostLoginRedirect = () => {
    const redirectQuery = router.query.redirect;
    if (typeof redirectQuery === "string" && redirectQuery.length > 0) {
      return redirectQuery;
    }
    return "/home";
  };

  useEffect(() => {
    if (!!auth && user && typeof (user as any).error === "undefined") {
      void router.replace(getPostLoginRedirect());
    }
  }, [auth, router, user]);

  const handleFormSubmitted = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      let token;
      if (params && params.length > 0) {
        token = params[0];
      }
      await login(email, password, token);
      await router.replace(getPostLoginRedirect());
    } catch (e) {
      localStorage.removeItem("auth");
      setAuthError((e as any).message);
    }
  };

  return (
    <Page>
      <Dialog open showCloseButton={false} hideBackdrop>
        <form onSubmit={handleFormSubmitted}>
          <DialogTitle>{t("authentication:login.title")}</DialogTitle>
          <DialogContent
            sx={{
              minWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {authError?.includes("Awaiting moderation") && (
              <ErrorBlock>
                {t("authentication:login.errors.awaiting-moderation")}
              </ErrorBlock>
            )}
            {authError?.includes("Unauthorized") && (
              <ErrorBlock>
                {t("authentication:login.errors.invalid-credentials")}
              </ErrorBlock>
            )}
            {router.query.error === "moderation" && (
              <ErrorBlock>
                {t("authentication:login.errors.awaiting-moderation")}
              </ErrorBlock>
            )}
            {router.query.error === "unauthorized" && (
              <BlueInfoCard
                icon={<InfoOutlinedIcon sx={{ fontSize: 24, color: "white" }} />}
              >
                <div>{t("authentication:login.errors.unauthorized")}</div>
              </BlueInfoCard>
            )}
            <TextField
              name="email"
              label={t("authentication:email")}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              fullWidth
            ></TextField>
            <PasswordField
              name="password"
              label={t("authentication:password")}
              onChange={(event) => setPassword(event.target.value)}
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
                  justifyContent: "center",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  loading={loading}
                  disabled={loading}
                >
                  {t("authentication:login.submit")}
                </Button>
              </div>
              <SideActionsContainer>
                <Link href="/authentication/register">
                  {t("authentication:actions.register")}
                </Link>
                <Divider orientation="vertical" flexItem />
                <Link href={`/authentication/recover/${email}`}>
                  {t("authentication:actions.forgot-password")}
                </Link>
              </SideActionsContainer>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </Page>
  );
};

export default Login;
