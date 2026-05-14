import TextField from "@/components/TextField";
import styled from "@emotion/styled";
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Typography,
  Button,
  Select,
  Divider,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ElectricRickshawOutlinedIcon from "@mui/icons-material/ElectricRickshawOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { useFormik } from "formik";
import { useTranslation } from "next-i18next";
import Markdown from "@/components/UI/Markdown";
import Planning from "@/components/projects/Planning";
import { ProgramStatuses, Tour, User } from "@cooprog/core";
import { useEffect, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  isAfter,
  startOfMonth,
  getMonth,
  getYear,
} from "date-fns";
import useUser from "@/components/authentication/useUser";
import { enqueueSnackbar } from "notistack";
import useRights, { Actions } from "@/components/structures/useRights";
import TitleWithIcon from "@/components/UI/TitleWithIcon";
import MultipleAddressAutocomplete from "@/components/UI/MultipleAddressAutocomplete";
import { Place } from "@cooprog/core";
import SingleSelectToggle from "@/components/UI/SingleSelectToggle";
import { useRouter } from "next/router";
import MainTextField from "@/components/UI/MainTextField";
import FormErrorNotification from "@/components/UI/FormErrorNotification";
import { Location } from "@cooprog/core";
import UserEditDialog from "@/components/authentication/UserEditDialog";
import { DialogActions, DialogContent } from "@/components/UI/Dialog";
import BlueInfoCard from "@/components/UI/BlueInfoCard";

const HelperText = styled(FormHelperText)`
  font-size: 12px;
  color: var(--color-gray);
  margin-left: 0;
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

export const GenreChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const MarkdownContainer = styled.div`
  font-size: 1rem;
  line-height: 1.5;

  > p {
    margin: 1rem 0;
  }
`;

const HelperMarkdownContainer = styled(MarkdownContainer)`
  font-size: 0.8rem;
  line-height: 1.5;
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

export interface TourInformationProps {
  tourName?: string;
  start?: Date;
  end?: Date;
  artisticTeamPlace?: Place;
  peopleTransportMode?: string;
  decorationsTransportMode?: string;
  decorationsWeight?: number;
  month?: number;
  year?: number;
  schedule: {
    _id: string;
    date: Date;
    status: ProgramStatuses;
    user?: User;
    customMessage?: string;
  }[];
}
export interface TourInformationForm {
  tourName?: string;
  month?: number;
  year?: number;
  artisticTeamPlace?: Place;
  peopleTransportMode?: string;
  decorationsTransportMode?: string;
  decorationsWeight?: number;
  schedule: {
    _id: string;
    date: Date;
    status: ProgramStatuses;
    user?: User;
    customMessage?: string;
  }[];
}

const RequiredFieldsNote = styled(FormHelperText)`
  text-align: right;
  margin-top: 4px;
  color: var(--color-gray);
`;

const LocationSelect = styled(Select)`
  .MuiSelect-select {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const LocationMenuItem = styled(MenuItem)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px;
  gap: 4px;
`;

