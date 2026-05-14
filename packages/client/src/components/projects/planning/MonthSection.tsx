import React from "react";
import { useTranslation } from "next-i18next";
import {
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isSameDay,
  setDate,
  setMonth,
  setYear,
  subDays,
} from "date-fns";
import {
  Container,
  Month,
  MonthBody,
  MonthHead,
  MonthTitle,
  MonthContainer,
} from "./styles";
import {
  DAYS_AFTER_EVENT_FOR_BUTTON,
  DAYS_BEFORE_EVENT_FOR_BUTTON,
  ScheduleHashMap,
} from "./types";
import DayRow from "./DayRow";
import CollapseButton from "./CollapseButton";
import { Location, Program, ProgramStatuses, User } from "@cooprog/core";
import { CSSProperties } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

interface MonthSectionProps {
  month: number;
  year: number;
  numberOfDays: number;
  scheduleHashMap: ScheduleHashMap;
  start: Date;
  end: Date;
  firstEventDate: Date | null;
  lastEventDate: Date | null;
  isStartCollapsed: boolean;
  isEndCollapsed: boolean;
  toggleCollapseStart: () => void;
  toggleCollapseEnd: () => void;
  shouldCollapseStart: boolean;
  shouldCollapseEnd: boolean;
  isDateCollapsed: (date: Date) => boolean;
  unschedule: (id: string) => Promise<void> | void;
  schedule: (
    date: Date,
    status: ProgramStatuses,
    user?: Partial<User> | null,
    location?: Location,
    customMessage?: string
  ) => Promise<void> | void;
  editProgram: (
    programId: string,
    params: Partial<Program>
  ) => Promise<void> | void;
  canEdit?: boolean;
  canSchedule?: boolean;
  canBlock?: boolean;
  canWish?: boolean;
  canScheduleForOthers?: boolean;
  canAddUnavailable?: boolean;
  onEditTour?: () => void;
  sx?: CSSProperties & {
    MonthTitle?: CSSProperties;
    TableHeader?: CSSProperties;
  };
  preserveScrollForDate: (dateStr: string) => void;
}

