/* eslint-disable @next/next/no-sync-scripts */
import { InitColorSchemeScript } from "@mui/material";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Head, Html, Main, NextScript } from "next/document";

const namespaces = ["common"];
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};

export default function Document() {
  const { t, i18n } = useTranslation(namespaces);

  return (
    <Html lang={i18n.language}>
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
      <body>
        <InitColorSchemeScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
