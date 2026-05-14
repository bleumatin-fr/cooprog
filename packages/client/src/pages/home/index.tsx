import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import useUser from "@/components/authentication/useUser";
import AppLayout from "@/components/layout/AppLayout";
import Page from "@/components/layout/Page";
import * as Sentry from "@sentry/nextjs";
import { GetServerSideProps } from "next";
import { i18n } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dehydrate, QueryClient } from "react-query";
import { useEffect } from "react";
import { Role } from "@cooprog/core";
import VenueDashboard from "@/components/dashboard/VenueDashboard";
import ArtisticTeamDashboard from "@/components/dashboard/ArtisticTeamDashboard";
import NoDashboard from "@/components/dashboard/NoDashboard";
import LoadingPage from "@/components/UI/LoadingPage";
import { useRouter } from "next/router";

const namespaces = [
  "common",
  "authentication",
  "notifications",
  "projects",
  "home",
  "projects",
  "users",
];

/**
 * This enables server side rendering for the page
 * @param context Next.js context
 * @returns Props for the page
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, locale } = context;
  const queryClient = new QueryClient();
  if (process.env.NODE_ENV === "development") {
    await i18n?.reloadResources();
  }
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};

const Home = () => {
  const router = useRouter();
  const { user, error, loading, selectedProfile } = useUser({
    useErrorBoundary: false,
  });

  useEffect(() => {
    if (!loading && error) {
      router.replace({
        pathname: `/authentication/login`,
        query: {
          redirect: router.asPath,
        },
      });
    }
  }, [error, loading]);

  if (process.env.NEXT_PUBLIC_SENTRY_DSN && user) {
    Sentry.setUser({
      username: `${user.company} ${selectedProfile?.firstName} ${selectedProfile?.lastName}`,
      email: user.email,
    });
  }

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <AuthenticationGuard>
      <AppLayout showDiscipline={false}>
        <Page
          className="home"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "16px 0",
          }}
        >
          {(() => {
            switch (user?.role) {
              case Role.DIFFUSION_STRUCTURE:
                return <VenueDashboard />;
              case Role.ARTISTIC_TEAM:
                return <ArtisticTeamDashboard />;
              default:
                return <NoDashboard />;
            }
          })()}
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

export default Home;
