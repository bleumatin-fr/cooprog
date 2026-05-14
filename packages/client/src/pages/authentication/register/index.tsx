import Page from "@/components/layout/Page";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";
import * as yup from "yup";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

import { useEffect } from "react";

import styled from "@emotion/styled";

import Address from "@/components/authentication/register/Address";
import GeneralInfos, {
  GeneralInformationValues,
} from "@/components/authentication/register/GeneralInfos";

import {
  AuthenticationProvider,
  useAuthentication,
} from "@/components/authentication/useAuthentication";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Place } from "@/components/authentication/register/Address";
import ContactInformation, {
  ContactInformationValues,
} from "@/components/authentication/register/ContactInformation";
import RegisterInformation from "@/components/authentication/register/RegisterInformation";
import { Discipline, Role, StructureType } from "@cooprog/core";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dehydrate, QueryClient } from "react-query";
import { useLocalStorage } from "usehooks-ts";
import { enqueueSnackbar } from "notistack";
import { useFormik } from "formik";
import { ValidationError } from "yup";
import { omit } from "lodash";
import { countNearby } from "@/components/authentication/useUsers";

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

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  > * {
    flex: 1;
  }
`;

const Register = () => {
  return (
    <AuthenticationProvider>
      <ConnectedRegister />
    </AuthenticationProvider>
  );
};

export interface RegisterInformationValues {
  accountType: Role | undefined;

  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  companyDescription?: string;
  link?: string;
  tos?: boolean;
  privacy?: boolean;
  manifesto?: boolean;
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];

  address: string;
  place: Place | undefined;

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

enum Steps {
  INFORMATION = 0,
  GENERAL = 1,
  ADDRESS = 2,
  CONTACT = 3,
}

const ConnectedRegister = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t, i18n } = useTranslation(namespaces);
  const { loading, login, register: registerUser } = useAuthentication();

  const [activeStep, setActiveStep] = useLocalStorage<Steps>(
    "register-form-active-step",
    Steps.INFORMATION,
  );
  const [registerInformations, setRegisterInformations] = useLocalStorage<
    Omit<RegisterInformationValues, "password"> | undefined
  >("register-form", undefined);

  const formik = useFormik<RegisterInformationValues>({
    initialValues: registerInformations
      ? {
          ...registerInformations,
          password: "",
        }
      : {
          accountType: undefined,
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          company: "",
          companyDescription: "",
          link: "",
          tos: false,
          privacy: false,
          manifesto: false,
          programmingDisciplines: [],
          structureTypes: [],
          programmingPeriods: "",
          programmingGenres: [],
          address: "",
          place: undefined,
          types: ["email"],
          contactEmail: "",
          contactPhone: "",
          instructions: "",
        },
    validateOnChange: false,
    validateOnBlur: false,
    validateOnMount: false,
    onSubmit: async (values) => {},
  });

  // Save form values to localStorage whenever they change
  useEffect(() => {
    const informationsToBeSaved = omit(formik.values, ["password"]);
    setRegisterInformations(informationsToBeSaved);
  }, [formik.values, setRegisterInformations]);

  const router = useRouter();

  const steps = [
    t("authentication:register.steps.information"),
    t("authentication:register.steps.general"),
    t("authentication:register.steps.address"),
    t("authentication:register.steps.contact"),
  ];

  const handleNext = async () => {
    switch (activeStep) {
      case Steps.INFORMATION:
        formik.setErrors({
          accountType: undefined,
        });
        const registerInformationValidationSchema = yup.object({
          accountType: yup
            .mixed<Role>()
            .required(
              t("authentication:register.errors.account-type-required"),
            ),
        });
        try {
          await registerInformationValidationSchema.validate(formik.values, {
            abortEarly: false,
          });
          setActiveStep(Steps.GENERAL);
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
          } else {
            console.error(error);
            enqueueSnackbar(t("common:unknown-error"), {
              variant: "error",
            });
          }
        }
        break;

      case Steps.GENERAL:
        formik.setErrors({
          email: undefined,
          password: undefined,
          company: undefined,
          companyDescription: undefined,
          link: undefined,
        });
        const generalInformationValidationSchema = yup.object({
          email: yup
            .string()
            .email(t("authentication:register.errors.invalid-email"))
            .required(t("common:required-field")),
          password: yup
            .string()
            .min(8, t("authentication:register.errors.password-too-short"))
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
          await generalInformationValidationSchema.validate(formik.values, {
            abortEarly: false,
          });
          setActiveStep(Steps.ADDRESS);
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
          } else {
            console.error(error);
            enqueueSnackbar(t("common:unknown-error"), {
              variant: "error",
            });
          }
        }
        break;
      case Steps.ADDRESS:
        formik.setErrors({
          address: undefined,
          place: undefined,
        });
        const addressValidationSchema = yup.object({
          address: yup.string().required(t("common:required-field")),
          place: yup.object().required(t("common:required-field")),
        });
        try {
          await addressValidationSchema.validate(formik.values, {
            abortEarly: false,
          });

          // const { count } = await countNearby([
          //   parseFloat(formik.values.place!.lon.toString()),
          //   parseFloat(formik.values.place!.lat.toString()),
          // ]);

          // if (count > 0) {
          //   if (!confirm(t("authentication:register.errors.nearby-address"))) {
          //     return;
          //   }
          // }
          setActiveStep(Steps.CONTACT);
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
          } else {
            console.error(error);
            enqueueSnackbar(t("common:unknown-error"), {
              variant: "error",
            });
          }
        }
        break;
    }
  };

  const handleSubmit = async () => {
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
      await createUser();
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
      } else {
        console.error(error);
        enqueueSnackbar(t("common:unknown-error"), {
          variant: "error",
        });
      }
    }
  };

  const createUser = async () => {
    try {
      await registerUser({
        accountType: formik.values.accountType!,
        email: formik.values.email,
        password: formik.values.password,
        firstName: formik.values.firstName,
        lastName: formik.values.lastName,
        company: formik.values.company,
        companyDescription: formik.values.companyDescription,
        link: formik.values.link,
        address: formik.values.place?.display_name,
        data: formik.values.place?.address,
        language: i18n.language,
        coordinates: [
          parseFloat(formik.values.place!.lon.toString()),
          parseFloat(formik.values.place!.lat.toString()),
        ],
        contactInformation: {
          types: formik.values.types || [],
          email: formik.values.contactEmail,
          phone: formik.values.contactPhone,
          instructions: formik.values.instructions,
        },
        programmingDisciplines: formik.values.programmingDisciplines,
        structureTypes: formik.values.structureTypes,
        programmingPeriods: formik.values.programmingPeriods,
        programmingGenres: formik.values.programmingGenres,
      });

      if (formik.values.accountType === Role.DIFFUSION_STRUCTURE) {
        router.push("/authentication/waiting-approval");
      } else {
        enqueueSnackbar(t("authentication:register.success"), {
          variant: "success",
        });
        await login(formik.values.email, formik.values.password);
        router.push("/home");
      }
      setTimeout(() => {
        setRegisterInformations(undefined);
        setActiveStep(Steps.INFORMATION);
      }, 1000);
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar(error.message, {
        variant: "error",
      });
    }
  };

  return (
    <Page>
      <Dialog open showCloseButton={false} hideBackdrop>
        <DialogTitle>{t("authentication:register.title")}</DialogTitle>
        <DialogContent sx={{ minWidth: 720 }}>
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
              <RegisterInformation
                value={{ accountType: formik.values.accountType }}
                touched={formik.touched}
                errors={formik.errors}
                onChange={(value) => {
                  formik.setValues({ ...formik.values, ...value });
                  formik.setFieldError("accountType", undefined);
                }}
              ></RegisterInformation>
            )}
            {activeStep === 1 && (
              <GeneralInfos
                value={formik.values}
                role={formik.values.accountType}
                touched={formik.touched}
                errors={formik.errors}
                onChange={(value) => {
                  const changedFields = Object.keys(value).filter(
                    (key) =>
                      value[key as keyof GeneralInformationValues] !==
                      formik.values[key as keyof RegisterInformationValues],
                  );
                  changedFields.forEach((field) => {
                    formik.setFieldError(field, undefined);
                  });
                  formik.setValues({ ...formik.values, ...value });
                }}
                showLink
              />
            )}
            {activeStep === 2 && (
              <Address
                onChange={(value) => {
                  formik.setValues({ ...formik.values, ...value });
                  formik.setFieldError("place", undefined);
                }}
                value={formik.values}
                touched={formik.touched}
                errors={formik.errors}
                loading={loading}
              />
            )}
            {activeStep === 3 && (
              <ContactInformation
                onChange={(value) => {
                  const changedFields = Object.keys(value).filter(
                    (key) =>
                      value[key as keyof ContactInformationValues] !==
                      formik.values[key as keyof RegisterInformationValues],
                  );
                  changedFields.forEach((field) => {
                    formik.setFieldError(field, undefined);
                  });
                  formik.setValues({ ...formik.values, ...value });
                }}
                value={formik.values}
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
              {activeStep > Steps.INFORMATION && (
                <Button
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={loading}
                >
                  {t("common:previous")}
                </Button>
              )}
              {/* Placeholder for flex container */}
              {activeStep === Steps.INFORMATION && <div />}
              {activeStep < Steps.CONTACT && (
                <Button
                  onClick={() => handleNext()}
                  variant="contained"
                  disabled={loading}
                >
                  {t("common:next")}
                </Button>
              )}
              {activeStep === Steps.CONTACT && (
                <Button
                  onClick={() => handleSubmit()}
                  variant="contained"
                  disabled={loading}
                >
                  {t("common:next")}
                </Button>
              )}
            </div>
            <SideActionsContainer>
              <Link href="/authentication/login">
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
