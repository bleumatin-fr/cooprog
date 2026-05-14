import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import { useState, useMemo, useEffect } from "react";
import { Project, Discipline, Tour, ProgramStatuses } from "@cooprog/core";

import { useScrollPersistence } from "./hooks/useScrollPersistence";
import {
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
} from "@mui/material";
import useProjects from "../projects/useProjects";
import useUser from "../authentication/useUser";
import useDiscipline, { colors } from "../layout/useDiscipline";
import DisciplineSelector from "../projects/DisciplineSelector";
import ScheduledProjectsCalendar from "./ScheduledProjectsCalendar";
import ArtisticTeamProjectCard from "../projects/ArtisticTeamProjectCard";
import EmptyDashboard from "./EmptyDashboard";

const FilterContainer = styled.div`
  z-index: 10;
  position: sticky;
  top: 64px;
  background-color: var(--content-background-color);

  > div:first-child {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
    padding: 16px;
  }
`;

const FakeTopBorder = styled.div`
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  height: 16px;
`;

const ArtisticTeamDashboard = () => {
  const { t } = useTranslation();
  useScrollPersistence("artisticDashboardScrollY");
  const { user } = useUser();
  const [disciplines, setSelectedDisciplines] = useState<Discipline[]>([
    Discipline.PERFORMING_ARTS,
    Discipline.MUSIC,
  ]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<
    string[] | undefined
  >(undefined);

  const { projects: allProjects } = useProjects({
    userId: user?._id,
    sort: "work",
    upcomingOnly: true,
    disciplines: disciplines,
  });

  const { projects: scheduledProjects } = useProjects({
    userId: user?._id,
    sort: "minDate",
    upcomingOnly: true,
    disciplines: disciplines,
    projectIds: selectedProjectIds,
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
              ?.filter((s) => new Date(s.date) >= startOfMonth)
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

  const shouldDisplayScheduledProjects =
    scheduledProjectsGroupedByMonth &&
    Object.keys(scheduledProjectsGroupedByMonth).length > 0;

  return (
    <>
      <FilterContainer>
        <div>
          <DisciplineSelector
            value={disciplines}
            setValue={setSelectedDisciplines}
            multiSelect
          />

          <FormControl size="small" style={{ minWidth: 200 }}>
            <InputLabel>{t("home:artistic_dashboard.select_work")}</InputLabel>
            <Select
              multiple
              label={t("home:artistic_dashboard.select_work")}
              value={selectedProjectIds || []}
              onChange={(e) => {
                const value = e.target.value as string[];
                setSelectedProjectIds(value.length > 0 ? value : undefined);
              }}
              renderValue={(selected) => {
                return selected
                  .map(
                    (id) =>
                      allProjects?.find((p) => p._id === id)?.work ||
                      allProjects?.find((p) => p._id === id)?.artist,
                  )
                  .join(", ");
              }}
            >
              {allProjects?.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  <Checkbox
                    checked={selectedProjectIds?.includes(project._id)}
                  />
                  <ListItemText
                    primary={
                      project.work
                        ? `${project.work} · ${project.artist}`
                        : project.artist
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <FakeTopBorder />
      </FilterContainer>
      {!shouldDisplayScheduledProjects && <EmptyDashboard />}
      {shouldDisplayScheduledProjects && (
        <ScheduledProjectsCalendar
          scheduledProjectsGroupedByMonth={scheduledProjectsGroupedByMonth}
          renderProjectCard={(project, tour, month, year) => (
            <ArtisticTeamProjectCard
              key={project._id}
              project={project}
              tour={tour}
              month={month}
              year={year}
            />
          )}
          getEventTitle={(project, program) =>
            `${program.user?.company} · ${program.location?.data?.city}`
          }
          filterProgramsByUser={false}
        />
      )}
    </>
  );
};

export default ArtisticTeamDashboard;
