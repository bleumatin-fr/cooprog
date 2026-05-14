import { Location, Program, ProgramStatuses, Tour, User } from "@cooprog/core";
import { CSSProperties } from "react";

export const DEFAULT_TOUR_DURATION_MONTHS = 3;
export const COLLAPSE_THRESHOLD_DAYS = 7;
export const DAYS_BEFORE_EVENT_FOR_BUTTON = 10;
export const DAYS_AFTER_EVENT_FOR_BUTTON = 10;

export interface ScheduleHashMap {
  // year
  [key: number]: {
    // month
    [key: number]: {
      // day
      [key: number]: {
        // calendar column
        [key: string]: Program[];
      };
    };
  };
}

export interface PlanningProps {
  tour: Partial<Tour>;
  schedule: (
    date: Date,
    status: ProgramStatuses,
    user?: Partial<User> | null,
    location?: Location,
    customMessage?: string
  ) => Promise<void> | void;
  unschedule: (id: string) => Promise<void> | void;
  editProgram: (
    programId: string,
    params: Partial<Program>
  ) => Promise<void> | void;
  canSchedule?: boolean;
  canEdit?: boolean;
  canBlock?: boolean;
  canWish?: boolean;
  canScheduleForOthers?: boolean;
  canAddUnavailable?: boolean;
  onEditTour?: () => void;
  sx?: CSSProperties & {
    MonthTitle?: CSSProperties;
    TableHeader?: CSSProperties;
  };
  id?: string;
}

export interface MonthData {
  month: number;
  year: number;
  numberOfDays: number;
}
