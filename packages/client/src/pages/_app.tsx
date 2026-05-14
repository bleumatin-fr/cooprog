import { AuthenticationProvider } from "@/components/authentication/useAuthentication";
import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import "@/styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";
import { useState } from "react";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  setLogger,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";

import { fr } from "date-fns/locale/fr";
import { enGB } from "date-fns/locale/en-GB";

// polyfills
import "core-js/features/array/to-reversed";

const theme = createTheme({
  cssVariables: true,
});

const PROTECTED_ROUTE_PREFIXES = ["/home", "/projects", "/users"];

const isProtectedPath = (pathname: string) =>
  PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

setLogger({
  log: console.log,
  warn: console.warn,
  error: (...args: any[]) => {
    if (args[0] && args[0].message && args[0].message === "Unauthorized") {
      // toklen expired, everything is ok
      return;
    }
    console.error("react-query error", args);
  },
});

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(() => new QueryClient());
  const { i18n } = useTranslation();
  const router = useRouter();
  const shouldProtectRoute = isProtectedPath(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <SnackbarProvider
          className="snackbar"
          maxSnack={3}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={i18n.language === "fr" ? fr : enGB}
          >
            <Hydrate state={pageProps.dehydratedState}>
              <ThemeProvider theme={theme}>
                <Head>
                  <title>CooProg</title>
                </Head>
                {shouldProtectRoute ? (
                  <AuthenticationGuard>
                    <Component {...pageProps} />
                  </AuthenticationGuard>
                ) : (
                  <Component {...pageProps} />
                )}
              </ThemeProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </Hydrate>
          </LocalizationProvider>
        </SnackbarProvider>
      </AuthenticationProvider>
    </QueryClientProvider>
  );
};

export default appWithTranslation(App, nextI18nextConfig);
