import { mockEvents, type EventRecord } from "@/mock/schedule";
import { API_ROUTES } from "@/api/routes";

type ApiEvent = Omit<Partial<EventRecord>, "sport" | "organization"> & {
  start_date?: string;
  end_date?: string;
  sport_slug?: string;
  organization_slug?: string;
  source_url?: string;
  official_source_url?: string;
  source?: string;
  sport?: string | { name?: string; slug?: string };
  organization?: string | { name?: string; slug?: string };
};

function entityName(value: ApiEvent["sport"] | ApiEvent["organization"]) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value.name ?? "");
}

function entitySlug(value: ApiEvent["sport"] | ApiEvent["organization"], fallback = "") {
  if (!value || typeof value === "string") return fallback;
  return String(value.slug ?? fallback);
}

function normalizeEvent(event: ApiEvent): EventRecord {
  const sport = entityName(event.sport);
  const organization = entityName(event.organization);

  return {
    id: Number(event.id),
    title: String(event.title ?? ""),
    sport,
    sportSlug: entitySlug(event.sport, String(event.sportSlug ?? event.sport_slug ?? "")),
    organization,
    organizationSlug: entitySlug(
      event.organization,
      String(event.organizationSlug ?? event.organization_slug ?? ""),
    ),
    location: String(event.location ?? ""),
    city: String(event.city ?? ""),
    country: String(event.country ?? ""),
    startDate: String(event.startDate ?? event.start_date ?? ""),
    endDate: String(event.endDate ?? event.end_date ?? event.startDate ?? event.start_date ?? ""),
    status: event.status === "live" || event.status === "completed" ? event.status : "upcoming",
    sourceUrl: String(event.sourceUrl ?? event.source_url ?? event.official_source_url ?? event.source ?? ""),
  };
}

export async function fetchEvents(): Promise<{ events: EventRecord[]; fromFallback: boolean }> {
  const response = await fetch(API_ROUTES.events);

  if (!response.ok) {
    return { events: mockEvents, fromFallback: true };
  }

  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : payload.results;

  if (!Array.isArray(results)) {
    return { events: mockEvents, fromFallback: true };
  }

  return { events: results.map(normalizeEvent), fromFallback: false };
}
