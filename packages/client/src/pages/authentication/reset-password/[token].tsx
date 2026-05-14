import ResetPassword from "@/components/authentication/ResetPassword";
import { CenteredContainer } from "@/components/layout/Block";
import Page from "@/components/layout/Page";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dehydrate, QueryClient } from "react-query";

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

const ResetPass = () => {
  const { t } = useTranslation(namespaces);
  return (
    <Page>
      <CenteredContainer>
        <ResetPassword
          title={t("authentication:reset-password.title")}
          fieldLabel={t("authentication:reset-password.new-password")}
          successMessage={t("authentication:reset-password.success")}
          buttonLabel={t("authentication:reset-password.submit")}
        />
      </CenteredContainer>
    </Page>
  );
};

export default ResetPass;
