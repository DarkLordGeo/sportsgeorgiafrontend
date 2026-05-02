import { useEffect, useMemo, useState } from "react";

const savedEventsKey = "sportsgeorgia-saved-events";

function readSavedIds() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(savedEventsKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

export function useSavedEvents() {
  const [savedIds, setSavedIds] = useState<number[]>(readSavedIds);

  useEffect(() => {
    window.localStorage.setItem(savedEventsKey, JSON.stringify(savedIds));
  }, [savedIds]);

  return useMemo(
    () => ({
      savedIds,
      isSaved: (eventId: number) => savedIds.includes(eventId),
      toggleSaved: (eventId: number) =>
        setSavedIds((current) =>
          current.includes(eventId)
            ? current.filter((savedId) => savedId !== eventId)
            : [...current, eventId],
        ),
    }),
    [savedIds],
  );
}
