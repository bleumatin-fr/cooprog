import { i18n } from "i18next";

const concatAllDaysBetweenTwoDates = (start: Date, end: Date, i18n: i18n) => {
  const days = [];
  for (
    let d = new Date(start);
    d <= new Date(end);
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d).getDate());
  }
  if (days.length > 3)
    return i18n.t("projects:card.dates", {
      start: days[0].toString(),
      end: days[days.length - 1].toString(),
    });
  // return `From ${} to ${days[days.length - 1].toString()}`;

  return days.join(", ");
};

const groupConsecutiveDates = (dates: Date[]): Date[][] => {
  if (dates.length === 0) return [];

  // Sort dates
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const groups: Date[][] = [];
  let currentGroup: Date[] = [sortedDates[0]];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const previousDate = sortedDates[i - 1];

    // Check if dates are consecutive
    const diffTime = currentDate.getTime() - previousDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentGroup.push(currentDate);
    } else {
      groups.push([...currentGroup]);
      currentGroup = [currentDate];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};

const formatDateGroup = (group: Date[], i18n: i18n): string => {
  if (group.length === 1) {
    return group[0].getDate().toString();
  }

  const month = group[0].toLocaleString(i18n.language, { month: "long" });
  const year = group[0].getUTCFullYear();

  if (group.length === 2) {
    return `${group[0].getDate()}, ${group[1].getDate()}`;
  }

  return `${group[0].getDate()} - ${group[group.length - 1].getDate()}`;
};

export const humanizeMultipleDates = (dates: Date[], i18n: i18n) => {
  if (dates.length === 0) return "";

  // Ensure all dates are in the same month
  const firstDate = dates[0];
  const month = firstDate.getUTCMonth();
  const year = firstDate.getUTCFullYear();

  if (
    !dates.every(
      (date) => date.getUTCMonth() === month && date.getUTCFullYear() === year
    )
  ) {
    return dates.map((date) => humanizeDateRange(date, null, i18n)).join(", ");
  }

  const groups = groupConsecutiveDates(dates);
  const monthStr = firstDate.toLocaleString(i18n.language, { month: "long" });
  const yearStr = year.toString();

  const formattedGroups = groups.map((group) => formatDateGroup(group, i18n));
  return `${formattedGroups.join(", ")} ${monthStr} ${yearStr}`;
};

const humanizeDateRange = (
  start: Date,
  end: Date | null | undefined,
  i18n: i18n
) => {
  if (!end) {
    return new Date(start).toLocaleString(i18n.language, {
      month: "long",
    });
  }
  const startMonth = new Date(start).toLocaleString(i18n.language, {
    month: "long",
  });
  const endMonth = new Date(end).toLocaleString(i18n.language, {
    month: "long",
  });
  const startYear = new Date(start).getUTCFullYear();
  const endYear = new Date(end).getUTCFullYear();
  const days = concatAllDaysBetweenTwoDates(start, end, i18n);
  if (startMonth === endMonth && startYear === endYear) {
    return `${days} ${startMonth} ${startYear}`;
  } else if (startYear === endYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  } else {
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }
};

export default humanizeDateRange;
