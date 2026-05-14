import { useState } from "react";

type HoverSync<T> = {
  itemIdFromEvent: (event: any) => string | null;
};

export function useCalendarHoverSync<T extends { start: Date; id: string }>({
  itemIdFromEvent,
}: HoverSync<T>) {
  const [focusDate, setFocusDate] = useState<Date | undefined>();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [highlightedEventIds, setHighlightedEventIds] = useState<string[]>([]);
  const [hoverSource, setHoverSource] = useState<"card" | "calendar" | null>(
    null
  );

  const handleItemHover = (itemId: string, relatedEvents: T[]) => {
    setHoverSource("card");
    setHoveredItemId(itemId);
    const eventIds = relatedEvents.map((e) => e.id);
    setHighlightedEventIds(eventIds);

    if (relatedEvents.length > 0) {
      const earliest = relatedEvents.reduce((a, b) =>
        new Date(a.start) < new Date(b.start) ? a : b
      );
      setFocusDate(new Date(earliest.start));
    }
  };

  const handleEventHover = (event: T) => {
    setHoverSource("calendar");
    const eventId = (event as any).id;
    const itemId = itemIdFromEvent(event);
    if (itemId) setHoveredItemId(itemId);
    if (eventId) setHighlightedEventIds([eventId]);
  };

  const clearHover = () => {
    setFocusDate(undefined);
    setHoveredItemId(null);
    setHighlightedEventIds([]);
    setHoverSource(null);
  };

  return {
    focusDate,
    hoveredItemId,
    highlightedEventIds,
    handleItemHover,
    handleEventHover,
    clearHover,
    hoverSource,
  };
}