const MonthSection: React.FC<MonthSectionProps> = ({
  month,
  year,
  numberOfDays,
  scheduleHashMap,
  start,
  end,
  firstEventDate,
  lastEventDate,
  isStartCollapsed,
  isEndCollapsed,
  toggleCollapseStart,
  toggleCollapseEnd,
  shouldCollapseStart,
  shouldCollapseEnd,
  isDateCollapsed,
  unschedule,
  schedule,
  editProgram,
  canEdit = false,
  canSchedule = false,
  canBlock = false,
  canWish = false,
  canScheduleForOthers = false,
  canAddUnavailable = false,
  onEditTour,
  sx,
  preserveScrollForDate,
}) => {
  const { t } = useTranslation(["common", "projects"]);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEntireMonthCollapsedStart =
    isStartCollapsed &&
    firstEventDate &&
    ((subDays(
      new Date(firstEventDate),
      DAYS_BEFORE_EVENT_FOR_BUTTON
    ).getMonth() > month &&
      subDays(
        new Date(firstEventDate),
        DAYS_BEFORE_EVENT_FOR_BUTTON
      ).getFullYear() === year) ||
      subDays(
        new Date(firstEventDate),
        DAYS_BEFORE_EVENT_FOR_BUTTON
      ).getFullYear() > year);

  const isEntireMonthCollapsedEnd =
    isEndCollapsed &&
    lastEventDate &&
    ((addDays(new Date(lastEventDate), DAYS_AFTER_EVENT_FOR_BUTTON).getMonth() <
      month &&
      addDays(
        new Date(lastEventDate),
        DAYS_AFTER_EVENT_FOR_BUTTON
      ).getFullYear() === year) ||
      addDays(
        new Date(lastEventDate),
        DAYS_AFTER_EVENT_FOR_BUTTON
      ).getFullYear() < year) &&
    // Never skip the month that contains the tour end so the end of the planning always shows
    !(end.getMonth() === month && end.getFullYear() === year);

  // Skip rendering the entire month if it should be collapsed
  if (isEntireMonthCollapsedStart || isEntireMonthCollapsedEnd) {
    return null;
  }

  // Calculate the button positions for this month
  let startButtonDay: number | null = null;
  let endButtonDay: number | null = null;

  if (shouldCollapseStart && firstEventDate) {
    const buttonDate = subDays(
      new Date(firstEventDate),
      DAYS_BEFORE_EVENT_FOR_BUTTON
    );
    if (buttonDate.getMonth() === month && buttonDate.getFullYear() === year) {
      startButtonDay = buttonDate.getDate();
    }
  }

  if (shouldCollapseEnd && lastEventDate) {
    const buttonDate = addDays(
      new Date(lastEventDate),
      DAYS_AFTER_EVENT_FOR_BUTTON
    );
    if (buttonDate.getMonth() === month && buttonDate.getFullYear() === year) {
      endButtonDay = buttonDate.getDate();
    }
  }

  // Get the first displayed date (first day of the first month in the planning)
  const firstDisplayedDate = new Date(year, month, 1);

  // Get the last displayed date (last day of the last month in the planning)
  const lastDisplayedDate = new Date(year, month + 1, 0);

  return (
    <Container>
      <MonthTitle style={sx?.MonthTitle} mobile={mobile}>
        {t(`common:months.${month}`)} {year}
      </MonthTitle>
      <MonthContainer mobile={mobile}>
        <Month>
          <MonthHead style={sx?.TableHeader} mobile={mobile}>
            <tr>
              <th>{t("projects:tours.planning.columns.date")}</th>
              <th>{t("projects:tours.planning.columns.day")}</th>
              <th>{t("projects:tours.planning.columns.planning")}</th>
              <th>{t("projects:tours.planning.columns.options")}</th>
            </tr>
          </MonthHead>
          <MonthBody>
            {Array(numberOfDays)
              .fill(null)
              .map((_, index) => {
                const day = index + 1;
                const date = new Date(Date.UTC(year, month, day));

                // Check if this is a button day
                const isStartButtonDay = startButtonDay === day;
                const isEndButtonDay = endButtonDay === day;

                // Generate start collapse button (appear ABOVE its day)
                if (isStartButtonDay) {
                  const hiddenDays = Math.abs(
                    differenceInDays(new Date(start), new Date(date))
                  );

                  // If date is collapsed, just show the button
                  if (isDateCollapsed(date)) {
                    return (
                      <CollapseButton
                        key={`start-button-${day}`}
                        isCollapsed={isStartCollapsed}
                        onClick={toggleCollapseStart}
                        hiddenDays={hiddenDays}
                        isStartCollapse={true}
                      />
                    );
                  }

                  // Get properties for the DayRow
                  const dayOfWeek = new Date(year, month, day).getDay();
                  const isOutsideTourRange =
                    isBefore(new Date(date), start) ||
                    isAfter(new Date(date), end);
                  const isTheDayBeforeStart = isSameDay(
                    new Date(date),
                    subDays(new Date(start), 1)
                  );
                  const isTheDayAfterEnd = isSameDay(
                    new Date(date),
                    addDays(new Date(end), 1)
                  );
                  const hasUnavailability =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.UNAVAILABLE
                    ]?.length > 0;
                  const hasBlocked =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.BLOCKED
                    ]?.length > 0;
                  const hasWished =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_WISHED
                    ]?.length > 0;

                  const hasPendingDates =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_PENDING
                    ]?.length > 0;

                  const hasConfirmedDates =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_CONFIRMED
                    ]?.length > 0;

                  // Render Start Button + Day Row
                  return (
                    <React.Fragment key={`day-${day}-with-start-button`}>
                      <CollapseButton
                        isCollapsed={isStartCollapsed}
                        onClick={toggleCollapseStart}
                        hiddenDays={hiddenDays}
                        isStartCollapse={true}
                      />
                      <DayRow
                        date={date}
                        day={day}
                        month={month}
                        year={year}
                        dayOfWeek={dayOfWeek}
                        isOutsideTourRange={isOutsideTourRange}
                        isTheDayBeforeStart={isTheDayBeforeStart}
                        isTheDayAfterEnd={isTheDayAfterEnd}
                        hasUnavailability={hasUnavailability}
                        hasBlocked={hasBlocked}
                        hasWished={hasWished}
                        hasConfirmedDates={hasConfirmedDates}
                        hasPendingDates={hasPendingDates}
                        scheduleHashMap={scheduleHashMap}
                        unschedule={unschedule}
                        schedule={schedule}
                        editProgram={editProgram}
                        canEdit={canEdit}
                        canSchedule={canSchedule}
                        canBlock={canBlock}
                        canWish={canWish}
                        canScheduleForOthers={canScheduleForOthers}
                        canAddUnavailable={canAddUnavailable}
                        onEditTour={onEditTour}
                        preserveScrollForDate={preserveScrollForDate}
                      />
                    </React.Fragment>
                  );
                } else {
                  // Skip rendering days that should be collapsed
                  if (isDateCollapsed(date)) return null;
                }

                // Check if this is an end button day
                if (isEndButtonDay) {
                  const hiddenDays = Math.abs(
                    differenceInDays(new Date(date), new Date(end))
                  );

                  // Get properties for the DayRow
                  const dayOfWeek = new Date(year, month, day).getDay();
                  const isOutsideTourRange =
                    isBefore(new Date(date), start) ||
                    isAfter(new Date(date), end);
                  const isTheDayBeforeStart = isSameDay(
                    new Date(date),
                    subDays(new Date(start), 1)
                  );
                  const isTheDayAfterEnd = isSameDay(
                    new Date(date),
                    addDays(new Date(end), 1)
                  );
                  const hasUnavailability =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.UNAVAILABLE
                    ]?.length > 0;
                  const hasBlocked =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.BLOCKED
                    ]?.length > 0;
                  const hasWished =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_WISHED
                    ]?.length > 0;

                  const hasPendingDates =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_PENDING
                    ]?.length > 0;

                  const hasConfirmedDates =
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_CONFIRMED
                    ]?.length > 0;

                  // Render Day Row + End Button
                  return (
                    <React.Fragment key={`day-${day}-with-end-button`}>
                      <DayRow
                        date={date}
                        day={day}
                        month={month}
                        year={year}
                        dayOfWeek={dayOfWeek}
                        isOutsideTourRange={isOutsideTourRange}
                        isTheDayBeforeStart={isTheDayBeforeStart}
                        isTheDayAfterEnd={isTheDayAfterEnd}
                        hasUnavailability={hasUnavailability}
                        hasBlocked={hasBlocked}
                        hasWished={hasWished}
                        hasConfirmedDates={hasConfirmedDates}
                        hasPendingDates={hasPendingDates}
                        scheduleHashMap={scheduleHashMap}
                        unschedule={unschedule}
                        schedule={schedule}
                        editProgram={editProgram}
                        canEdit={canEdit}
                        canSchedule={canSchedule}
                        canBlock={canBlock}
                        canWish={canWish}
                        canScheduleForOthers={canScheduleForOthers}
                        canAddUnavailable={canAddUnavailable}
                        onEditTour={onEditTour}
                        preserveScrollForDate={preserveScrollForDate}
                      />
                      <CollapseButton
                        isCollapsed={isEndCollapsed}
                        onClick={toggleCollapseEnd}
                        hiddenDays={hiddenDays}
                        isStartCollapse={false}
                      />
                    </React.Fragment>
                  );
                }

                // Regular day without collapse buttons
                const dayOfWeek = new Date(year, month, day).getDay();
                const isOutsideTourRange =
                  isBefore(new Date(date), start) ||
                  isAfter(new Date(date), end);
                const isTheDayBeforeStart = isSameDay(
                  new Date(date),
                  subDays(new Date(start), 1)
                );
                const isTheDayAfterEnd = isSameDay(
                  new Date(date),
                  addDays(new Date(end), 1)
                );
                const hasUnavailability =
                  scheduleHashMap[year]?.[month]?.[day]?.[
                    ProgramStatuses.UNAVAILABLE
                  ]?.length > 0;
                const hasBlocked =
                  scheduleHashMap[year]?.[month]?.[day]?.[
                    ProgramStatuses.BLOCKED
                  ]?.length > 0;
                const hasWished =
                  scheduleHashMap[year]?.[month]?.[day]?.[
                    ProgramStatuses.SHOW_WISHED
                  ]?.length > 0;

                const hasPendingDates =
                  scheduleHashMap[year]?.[month]?.[day]?.[
                    ProgramStatuses.SHOW_PENDING
                  ]?.length > 0;

                const hasConfirmedDates =
                  scheduleHashMap[year]?.[month]?.[day]?.[
                    ProgramStatuses.SHOW_CONFIRMED
                  ]?.length > 0;

                return (
                  <DayRow
                    key={day}
                    date={date}
                    day={day}
                    month={month}
                    year={year}
                    dayOfWeek={dayOfWeek}
                    isOutsideTourRange={isOutsideTourRange}
                    isTheDayBeforeStart={isTheDayBeforeStart}
                    isTheDayAfterEnd={isTheDayAfterEnd}
                    hasUnavailability={hasUnavailability}
                    hasBlocked={hasBlocked}
                    hasWished={hasWished}
                    hasConfirmedDates={hasConfirmedDates}
                    hasPendingDates={hasPendingDates}
                    scheduleHashMap={scheduleHashMap}
                    unschedule={unschedule}
                    schedule={schedule}
                    editProgram={editProgram}
                    canEdit={canEdit}
                    canSchedule={canSchedule}
                    canBlock={canBlock}
                    canWish={canWish}
                    canScheduleForOthers={canScheduleForOthers}
                    canAddUnavailable={canAddUnavailable}
                    onEditTour={onEditTour}
                    preserveScrollForDate={preserveScrollForDate}
                  />
                );
              })}
          </MonthBody>
        </Month>
      </MonthContainer>
    </Container>
  );
};

export default MonthSection;
