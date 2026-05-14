import { useEffect, RefObject } from "react";

export function useScrollToHighlightedItem<T extends string>(
  itemId: T | null,
  refs: RefObject<Record<T, HTMLDivElement | null>>,
  shouldScroll: boolean = true
) {
  useEffect(() => {
    if (shouldScroll && itemId && refs.current?.[itemId]) {
      refs.current[itemId]!.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [itemId, shouldScroll]);
}