const LocationLabel = styled.div`
  font-weight: 500;
  color: #123036;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LocationAddress = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

/**
 * Generates a tour name based on the schedule dates and user language
 * @param schedule - Array of scheduled dates with their status
 * @param t - Translation function from useTranslation
 * @param i18n - i18n instance to get current language
 * @returns Generated tour name like "Tour octobre-november 2027" or "Tournée février 2028"
 */
export const generateTourName = (
  schedule: {
    _id: string;
    date: Date;
    status: ProgramStatuses;
    user?: User;
  }[],
  t: (key: string) => string,
  i18n: { language: string }
): string => {
  if (!schedule || schedule.length === 0) {
    return "";
  }

  // Get confirmed and pending dates
  const confirmedDates = schedule
    .filter(
      (s) =>
        s.date &&
        [ProgramStatuses.SHOW_CONFIRMED, ProgramStatuses.SHOW_PENDING].includes(
          s.status
        )
    )
    .map((s) => new Date(s.date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (confirmedDates.length === 0) {
    return "";
  }

  const firstDate = confirmedDates[0];
  const lastDate = confirmedDates[confirmedDates.length - 1];

  const firstMonth = getMonth(firstDate);
  const firstYear = getYear(firstDate);
  const lastMonth = getMonth(lastDate);
  const lastYear = getYear(lastDate);

  // Get month names from translations
  const firstMonthName = t(`common:months.${firstMonth}`);
  const lastMonthName = t(`common:months.${lastMonth}`);

  // Get tour prefix from translations
  const tourPrefix = t("common:tour.prefix");

  // Same month and year
  if (firstMonth === lastMonth && firstYear === lastYear) {
    return `${tourPrefix} ${firstMonthName.toLowerCase()} ${firstYear}`;
  }

  // Same year, different months
  if (firstYear === lastYear) {
    return `${tourPrefix} ${firstMonthName.toLowerCase()}-${lastMonthName.toLowerCase()} ${firstYear}`;
  }

  // Different years
  return `${tourPrefix} ${firstMonthName.toLowerCase()} ${firstYear}-${lastMonthName.toLowerCase()} ${lastYear}`;
};

const TourCreateForm = ({
  tourInfos,
  defaultArtisticTeamPlace,
  submitButtonText,
  onCancel,
  showPreviousButton,
  onValidate,
  onChange,
  submitButtonEndIcon,
  submitButtonStartIcon,
}: {
  tourInfos?: Partial<TourInformationProps>;
  defaultArtisticTeamPlace?: Place;
  submitButtonText?: string;
  onCancel: () => void;
  showPreviousButton?: boolean;
  onChange?: (values: TourInformationProps) => void;
  onValidate: (values: TourInformationProps) => void;
  submitButtonEndIcon?: React.ReactNode;
  submitButtonStartIcon?: React.ReactNode;
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const fieldToFocus = useRef<HTMLInputElement>(null);
  const [bounds, setBounds] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const { can } = useRights({ user, tourCreation: true });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [userEditDialogOpen, setUserEditDialogOpen] = useState<boolean>(false);

  const validationSchema = yup.object({
    tourName: yup.string().optional(),
    month: yup.number().required(t("common:validation.monthRequired")),
    year: yup.number().required(t("common:validation.yearRequired")),
    artisticTeamPlace: yup.object().nullable().shape({
      city: yup.string(),
      country: yup.string(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      tourName: tourInfos?.tourName,
      start: tourInfos?.start || undefined,
      end: tourInfos?.end || undefined,
      artisticTeamPlace:
        defaultArtisticTeamPlace || tourInfos?.artisticTeamPlace || undefined,
      peopleTransportMode: tourInfos?.peopleTransportMode || undefined,
      decorationsTransportMode:
        tourInfos?.decorationsTransportMode || undefined,
      decorationsWeight: tourInfos?.decorationsWeight || undefined,
      month: tourInfos?.month || undefined,
      year: tourInfos?.year || undefined,
      schedule: tourInfos?.schedule || [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const hasDate = values.schedule.some(
          (s) =>
            s.date &&
            [
              ProgramStatuses.SHOW_CONFIRMED,
              ProgramStatuses.SHOW_PENDING,
            ].includes(s.status)
        );
        if (!hasDate) {
          formik.setFieldError(
            "schedule",
            t("common:validation.atLeastOneDateRequired")
          );
          return;
        }

        const areAllDatesInTheFuture = values.schedule.every(
          (s) => s.date && isAfter(new Date(s.date), new Date())
        );
        if (!areAllDatesInTheFuture) {
          formik.setFieldError(
            "schedule",
            t("common:validation.allDatesMustBeInFuture")
          );
          return;
        }

        const earliestDate = new Date(
          values.schedule.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0].date
        );
        const earliestDateMinus7Days = addDays(earliestDate, -15);
        const latestDate = new Date(
          values.schedule.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0].date
        );
        const latestDatePlus7Days = addDays(latestDate, 15);

        // Generate tour name if not provided
        const tourName =
          values.tourName || generateTourName(values.schedule, t, i18n);

        const newValues = {
          ...values,
          start: earliestDateMinus7Days,
          end: latestDatePlus7Days,
          tourName,
        };
        onValidate({
          ...newValues,
          tourName: newValues.tourName || "",
        });
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (onChange) {
      onChange({
        ...formik.values,
        tourName: formik.values.tourName || "",
      });
    }
  }, [formik.values]);

  useEffect(() => {
    setTimeout(() => {
      fieldToFocus.current?.focus();
    }, 1000);
  }, []);

  useEffect(() => {
    if (user?.locations) {
      const mainLocation = user.locations.find((loc) => loc.isMain);
      if (mainLocation?._id) {
        setSelectedLocation(mainLocation._id);
      }
    }
  }, [user?.locations]);

  const handleLocationChange = (event: any) => {
    setSelectedLocation(event.target.value);
  };

  const handleSchedule = async (
    date: Date,
    status: ProgramStatuses,
    otherUser?: Partial<User> | null
  ) => {
    let location: Location | undefined;
    if (otherUser) {
      location = otherUser.locations?.find((loc) => loc.isMain)?.location;
    } else if (selectedLocation) {
      location = user?.locations?.find(
        (loc) => loc._id === selectedLocation
      )?.location;
    } else {
      location = user?.locations?.find((loc) => loc.isMain)?.location;
    }
    await formik.setFieldValue("schedule", [
      ...formik.values.schedule,
      {
        _id: uuidv4(),
        date,
        status,
        user: otherUser || user,
        location,
      },
    ]);
  };

  const handleUnschedule = async (id: string) => {
    await formik.setFieldValue(
      "schedule",
      formik.values.schedule.filter((s) => s._id !== id)
    );
  };

  const handleEditProgram = async (id: string, params: Partial<Tour>) => {
    await formik.setFieldValue(
      "schedule",
      formik.values.schedule.map((s) =>
        s._id === id ? { ...s, ...params } : s
      )
    );
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        typeof formik.values.month === "number" &&
        formik.values.year &&
        formik.values.year > 2000
      ) {
        setLoading(true);
        const startDate = startOfMonth(
          new Date(formik.values.year, formik.values.month)
        );
        const endDate = endOfMonth(
          new Date(formik.values.year, formik.values.month)
        );
        if (
          bounds?.start.getTime() !== startDate.getTime() ||
          bounds?.end.getTime() !== endDate.getTime()
        ) {
          formik.setFieldValue("schedule", []);
          setBounds({ start: startDate, end: endDate });
        }
        setLoading(false);
      } else {
        setBounds(null);
        setLoading(false);
      }
    }, 1);
    return () => clearTimeout(timeout);
  }, [formik.values.month, formik.values.year]);

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

  // For SingleSelectToggle, map to { value, label }
  const peopleTransportModeSelectOptions: { value: string; label: string }[] =
    Object.entries(peopleTransportModeOptions).map(([key, value]) => ({
      value: key,
      label: value.label,
    }));

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

  // For SingleSelectToggle, map to { value, label }
  const decorationsTransportModeSelectOptions: {
    value: string;
    label: string;
  }[] = Object.entries(decorationsTransportModeOptions).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));

  const now = new Date();
  const startOfNextMonth = startOfMonth(addMonths(now, 1));
  const endOfNextMonth = endOfMonth(addMonths(now, 1));

  const defaultBounds = {
    start: startOfNextMonth,
    end: endOfNextMonth,
  };

  return (
    <Container>
      <Form onSubmit={formik.handleSubmit} autoComplete="off">
        <FormErrorNotification formik={formik} />
        <DialogContent>
          <BlueInfoCard icon={<CalendarTodayIcon sx={{ fontSize: 64, color: "white" }} />}>
            <MarkdownContainer>
              <Markdown>
                {t("common:dialogs.new-project.tour-information.description")}
              </Markdown>
            </MarkdownContainer>
          </BlueInfoCard>
          <Block>
            <div>
              <MainTextField
                id="tourName"
                name="tourName"
                label={t("common:dialogs.new-project.tour-information.name")}
                value={formik.values.tourName}
                onChange={formik.handleChange}
                error={
                  formik.touched.tourName && Boolean(formik.errors.tourName)
                }
                helperText={
                  (formik.touched.tourName && formik.errors.tourName) || (
                    <HelperMarkdownContainer>
                      <Markdown>
                        {t(
                          "common:dialogs.new-project.tour-information.name-helper"
                        )}
                      </Markdown>
                    </HelperMarkdownContainer>
                  )
                }
                fullWidth
                inputRef={fieldToFocus}
                placeholder={generateTourName(formik.values.schedule, t, i18n)}
              />
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
                  value={formik.values.artisticTeamPlace}
                  onChange={(value) =>
                    formik.setFieldValue("artisticTeamPlace", value)
                  }
                  error={false}
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
                  onChange={(value) =>
                    formik.setFieldValue("peopleTransportMode", value)
                  }
                  options={peopleTransportModeSelectOptions.reduce(
                    (acc, option) => {
                      acc[option.value] = option.label;
                      return acc;
                    },
                    {} as Record<string, string>
                  )}
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
                      options={decorationsTransportModeSelectOptions.reduce(
                        (acc, option) => {
                          acc[option.value] = option.label;
                          return acc;
                        },
                        {} as Record<string, string>
                      )}
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
                      size="small"
                      value={formik.values.decorationsWeight}
                      onChange={formik.handleChange}
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
            {user?.locations && user.locations.length > 1 && (
              <>
                <Markdown>
                  {t(
                    "common:dialogs.new-project.tour-information.locations-explanation"
                  )}
                </Markdown>
                <FormControl sx={{ minWidth: 200, gap: "4px !important" }}>
                  <LocationSelect
                    labelId="location-select-label"
                    value={selectedLocation || ""}
                    onChange={handleLocationChange}
                    renderValue={(value) => {
                      const location = user.locations.find(
                        (loc) => loc._id === value
                      );
                      return location?.label;
                    }}
                    startAdornment={
                      <LocationOnIcon
                        sx={{
                          color: "primary.main",
                          fontSize: "1.2rem",
                          marginRight: "4px",
                        }}
                      />
                    }
                    sx={{
                      minWidth: 400,
                    }}
                  >
                    {user.locations.map((location) => (
                      <LocationMenuItem key={location._id} value={location._id}>
                        <LocationLabel>
                          {location.label}
                          {location.isMain && (
                            <StarIcon
                              sx={{
                                color: "#FFD700",
                                fontSize: "1rem",
                              }}
                            />
                          )}
                        </LocationLabel>
                        <LocationAddress>
                          {location.location.address}
                        </LocationAddress>
                      </LocationMenuItem>
                    ))}
                  </LocationSelect>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: "right",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontStyle: "italic",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                    onClick={() => {
                      setUserEditDialogOpen(true);
                    }}
                  >
                    {t("projects:tours.handle-locations")}
                  </Typography>
                </FormControl>
                <Divider sx={{ margin: "16px 0" }} />
              </>
            )}

            <Markdown>
              {t(
                "common:dialogs.new-project.tour-information.dates-explanation"
              )}
            </Markdown>
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-end",
              }}
              data-testid="date-selector"
            >
              <TextField
                id="month"
                name="month"
                label={
                  t("common:dialogs.new-project.tour-information.month") + " *"
                }
                value={formik.values.month}
                onChange={(e) => formik.setFieldValue("month", e.target.value)}
                error={formik.touched.month && Boolean(formik.errors.month)}
                helperText={formik.touched.year && formik.errors.year}
                placeholder="Month"
                fullWidth
                select
              >
                <MenuItem value={undefined}>
                  <em>None</em>
                </MenuItem>
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <MenuItem key={month} value={month}>
                    {t(`common:months.${month}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                id="year"
                name="year"
                label={
                  t("common:dialogs.new-project.tour-information.year") + " *"
                }
                autoComplete="new-number"
                value={formik.values.year}
                onChange={formik.handleChange}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
                fullWidth
                InputProps={{
                  endAdornment: loading ? (
                    <CircularProgress
                      size="24px"
                      style={{ marginLeft: "12px" }}
                    />
                  ) : null,
                }}
              />
            </div>
            <Divider sx={{ margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Markdown>
                {t(
                  "common:dialogs.new-project.tour-information.planning-explanation"
                )}
              </Markdown>
              <FormControl
                fullWidth
                error={
                  formik.touched.schedule && Boolean(formik.errors.schedule)
                }
              >
                <div style={{ position: "relative" }}>
                  {!bounds && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#f5f5f5aa",
                        backdropFilter: "blur(4px)",
                        zIndex: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        borderRadius: "4px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "sticky",
                          top: "120px",
                          backgroundColor: "white",
                          padding: "16px 24px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                          maxWidth: "400px",
                          textAlign: "center",
                          marginTop: "150px",
                        }}
                      >
                        <CalendarMonthOutlinedIcon
                          fontSize="large"
                          style={{
                            color: "var(--color-primary)",
                            marginBottom: "8px",
                          }}
                        />
                        <Typography variant="h6" gutterBottom>
                          {t(
                            "common:dialogs.new-project.tour-information.planning-overlay.title"
                          )}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t(
                            "common:dialogs.new-project.tour-information.planning-overlay.description"
                          )}
                        </Typography>
                      </div>
                    </div>
                  )}
                  <Planning
                    tour={{
                      ...(bounds ? bounds : defaultBounds),
                      schedule: formik.values.schedule,
                    }}
                    id="schedule"
                    schedule={handleSchedule}
                    unschedule={handleUnschedule}
                    editProgram={handleEditProgram}
                    canBlock={!!bounds && can(Actions.TOUR_BLOCK)}
                    canWish={!!bounds && can(Actions.TOUR_ADD_WISH)}
                    canSchedule={!!bounds && can(Actions.TOUR_SCHEDULE)}
                    canEdit={!!bounds && can(Actions.TOUR_EDIT_DAYS)}
                    canScheduleForOthers={
                      !!bounds && can(Actions.TOUR_SCHEDULE_FOR_OTHERS)
                    }
                    canAddUnavailable={
                      !!bounds && can(Actions.TOUR_ADD_UNAVAILABLE)
                    }
                    sx={{
                      MonthTitle: {
                        backgroundColor: "var(--content-background-color)",
                      },
                      TableHeader: {
                        // top: "50px",
                        backgroundColor:
                          "var(--content-background-color) !important",
                      },
                    }}
                  ></Planning>
                </div>
              </FormControl>
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
                {showPreviousButton && (
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push("/projects/new")}
                  >
                    {t("common:previous")}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  endIcon={submitButtonEndIcon || <ArrowForwardIcon />}
                  startIcon={submitButtonStartIcon || undefined}
                >
                  {t(submitButtonText || "common:next")}
                </Button>
              </div>
            </div>
            <RequiredFieldsNote>
              {t("common:required-fields")}
            </RequiredFieldsNote>
          </div>
        </DialogActions>
      </Form>
      {user && (
        <UserEditDialog
          open={userEditDialogOpen}
          onClose={() => setUserEditDialogOpen(false)}
          user={user}
          initialTab={1}
        />
      )}
    </Container>
  );
};

export default TourCreateForm;
