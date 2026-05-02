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

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function normalizeEvent(event: any): EventRecord {
  return {
    id: Number(event.id),
    title: safeString(event.title),
    sport: safeString(event.sport?.name ?? event.sport),
    sportSlug: safeString(event.sport?.slug ?? event.sport_slug),
    organization: safeString(event.organization?.name ?? event.organization),
    organizationSlug: safeString(event.organization?.slug ?? event.organization_slug),
    location: safeString(event.location),
    city: safeString(event.city),
    country: safeString(event.country),
    startDate: safeString(event.start_date),
    // Keep null as null — do NOT fall back to startDate
    endDate: event.end_date ? String(event.end_date) : null,
    status: normalizeStatus(event.status),
    sourceUrl: safeString(event.source_url),
    createdAt: safeString(event.created_at),
    updatedAt: safeString(event.updated_at),
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