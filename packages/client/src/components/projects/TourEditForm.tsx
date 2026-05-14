import TextField from "@/components/TextField";
import styled from "@emotion/styled";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import { DialogActions, DialogContent } from "@/components/UI/Dialog";

import * as yup from "yup";

import { DatePicker } from "@mui/x-date-pickers";
import { useFormik } from "formik";
import { useTranslation } from "next-i18next";
import { useRef } from "react";
import Markdown from "@/components/UI/Markdown";
import { Place } from "@cooprog/core";
import TitleWithIcon from "@/components/UI/TitleWithIcon";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ElectricRickshawOutlinedIcon from "@mui/icons-material/ElectricRickshawOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MultipleAddressAutocomplete from "@/components/UI/MultipleAddressAutocomplete";
import SingleSelectToggle from "@/components/UI/SingleSelectToggle";
import MainTextField from "@/components/UI/MainTextField";
import CloseIcon from "@mui/icons-material/Close";
import BlueInfoCard from "@/components/UI/BlueInfoCard";

const HelperText = styled(FormHelperText)`
  font-size: 12px;
  color: var(--color-gray);
  margin-left: 0;
`;

const HelperMarkdownContainer = styled.div`
  font-size: 0.8rem;
  line-height: 1.5;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  width: 100%;
`;

export const Block = styled.div`
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  > div {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const RequiredFieldsNote = styled(FormHelperText)`
  text-align: right;
  margin-top: 4px;
  color: var(--color-gray);
