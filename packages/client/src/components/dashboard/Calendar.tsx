import styled from "@emotion/styled";
import { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import { LegendColorBox, LegendContainer } from "../map/Legend";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useRef } from "react";

export interface BaseEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  display: string;
  backgroundColor: string;
  extendedProps?: Record<string, any>;
}

interface CalendarProps<T extends BaseEvent> {
  events: T[];
  onEventClick?: (info: EventClickArg) => void;
  focusDate?: Date;
  highlightedEventIds?: string[];
  onEventHover?: (event: T) => void;
  onEventLeave?: () => void;
  viewMode?: "month" | "week";
}

const CalendarContainer = styled.div`
  * {
    font-family: "Libre Franklin Medium", sans-serif;
  }

  .fc-daygrid-day {
    color: #333;
    background-color: #f8f9fa;
  }

  .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    text-decoration: none !important;
    color: inherit !important;
    cursor: default !important;
  }

  .fc-toolbar-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2c3e50;
  }

  .fc-event {
    font-size: 0.8rem;
    border: none;
    padding: 2px 6px;
    border-radius: 6px;
    transition: opacity 0.2s, transform 0.2s;
    opacity: 0.8;

    &:hover {
      opacity: 1;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }
  }

  .fc-col-header-cell {
    color: #333;
    text-decoration: none !important;
  }
`;

export const Calendar = <T extends BaseEvent>({
  events,
  onEventClick,
  focusDate,
  highlightedEventIds = [],
  onEventHover,
  onEventLeave,
  viewMode = "month",
}: CalendarProps<T>) => {
  const calendarRef = useRef<any>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (focusDate && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(focusDate);
    }
  }, [focusDate]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const newView = viewMode === "week" ? "dayGridWeek" : "dayGridMonth";
      if (calendarApi.view.type !== newView) {
        calendarApi.changeView(newView);
      }
    }
  }, [viewMode]);

  const locale = i18n.language === "fr" ? frLocale : enLocale;

  return (
    <CalendarContainer>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={viewMode === "week" ? "dayGridWeek" : "dayGridMonth"}
        displayEventTime={false}
        headerToolbar={false}
        aspectRatio={1}
        events={events}
        eventClick={onEventClick}
        eventMouseEnter={({ event }) => {
          onEventHover?.(event as unknown as T);
        }}
        eventMouseLeave={() => {
          onEventLeave?.();
        }}
        locale={locale}
        firstDay={1}
      />
    </CalendarContainer>
  );
};

export const CalendarLegend = () => {
  const { t } = useTranslation();
  return (
    <LegendContainer>
      <div>
        <LegendColorBox color="var(--pending-background-color)" />
        <span>{t("projects:tours.planning.programTypes.pending")}</span>
      </div>
      <div>
        <LegendColorBox color="var(--confirmed-background-color)" />
        <span>{t("projects:tours.planning.programTypes.confirmed")}</span>
      </div>
    </LegendContainer>
  );
};

export default Calendar;
