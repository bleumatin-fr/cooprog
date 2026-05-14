import { MonthData } from "./types";
import {
  addMonths,
  isBefore,
  isEqual,
  getMonth,
  getYear,
  getDaysInMonth,
} from "date-fns";

/**
 * Get all months and years between two dates
 */
export const getAllMonthsAndYearBetween = (
  start: Date,
  end: Date
): MonthData[] => {
  const months: MonthData[] = [];
  let current = new Date(start);

  // Continue while current is before or equal to end (by month)
  while (
    getYear(current) < getYear(end) ||
    (getYear(current) === getYear(end) && getMonth(current) <= getMonth(end))
  ) {
    months.push({
      month: getMonth(current),
      year: getYear(current),
      numberOfDays: getDaysInMonth(current),
    });
    current = addMonths(current, 1);
  }

  return months;
};