`;

const DecorationsSection = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start !important;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const DecorationsFieldsColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DecorationsHelpMarkdown = styled(HelperMarkdownContainer)`
  max-width: 380px;
  width: 100%;
  margin-top: 0;

  h3,
  h4 {
    margin: 0;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4 {
    font-size: 0.95rem;
  }

  p {
    margin: 4px 0 0 0;
    white-space: pre-line;
  }

  @media (max-width: 900px) {
    max-width: none;
  }
`;

const validationSchema = yup.object({
  name: yup.string().required("Mandatory field"),
  start: yup.date().required("Mandatory field"),
  end: yup
    .date()
    .min(yup.ref("start"), "End date must be after start date")
    .when("start", (start, schema) => {
      return start
        ? schema.required("End date is required when start date is set")
        : schema;
    }),

  artisticTeamPlace: yup.object().nullable().shape({
    city: yup.string(),
    country: yup.string(),
  }),
});

export interface TourInformationProps {
  name: string;
  start?: Date;
  end?: Date;
  artisticTeamPlace?: Place;
  peopleTransportMode?: string;
  decorationsTransportMode?: string;
  decorationsWeight?: number;
  schedule?: {
    date: Date;
    status: string;
  }[];
}

const TourEditForm = ({
  generalInfos,
  onCancel,
  onValidate,
  submitButtonText = "common:next",
}: {
  generalInfos?: TourInformationProps;
  onCancel: () => void;
  onValidate: (values: TourInformationProps) => void;
  submitButtonText?: string;
}) => {
  const { t } = useTranslation();
  const fieldToFocus = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: generalInfos || {
      name: "",
      start: undefined,
      end: undefined,
      schedule: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      onValidate(values);
    },
  });

  const peopleTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.people-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };

  const peopleTransportModeLabelOptions: Record<string, string> =
    Object.fromEntries(
      Object.entries(peopleTransportModeOptions).map(([key, value]) => [
        key,
        value.label,
      ])
    );

  const decorationsTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.decorations-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };

  const decorationsTransportModeLabelOptions: Record<string, string> =
    Object.fromEntries(
      Object.entries(decorationsTransportModeOptions).map(([key, value]) => [
        key,
        value.label,
      ])
    );

  return (
    <Container>
      <Form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <BlueInfoCard icon={<CalendarTodayIcon sx={{ fontSize: 64, color: "white" }} />}>
            <Markdown>
              {t("common:dialogs.new-project.tour-information.description")}
            </Markdown>
          </BlueInfoCard>
          <Block>
            <div>
              <MainTextField
                id="name"
                name="name"
                label={t("common:dialogs.new-project.tour-information.name")}
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
                inputRef={fieldToFocus}
                required
              ></MainTextField>
            </div>
          </Block>

          <Block>
            <TitleWithIcon
              title={t("common:dialogs.new-project.tour-information.logistic")}
              icon={ElectricRickshawOutlinedIcon}
            />
            <Markdown>
              {t(
                "common:dialogs.new-project.tour-information.logistic-explanation"
              )}
            </Markdown>
            <FormLabel sx={{ marginTop: "16px", color: "var(--color-black)" }}>
              {t(
                "common:dialogs.new-project.tour-information.logistics-artistic-team"
              )}
            </FormLabel>
            <div>
              <FormControl>
                <FormLabel sx={{ fontSize: "14px" }}>
                  {t(
                    "common:dialogs.new-project.tour-information.artistic-team-localization"
                  )}
                </FormLabel>
                <HelperText>
                  {t(
                    "common:dialogs.new-project.tour-information.artistic-team-localization-helper"
                  )}
                </HelperText>
                <MultipleAddressAutocomplete
                  onChange={(value) =>
                    formik.setFieldValue("artisticTeamPlace", value)
                  }
                  error={false}
                  value={formik.values.artisticTeamPlace}
                  multiple={false}
                />
              </FormControl>
            </div>
            <div>
              <FormControl>
                <FormLabel sx={{ fontSize: "14px" }}>
                  {t(
                    "common:dialogs.new-project.tour-information.people-transport"
                  )}
                </FormLabel>
                <HelperText>
                  {t(
                    "common:dialogs.new-project.tour-information.people-transport-helper"
                  )}
                </HelperText>
                <SingleSelectToggle
                  value={formik.values.peopleTransportMode || ""}
                  onChange={(value) => {
                    formik.setFieldValue("peopleTransportMode", value);
                  }}
                  options={peopleTransportModeLabelOptions}
                />
              </FormControl>
            </div>
            <DecorationsSection>
              <DecorationsFieldsColumn>
                <div>
                  <FormLabel sx={{ marginTop: "16px", color: "var(--color-black)" }}>
                    {t(
                      "common:dialogs.new-project.tour-information.logistics-decorations"
                    )}
                  </FormLabel>
                  <HelperText>
                    {t(
                      "common:dialogs.new-project.tour-information.decorations-transport-helper"
                    )}
                  </HelperText>
                </div>
                <div>
                  <FormControl>
                    <FormLabel sx={{ fontSize: "14px" }}>
                      {t(
                        "common:dialogs.new-project.tour-information.decorations-transport"
                      )}
                    </FormLabel>
                    <SingleSelectToggle
                      value={formik.values.decorationsTransportMode || ""}
                      onChange={(value) =>
                        formik.setFieldValue("decorationsTransportMode", value)
                      }
                      options={decorationsTransportModeLabelOptions}
                    />
                  </FormControl>
                </div>
                <div>
                  <FormControl>
                    <FormLabel sx={{ fontSize: "14px" }}>
                      {t(
                        "common:dialogs.new-project.tour-information.decorationsWeight"
                      )}
                    </FormLabel>
                    <TextField
                      fullWidth
                      id="decorationsWeight"
                      name="decorationsWeight"
                      value={formik.values.decorationsWeight}
                      onChange={formik.handleChange}
                      size="small"
                      error={
                        formik.touched.decorationsWeight &&
                        Boolean(formik.errors.decorationsWeight)
                      }
                      helperText={
                        formik.touched.decorationsWeight &&
                        formik.errors.decorationsWeight
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">kg</InputAdornment>
                        ),
                      }}
                      type="number"
                    />
                  </FormControl>
                </div>
              </DecorationsFieldsColumn>
              <div>
                <DecorationsHelpMarkdown>
                  <Markdown>
                    {t(
                      "common:dialogs.new-project.tour-information.decorations-help",
                    )}
                  </Markdown>
                </DecorationsHelpMarkdown>
              </div>
            </DecorationsSection>
          </Block>

          <Block>
            <TitleWithIcon
              title={t("common:dialogs.new-project.tour-information.planning")}
              icon={CalendarMonthOutlinedIcon}
            />
            <div>
              <DatePicker
                name="start"
                label={t("common:dialogs.new-project.tour-information.start")}
                value={
                  formik.values.start ? new Date(formik.values.start) : null
                }
                onChange={(value) => formik.setFieldValue("start", value, true)}
                slotProps={{
                  textField: {
                    error: formik.touched.start && Boolean(formik.errors.start),
                    helperText: formik.touched.start && formik.errors.start,
                    fullWidth: true,
                    required: true,
                  },
                }}
              ></DatePicker>
              <DatePicker
                name="end"
                label={t("common:dialogs.new-project.tour-information.end")}
                value={formik.values.end ? new Date(formik.values.end) : null}
                onChange={(value) => formik.setFieldValue("end", value, true)}
                slotProps={{
                  textField: {
                    error: formik.touched.end && Boolean(formik.errors.end),
                    helperText: formik.touched.end && formik.errors.end,
                    fullWidth: true,
                    required: true,
                  },
                }}
              ></DatePicker>
            </div>
          </Block>
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
              <Button onClick={onCancel} startIcon={<CloseIcon />}>
                {t("common:cancel")}
              </Button>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button type="submit" variant="contained" color="primary">
                  {t(submitButtonText)}
                </Button>
              </div>
            </div>
            <RequiredFieldsNote>
              {t("common:required-fields")}
            </RequiredFieldsNote>
          </div>
        </DialogActions>
      </Form>
    </Container>
  );
};

export default TourEditForm;
