import Page from "@/components/layout/Page";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as yup from "yup";
import { ValidationError } from "yup";

import { Button, useMediaQuery, useTheme } from "@mui/material";

import { useEffect, useState } from "react";

import styled from "@emotion/styled";

import Address from "../../../components/authentication/register/Address";
import GeneralInfos from "../../../components/authentication/register/GeneralInfos";
import ContactInformation, {
  ContactInformationValues,
} from "../../../components/authentication/register/ContactInformation";

import {
  AuthenticationProvider,
  confirmAccount,
  useAuthentication,
} from "@/components/authentication/useAuthentication";
import Link from "next/link";

import Markdown from "@/components/UI/Markdown";
import { Discipline, Role, StructureType, User } from "@cooprog/core";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { Place } from "../../../components/authentication/register/Address";
import { useSnackbar } from "notistack";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getInviteInformation = async (
  token: string,
): Promise<{ user: User; payload: any }> => {
  const response = await fetch(`${API_URL}/authentication/invite/${token}`, {
    method: "GET",
  });
  if (response.status < 200 || response.status >= 300) {
    const body = await response.json();
    throw new Error(body.message);
  }
  return await response.json();
};

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  > * {
    flex: 1;
  }
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: -16px;
  padding-top: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  background-color: white;
  z-index: 1000;

  > div {
    flex-grow: 1;
  }
