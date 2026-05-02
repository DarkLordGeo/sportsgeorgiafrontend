import type { Language } from "@/i18n/translations";
import type { EventRecord } from "@/mock/schedule";

export function formatDate(value: string | null | undefined, language: Language): string {
  if (!value || value === "null" || value === "undefined") return "";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return value; // return raw string instead of crashing
  return new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateRange(event: EventRecord, language: Language): string {
  const start = formatDate(event.startDate, language);
  if (!event.endDate || event.endDate === event.startDate) return start;
  const end = formatDate(event.endDate, language);
  if (!end) return start;
  return `${start} – ${end}`;
}

export function formatLocation(event: EventRecord): string {
  return [event.city, event.country].filter(Boolean).join(", ");
}