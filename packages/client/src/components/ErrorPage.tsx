"use client";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Head from "next/head";
import CustomButton from "@/components/UI/Button";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

interface ErrorPageProps {
  errorKey: "404" | "500" | "generic";
  errorCode?: string;
  showCountdown?: boolean;
  countdownSeconds?: number;
  redirectPath?: string;
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-beige);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
`;

const ErrorContent = styled.div`
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const ErrorIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--color-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--color-white);
  font-weight: bold;
`;

const ErrorTitle = styled.h1`
  font-family: "Libre Franklin Medium", sans-serif;
  font-size: 2.5rem;
  color: var(--color-dark-green);
  margin: 0;
  letter-spacing: 2px;
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-gray);
  margin: 0;
  line-height: 1.6;
`;

const RedirectMessage = styled.p`
  font-size: 1rem;
  color: var(--color-gray);
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const LanguageSwitcherContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
`;

const ErrorPage = ({
  errorKey,
  errorCode,
  showCountdown = true,
  countdownSeconds = 10,
  redirectPath = "/",
}: ErrorPageProps) => {
  const { t, ready, i18n } = useTranslation("common");
  const router = useRouter();
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [mounted, setMounted] = useState(false);
  const [translations, setTranslations] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load translations manually for error pages
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Get current language from router or default to 'en'
        const currentLang = router.locale || "en";

        // Load the common translation file
        const response = await fetch(`/locales/${currentLang}/common.json`);
        if (response.ok) {
          const translationData = await response.json();
          setTranslations(translationData);
        }
      } catch (error) {
        console.warn("Failed to load translations for error page:", error);
      }
    };

    if (mounted) {
      loadTranslations();
    }
  }, [mounted, router.locale]);

  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, showCountdown, redirectPath]);

  // Get error-specific content with fallbacks
  const getErrorContent = () => {
    const fallbacks = {
      404: {
        code: "404",
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        secondaryAction: {
          label: "Go Back",
          onClick: () => window.history.back(),
        },
      },
      500: {
        code: "500",
        title: "Server Error",
        message:
          "Something went wrong on our end. We're working to fix this issue.",
        secondaryAction: {
          label: "Try Again",
          onClick: () => window.location.reload(),
        },
      },
      generic: {
        code: errorCode || "Error",
        title: `Error ${errorCode || "Unknown"}`,
        message: "An unexpected error occurred. Please try again later.",
        secondaryAction: {
          label: "Try Again",
          onClick: () => window.location.reload(),
        },
      },
    };

    const fallback = fallbacks[errorKey];

    // Use translations if available, otherwise use fallbacks
    const getTranslation = (key: string, defaultValue: string) => {
      if (translations?.errors && translations.errors[key]) {
        return translations.errors[key];
      }
      if (ready && t) {
        try {
          const translated = t(key);
          return translated !== key ? translated : defaultValue;
        } catch (error) {
          return defaultValue;
        }
      }
      return defaultValue;
    };

    switch (errorKey) {
      case "404":
        return {
          code: "404",
          title: getTranslation("errors.404.title", fallback.title),
          message: getTranslation("errors.404.message", fallback.message),
          secondaryAction: {
            label: getTranslation(
              "errors.404.go-back",
              fallback.secondaryAction.label
            ),
            onClick: fallback.secondaryAction.onClick,
          },
        };
      case "500":
        return {
          code: "500",
          title: getTranslation("errors.500.title", fallback.title),
          message: getTranslation("errors.500.message", fallback.message),
          secondaryAction: {
            label: getTranslation(
              "errors.500.try-again",
              fallback.secondaryAction.label
            ),
            onClick: fallback.secondaryAction.onClick,
          },
        };
      case "generic":
        return {
          code: errorCode || "Error",
          title: getTranslation(`errors.generic.title`, fallback.title).replace(
            "{{code}}",
            errorCode || "Unknown"
          ),
          message: getTranslation("errors.generic.message", fallback.message),
          secondaryAction: {
            label: getTranslation(
              "errors.generic.try-again",
              fallback.secondaryAction.label
            ),
            onClick: fallback.secondaryAction.onClick,
          },
        };
    }
  };

  // Don't render until component is mounted
  if (!mounted) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <ErrorIcon>
            {errorKey === "generic" ? errorCode || "Error" : errorKey}
          </ErrorIcon>
          <div>
            <ErrorTitle>Loading...</ErrorTitle>
            <ErrorMessage>Please wait...</ErrorMessage>
          </div>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  const errorContent = getErrorContent();
  const defaultPrimaryAction = {
    label: translations?.errors?.generic?.goHome || "Go to Home",
    onClick: () => router.push("/"),
  };

  return (
    <>
      <Head>
        <title>{errorContent.title} - CooProg</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <LanguageSwitcherContainer>
        <LanguageSwitcher />
      </LanguageSwitcherContainer>
      <ErrorContainer>
        <ErrorContent>
          <ErrorIcon>{errorContent.code}</ErrorIcon>
          <div>
            <ErrorTitle>{errorContent.title}</ErrorTitle>
            <ErrorMessage>{errorContent.message}</ErrorMessage>
          </div>
          {showCountdown && (
            <RedirectMessage>
              {translations?.errors?.generic?.redirecting?.replace(
                "{{countdown}}",
                countdown.toString()
              ) || `Redirecting to home page in ${countdown} seconds...`}
            </RedirectMessage>
          )}
          <ButtonContainer>
            <CustomButton
              color="primary"
              onClick={defaultPrimaryAction.onClick}
              variant="contained"
            >
              {defaultPrimaryAction.label}
            </CustomButton>
            {errorContent.secondaryAction && (
              <CustomButton
                color="secondary"
                onClick={errorContent.secondaryAction.onClick}
                variant="outlined"
              >
                {errorContent.secondaryAction.label}
              </CustomButton>
            )}
          </ButtonContainer>
        </ErrorContent>
      </ErrorContainer>
    </>
  );
};

export default ErrorPage;
