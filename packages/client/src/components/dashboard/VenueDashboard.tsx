import { useEffect, useMemo, useState } from "react";
import { Discipline, ProgramStatuses, Project, Tour } from "@cooprog/core";
import ProjectsWithInterestBlock from "./ProjectsWithInterestBlock";
import useUser from "../authentication/useUser";
import useProjects from "../projects/useProjects";
import useDiscipline, { colors } from "../layout/useDiscipline";
import DisciplineSelector from "../projects/DisciplineSelector";
import ScheduledProjectsCalendar from "./ScheduledProjectsCalendar";
import { useMediaQuery, useTheme, Button, ButtonGroup } from "@mui/material";
import { CalendarMonthOutlined, ViewWeekOutlined } from "@mui/icons-material";
import { useScrollPersistence } from "./hooks/useScrollPersistence";
import styled from "@emotion/styled";
import EmptyDashboard from "./EmptyDashboard";
import { useTranslation } from "next-i18next";
import { getWeek } from "date-fns";
import { useLocalStorage } from "usehooks-ts";

const FilterContainer = styled.div`
  z-index: 10;
  position: sticky;
  top: 52px;
  @media (min-width: 600px) {
    top: 64px;
  }
  background-color: var(--content-background-color);

  > div:first-child {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
    padding: 16px 0;
  }
`;

const FakeTopBorder = styled.div`
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  height: 16px;
`;

const VenueDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [disciplines, setSelectedDisciplines] = useState<Discipline[]>([
    Discipline.PERFORMING_ARTS,
    Discipline.MUSIC,
  ]);
  const [viewMode, setViewMode] = useLocalStorage<"month" | "week">(
    "venueDashboardViewMode",
    "month",
  );
  useScrollPersistence("venueDashboardScrollY");

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));

  const { projects: projectsWithInterest } = useProjects({
    userId: user?._id,
    sort: "minDate",
    interestOnly: true,
    disciplines: disciplines,
  });

  const { projects: scheduledProjects } = useProjects({
    userId: user?._id,
    sort: "minDate",
    upcomingOnly: true,
    disciplines: disciplines,
  });

  const startOfMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const scheduledProjectsGroupedByMonth = useMemo(
    () =>
      scheduledProjects?.reduce(
        (acc, project) => {
          project.tours?.forEach((tour) => {
            const myPrograms = tour.schedule
              ?.filter((s) => s.user?._id.toString() === user?._id.toString())
              .filter((s) => new Date(s.date) >= startOfMonth)
              .filter((s) =>
                [
                  ProgramStatuses.SHOW_CONFIRMED,
                  ProgramStatuses.SHOW_PENDING,
                ].includes(s.status),
              );

            myPrograms?.forEach((program) => {
              if (!program) return;
              const programDate = new Date(program.date);
              const month = programDate.getUTCMonth();
              const year = programDate.getUTCFullYear();
              const monthIndex = `${year}-${month}`;
              if (!acc[monthIndex]) {
                acc[monthIndex] = [];
              }
              if (
                !acc[monthIndex].find(
                  (item) =>
                    item.project._id.toString() === project._id.toString() &&
                    item.tour._id?.toString() === tour._id?.toString(),
                )
              ) {
                acc[monthIndex].push({ project, tour });
              }
            });
          });
          return acc;
        },
        {} as Record<string, { project: Project; tour: Tour }[]>,
      ),
    [scheduledProjects, user?._id],
  );

  const scheduledProjectsGroupedByWeek = useMemo(
    () =>
      scheduledProjects?.reduce(
        (acc, project) => {
          project.tours?.forEach((tour) => {
            const myPrograms = tour.schedule
              ?.filter((s) => s.user?._id.toString() === user?._id.toString())
              .filter((s) => new Date(s.date) >= startOfMonth)
              .filter((s) =>
                [
                  ProgramStatuses.SHOW_CONFIRMED,
                  ProgramStatuses.SHOW_PENDING,
                ].includes(s.status),
              );

            myPrograms?.forEach((program) => {
              if (!program) return;
              const programDate = new Date(program.date);
              const week = getWeek(programDate, { weekStartsOn: 1 }); // Monday as first day
              const year = programDate.getUTCFullYear();
              const weekIndex = `${year}-W${week.toString().padStart(2, "0")}`;
              if (!acc[weekIndex]) {
                acc[weekIndex] = [];
              }
              if (
                !acc[weekIndex].find(
                  (item) =>
                    item.project._id.toString() === project._id.toString() &&
                    item.tour._id?.toString() === tour._id?.toString(),
                )
              ) {
                acc[weekIndex].push({ project, tour });
              }
            });
          });
          return acc;
        },
        {} as Record<string, { project: Project; tour: Tour }[]>,
      ),
    [scheduledProjects, user?._id],
  );

  const shouldDisplayProjectsWithInterest =
    projectsWithInterest && projectsWithInterest.length > 0;

  const shouldDisplayScheduledProjects =
    viewMode === "month"
      ? scheduledProjectsGroupedByMonth &&
        Object.keys(scheduledProjectsGroupedByMonth).length > 0
      : scheduledProjectsGroupedByWeek &&
        Object.keys(scheduledProjectsGroupedByWeek).length > 0;

  const hasSomethingToDisplay =
    shouldDisplayProjectsWithInterest || shouldDisplayScheduledProjects;

  return (
    <>
      <FilterContainer>
        <div>
          <DisciplineSelector
            value={disciplines}
            setValue={setSelectedDisciplines}
            multiSelect
          />
          <ButtonGroup
            variant="text"
            size="small"
            sx={{
              border: "1px solid var(--color-light-gray)",
              borderRadius: "4px",
              "& .MuiButton-root": {
                color: "#999",
                padding: "8px 16px",
                backgroundColor: "transparent",
                borderColor: "var(--color-light-gray)",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                },
                "&.Mui-disabled": {
                  backgroundColor: "white",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "black",
                  },
                },
              },
            }}
          >
            <Button
              onClick={() => setViewMode("month")}
              startIcon={<CalendarMonthOutlined />}
              disabled={viewMode === "month"}
              title={t("common:month")}
              sx={{
                "& .MuiButton-startIcon": {
                  margin: mobile || tablet ? 0 : undefined,
                },
              }}
            >
              {mobile || tablet ? null : t("common:month")}
            </Button>
            <Button
              onClick={() => setViewMode("week")}
              startIcon={<ViewWeekOutlined />}
              disabled={viewMode === "week"}
              title={t("common:week")}
              sx={{
                "& .MuiButton-startIcon": {
                  margin: mobile || tablet ? 0 : undefined,
                },
              }}
            >
              {mobile || tablet ? null : t("common:week")}
            </Button>
          </ButtonGroup>
        </div>
        <FakeTopBorder />
      </FilterContainer>
      {!hasSomethingToDisplay && <EmptyDashboard />}
      {shouldDisplayProjectsWithInterest && (
        <ProjectsWithInterestBlock
          projects={projectsWithInterest}
          style={{
            borderRadius: 0,
          }}
        />
      )}
      {shouldDisplayScheduledProjects && (
        <ScheduledProjectsCalendar
          scheduledProjectsGroupedByMonth={
            viewMode === "month" ? scheduledProjectsGroupedByMonth || {} : {}
          }
          scheduledProjectsGroupedByWeek={
            viewMode === "week" ? scheduledProjectsGroupedByWeek || {} : {}
          }
          viewMode={viewMode}
        />
      )}
    </>
  );
};

export default VenueDashboard;
