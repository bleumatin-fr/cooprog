import Block from "../layout/Block";
import useUser from "../authentication/useUser";
import ProjectCard from "../projects/ProjectCard";
import TitleWithIcon from "../UI/TitleWithIcon";
import { useTranslation } from "next-i18next";
import styled from "@emotion/styled";
import { Program, ProgramStatuses, Project, Tour } from "@cooprog/core";
import {
  ArrowForward,
  ArrowBack,
  CalendarMonthOutlined,
} from "@mui/icons-material";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Calendar, CalendarLegend } from "./Calendar";
import { Button, ButtonGroup, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import { CalendarIcon } from "@mui/x-date-pickers/icons";
import { getWeek, startOfWeek, endOfWeek } from "date-fns";

const GridAndCalendarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
`;

const CalendarContainer = styled.div`
  height: calc(100vh - 174px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  color: white;
  position: sticky;
  top: 174px;
  gap: 16px;
  width: 500px;

  @media (max-height: 800px) {
    width: 300px;

    > div > div:nth-child(2) {
      height: 300px;
      font-size: 10px;
    }
  }
  @media (min-height: 801px) and (max-height: 900px) {
    width: 400px;

    > div > div:nth-child(2) {
      height: 400px;
    }
  }
`;

const ButtonGroupContainer = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 16px;
  justify-content: flex-end;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const GridContainer = styled.div`
  padding: 24px 0;
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 16px 0;
  gap: 16px;

  > a {
    padding-left: 0;
  }
`;

const MonthContainer = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  scroll-margin-top: 100px;
  margin: 40px 0;
  ${({ mobile }) => !mobile && `min-height: 500px;`}
`;

const MonthTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
`;

const MonthSubtitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-gray);
  font-style: italic;
`;

const TimelineSeparator = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 0;
  margin: 16px 0;
  color: #333;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #333;
    opacity: 0.5;
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`;

const TimelineDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #333;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #333;
    opacity: 0.5;
  }

  &::before {
    left: -16px;
  }

  &::after {
    right: -16px;
  }
`;

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  display: string;
  backgroundColor: string;
  extendedProps: {
    id: string;
    project: Project;
    tour: Tour;
    program: Program;
  };
};

/** Same project is implied by grouping; this compares place (location). */
const isSamePlace = (a: Program, b: Program): boolean => {
  const locA = a.location;
  const locB = b.location;
  if (!locA || !locB) return false;
  if (locA.address && locB.address && locA.address === locB.address)
    return true;
  const coordsA = locA.geolocation?.coordinates;
  const coordsB = locB.geolocation?.coordinates;
  if (
    coordsA?.length >= 2 &&
    coordsB?.length >= 2 &&
    coordsA[0] === coordsB[0] &&
    coordsA[1] === coordsB[1]
  )
    return true;
  const cityA =
    locA.data?.city ?? locA.data?.municipality ?? locA.data?.village;
  const cityB =
    locB.data?.city ?? locB.data?.municipality ?? locB.data?.village;
  if (cityA && cityB && cityA === cityB && locA.address === locB.address)
    return true;
  return false;
};

const ScheduledProjectsCalendar = ({
  scheduledProjectsGroupedByMonth,
  scheduledProjectsGroupedByWeek,
  viewMode = "month",
  renderProjectCard = (
    project: Project,
    tour: Tour,
    month: number,
    year: number
  ) => <ProjectCard key={project._id} project={project} tour={tour} />,
  getEventTitle = (project: Project, program: Program) =>
    !!project.work ? `${project.artist} · ${project.work}` : project.artist,
  filterProgramsByUser = true,
}: {
  scheduledProjectsGroupedByMonth: Record<
    string,
    { project: Project; tour: Tour }[]
  >;
  scheduledProjectsGroupedByWeek?: Record<
    string,
    { project: Project; tour: Tour }[]
  >;
  viewMode?: "month" | "week";
  renderProjectCard?: (
    project: Project,
    tour: Tour,
    month: number,
    year: number
  ) => React.ReactNode;
  getEventTitle?: (project: Project, program: Program) => string;
  filterProgramsByUser?: boolean;
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<string | null>(null);
  const [highlightedEventIds, setHighlightedEventIds] = useState<string[]>([]);
  const observers = useRef<Map<string, IntersectionObserver>>(new Map());
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleEventHover = useCallback((event: CalendarEvent) => {
    setHighlightedEventIds([event.id]);
  }, []);

  const clearHover = useCallback(() => {
    setHighlightedEventIds([]);
  }, []);

  const events = useMemo(() => {
    if (viewMode === "month") {
      if (!activeMonth || !scheduledProjectsGroupedByMonth[activeMonth])
        return [];

      const [year, monthIndex] = activeMonth.split("-");
      const month = parseInt(monthIndex);

      // First, collect all programs for each project-tour combination
      const projectTourPrograms = new Map<
        string,
        { project: Project; tour: Tour; dates: Date[]; programs: Program[] }
      >();

      scheduledProjectsGroupedByMonth[activeMonth].forEach(
        ({ project, tour }) => {
          // First filter by user and status
          const userPrograms = tour.schedule?.filter((s) => {
            const matchesUser = filterProgramsByUser
              ? s.user?._id === user?._id
              : true;
            const matchesStatus = [
              ProgramStatuses.SHOW_CONFIRMED,
              ProgramStatuses.SHOW_PENDING,
            ].includes(s.status);
            const matchesDate =
              new Date(s.date).getUTCMonth() === month &&
              new Date(s.date).getUTCFullYear() === parseInt(year);

            return matchesUser && matchesStatus && matchesDate;
          });

          if (!userPrograms || userPrograms.length === 0) return;

          // Sort programs by date
          const sortedPrograms = userPrograms
            .map((s) => ({
              program: s,
              date: new Date(s.date),
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

          const key = `${project._id}-${tour._id}`;
          projectTourPrograms.set(key, {
            project,
            tour,
            dates: sortedPrograms.map((p) => p.date),
            programs: sortedPrograms.map((p) => p.program),
          });
        }
      );

      // Merge consecutive dates only when same project and same place (and same status)
      const mergedEvents = Array.from(projectTourPrograms.entries()).flatMap(
        ([key, { project, tour, dates, programs }]) => {
          const events: CalendarEvent[] = [];
          let currentEvent: {
            start: Date;
            end: Date;
            status: ProgramStatuses;
            program: Program;
          } | null = null;

          dates.forEach((date, index) => {
            const program = programs[index];
            if (!program) return;

            if (!currentEvent) {
              currentEvent = {
                start: date,
                end: date,
                status: program.status,
                program: program,
              };
            } else {
              const prevDate = new Date(currentEvent.end);
              prevDate.setDate(prevDate.getDate() + 1);
              const consecutive =
                prevDate.getTime() === date.getTime();
              const sameStatus = currentEvent.status === program.status;
              const samePlace = isSamePlace(currentEvent.program, program);

              if (consecutive && sameStatus && samePlace) {
                currentEvent.end = date;
              } else {
                events.push({
                  id: `${key}-${events.length}`,
                  title: getEventTitle(project, currentEvent.program),
                  start: currentEvent.start,
                  end: currentEvent.end,
                  display: "block",
                  backgroundColor:
                    currentEvent.status === ProgramStatuses.SHOW_CONFIRMED
                      ? "var(--confirmed-background-color)"
                      : "var(--pending-background-color)",
                  extendedProps: {
                    id: `${key}-${events.length}`,
                    project,
                    tour,
                    program: currentEvent.program,
                  },
                });
                currentEvent = {
                  start: date,
                  end: date,
                  status: program.status,
                  program: program,
                };
              }
            }

            if (index === dates.length - 1 && currentEvent) {
              events.push({
                id: `${key}-${events.length}`,
                title: getEventTitle(project, currentEvent.program),
                start: currentEvent.start,
                end: currentEvent.end,
                display: "block",
                backgroundColor:
                  currentEvent.status === ProgramStatuses.SHOW_CONFIRMED
                    ? "var(--confirmed-background-color)"
                    : "var(--pending-background-color)",
                extendedProps: {
                  id: `${key}-${events.length}`,
                  project,
                  tour,
                  program: currentEvent.program,
                },
              });
            }
          });

          return events;
        }
      );

      return mergedEvents;
    } else {
      // Week view logic
      if (!activeWeek || !scheduledProjectsGroupedByWeek?.[activeWeek])
        return [];

      const [year, weekStr] = activeWeek.split("-W");
      const week = parseInt(weekStr);

      // First, collect all programs for each project-tour combination
      const projectTourPrograms = new Map<
        string,
        { project: Project; tour: Tour; dates: Date[]; programs: Program[] }
      >();

      scheduledProjectsGroupedByWeek[activeWeek].forEach(
        ({ project, tour }) => {
          // First filter by user and status
          const userPrograms = tour.schedule?.filter((s) => {
            const matchesUser = filterProgramsByUser
              ? s.user?._id === user?._id
              : true;
            const matchesStatus = [
              ProgramStatuses.SHOW_CONFIRMED,
              ProgramStatuses.SHOW_PENDING,
            ].includes(s.status);
            const programDate = new Date(s.date);
            const programWeek = getWeek(programDate, { weekStartsOn: 1 });
            const matchesDate =
              programWeek === week &&
              programDate.getUTCFullYear() === parseInt(year);

            return matchesUser && matchesStatus && matchesDate;
          });

          if (!userPrograms || userPrograms.length === 0) return;

          // Sort programs by date
          const sortedPrograms = userPrograms
            .map((s) => ({
              program: s,
              date: new Date(s.date),
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

          const key = `${project._id}-${tour._id}`;
          projectTourPrograms.set(key, {
            project,
            tour,
            dates: sortedPrograms.map((p) => p.date),
            programs: sortedPrograms.map((p) => p.program),
          });
        }
      );

      // Merge consecutive dates only when same project and same place (and same status)
      const mergedEvents = Array.from(projectTourPrograms.entries()).flatMap(
        ([key, { project, tour, dates, programs }]) => {
          const events: CalendarEvent[] = [];
          let currentEvent: {
            start: Date;
            end: Date;
            status: ProgramStatuses;
            program: Program;
          } | null = null;

          dates.forEach((date, index) => {
            const program = programs[index];
            if (!program) return;

            if (!currentEvent) {
              currentEvent = {
                start: date,
                end: date,
                status: program.status,
                program: program,
              };
            } else {
              const prevDate = new Date(currentEvent.end);
              prevDate.setDate(prevDate.getDate() + 1);
              const consecutive =
                prevDate.getTime() === date.getTime();
              const sameStatus = currentEvent.status === program.status;
              const samePlace = isSamePlace(currentEvent.program, program);

              if (consecutive && sameStatus && samePlace) {
                currentEvent.end = date;
              } else {
                events.push({
                  id: `${key}-${events.length}`,
                  title: getEventTitle(project, currentEvent.program),
                  start: currentEvent.start,
                  end: currentEvent.end,
                  display: "block",
                  backgroundColor:
                    currentEvent.status === ProgramStatuses.SHOW_CONFIRMED
                      ? "var(--confirmed-background-color)"
                      : "var(--pending-background-color)",
                  extendedProps: {
                    id: `${key}-${events.length}`,
                    project,
                    tour,
                    program: currentEvent.program,
                  },
                });
                currentEvent = {
                  start: date,
                  end: date,
                  status: program.status,
                  program: program,
                };
              }
            }

            if (index === dates.length - 1 && currentEvent) {
              events.push({
                id: `${key}-${events.length}`,
                title: getEventTitle(project, currentEvent.program),
                start: currentEvent.start,
                end: currentEvent.end,
                display: "block",
                backgroundColor:
                  currentEvent.status === ProgramStatuses.SHOW_CONFIRMED
                    ? "var(--confirmed-background-color)"
                    : "var(--pending-background-color)",
                extendedProps: {
                  id: `${key}-${events.length}`,
                  project,
                  tour,
                  program: currentEvent.program,
                },
              });
            }
          });

          return events;
        }
      );

      return mergedEvents;
    }
  }, [
    activeMonth,
    activeWeek,
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    user?._id,
    viewMode,
  ]);

  useEffect(() => {
    // Create observers for each month/week
    const dataToObserve =
      viewMode === "month"
        ? scheduledProjectsGroupedByMonth
        : scheduledProjectsGroupedByWeek || {};

    Object.keys(dataToObserve).forEach((period) => {
      const element = document.querySelector(`[data-${viewMode}="${period}"]`);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const periodValue = entry.target.getAttribute(
                  `data-${viewMode}`
                );
                if (periodValue) {
                  if (viewMode === "month") {
                    setActiveMonth(periodValue);
                  } else {
                    setActiveWeek(periodValue);
                  }
                }
              }
            });
          },
          {
            root: null,
            rootMargin: "-40% 0px -40% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1],
          }
        );
        observer.observe(element);
        observers.current.set(period, observer);
      }
    });

    // Cleanup function
    return () => {
      observers.current.forEach((observer) => observer.disconnect());
      observers.current.clear();
    };
  }, [
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    viewMode,
  ]);

  const hasPreviousPeriod = useMemo(() => {
    const data =
      viewMode === "month"
        ? scheduledProjectsGroupedByMonth
        : scheduledProjectsGroupedByWeek || {};

    if (!data) return false;

    const activePeriod = viewMode === "month" ? activeMonth : activeWeek;
    if (!activePeriod) return false;

    const sortedPeriods = Object.keys(data).sort((a, b) => {
      if (viewMode === "month") {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      } else {
        const [yearA, weekStrA] = a.split("-W");
        const [yearB, weekStrB] = b.split("-W");
        const weekA = parseInt(weekStrA);
        const weekB = parseInt(weekStrB);
        return yearA === yearB
          ? weekA - weekB
          : parseInt(yearA) - parseInt(yearB);
      }
    });

    const currentIndex = sortedPeriods.indexOf(activePeriod);
    return currentIndex > 0;
  }, [
    activeMonth,
    activeWeek,
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    viewMode,
  ]);

  const hasNextPeriod = useMemo(() => {
    const data =
      viewMode === "month"
        ? scheduledProjectsGroupedByMonth
        : scheduledProjectsGroupedByWeek || {};

    if (!data) return false;

    const activePeriod = viewMode === "month" ? activeMonth : activeWeek;
    if (!activePeriod) return false;

    const sortedPeriods = Object.keys(data).sort((a, b) => {
      if (viewMode === "month") {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      } else {
        const [yearA, weekStrA] = a.split("-W");
        const [yearB, weekStrB] = b.split("-W");
        const weekA = parseInt(weekStrA);
        const weekB = parseInt(weekStrB);
        return yearA === yearB
          ? weekA - weekB
          : parseInt(yearA) - parseInt(yearB);
      }
    });

    const currentIndex = sortedPeriods.indexOf(activePeriod);
    return currentIndex < sortedPeriods.length - 1;
  }, [
    activeMonth,
    activeWeek,
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    viewMode,
  ]);

  const navigateToPreviousPeriod = useCallback(() => {
    const data =
      viewMode === "month"
        ? scheduledProjectsGroupedByMonth
        : scheduledProjectsGroupedByWeek || {};

    if (!data) return;

    const activePeriod = viewMode === "month" ? activeMonth : activeWeek;
    if (!activePeriod) return;

    const sortedPeriods = Object.keys(data).sort((a, b) => {
      if (viewMode === "month") {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      } else {
        const [yearA, weekStrA] = a.split("-W");
        const [yearB, weekStrB] = b.split("-W");
        const weekA = parseInt(weekStrA);
        const weekB = parseInt(weekStrB);
        return yearA === yearB
          ? weekA - weekB
          : parseInt(yearA) - parseInt(yearB);
      }
    });

    const currentIndex = sortedPeriods.indexOf(activePeriod);
    if (currentIndex > 0) {
      const newPeriod = sortedPeriods[currentIndex - 1];
      if (viewMode === "month") {
        setActiveMonth(newPeriod);
      } else {
        setActiveWeek(newPeriod);
      }

      // Scroll to the new period
      setTimeout(() => {
        const element = document.querySelector(
          `[data-${viewMode}="${newPeriod}"]`
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 0);
    }
  }, [
    activeMonth,
    activeWeek,
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    viewMode,
  ]);

  const navigateToNextPeriod = useCallback(() => {
    const data =
      viewMode === "month"
        ? scheduledProjectsGroupedByMonth
        : scheduledProjectsGroupedByWeek || {};

    if (!data) return;

    const activePeriod = viewMode === "month" ? activeMonth : activeWeek;
    if (!activePeriod) return;

    const sortedPeriods = Object.keys(data).sort((a, b) => {
      if (viewMode === "month") {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      } else {
        const [yearA, weekStrA] = a.split("-W");
        const [yearB, weekStrB] = b.split("-W");
        const weekA = parseInt(weekStrA);
        const weekB = parseInt(weekStrB);
        return yearA === yearB
          ? weekA - weekB
          : parseInt(yearA) - parseInt(yearB);
      }
    });

    const currentIndex = sortedPeriods.indexOf(activePeriod);
    if (currentIndex < sortedPeriods.length - 1) {
      const newPeriod = sortedPeriods[currentIndex + 1];
      if (viewMode === "month") {
        setActiveMonth(newPeriod);
      } else {
        setActiveWeek(newPeriod);
      }

      // Scroll to the new period
      setTimeout(() => {
        const element = document.querySelector(
          `[data-${viewMode}="${newPeriod}"]`
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 0);
    }
  }, [
    activeMonth,
    activeWeek,
    scheduledProjectsGroupedByMonth,
    scheduledProjectsGroupedByWeek,
    viewMode,
  ]);

  const focusDate = useMemo(() => {
    if (viewMode === "month") {
      if (!activeMonth) return null;
      const [year, monthIndex] = activeMonth.split("-");
      const month = parseInt(monthIndex);
      return new Date(parseInt(year), month, 1);
    } else {
      if (!activeWeek) return null;
      const [year, weekStr] = activeWeek.split("-W");
      const week = parseInt(weekStr);
      // Get the first day of the week
      const firstDayOfYear = new Date(parseInt(year), 0, 1);
      const daysToAdd = (week - 1) * 7 + (1 - firstDayOfYear.getDay());
      return new Date(parseInt(year), 0, 1 + daysToAdd);
    }
  }, [activeMonth, activeWeek, viewMode]);

  return (
    <Block style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
      <TitleWithIcon
        title={t("home:venue_dashboard.scheduled_projects.title")}
        icon={CalendarMonthOutlined}
      />
      <ListContainer>
        <div style={{ flexGrow: 1, paddingBottom: "400px" }}>
          {viewMode === "month"
            ? // Month view
              scheduledProjectsGroupedByMonth &&
              Object.keys(scheduledProjectsGroupedByMonth).length > 0 && (
                <>
                  {Object.keys(scheduledProjectsGroupedByMonth)
                    .sort((a, b) => {
                      const [yearA, monthA] = a.split("-").map(Number);
                      const [yearB, monthB] = b.split("-").map(Number);
                      return yearA === yearB ? monthA - monthB : yearA - yearB;
                    })
                    .map((month, index) => {
                      const [year, monthIndex] = month.split("-");
                      const previousMonthExists =
                        scheduledProjectsGroupedByMonth[
                          `${year}-${parseInt(monthIndex) - 1}`
                        ] !== undefined;
                      return (
                        <MonthContainer
                          key={month}
                          data-month={month}
                          mobile={mobile}
                        >
                          {!previousMonthExists && index > 0 && (
                            <TimelineSeparator>
                              <TimelineDot />
                            </TimelineSeparator>
                          )}
                          <MonthTitle
                            style={{
                              opacity: activeMonth === month ? 1 : 0.3,
                              transition: "opacity 0.3s ease-in-out",
                            }}
                          >
                            {t(`common:months.${monthIndex}`) + " " + year}
                          </MonthTitle>
                          <GridAndCalendarContainer
                            style={{
                              opacity: activeMonth === month ? 1 : 0.3,
                              transition: "opacity 0.3s ease-in-out",
                            }}
                          >
                            <GridContainer>
                              {scheduledProjectsGroupedByMonth[month].map(
                                ({ project, tour }) =>
                                  renderProjectCard(
                                    project,
                                    tour,
                                    parseInt(monthIndex),
                                    parseInt(year)
                                  )
                              )}
                            </GridContainer>
                          </GridAndCalendarContainer>
                        </MonthContainer>
                      );
                    })}
                </>
              )
            : // Week view
              scheduledProjectsGroupedByWeek &&
              Object.keys(scheduledProjectsGroupedByWeek).length > 0 && (
                <>
                  {Object.keys(scheduledProjectsGroupedByWeek)
                    .sort((a, b) => {
                      const [yearA, weekStrA] = a.split("-W");
                      const [yearB, weekStrB] = b.split("-W");
                      const weekA = parseInt(weekStrA);
                      const weekB = parseInt(weekStrB);
                      return yearA === yearB
                        ? weekA - weekB
                        : parseInt(yearA) - parseInt(yearB);
                    })
                    .map((week, index) => {
                      const [year, weekStr] = week.split("-W");

                      // Use date-fns to calculate week start and end dates
                      const weekNum = parseInt(weekStr);
                      const yearNum = parseInt(year);

                      // Create a date in the target week (using the first day of the year as base)
                      const baseDate = new Date(yearNum, 0, 1);
                      const targetWeekDate = new Date(baseDate);
                      targetWeekDate.setDate(
                        baseDate.getDate() + (weekNum - 1) * 7
                      );

                      const weekStartDate = startOfWeek(targetWeekDate, {
                        weekStartsOn: 1,
                      });
                      const weekEndDate = endOfWeek(targetWeekDate, {
                        weekStartsOn: 1,
                      });

                      const previousWeekExists =
                        scheduledProjectsGroupedByWeek[
                          `${year}-W${(weekNum - 1)
                            .toString()
                            .padStart(2, "0")}`
                        ] !== undefined;
                      return (
                        <MonthContainer
                          key={week}
                          data-week={week}
                          mobile={mobile}
                        >
                          {!previousWeekExists && index > 0 && (
                            <TimelineSeparator>
                              <TimelineDot />
                            </TimelineSeparator>
                          )}
                          <MonthTitle
                            style={{
                              opacity: activeWeek === week ? 1 : 0.3,
                              transition: "opacity 0.3s ease-in-out",
                            }}
                          >
                            {t("common:week")} {weekNum} -{" "}
                            {t(`common:months.${weekStartDate.getMonth()}`)}{" "}
                            {year}
                          </MonthTitle>
                          <MonthSubtitle>
                            {weekStartDate.toLocaleDateString()} -{" "}
                            {weekEndDate.toLocaleDateString()}
                          </MonthSubtitle>
                          <GridAndCalendarContainer
                            style={{
                              opacity: activeWeek === week ? 1 : 0.3,
                              transition: "opacity 0.3s ease-in-out",
                            }}
                          >
                            <GridContainer>
                              {scheduledProjectsGroupedByWeek[week].map(
                                ({ project, tour }) =>
                                  renderProjectCard(
                                    project,
                                    tour,
                                    0,
                                    parseInt(year)
                                  )
                              )}
                            </GridContainer>
                          </GridAndCalendarContainer>
                        </MonthContainer>
                      );
                    })}
                </>
              )}
        </div>
        {focusDate && !mobile && (
          <CalendarContainer>
            <div>
              <ButtonGroupContainer>
                <ButtonGroup
                  variant="text"
                  size="small"
                  sx={{
                    border: "1px solid var(--color-light-gray)",
                    borderRadius: "4px",
                    "& .MuiButton-root": {
                      color: "#999",
                      backgroundColor: "transparent",
                      borderColor: "var(--color-light-gray)",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        color: "#333",
                      },
                      "&.Mui-disabled": {
                        color: "#ccc",
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "#ccc",
                        },
                      },
                    },
                  }}
                >
                  <Button
                    onClick={navigateToPreviousPeriod}
                    disabled={!hasPreviousPeriod}
                  >
                    <ArrowBack />
                  </Button>
                  <Button
                    onClick={navigateToNextPeriod}
                    disabled={!hasNextPeriod}
                  >
                    <ArrowForward />
                  </Button>
                </ButtonGroup>
              </ButtonGroupContainer>
              <Calendar
                events={events}
                onEventClick={(info) => {
                  const projectId = info.event.extendedProps?.project?._id;
                  if (projectId) {
                    window.location.href = `/projects/${projectId}`;
                  }
                }}
                focusDate={focusDate}
                highlightedEventIds={highlightedEventIds}
                onEventHover={handleEventHover}
                onEventLeave={clearHover}
                viewMode={viewMode}
              />
              <CalendarLegend />
            </div>
          </CalendarContainer>
        )}
      </ListContainer>
    </Block>
  );
};

export default ScheduledProjectsCalendar;
