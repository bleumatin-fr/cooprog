import React from "react";
import { useTranslation } from "next-i18next";
import clsx from "clsx";
import { Location, Program, ProgramStatuses, User } from "@cooprog/core";
import { Day } from "./styles";
import UnavailableCell from "./cells/UnavailableCell";
import BookedCell from "./cells/BookedCell";
import PlanningCell from "./cells/PlanningCell";
import WishedCell from "./cells/WishedCell";
import OptionsCell from "./cells/OptionsCell";
import { ScheduleHashMap } from "./types";

interface DayRowProps {
  date: Date;
  day: number;
  month: number;
  year: number;
  dayOfWeek: number;
  isOutsideTourRange: boolean;
  isTheDayBeforeStart: boolean;
  isTheDayAfterEnd: boolean;
  hasUnavailability: boolean;
  hasBlocked: boolean;
  hasWished: boolean;
  hasConfirmedDates: boolean;
  hasPendingDates: boolean;
  scheduleHashMap: ScheduleHashMap;
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
  preserveScrollForDate: (dateStr: string) => void;
}

const DayRow: React.FC<DayRowProps> = ({
  date,
  day,
  month,
  year,
  dayOfWeek,
  isOutsideTourRange,
  isTheDayBeforeStart,
  isTheDayAfterEnd,
  hasUnavailability,
  hasBlocked,
  hasWished,
  hasConfirmedDates,
  hasPendingDates,
  scheduleHashMap,
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
  preserveScrollForDate,
}) => {
  const { t } = useTranslation(["common", "projects"]);

  return (
    <Day
      className={clsx({
        "out-of-range": isOutsideTourRange,
        unavailable: hasUnavailability,
        blocked: hasBlocked,
        wished: hasWished,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
        [`day-${dayOfWeek}`]: true,
      })}
      data-date={date.toISOString().slice(0, 10)}
      data-testid="day-row"
    >
      <td>{day}</td>
      <td>{t(`common:day.${dayOfWeek}`)}</td>
      {isOutsideTourRange && (
        <UnavailableCell
          unschedule={unschedule}
          canEdit={canEdit}
          onEditTour={onEditTour}
          extendDateOption={
            isTheDayBeforeStart ? "start" : isTheDayAfterEnd ? "end" : undefined
          }
          programs={
            scheduleHashMap[year]?.[month]?.[day]?.[ProgramStatuses.UNAVAILABLE]
          }
        />
      )}
      {hasUnavailability && (
        <UnavailableCell
          unschedule={unschedule}
          label={t("projects:tours.planning.unavailable")}
          canEdit={canEdit}
          programs={
            scheduleHashMap[year]?.[month]?.[day]?.[ProgramStatuses.UNAVAILABLE]
          }
        />
      )}
      {hasBlocked && (
        <BookedCell
          unschedule={unschedule}
          editProgram={editProgram}
          canEdit={canEdit}
          program={
            scheduleHashMap[year]?.[month]?.[day]?.[ProgramStatuses.BLOCKED][0]
          }
        />
      )}
      {!hasUnavailability && !isOutsideTourRange && !hasBlocked && (
        <>
          <PlanningCell
            date={date}
            unschedule={unschedule}
            schedule={schedule}
            canEdit={canEdit}
            canBlock={canBlock}
            canWish={canWish}
            canSchedule={canSchedule}
            canScheduleForOthers={canScheduleForOthers}
            canAddUnavailable={canAddUnavailable}
            placeholder={
              hasWished ? (
                <WishedCell
                  unschedule={unschedule}
                  canEdit={canEdit}
                  canSchedule={canSchedule}
                  programs={
                    scheduleHashMap[year]?.[month]?.[day]?.[
                      ProgramStatuses.SHOW_WISHED
                    ]
                  }
                />
              ) : null
            }
            unavailable={hasUnavailability}
            blocked={hasBlocked}
            wished={hasWished}
            hasConfirmedDates={hasConfirmedDates}
            hasPendingDates={hasPendingDates}
            programs={
              scheduleHashMap[year]?.[month]?.[day]?.[
                ProgramStatuses.SHOW_CONFIRMED
              ]
            }
            preserveScrollForDate={preserveScrollForDate}
          />
          <OptionsCell
            date={date}
            unschedule={unschedule}
            schedule={schedule}
            canEdit={canEdit}
            canSchedule={canSchedule}
            programs={
              scheduleHashMap[year]?.[month]?.[day]?.[
                ProgramStatuses.SHOW_PENDING
              ]
            }
          />
        </>
      )}
    </Day>
  );
};

export default DayRow;
