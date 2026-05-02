import type { Language } from "@/i18n/translations";
import type { EventRecord } from "@/mock/schedule";

export function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDateRange(event: EventRecord, language: Language) {
  if (event.startDate === event.endDate) return formatDate(event.startDate, language);
  return `${formatDate(event.startDate, language)} - ${formatDate(event.endDate, language)}`;
}

export function formatLocation(event: EventRecord) {
  return [event.city, event.country].filter(Boolean).join(", ");
}
