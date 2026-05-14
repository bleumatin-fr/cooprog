import { useEffect } from "react";

export function useScrollPersistence(storageKey: string, debounceMs = 150) {
  useEffect(() => {
    // Restore scroll position on mount
    const savedScroll = localStorage.getItem(storageKey);
    if (savedScroll) {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "auto" });
    }

    // Simple debounce function
    let timeout: NodeJS.Timeout | null = null;
    const saveScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(storageKey, window.scrollY.toString());
      }, debounceMs);
    };

    window.addEventListener("scroll", saveScroll);
    return () => {
      window.removeEventListener("scroll", saveScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [storageKey, debounceMs]);
}
