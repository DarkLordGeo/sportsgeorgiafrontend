import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { type EventRecord } from "@/mock/schedule";

// Re-use normalizeEvent if necessary, or let backend shape match what we need.
// Assuming backend snake_case needs to be mapped to camelCase.
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
    startDate: String(event.start_date ?? event.startDate ?? ""),
    endDate: String(event.end_date ?? event.endDate ?? event.start_date ?? ""),
    status: event.status === "live" || event.status === "completed" ? event.status : "upcoming",
    sourceUrl: String(event.source_url ?? event.sourceUrl ?? event.official_source_url ?? ""),
  };
}

export function useEvents(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const response = await apiClient.getEvents(filters);
      return {
        ...response,
        results: response.results.map(normalizeEvent)
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
      return response.results;
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await apiClient.getOrganizations();
      return response.results;
    },
  });
}
