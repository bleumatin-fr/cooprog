import { Program, ProgramStatuses, Tour } from "@cooprog/core";
import { useMemo } from "react";
import {
  DEFAULT_TOUR_DURATION_MONTHS,
  COLLAPSE_THRESHOLD_DAYS,
  DAYS_BEFORE_EVENT_FOR_BUTTON,
  DAYS_AFTER_EVENT_FOR_BUTTON,
  ScheduleHashMap,
} from "./types";
import { getAllMonthsAndYearBetween } from "./utils";
import {
  addMonths,
  subDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  getYear,
  getMonth,
  getDate,
  isBefore,
  isAfter,
  isSameDay,
  lastDayOfMonth,
  isValid,
  parseISO,
  getDaysInMonth,
} from "date-fns";

interface UsePlanningDataProps {
  tour: Partial<Tour>;
}

interface UsePlanningDataReturn {
  scheduleHashMap: ScheduleHashMap;
  start: Date | null;
  end: Date | null;
  firstEventDate: Date | null;
  lastEventDate: Date | null;
  shouldCollapseStart: boolean;
  shouldCollapseEnd: boolean;
  months: ReturnType<typeof getAllMonthsAndYearBetween>;
}

export const usePlanningData = ({
  tour,
}: UsePlanningDataProps): UsePlanningDataReturn => {
  // Create schedule hash map for fast lookups
  const scheduleHashMap = useMemo(() => {
    const hashMap: ScheduleHashMap = {};

    tour.schedule?.forEach((program) => {
      const date = new Date(program.date);

      if (!hashMap[date.getFullYear()]) {
        hashMap[date.getFullYear()] = {};
      }

      if (!hashMap[date.getFullYear()][date.getMonth()]) {
        hashMap[date.getFullYear()][date.getMonth()] = {};
      }

      if (!hashMap[date.getFullYear()][date.getMonth()][date.getDate()]) {
        hashMap[date.getFullYear()][date.getMonth()][date.getDate()] = {};
      }

      if (
        !hashMap[date.getFullYear()][date.getMonth()][date.getDate()][
          program.status
        ]
      ) {
        hashMap[date.getFullYear()][date.getMonth()][date.getDate()][
          program.status
        ] = [];
      }

      hashMap[date.getFullYear()][date.getMonth()][date.getDate()][
        program.status
      ].push(program);
    });

    return hashMap;
  }, [tour.schedule]);

  // Calculate start and end dates
  const start = useMemo(
    () => (tour.start ? new Date(tour.start) : null),
    [tour.start]
  );

  const end = useMemo(
    () =>
      tour.end
        ? new Date(tour.end)
        : start
        ? subDays(addMonths(start, DEFAULT_TOUR_DURATION_MONTHS), 1)
        : null,
    [tour.end, start]
  );

  // Find first and last event dates
  const firstEventDate = useMemo(() => {
    if (!tour.schedule || tour.schedule.length === 0 || !start) return null;

    let earliestDate: Date | null = null;

    tour.schedule.forEach((program) => {
      const date = new Date(program.date);
      // Skip unavailable dates when finding first event
      if (program.status === ProgramStatuses.UNAVAILABLE) return;

      if (!earliestDate || date < earliestDate) {
        earliestDate = date;
      }
    });

    return earliestDate;
  }, [tour.schedule, start]);

  const lastEventDate = useMemo(() => {
    if (!tour.schedule || tour.schedule.length === 0 || !end) return null;

    let latestDate: Date | null = null;

    tour.schedule.forEach((program) => {
      const date = new Date(program.date);
      // Skip unavailable dates when finding last event
      if (program.status === ProgramStatuses.UNAVAILABLE) return;

      if (!latestDate || date > latestDate) {
        latestDate = date;
      }
    });

    return latestDate;
  }, [tour.schedule, end]);

  // Determine if collapsing is needed
  const shouldCollapseStart = useMemo(() => {
    if (!start || !firstEventDate) return false;

    // Get the first displayed date (first day of the first month in the planning)
    const firstDisplayedDate = startOfMonth(start);

    const daysDifference = differenceInDays(firstEventDate, firstDisplayedDate);
    return daysDifference >= COLLAPSE_THRESHOLD_DAYS;
  }, [start, firstEventDate]);

  const shouldCollapseEnd = useMemo(() => {
    if (!end || !lastEventDate) return false;

    // Get the last displayed date (last day of the last month in the planning)
    const lastDisplayedDate = endOfMonth(end);

    const daysDifference = differenceInDays(lastDisplayedDate, lastEventDate);
    return daysDifference >= COLLAPSE_THRESHOLD_DAYS;
  }, [end, lastEventDate]);

  // Get all months between start and end
  const months = useMemo(() => {
    if (!start || !end) return [];
    return getAllMonthsAndYearBetween(start, end);
  }, [start, end]);

  return {
    scheduleHashMap,
    start,
    end,
    firstEventDate,
    lastEventDate,
    shouldCollapseStart,
    shouldCollapseEnd,
    months,
  };
};
