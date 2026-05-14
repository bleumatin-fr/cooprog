import { Cell as BaseCell, Grid, Line } from "@/components/landing/Grid";
import Subtitle from "@/components/landing/Subtitle";
import Title from "@/components/landing/Title";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "react-query";

import AddIcon from "@/components/landing/AddIcon";
import Cooperate from "@/components/landing/Cooperate";
import CooprogIs from "@/components/landing/CooprogIs";
import CoprogramIcon from "@/components/landing/CoprogramIcon";
import Decentralized from "@/components/landing/Decentralized";
import DoGood from "@/components/landing/DoGood";
import Footer from "@/components/landing/Footer";
import GetInspiration from "@/components/landing/GetInspiration";
import { getStats } from "@/components/landing/getStats";
import OpenAndFree from "@/components/landing/OpenAndFree";
import SafeSpace from "@/components/landing/SafeSpace";
import SearchPersonIcon from "@/components/landing/SearchPersonIcon";
import SearchProjectIcon from "@/components/landing/SearchProjectIcon";
import StakesAndValues from "@/components/landing/StakesAndValues";
import ToolToShare from "@/components/landing/ToolToShare";
import VisibilityTuneIcon from "@/components/landing/VisibilityTuneIcon";
import CustomButton from "@/components/UI/RoundButton";
import { useMediaQuery, useTheme } from "@mui/material";
import Head from "next/head";
import Disciplines from "@/components/landing/Disciplines";

const namespaces = ["common", "authentication", "landing"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;
  const queryClient = new QueryClient();

  if (process.env.NODE_ENV === "development") {
    await i18n?.reloadResources();
  }

  const stats = await getStats();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      stats,
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};

const Page = styled.div`
  min-height: 100vh;
  min-width: calc(100vw - 40px);
  background-color: ${(props) => props.color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;

  .mobile & {
    min-height: 100%;
  }

  a,
  button {
    font-family: "Libre Franklin Medium", sans-serif;
    letter-spacing: 2px;
    --mui-palette-primary-main: var(--color-orange) !important;
    --mui-palette-primary-mainChannel: 255 116 70 !important;
    --mui-palette-primary-dark: var(--color-light-orange) !important;
    --mui-palette-primary-contrastText: var(--color-beige) !important;
    --mui-palette-secondary-main: var(--color-dark-green) !important;
    --mui-palette-secondary-mainChannel: 130 130 130 !important;
    --mui-palette-secondary-dark: var(--color-dark-green) !important;
    --mui-palette-secondary-contrastText: var(--color-beige) !important;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  min-width: calc(100vw - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  .mobile & {
    min-height: 100%;
  }
`;

const Container = styled.div`
  max-width: 1280px;
`;

const CallToActionContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;

  > button,
  > a {
    font-size: 1.5rem;
    text-align: center;
  }
`;

const Circle = styled.div`
  padding: 20px;
  border-radius: 50%;
  background-color: var(--color-text-gray);
  margin-bottom: 20px;
  > svg {
    fill: var(--color-beige);
    width: 80px;
    height: 80px;
  }
`;

const LanguageSwitcherContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
`;

const Cell = styled(BaseCell)`
  font-family: "Libre Franklin Medium", sans-serif;
  > svg {
    fill: var(--color-beige);
    width: 140px;
    height: 140px;
    margin-bottom: 20px;
  }
`;

interface HomeProps {
  stats: {
    projectCount: number;
    usersCount: number;
    tonsCount: number;
  };
}