`;

const IntroductionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Register = () => {
  return (
    <AuthenticationProvider>
      <ConfirmAccount />
    </AuthenticationProvider>
  );
};

interface FormProps {
  accountType: Role;
  programmingDisciplines: Discipline[];
  email: string;
  firstName?: string;
  lastName?: string;
  company: string;
  link: string;
  tos?: boolean;
  privacy?: boolean;
  manifesto?: boolean;
  password: string;
  place: Place | undefined;
  address: string;
  programmingGenres: string[];
  structureTypes: StructureType[];
  programmingPeriods: string;
  resetPasswordToken: string;
  types?: ("email" | "phone")[];
  contactEmail?: string;
  contactPhone?: string;
  instructions?: string;
}

const namespaces = ["common", "authentication", "projects", "users"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;
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

const ConfirmAccount = () => {
  const { t } = useTranslation(namespaces);
  const router = useRouter();
  const { token } = router.query;
  const { login } = useAuthentication();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data, isError, isLoading } = useQuery(
    ["tokenInformation", token],
    () => getInviteInformation(token as string),
    { enabled: !!token },
  );

  useEffect(() => {
    if (isError && !isLoading) {
      router.push("/error");
    }
  }, [isError, isLoading]);

  const validationSchema = yup.object({
    password: yup
      .string()
      .min(8, t("authentication:register.errors.password-too-short"))
      .required(t("common:required-field")),
  });

  const steps = [
    t("authentication:register.steps.information"),
    t("authentication:register.steps.general"),
    t("authentication:register.steps.address"),
    t("authentication:register.steps.contact"),
  ];

  const formik = useFormik<FormProps>({
    initialValues: {
      accountType: Role.DIFFUSION_STRUCTURE, // Valeur par défaut
      programmingDisciplines: [] as Discipline[],
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      link: "",
      tos: false,
      privacy: false,
      manifesto: false,
      password: "",
      place: undefined as Place | undefined,
      address: "",
      programmingGenres: [] as string[],
      structureTypes: [] as StructureType[],
      programmingPeriods: "",
      resetPasswordToken: "",
      types: ["email"],
      contactEmail: "",
      contactPhone: "",
      instructions: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validateOnMount: false,
    validationSchema: validationSchema,
    onSubmit: async (values) => {},
  });
  useEffect(() => {
    if (data) {
      if (data.payload.reason === "recover") {
        router.push(`/authentication/reset-password/${token}`);
      }
      formik.setValues({
        ...formik.values,
        ...data.user,
        accountType: data.payload.role,
      });
      setReason(data.payload.reason);
      formik.setFieldValue("email", data.user.email);
      formik.setFieldValue("firstName", data.user.profiles?.[0]?.firstName);
      formik.setFieldValue("lastName", data.user.profiles?.[0]?.lastName);
      formik.setFieldValue("company", data.user.company);
      formik.setFieldValue("link", data.user.link);
      // Only set place if we have valid coordinates
      if (
        data.user.locations?.[0]?.location?.geolocation?.coordinates &&
        data.user.locations[0].location.geolocation.coordinates.length >= 2 &&
        data.user.locations[0].location.geolocation.coordinates[0] != null &&
        data.user.locations[0].location.geolocation.coordinates[1] != null
      ) {
        const place: Place = {
          id: 1,
          country: data.user.locations[0].location.data?.country || "",
          region:
            data.user.locations[0].location.data?.state ||
            data.user.locations[0].location.data?.county ||
            "",
          city:
            data.user.locations[0].location.data?.city ||
            data.user.locations[0].location.data?.town ||
            data.user.locations[0].location.data?.village ||
            data.user.locations[0].location.data?.municipality ||
            "",
          lat: data.user.locations[0].location.geolocation.coordinates[1],
          lon: data.user.locations[0].location.geolocation.coordinates[0],
          place_id: 1,
          display_name: data.user.locations[0].location.address,
          address: data.user.locations[0].location.data,
        };
        formik.setFieldValue("place", place);
        formik.setFieldValue(
          "address",
          data.user.locations[0].location.address,
        );
      } else {
        // Set address if available, but don't set place without valid coordinates
        if (data.user.locations?.[0]?.location?.address) {
          formik.setFieldValue(
            "address",
            data.user.locations[0].location.address,
          );
        }
      }
      formik.setFieldValue("accountType", data.payload.role);
      formik.setFieldValue("resetPasswordToken", data.user.resetPasswordToken);
    }
  }, [data]);

  const handleGeneralInfoChange = (values: Partial<FormProps>) => {
    formik.setValues({ ...formik.values, ...values });
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNext = async () => {
    switch (activeStep) {
      case 0:
        setActiveStep(1);
        break;
      case 1:
        // Validation pour l'étape GeneralInfos
        const generalValidationSchema = yup.object({
          email: yup
            .string()
            .email(t("authentication:register.errors.invalid-email"))
            .required(t("common:required-field")),
          company: yup.string().required(t("common:required-field")),
          companyDescription: yup.string(),
          link: yup.string(),
          programmingDisciplines: yup
            .array()
            .of(yup.string())
            .min(1, t("common:required-field")),
          structureTypes: yup.array().of(yup.string()),
          programmingPeriods: yup.string(),
          programmingGenres: yup.array().of(yup.string()),
        });

        try {
          await generalValidationSchema.validate(formik.values, {
            abortEarly: false,
          });
          setActiveStep(2);
        } catch (error) {
          if (error instanceof ValidationError) {
            error.inner.forEach((error) => {
              if (!error.path) return;
              formik.setFieldTouched(error.path, true);
              formik.setFieldError(error.path, error.message);
            });
            enqueueSnackbar(error.message, {
              variant: "error",
            });
          }
        }
        break;
      case 2:
        // Validation pour l'étape Address
        const addressValidationSchema = yup.object({
          address: yup.string().required(t("common:required-field")),
          place: yup.object().required(t("common:required-field")),
        });

        try {
          await addressValidationSchema.validate(formik.values, {
            abortEarly: false,
          });
          setActiveStep(3);
        } catch (error) {
          if (error instanceof ValidationError) {
            error.inner.forEach((error) => {
              if (!error.path) return;
              formik.setFieldTouched(error.path, true);
              formik.setFieldError(error.path, error.message);
            });
            enqueueSnackbar(error.message, {
              variant: "error",
            });
          }
        }
        break;
      case 3:
        // Validation pour l'étape ContactInformation
        formik.setErrors({
          firstName: undefined,
          lastName: undefined,
          tos: undefined,
          privacy: undefined,
          manifesto: undefined,
        });
        const contactInformationValidationSchema = yup.object({
          firstName: yup.string().required(t("common:required-field")),
          lastName: yup.string().required(t("common:required-field")),
          tos: yup
            .boolean()
            .oneOf([true], t("authentication:register.errors.tos-required")),
          privacy: yup
            .boolean()
            .oneOf(
              [true],
              t("authentication:register.errors.privacy-required"),
            ),
          manifesto: yup
            .boolean()
            .oneOf(
              [true],
              t("authentication:register.errors.manifesto-required"),
            ),
        });

        try {
          await contactInformationValidationSchema.validate(formik.values, {
            abortEarly: false,
          });
          setActiveStep(4);
        } catch (error) {
          if (error instanceof ValidationError) {
            error.inner.forEach((error) => {
              if (!error.path) return;
              formik.setFieldTouched(error.path, true);
              formik.setFieldError(error.path, error.message);
            });
            enqueueSnackbar(error.message, {
              variant: "error",
            });
          }
        }
        break;
    }
  };

  const handleSubmit = async () => {
    if (!token || !data) return;
    formik.setErrors({
      types: undefined,
      contactEmail: undefined,
      contactPhone: undefined,
      instructions: undefined,
      firstName: undefined,
      lastName: undefined,
      tos: undefined,
      privacy: undefined,
      manifesto: undefined,
    });
    const contactInformationValidationSchema = yup.object({
      types: yup
        .array()
        .of(yup.string().oneOf(["email", "phone"]))
        .min(1, t("authentication:register.errors.contact-type-required")),
      contactEmail: yup.string().when("types", {
        is: (types: string[]) => types?.includes("email"),
        then: (schema) =>
          schema
            .required(
              t("authentication:register.errors.contact-email-required"),
            )
            .email(t("authentication:register.errors.contact-email-invalid")),
        otherwise: (schema) => schema.optional(),
      }),
      contactPhone: yup.string().when("types", {
        is: (types: string[]) => types?.includes("phone"),
        then: (schema) =>
          schema
            .required(
              t("authentication:register.errors.contact-phone-required"),
            )
            .matches(
              /^\+?[0-9]\d{1,14}$/,
              t("authentication:register.errors.contact-phone-invalid"),
            ),
        otherwise: (schema) => schema.optional(),
      }),
      instructions: yup
        .string()
        .max(255, t("authentication:register.errors.instructions-too-long")),
      firstName: yup.string().required(t("common:required-field")),
      lastName: yup.string().required(t("common:required-field")),
      tos: yup
        .boolean()
        .oneOf([true], t("authentication:register.errors.tos-required")),
      privacy: yup
        .boolean()
        .oneOf([true], t("authentication:register.errors.privacy-required")),
      manifesto: yup
        .boolean()
        .oneOf([true], t("authentication:register.errors.manifesto-required")),
    });

    try {
      await contactInformationValidationSchema.validate(formik.values, {
        abortEarly: false,
      });

      const userData = {
        ...data.user,
        programmingDisciplines: formik.values.programmingDisciplines,
        email: formik.values.email,
        firstName: formik.values.firstName,
        lastName: formik.values.lastName,
        password: formik.values.password,
        company: formik.values.company,
        link: formik.values.link,
        tos: formik.values.tos,
        privacy: formik.values.privacy,
        manifesto: formik.values.manifesto,
        address: formik.values.address,
        place: formik.values.place,
        programmingGenres: formik.values.programmingGenres,
        structureTypes: formik.values.structureTypes,
        programmingPeriods: formik.values.programmingPeriods,
        contactInformation: {
          types: formik.values.types || [],
          email: formik.values.contactEmail,
          phone: formik.values.contactPhone,
          instructions: formik.values.instructions,
        },
      };

      await confirmAccount(formik.values.resetPasswordToken, userData);

      if (formik.values.accountType === Role.ARTISTIC_TEAM) {
        enqueueSnackbar(
          t("authentication:confirm-account.success.artistic-team"),
          {
            variant: "success",
          },
        );
        await login(formik.values.email, formik.values.password);
        setTimeout(() => {
          router.push("/home");
        }, 0);
      } else {
        router.push("/authentication/waiting-approval");
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        error.inner.forEach((error) => {
          if (!error.path) return;
          formik.setFieldTouched(error.path, true);
          formik.setFieldError(error.path, error.message);
        });
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        return;
      }
    }
  };

  return (
    <Page>
      <Dialog open showCloseButton={false} hideBackdrop>
        <DialogTitle>{t("authentication:confirm-account.title")}</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 720,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Header>
            {!mobile && (
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
          </Header>

          <ContentContainer>
            {activeStep === 0 && (
              <IntroductionContainer>
                <Markdown>
                  {t(`authentication:confirm-account.introduction.${reason}`)}
                </Markdown>
              </IntroductionContainer>
            )}
            {activeStep === 1 && (
              <GeneralInfos
                value={formik.values}
                role={formik.values.accountType}
                touched={formik.touched}
                errors={formik.errors}
                onChange={handleGeneralInfoChange}
                showLink={
                  formik.values.accountType === Role.DIFFUSION_STRUCTURE
                    ? true
                    : false
                }
              />
            )}
            {activeStep === 2 && (
              <Address
                value={formik.values}
                touched={formik.touched}
                errors={formik.errors}
                onChange={(value) => {
                  formik.setValues({ ...formik.values, ...value });
                  formik.setFieldError("place", undefined);
                }}
                loading={false}
              />
            )}
            {activeStep === 3 && (
              <ContactInformation
                onChange={(value) => {
                  const changedFields = Object.keys(value).filter(
                    (key) =>
                      value[key as keyof ContactInformationValues] !==
                      formik.values[key as keyof FormProps],
                  );
                  changedFields.forEach((field) => {
                    formik.setFieldError(field, undefined);
                  });
                  formik.setValues({ ...formik.values, ...value });
                }}
                value={formik.values as ContactInformationValues}
                touched={formik.touched}
                errors={formik.errors}
                role={formik.values.accountType}
              />
            )}
          </ContentContainer>
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
              {activeStep > 0 && (
                <Button onClick={handlePreviousStep} disabled={false}>
                  {t("common:previous")}
                </Button>
              )}
              {/* Placeholder for flex container */}
              {activeStep === 0 && <div />}
              {activeStep < 3 && (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={false}
                >
                  {t("common:next")}
                </Button>
              )}
              {activeStep === 3 && (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={false}
                >
                  {t("common:submit")}
                </Button>
              )}
            </div>
            <SideActionsContainer>
              <Link href={`/authentication/login/${token}`}>
                <p style={{ color: "black" }}>
                  {t("authentication:actions.account-already-exists-login")}
                </p>
              </Link>
            </SideActionsContainer>
          </div>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default Register;
