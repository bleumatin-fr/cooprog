import { useState, useCallback, useRef, useEffect } from "react";
import {
  addDays,
  isAfter,
  isBefore,
  isSameDay,
  setDate,
  setMonth,
  setYear,
  subDays,
} from "date-fns";
import {
  DAYS_BEFORE_EVENT_FOR_BUTTON,
  DAYS_AFTER_EVENT_FOR_BUTTON,
} from "./types";

interface UseCollapseStateProps {
  shouldCollapseStart: boolean;
  shouldCollapseEnd: boolean;
  firstEventDate: Date | null;
  lastEventDate: Date | null;
  start: Date | null;
  end: Date | null;
}

export const useCollapseState = ({
  shouldCollapseStart,
  shouldCollapseEnd,
  firstEventDate,
  lastEventDate,
  start,
  end,
}: UseCollapseStateProps) => {
  const [isStartCollapsed, setIsStartCollapsed] = useState(true);
  const [isEndCollapsed, setIsEndCollapsed] = useState(true);

  // Store anchor info
  const scrollAnchorDayRef = useRef<string | null>(null);
  const scrollAnchorTopRef = useRef<number>(0);

  // Helper to get all visible day rows sorted by date
  const getVisibleDayRows = () => {
    const planningContainer = document.querySelector('[id*="planning"]');
    if (!planningContainer) return [];
    const dayRows = Array.from(
      planningContainer.querySelectorAll("tr[data-date]")
    ) as HTMLElement[];
    return dayRows.filter((row) => row.offsetParent !== null);
  };

  // Helper to find the next visible row by date
  const findNextVisibleRow = (dateStr: string) => {
    const rows = getVisibleDayRows();
    const dates = rows.map((row) => row.getAttribute("data-date"));
    const idx = dates.indexOf(dateStr);
    if (idx === -1) {
      // Try to find the next date after the anchor
      const anchorDate = new Date(dateStr);
      let minDiff = Infinity;
      let closestRow: HTMLElement | null = null;
      for (const row of rows) {
        const rowDateStr = row.getAttribute("data-date");
        if (!rowDateStr) continue;
        const rowDate = new Date(rowDateStr);
        const diff =
          rowDate > anchorDate
            ? rowDate.getTime() - anchorDate.getTime()
            : Infinity;
        if (diff < minDiff) {
          minDiff = diff;
          closestRow = row;
        }
      }
      return closestRow;
    }
    return rows[idx] || null;
  };

  const storeScrollAnchor = () => {
    const anchor = getVisibleDayRows()[0];
    if (anchor) {
      scrollAnchorDayRef.current = anchor.getAttribute("data-date");
      scrollAnchorTopRef.current = anchor.getBoundingClientRect().top;
    } else {
      scrollAnchorDayRef.current = null;
      scrollAnchorTopRef.current = 0;
    }
  };

  const restoreScrollAnchor = () => {
    let start = performance.now();
    let attempts = 0;
    const maxDuration = 500; // ms
    function tryRestore() {
      attempts++;
      let anchor: HTMLElement | null = null;
      if (scrollAnchorDayRef.current) {
        anchor = document.querySelector(
          `tr[data-date="${scrollAnchorDayRef.current}"]`
        ) as HTMLElement | null;
        if (!anchor || anchor.offsetParent === null) {
          // Try next visible row by date
          anchor = findNextVisibleRow(scrollAnchorDayRef.current);
        }
      }
      if (anchor) {
        const newTop = anchor.getBoundingClientRect().top;
        const diff = newTop - scrollAnchorTopRef.current;
        if (Math.abs(diff) > 1) {
          window.scrollBy({ top: diff, behavior: "auto" });
        }
        scrollAnchorDayRef.current = null;
        scrollAnchorTopRef.current = 0;
      } else if (performance.now() - start < maxDuration) {
        requestAnimationFrame(tryRestore);
      } else {
        scrollAnchorDayRef.current = null;
        scrollAnchorTopRef.current = 0;
      }
    }
    tryRestore();
  };

  const toggleCollapseStart = useCallback(() => {
    storeScrollAnchor();
    setIsStartCollapsed((prev) => !prev);
  }, []);

  const toggleCollapseEnd = useCallback(() => {
    storeScrollAnchor();
    setIsEndCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    restoreScrollAnchor();
  }, [isStartCollapsed, isEndCollapsed, firstEventDate, lastEventDate]);

  const isDateCollapsed = useCallback(
    (date: Date) => {
      // Handle start collapse
      if (shouldCollapseStart && firstEventDate && isStartCollapsed && start) {
        const firstDisplayedDate = setDate(
          setMonth(
            setYear(new Date(), new Date(start).getFullYear()),
            new Date(start).getMonth()
          ),
          1
        );

        const startButtonDate = subDays(
          new Date(firstEventDate),
          DAYS_BEFORE_EVENT_FOR_BUTTON
        );

        if (
          isBefore(new Date(date), startButtonDate) &&
          (isAfter(new Date(date), firstDisplayedDate) ||
            isSameDay(new Date(date), firstDisplayedDate))
        ) {
          return true;
        }
      }

      // Handle end collapse: hide empty days after last event, but never hide the tour end date
      if (shouldCollapseEnd && lastEventDate && isEndCollapsed && end) {
        const endButtonDate = addDays(
          new Date(lastEventDate),
          DAYS_AFTER_EVENT_FOR_BUTTON
        );
        const dateObj = new Date(date);
        // Only collapse dates that are after endButtonDate AND after the tour end
        if (isAfter(dateObj, endButtonDate) && isAfter(dateObj, end)) {
          return true;
        }
      }

      return false;
    },
    [
      shouldCollapseStart,
      firstEventDate,
      isStartCollapsed,
      start,
      shouldCollapseEnd,
      lastEventDate,
      isEndCollapsed,
      end,
    ]
  );

  const preserveScrollForDate = (dateStr: string) => {
    const planningContainer = document.querySelector('[id*="planning"]');
    if (planningContainer) {
      const anchor = planningContainer.querySelector(
        `tr[data-date="${dateStr}"]`
      ) as HTMLElement | null;
      if (anchor) {
        scrollAnchorDayRef.current = dateStr;
        scrollAnchorTopRef.current = anchor.getBoundingClientRect().top;
        return;
      }
    }
    // fallback: use first visible row
    const anchor = getVisibleDayRows()[0];
    if (anchor) {
      scrollAnchorDayRef.current = anchor.getAttribute("data-date");
      scrollAnchorTopRef.current = anchor.getBoundingClientRect().top;
    } else {
      scrollAnchorDayRef.current = null;
      scrollAnchorTopRef.current = 0;
    }
  };

  return {
    isStartCollapsed,
    isEndCollapsed,
    toggleCollapseStart,
    toggleCollapseEnd,
    isDateCollapsed,
    preserveScrollForDate,
  };
};
