import styled from "@emotion/styled";

import { Role } from "@cooprog/core";

import Markdown from "@/components/UI/Markdown";
import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  TextField,
} from "@mui/material";
import { FormikErrors, FormikTouched } from "formik";
import { Trans, useTranslation } from "next-i18next";

const TextContainer = styled.div`
  max-width: 80%;
  margin: 20px auto;

  p {
    text-align: center !important;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  > div {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  #type-field {
    text-align: center;
    margin: 16px 0;
  }

  #type-field + div {
    max-width: 400px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

// Style pour aligner les labels à gauche
const LeftAlignedFormLabel = styled(FormLabel)`
  text-align: left;
  display: flex;
  width: 100%;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px !important;
  align-items: start !important;
`;

export interface ContactInformationValues {
  types?: ("email" | "phone")[];
  contactEmail?: string;
  contactPhone?: string;
  instructions?: string;
  firstName?: string;
  lastName?: string;
  tos?: boolean;
  privacy?: boolean;
  manifesto?: boolean;
}

interface ContactInformationProps {
  value: ContactInformationValues | null;
  onChange: (values: Partial<ContactInformationValues>) => void;
  touched: FormikTouched<ContactInformationValues>;
  errors: FormikErrors<ContactInformationValues>;
  role?: Role;
}

const ContactInformation = ({
  onChange,
  value,
  touched,
  errors,
  role = Role.DIFFUSION_STRUCTURE,
}: ContactInformationProps) => {
  const { t, i18n } = useTranslation();

  const availableLanguages = ["fr", "en"];
  const language = availableLanguages.includes(i18n.language)
    ? i18n.language
    : "en";

  return (
    <Container>
      <TextContainer>
        <Markdown>{t("authentication:contact.information")}</Markdown>
      </TextContainer>
      <Divider />
      <div style={{ display: "flex", gap: "16px" }}>
        <TextField
          id="firstName"
          name="firstName"
          label={t(`authentication:firstName-${role.toLowerCase()}`) + " *"}
          value={value?.firstName || ""}
          onChange={(e) =>
            onChange({
              ...value,
              firstName: e.target.value,
            })
          }
          error={touched.firstName && Boolean(errors.firstName)}
          helperText={touched.firstName && errors.firstName}
          fullWidth
          sx={{
            ".MuiFormHelperText-root": {
              textAlign: "left",
              width: "100%",
              display: "block",
              marginLeft: "0 !important",
            },
          }}
        ></TextField>
        <TextField
          id="lastName"
          name="lastName"
          label={t(`authentication:lastName-${role.toLowerCase()}`) + " *"}
          value={value?.lastName || ""}
          onChange={(e) =>
            onChange({
              ...value,
              lastName: e.target.value,
            })
          }
          error={touched.lastName && Boolean(errors.lastName)}
          helperText={touched.lastName && errors.lastName}
          fullWidth
          sx={{
            ".MuiFormHelperText-root": {
              textAlign: "left",
              width: "100%",
              display: "block",
              marginLeft: "0 !important",
            },
          }}
        ></TextField>
      </div>
      <FormControl error={touched.types && Boolean(errors.types)} fullWidth>
        <TextField
          id="email"
          name="email"
          label={t("authentication:register.contact-information.email-address")}
          value={value?.contactEmail || ""}
          onChange={(event) => {
            onChange({
              ...value,
              contactEmail: event.target.value,
            });
          }}
          error={touched.contactEmail && Boolean(errors.contactEmail)}
          helperText={touched.contactEmail && errors.contactEmail}
          fullWidth
          required={value?.types?.includes("email")}
        />
        <TextField
          id="instructions"
          name="instructions"
          label={t("authentication:register.contact-information.message")}
          value={value?.instructions || ""}
          onChange={(event) => {
            onChange({
              ...value,
              instructions: event.target.value,
            });
          }}
          error={touched.instructions && Boolean(errors.instructions)}
          helperText={
            (touched.instructions && errors.instructions) ||
            t("authentication:register.contact-information.message-helper-text")
          }
          multiline
          fullWidth
        ></TextField>
      </FormControl>
      <Divider />
      {(value?.tos !== undefined ||
        value?.privacy !== undefined ||
        value?.manifesto !== undefined) && (
        <CheckboxContainer>
          {value?.tos !== undefined && (
            <FormControl
              required
              error={touched.tos && Boolean(errors.tos)}
              component="fieldset"
              variant="standard"
            >
              <FormControlLabel
                sx={{
                  color:
                    touched.tos && Boolean(errors.tos)
                      ? "var(--mui-palette-error-main)"
                      : "inherit",
                }}
                control={
                  <Checkbox
                    id="tos"
                    name="tos"
                    checked={value.tos}
                    onChange={(_, checked) =>
                      onChange({
                        ...value,
                        tos: checked,
                      })
                    }
                    sx={{
                      color:
                        touched.tos && Boolean(errors.tos)
                          ? "var(--mui-palette-error-main)"
                          : "inherit",
                    }}
                  />
                }
                label={
                  <Trans
                    i18nKey={
                      t(`authentication:tos-${role.toLowerCase()}`) + " *"
                    }
                    components={[
                      <a href={`/tos-${language}.pdf`} target="_blank" />,
                    ]}
                    defaultTrans=""
                    style={{
                      color:
                        touched.tos && Boolean(errors.tos)
                          ? "var(--mui-palette-error-main)"
                          : "inherit",
                    }}
                  />
                }
              />
              {touched.tos && Boolean(errors.tos) && (
                <FormHelperText>{errors.tos}</FormHelperText>
              )}
            </FormControl>
          )}

          {value?.privacy !== undefined && (
            <FormControl
              required
              error={touched.privacy && Boolean(errors.privacy)}
              component="fieldset"
              variant="standard"
            >
              <FormControlLabel
                sx={{
                  color:
                    touched.privacy && Boolean(errors.privacy)
                      ? "var(--mui-palette-error-main)"
                      : "inherit",
                }}
                control={
                  <Checkbox
                    id="privacy"
                    name="privacy"
                    checked={value.privacy}
                    onChange={(_, checked) =>
                      onChange({
                        ...value,
                        privacy: checked,
                      })
                    }
                    sx={{
                      color:
                        touched.privacy && Boolean(errors.privacy)
                          ? "var(--mui-palette-error-main)"
                          : "inherit",
                    }}
                  />
                }
                label={
                  <Trans
                    i18nKey={
                      t(`authentication:privacy-${role.toLowerCase()}`) + " *"
                    }
                    components={[
                      <a href={`/privacy-${language}.pdf`} target="_blank" />,
                    ]}
                    defaultTrans=""
                  />
                }
              />
              {touched.privacy && Boolean(errors.privacy) && (
                <FormHelperText>{errors.privacy}</FormHelperText>
              )}
            </FormControl>
          )}

          {value?.manifesto !== undefined && (
            <FormControl
              required
              error={touched.manifesto && Boolean(errors.manifesto)}
              component="fieldset"
              variant="standard"
            >
              <FormControlLabel
                sx={{
                  color:
                    touched.manifesto && Boolean(errors.manifesto)
                      ? "var(--mui-palette-error-main)"
                      : "inherit",
                }}
                control={
                  <Checkbox
                    id="manifesto"
                    name="manifesto"
                    checked={value.manifesto}
                    onChange={(_, checked) =>
                      onChange({
                        ...value,
                        manifesto: checked,
                      })
                    }
                    sx={{
                      color:
                        touched.manifesto && Boolean(errors.manifesto)
                          ? "var(--mui-palette-error-main)"
                          : "inherit",
                    }}
                  />
                }
                label={
                  <Trans
                    i18nKey={
                      t(`authentication:manifesto-${role.toLowerCase()}`) + " *"
                    }
                    components={[
                      <a href={`/manifesto-${language}.pdf`} target="_blank" />,
                    ]}
                    defaultTrans=""
                  />
                }
              />
              {touched.manifesto && Boolean(errors.manifesto) && (
                <FormHelperText>{errors.manifesto}</FormHelperText>
              )}
            </FormControl>
          )}
        </CheckboxContainer>
      )}
    </Container>
  );
};

export default ContactInformation;
