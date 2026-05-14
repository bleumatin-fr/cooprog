import styled from "@emotion/styled";

import TextField from "@/components/TextField";
import PasswordField from "@/components/UI/PasswordField";
import ProgrammingDisciplineSection from "@/components/discipline/ProgrammingDisciplineSection";
import DisciplineSelector from "@/components/projects/DisciplineSelector";
import { Discipline, Role, StructureType } from "@cooprog/core";
import HelpIcon from "@mui/icons-material/Help";
import {
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { FormikErrors, FormikTouched } from "formik";
import { useTranslation } from "next-i18next";
import useGenres from "@/components/projects/useGenres";
import Markdown from "@/components/UI/Markdown";

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
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
  padding-right: 8px;
  padding-top: 12px;
  padding-bottom: 12px;

  > div {
    display: flex;
    align-items: center;
    // gap: 16px;
  }
`;

const RequiredFieldsNote = styled.div`
  font-size: 12px;
  position: absolute;
  right: 16px;
  bottom: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1000;
  padding: 16px;
  padding-bottom: 22px;
`;

// Style pour aligner les labels à gauche
const LeftAlignedFormLabel = styled(FormLabel)`
  text-align: left;
  display: flex;
  width: 100%;
`;

export interface GeneralInformationValues {
  email: string;
  company: string;
  companyDescription?: string;
  link?: string;
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
  password?: string;
}

interface GeneralInfoProps {
  value: GeneralInformationValues;
  onChange: (value: GeneralInformationValues) => void;
  touched: FormikTouched<GeneralInformationValues>;
  errors: FormikErrors<GeneralInformationValues>;
  showLink?: boolean;
  role?: Role;
}

const GeneralInfos = ({
  value,
  onChange,
  touched,
  errors,
  showLink = true,
  role = Role.DIFFUSION_STRUCTURE,
}: GeneralInfoProps) => {
  const { t } = useTranslation();
  const genres = useGenres();

  return (
    <Container>
      <TextContainer>
        <Markdown>
          {t(`authentication:general.information-${role.toLowerCase()}`)}
        </Markdown>
      </TextContainer>
      <Divider />
      <TextField
        id="email"
        name="email"
        label={t(`authentication:email-${role.toLowerCase()}`) + " *"}
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        error={touched.email && Boolean(errors.email)}
        helperText={touched.email && errors.email}
        fullWidth
        sx={{
          ".MuiFormHelperText-root": {
            textAlign: "left",
            width: "100%",
            display: "block",
          },
        }}
      ></TextField>
      <div
        style={{ display: "flex", flexDirection: "column", textAlign: "left" }}
      >
        <PasswordField
          id="password"
          name="password"
          label={
            t(`authentication:choose-password-${role.toLowerCase()}`) + " *"
          }
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          error={touched.password && Boolean(errors.password)}
          helperText={touched.password && errors.password}
          fullWidth
          sx={{
            ".MuiFormHelperText-root": {
              textAlign: "left",
              width: "100%",
              display: "block",
            },
          }}
        ></PasswordField>
        <FormHelperText sx={{ width: "100%" }}>
          {t(`authentication:email-helper-text`)}
        </FormHelperText>
      </div>
      <Divider />
      <div
        style={{ display: "flex", flexDirection: "column", textAlign: "left" }}
      >
        <TextField
          id="company"
          name="company"
          label={t(`authentication:company-${role.toLowerCase()}`) + " *"}
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
          error={touched.company && Boolean(errors.company)}
          helperText={touched.company && errors.company}
          fullWidth
          sx={{
            ".MuiFormHelperText-root": {
              textAlign: "left",
              width: "100%",
              display: "block",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title={t(
                    `authentication:company-helper-text-${role.toLowerCase()}-tooltip`,
                  )}
                >
                  <HelpIcon />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        ></TextField>
        {role === Role.DIFFUSION_STRUCTURE && (
          <FormHelperText sx={{ width: "100%" }}>
            {t(`authentication:company-helper-text-diffusion_structure`)}
          </FormHelperText>
        )}
      </div>
      <TextField
        id="companyDescription"
        name="companyDescription"
        label={t(`authentication:companyDescription-${role.toLowerCase()}`)}
        value={value.companyDescription}
        onChange={(e) =>
          onChange({ ...value, companyDescription: e.target.value })
        }
        error={touched.companyDescription && Boolean(errors.companyDescription)}
        helperText={touched.companyDescription && errors.companyDescription}
        fullWidth
        multiline
        rows={3}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip
                title={t(
                  `authentication:companyDescription-helper-text-${role.toLowerCase()}`,
                )}
              >
                <HelpIcon />
              </Tooltip>
            </InputAdornment>
          ),
        }}
      ></TextField>
      {showLink && role !== Role.ARTISTIC_TEAM && (
        <TextField
          id="link"
          name="link"
          label={t(`authentication:link-${role.toLowerCase()}`)}
          value={value.link}
          onChange={(e) => onChange({ ...value, link: e.target.value })}
          error={touched.link && Boolean(errors.link)}
          fullWidth
          InputLabelProps={{
            style: { textAlign: "left" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title={t(
                    `authentication:link-helper-text-${role.toLowerCase()}`,
                  )}
                >
                  <HelpIcon />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        ></TextField>
      )}
      <Divider sx={{ my: 2 }} />

      <div
        style={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <LeftAlignedFormLabel
          error={
            touched.programmingDisciplines &&
            Boolean(errors.programmingDisciplines)
          }
        >
          {t(`authentication:programmingDisciplines-${role.toLowerCase()}`)} *
        </LeftAlignedFormLabel>
        <FormControl fullWidth>
          <DisciplineSelector
            value={value.programmingDisciplines}
            error={
              touched.programmingDisciplines &&
              Boolean(errors.programmingDisciplines)
            }
            multiSelect={true}
            setValue={(newDisciplines: Discipline[]) => {
              const newGenres = value.programmingGenres?.filter((genre) => {
                const genreItem = genres.find((g) => g.id === genre);
                if (
                  genreItem?.discipline &&
                  newDisciplines.includes(genreItem?.discipline)
                ) {
                  return true;
                }
                return false;
              });
              onChange({
                ...value,
                programmingDisciplines: newDisciplines,
                programmingGenres: newGenres,
              });
            }}
          />
        </FormControl>
        <FormHelperText
          error={
            touched.programmingDisciplines &&
            Boolean(errors.programmingDisciplines)
          }
        >
          <Markdown style={{ fontSize: "0.75rem" }}>
            {t(
              `authentication:programmingDisciplines-helper-text-${role.toLowerCase()}`,
            )}
          </Markdown>
        </FormHelperText>
        <FormHelperText
          error={
            touched.programmingDisciplines &&
            Boolean(errors.programmingDisciplines)
          }
        >
          {errors.programmingDisciplines}
        </FormHelperText>
      </div>
      {value.programmingDisciplines &&
        value.programmingDisciplines.length > 0 && (
          <ProgrammingDisciplineSection
            values={{
              programmingDisciplines: value.programmingDisciplines,
              structureTypes: value.structureTypes,
              programmingPeriods: value.programmingPeriods,
              programmingGenres: value.programmingGenres,
            }}
            role={role}
            labels={{
              structureTypes: t(
                `authentication:structureTypes-${role.toLowerCase()}`,
              ),
              programmingPeriods: t(
                `authentication:programmingPeriods-${role.toLowerCase()}`,
              ),
              programmingPeriodsHelper: t(
                `authentication:programmingPeriods-helper-text-${role.toLowerCase()}`,
              ),
              genres: t(`authentication:genres-${role.toLowerCase()}`),
            }}
            onChange={(field: string, value: any) =>
              onChange({ ...value, [field]: value })
            }
          />
        )}
    </Container>
  );
};

export default GeneralInfos;
