import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { type EventRecord } from "@/mock/schedule";

export type Status = "upcoming" | "live" | "completed" | "cancelled" | "unknown";

const VALID_STATUSES: Status[] = ["upcoming", "live", "completed", "cancelled", "unknown"];

function normalizeStatus(value: unknown): Status {
  if (typeof value === "string" && VALID_STATUSES.includes(value as Status)) {
    return value as Status;
  }
  return "unknown";
}

function normalizeEvent(event: any): EventRecord {
  return {
    id: Number(event.id),
    title: String(event.title ?? ""),
    sport: String(event.sport?.name ?? event.sport ?? ""),
    sportSlug: String(event.sport?.slug ?? event.sport_slug ?? ""),
    organization: String(event.organization?.name ?? event.organization ?? ""),
    organizationSlug: String(event.organization?.slug ?? event.organization_slug ?? ""),
    location: String(event.location ?? ""),
    city: String(event.city ?? ""),
    country: String(event.country ?? ""),
    startDate: String(event.start_date || ""),
    // null end_date means single-day event — keep as null, don't copy startDate
    endDate: event.end_date ? String(event.end_date) : null,
    status: normalizeStatus(event.status),
    sourceUrl: String(event.source_url || ""),
    createdAt: String(event.created_at || ""),
    updatedAt: String(event.updated_at || ""),
  };
}

export function useEvents(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const response = await apiClient.getEvents(filters);
      const results = response?.results ?? [];
      return {
        ...response,
        results: results.map(normalizeEvent),
      };
    },
  });
}

export function useEvent(id: number | string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await apiClient.getEvent(id);
      return normalizeEvent(response);
    },
    enabled: !!id,
  });
}

export function useSports() {
  return useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const response = await apiClient.getSports();
      return response.results ?? [];
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await apiClient.getOrganizations();
      return response.results ?? [];
    },
  });
}