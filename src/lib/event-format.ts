import type { Language } from "@/i18n/translations";
import type { EventRecord } from "@/mock/schedule";

const ISO_COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR",
  "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL",
  "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO",
  "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA",
  "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT",
  "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO",
  "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP",
  "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY",
  "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR",
  "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL",
  "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN",
  "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD",
  "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX",
  "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT",
  "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN",
  "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

const COUNTRY_ALIASES: Record<string, string> = {
  america: "US",
  "bosnia herzegovina": "BA",
  "bosnia and herzegovina": "BA",
  britain: "GB",
  "chinese taipei": "TW",
  "congo brazzaville": "CG",
  "congo kinshasa": "CD",
  "cote d ivoire": "CI",
  "czech republic": "CZ",
  czechia: "CZ",
  england: "GB",
  "great britain": "GB",
  iran: "IR",
  kosovo: "XK",
  moldova: "MD",
  palestine: "PS",
  "republic of korea": "KR",
  russia: "RU",
  scotland: "GB",
  "south korea": "KR",
  syria: "SY",
  taiwan: "TW",
  tanzania: "TZ",
  turkey: "TR",
  turkiye: "TR",
  uae: "AE",
  uk: "GB",
  "united kingdom": "GB",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  venezuela: "VE",
  vietnam: "VN",
  wales: "GB",
};

let countryNameMap: Map<string, string> | null = null;

function normalizeCountryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function buildCountryNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  const DisplayNames = (Intl as typeof Intl & {
    DisplayNames?: new (locales: string[], options: { type: "region" }) => { of: (code: string) => string | undefined };
  }).DisplayNames;

  if (DisplayNames) {
    const displayNames = new DisplayNames(["en"], { type: "region" });
    ISO_COUNTRY_CODES.forEach((code) => {
      const name = displayNames.of(code);
      if (name) map.set(normalizeCountryName(name), code);
    });
  }

  Object.entries(COUNTRY_ALIASES).forEach(([name, code]) => {
    map.set(normalizeCountryName(name), code);
  });

  return map;
}

function countryCodeToFlagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return Array.from(code)
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

export function countryFlagEmoji(country: string | null | undefined): string {
  if (!country) return "";

  const trimmed = country.trim();
  if (!trimmed) return "";

  const upper = trimmed.toUpperCase();
  const code = /^[A-Z]{2}$/.test(upper)
    ? upper
    : (countryNameMap ??= buildCountryNameMap()).get(normalizeCountryName(trimmed));

  return code ? countryCodeToFlagEmoji(code) : "";
}

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
