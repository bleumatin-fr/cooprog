import React from "react";
import { PlanningProps } from "./types";
import { MonthsContainer } from "./styles";
import { usePlanningData } from "./usePlanningData";
import { useCollapseState } from "./useCollapseState";
import MonthSection from "./MonthSection";

const Planning: React.FC<PlanningProps> = ({
  tour,
  schedule,
  unschedule,
  editProgram,
  canSchedule = false,
  canEdit = false,
  canBlock = false,
  canWish = false,
  canScheduleForOthers = false,
  canAddUnavailable = false,
  onEditTour,
  sx,
  id,
}) => {
  // Get planning data calculations
  const {
    scheduleHashMap,
    start,
    end,
    firstEventDate,
    lastEventDate,
    shouldCollapseStart,
    shouldCollapseEnd,
    months,
  } = usePlanningData({ tour });

  // Get collapse state and handlers
  const {
    isStartCollapsed,
    isEndCollapsed,
    toggleCollapseStart,
    toggleCollapseEnd,
    isDateCollapsed,
    preserveScrollForDate,
  } = useCollapseState({
    shouldCollapseStart,
    shouldCollapseEnd,
    firstEventDate,
    lastEventDate,
    start,
    end,
  });

  if (!start || !end) {
    return null;
  }

  return (
    <MonthsContainer id={id || "planning"}>
      {months.map(({ month, year, numberOfDays }) => (
        <MonthSection
          key={`month-${year}-${month}`}
          month={month}
          year={year}
          numberOfDays={numberOfDays}
          scheduleHashMap={scheduleHashMap}
          start={start}
          end={end}
          firstEventDate={firstEventDate}
          lastEventDate={lastEventDate}
          isStartCollapsed={isStartCollapsed}
          isEndCollapsed={isEndCollapsed}
          toggleCollapseStart={toggleCollapseStart}
          toggleCollapseEnd={toggleCollapseEnd}
          shouldCollapseStart={shouldCollapseStart}
          shouldCollapseEnd={shouldCollapseEnd}
          isDateCollapsed={isDateCollapsed}
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
          sx={sx}
          preserveScrollForDate={preserveScrollForDate}
        />
      ))}
    </MonthsContainer>
  );
};

export default Planning;

// export default React.memo(Planning, (prevProps, nextProps) => {
//   return JSON.stringify(prevProps.tour) === JSON.stringify(nextProps.tour);
// });
