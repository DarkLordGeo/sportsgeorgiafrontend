import { useEffect, useState } from "react";
import { fetchEvents } from "@/api/events";
import { mockEvents, type EventRecord } from "@/mock/schedule";

export function useEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchEvents()
      .then((result) => {
        if (!isMounted) return;
        setEvents(result.events);
        setIsFallback(result.fromFallback);
      })
      .catch((requestError: Error) => {
        if (!isMounted) return;
        setError(requestError);
        setIsFallback(true);
        setEvents(mockEvents);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, isLoading, isFallback, error };
}