const Home = ({ stats }: HomeProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation(namespaces);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const availableLanguages = ["fr", "en"];

  const language = availableLanguages.includes(i18n.language)
    ? i18n.language
    : "en";

  return (
    <>
      <Head>
        <meta name="title" content={t("common:social.title")} />
        <meta name="description" content={t("common:social.description")} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cooprog.eu/" />
        <meta property="og:title" content={t("common:social.title")} />
        <meta
          property="og:description"
          content={t("common:social.description")}
        />
        <meta property="og:image" content="https://cooprog.eu/social.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://cooprog.eu/" />
        <meta property="twitter:title" content={t("common:social.title")} />
        <meta
          property="twitter:description"
          content={t("common:social.description")}
        />
        <meta
          property="twitter:image"
          content="https://cooprog.eu/social.png"
        />
      </Head>
      <LanguageSwitcherContainer>
        <LanguageSwitcher />
      </LanguageSwitcherContainer>
      <Page color="var(--color-beige)" className={mobile ? "mobile" : ""}>
        <PageContainer>
          <Title />
          <Disciplines />
          <Container>
            <div>
              <Subtitle color="var(--color-text-gray)">
                {t("landing:what-is-coprog.title")}
              </Subtitle>
              <Grid color="var(--color-light-green)">
                <Line>
                  <Cell
                    fillColor="var(--color-text-gray)"
                    color="var(--color-light-green)"
                  >
                    <AddIcon />
                    {t("landing:what-is-coprog.features.0")}
                  </Cell>
                  <Cell
                    fillColor="var(--color-text-gray)"
                    color="var(--color-light-green)"
                  >
                    <SearchProjectIcon />
                    {t("landing:what-is-coprog.features.1")}
                  </Cell>
                  <Cell
                    fillColor="var(--color-text-gray)"
                    color="var(--color-light-green)"
                  >
                    <SearchPersonIcon />
                    {t("landing:what-is-coprog.features.2")}
                  </Cell>
                  <Cell
                    fillColor="var(--color-text-gray)"
                    color="var(--color-light-green)"
                  >
                    <CoprogramIcon />
                    {t("landing:what-is-coprog.features.3")}
                  </Cell>
                  {/* <Cell
                    fillColor="var(--color-text-gray)"
                    color="var(--color-light-green)"
                  >
                    <VisibilityTuneIcon />
                    {t("landing:what-is-coprog.features.4")}
                  </Cell> */}
                </Line>
              </Grid>
              <CallToActionContainer>
                <CustomButton
                  onClick={() => router.push(`/authentication/register`)}
                  color="primary"
                  sx={{
                    boxShadow: "none !important",
                  }}
                >
                  {t("authentication:actions.register")}
                </CustomButton>
              </CallToActionContainer>
            </div>
          </Container>
        </PageContainer>

        <Container style={{ paddingBottom: 40 }}>
          <Grid color="var(--color-orange)">
            <Line color="var(--color-orange)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-orange)"
              >
                <DoGood value={stats?.tonsCount} />
              </Cell>
            </Line>
            <Line color="var(--color-orange)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-orange)"
              >
                <GetInspiration value={stats?.projectCount} />
              </Cell>

              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-orange)"
              >
                <Cooperate value={stats?.usersCount} />
              </Cell>
            </Line>
            <Line color="var(--color-orange)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-orange)"
              >
                <CooprogIs />
              </Cell>
            </Line>
          </Grid>
        </Container>
      </Page>
      <Page color="var(--color-light-green)" className={mobile ? "mobile" : ""}>
        <Container>
          <Subtitle id="stakes-and-values" color="var(--color-beige)">
            {t("landing:stakes-and-values.title")}
          </Subtitle>
          <Grid color="var(--color-dark-green)">
            <Line color="var(--color-light-green)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-dark-green)"
              >
                <StakesAndValues />
              </Cell>
            </Line>
            <Line color="var(--color-dark-green)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-dark-green)"
              >
                <OpenAndFree />
              </Cell>
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-dark-green)"
              >
                <ToolToShare />
              </Cell>
            </Line>
            <Line color="var(--color-dark-green)">
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-dark-green)"
              >
                <SafeSpace />
              </Cell>
              <Cell
                fillColor="var(--color-text-orange)"
                color="var(--color-dark-green)"
              >
                <Decentralized />
              </Cell>
            </Line>
          </Grid>
          <CallToActionContainer>
            <CustomButton
              href={`/manifesto-${language}.pdf`}
              target="_blank"
              color="secondary"
            >
              {t("landing:stakes-and-values.manifesto")}
            </CustomButton>
          </CallToActionContainer>
        </Container>
      </Page>
      <Footer className={mobile ? "mobile" : ""} />
    </>
  );
};

export default Home;
