import {
  CalendarDays,
  ChevronRight,
  CircleDot,
  Globe2,
  LayoutDashboard,
  Moon,
  Search,
  ShieldCheck,
  Star,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EventSourceLabel } from "@/components/EventSourceLabel";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QuickDateTabs, type DatePreset } from "@/components/QuickDateTabs";
import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import { SaveEventButton } from "@/components/SaveEventButton";
import { SavedEventsPage } from "@/components/SavedEventsPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/useEvents";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { translations, type Language, type Translation } from "@/i18n/translations";
import { formatDateRange, formatLocation } from "@/lib/event-format";
import type { EventRecord, Status } from "@/mock/schedule";

type Theme = "light" | "dark";
type Route = { name: "home" } | { name: "events" } | { name: "saved" } | { name: "event"; id: number };

type EventFilters = {
  date: DatePreset;
  sport: string;
  organization: string;
  country: string;
  status: string;
  from: string;
  to: string;
  query: string;
};

const themeStorageKey = "sportsgeorgia-theme";
const languageStorageKey = "sportsgeorgia-language";
const emptyFilters: EventFilters = {
  date: "",
  sport: "",
  organization: "",
  country: "",
  status: "",
  from: "",
  to: "",
  query: "",
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ka";

  const storedLanguage = window.localStorage.getItem(languageStorageKey);
  return storedLanguage === "en" ? "en" : "ka";
}

function useThemeMode() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}

function useLanguageMode() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "ka" ? "ka-GE" : "en";
    window.localStorage.setItem(languageStorageKey, language);
  }, [language]);

  return { language, setLanguage };
}

function currentRoute(): Route {
  const path = window.location.pathname;
  const eventMatch = path.match(/^\/events\/(\d+)$/);
  if (eventMatch) return { name: "event", id: Number(eventMatch[1]) };
  if (path === "/events") return { name: "events" };
  if (path === "/saved") return { name: "saved" };
  return { name: "home" };
}

function useBrowserRoute() {
  const [route, setRoute] = useState<Route>(currentRoute);
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const syncRoute = () => {
      setRoute(currentRoute());
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const navigate = (path: string, params?: URLSearchParams) => {
    const query = params?.toString();
    window.history.pushState(null, "", `${path}${query ? `?${query}` : ""}`);
    setRoute(currentRoute());
    setSearchParams(new URLSearchParams(window.location.search));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const updateSearch = (updates: Partial<EventFilters>) => {
    const nextParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    navigate("/events", nextParams);
  };

  return { route, searchParams, navigate, updateSearch };
}

function filtersFromParams(searchParams: URLSearchParams): EventFilters {
  return {
    date: (searchParams.get("date") as DatePreset) || "",
    sport: searchParams.get("sport") ?? "",
    organization: searchParams.get("organization") ?? "",
    country: searchParams.get("country") ?? "",
    status: searchParams.get("status") ?? "",
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    query: searchParams.get("query") ?? "",
  };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function presetRange(preset: DatePreset) {
  const today = new Date();
  if (preset === "today") return { from: isoDate(today), to: isoDate(today) };
  if (preset === "week") return { from: isoDate(today), to: isoDate(addDays(today, 6)) };
  if (preset === "month") return { from: isoDate(today), to: isoDate(addDays(today, 30)) };
  return { from: "", to: "" };
}

function filterEvents(events: EventRecord[], filters: EventFilters) {
  const preset = presetRange(filters.date);
  const from = filters.from || preset.from;
  const to = filters.to || preset.to;
  const query = filters.query.trim().toLowerCase();

  return events.filter((event) => {
    const matchesSport = !filters.sport || event.sport === filters.sport || event.sportSlug === filters.sport;
    const matchesOrganization =
      !filters.organization ||
      event.organization === filters.organization ||
      event.organizationSlug === filters.organization;
    const matchesCountry = !filters.country || event.country === filters.country;
    const matchesStatus = !filters.status || event.status === filters.status;
    const matchesFrom = !from || event.endDate >= from;
    const matchesTo = !to || event.startDate <= to;
    const matchesQuery =
      !query ||
      [event.title, event.sport, event.organization, event.country, event.city]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return (
      matchesSport &&
      matchesOrganization &&
      matchesCountry &&
      matchesStatus &&
      matchesFrom &&
      matchesTo &&
      matchesQuery
    );
  });
}

function uniqueValues(events: EventRecord[], key: keyof EventRecord) {
  return Array.from(new Set(events.map((event) => String(event[key])).filter(Boolean))).sort();
}

function sortUpcoming(events: EventRecord[]) {
  const today = isoDate(new Date());
  return [...events]
    .filter((event) => event.endDate >= today)
    .sort((first, second) => first.startDate.localeCompare(second.startDate));
}

export function App() {
  const { events, isLoading, isFallback, error } = useEvents();
  const { savedIds, isSaved, toggleSaved } = useSavedEvents();
  const { theme, toggleTheme } = useThemeMode();
  const { language, setLanguage } = useLanguageMode();
  const { route, searchParams, navigate, updateSearch } = useBrowserRoute();
  const t = translations[language];
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const savedEvents = useMemo(
    () => events.filter((event) => savedIds.includes(event.id)),
    [events, savedIds],
  );
  const selectedEvent = route.name === "event" ? events.find((event) => event.id === route.id) : undefined;

  const openDetails = (eventId: number) => navigate(`/events/${eventId}`);
  const openEventsWith = (updates: Partial<EventFilters>) => {
    const params = new URLSearchParams();
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate("/events", params);
  };

  return (
    <div className="sg-app">
      <header className="sg-header">
        <div className="sg-topbar">
          <button className="sg-brand" type="button" onClick={() => navigate("/")}>
            <span className="sg-brand-mark">
              <CircleDot size={19} />
            </span>
            <span>
              <strong>{t.appName}</strong>
              <small>{t.tagline}</small>
            </span>
          </button>

          <div className="sg-header-actions">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button
              className="theme-toggle"
              type="button"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>

        <nav className="sg-nav" aria-label="Main navigation">
          <NavButton active={route.name === "home"} icon={<LayoutDashboard />} label={t.navHome} onClick={() => navigate("/")} />
          <NavButton active={route.name === "events" || route.name === "event"} icon={<CalendarDays />} label={t.navEvents} onClick={() => navigate("/events")} />
          <NavButton active={route.name === "saved"} icon={<Star />} label={t.navSaved} onClick={() => navigate("/saved")} />
        </nav>
      </header>

      <main className="sg-content">
        {isFallback && !isLoading && (
          <div className="sg-api-note">{error ? t.apiError : "VITE_API_BASE_URL is not configured. Showing local development data."}</div>
        )}

        {route.name === "home" && (
          <HomePage
            events={events}
            isLoading={isLoading}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={openDetails}
            onOpenEventsWith={openEventsWith}
            onToggleSaved={toggleSaved}
          />
        )}

        {route.name === "events" && (
          <EventsPage
            events={filteredEvents}
            filters={filters}
            isLoading={isLoading}
            language={language}
            sourceEvents={events}
            t={t}
            isSaved={isSaved}
            onOpenDetails={openDetails}
            onToggleSaved={toggleSaved}
            onUpdateFilters={updateSearch}
            onClearFilters={() => navigate("/events")}
          />
        )}

        {route.name === "saved" && (
          <SavedEventsPage
            events={savedEvents}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={openDetails}
            onToggleSaved={toggleSaved}
          />
        )}

        {route.name === "event" && selectedEvent && (
          <EventDetailsPage
            event={selectedEvent}
            isSaved={isSaved(selectedEvent.id)}
            language={language}
            t={t}
            onBack={() => navigate("/events")}
            onToggleSaved={toggleSaved}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`sg-nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomePage({
  events,
  isLoading,
  language,
  t,
  isSaved,
  onToggleSaved,
  onOpenDetails,
  onOpenEventsWith,
}: {
  events: EventRecord[];
  isLoading: boolean;
  language: Language;
  t: Translation;
  isSaved: (eventId: number) => boolean;
  onToggleSaved: (eventId: number) => void;
  onOpenDetails: (eventId: number) => void;
  onOpenEventsWith: (updates: Partial<EventFilters>) => void;
}) {
  const upcomingEvents = sortUpcoming(events).slice(0, 5);

  return (
    <div className="sg-page-stack">
      <section className="sg-hero">
        <div>
          <span className="sg-eyebrow">{t.quickLinks}</span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroSubtitle}</p>
        </div>
        <Button className="sg-primary-button" onClick={() => onOpenEventsWith({})}>
          {t.browseEvents}
          <ChevronRight size={17} />
        </Button>
      </section>

      <section className="sg-quick-links" aria-label={t.quickLinks}>
        <QuickLink label={t.today} onClick={() => onOpenEventsWith({ date: "today" })} />
        <QuickLink label={t.thisWeek} onClick={() => onOpenEventsWith({ date: "week" })} />
        <QuickLink label={t.thisMonth} onClick={() => onOpenEventsWith({ date: "month" })} />
        <QuickLink label={t.judo} onClick={() => onOpenEventsWith({ sport: "Judo" })} />
      </section>

      <section className="sg-panel">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.upcomingEvents}</span>
            <h2>{t.upcomingEvents}</h2>
          </div>
          <strong>{upcomingEvents.length} {t.results}</strong>
        </div>
        {isLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : (
          <ResponsiveEventList
            events={upcomingEvents}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={onToggleSaved}
          />
        )}
      </section>
    </div>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="sg-quick-link" type="button" onClick={onClick}>
      <span>{label}</span>
      <ChevronRight size={16} />
    </button>
  );
}

function EventsPage({
  sourceEvents,
  events,
  filters,
  isLoading,
  language,
  t,
  isSaved,
  onToggleSaved,
  onOpenDetails,
  onUpdateFilters,
  onClearFilters,
}: {
  sourceEvents: EventRecord[];
  events: EventRecord[];
  filters: EventFilters;
  isLoading: boolean;
  language: Language;
  t: Translation;
  isSaved: (eventId: number) => boolean;
  onToggleSaved: (eventId: number) => void;
  onOpenDetails: (eventId: number) => void;
  onUpdateFilters: (updates: Partial<EventFilters>) => void;
  onClearFilters: () => void;
}) {
  const sports = uniqueValues(sourceEvents, "sport");
  const organizations = uniqueValues(sourceEvents, "organization");
  const countries = uniqueValues(sourceEvents, "country");
  const statuses: Status[] = ["upcoming", "live", "completed"];

  return (
    <div className="sg-events-layout">
      <aside className="sg-filters">
        <div>
          <span className="sg-eyebrow">{t.advancedFilters}</span>
          <h2>{t.filters}</h2>
        </div>
        <QuickDateTabs value={filters.date} t={t} onChange={(date) => onUpdateFilters({ date, from: "", to: "" })} />
        <FilterSelect label={t.sport} placeholder={t.allSports} value={filters.sport} options={sports} onChange={(sport) => onUpdateFilters({ sport })} />
        <FilterSelect label={t.organization} placeholder={t.allOrganizations} value={filters.organization} options={organizations} onChange={(organization) => onUpdateFilters({ organization })} />
        <FilterSelect label={t.country} placeholder={t.allCountries} value={filters.country} options={countries} onChange={(country) => onUpdateFilters({ country })} />
        <FilterSelect
          label={t.status}
          placeholder={t.allStatuses}
          value={filters.status}
          options={statuses}
          renderOption={(status) => t.statusLabels[status as Status]}
          onChange={(status) => onUpdateFilters({ status })}
        />
        <label className="sg-field">
          <span>{t.dateFrom}</span>
          <Input type="date" value={filters.from} onChange={(event) => onUpdateFilters({ from: event.target.value, date: "" })} />
        </label>
        <label className="sg-field">
          <span>{t.dateTo}</span>
          <Input type="date" value={filters.to} onChange={(event) => onUpdateFilters({ to: event.target.value, date: "" })} />
        </label>
        <Button variant="secondary" onClick={onClearFilters}>
          {t.clear}
        </Button>
      </aside>

      <section className="sg-panel">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.navEvents}</span>
            <h1>{t.allEvents}</h1>
          </div>
          <strong>{events.length} {t.results}</strong>
        </div>
        <div className="sg-toolbar">
          <label className="sg-search">
            <Search size={18} />
            <Input value={filters.query} placeholder={`${t.event}, ${t.country}, ${t.organization}`} onChange={(event) => onUpdateFilters({ query: event.target.value })} />
          </label>
        </div>
        {isLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : (
          <ResponsiveEventList
            events={events}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={onToggleSaved}
          />
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  options,
  renderOption,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  renderOption?: (value: string) => string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="sg-field">
      <span>{label}</span>
      <Select value={value || "all"} onValueChange={(nextValue) => onChange(nextValue === "all" ? "" : nextValue)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem value={option} key={option}>
              {renderOption ? renderOption(option) : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function EventDetailsPage({
  event,
  language,
  t,
  isSaved,
  onBack,
  onToggleSaved,
}: {
  event: EventRecord;
  language: Language;
  t: Translation;
  isSaved: boolean;
  onBack: () => void;
  onToggleSaved: (eventId: number) => void;
}) {
  const metadata = [
    { label: t.sport, value: event.sport, icon: <ShieldCheck size={17} /> },
    { label: t.organization, value: event.organization, icon: <Globe2 size={17} /> },
    { label: t.location, value: formatLocation(event), icon: <Globe2 size={17} /> },
    { label: t.dates, value: formatDateRange(event, language), icon: <CalendarDays size={17} /> },
  ];

  return (
    <div className="sg-page-stack">
      <Button className="sg-back-button" variant="ghost" onClick={onBack}>
        {t.backToEvents}
      </Button>
      <section className="sg-detail-header">
        <div>
          <div className="sg-detail-kicker">
            <EventStatusBadge status={event.status} t={t} />
            <EventSourceLabel sourceUrl={event.sourceUrl} t={t} />
          </div>
          <h1>{event.title}</h1>
          <p>{event.organization} / {formatLocation(event)} / {formatDateRange(event, language)}</p>
        </div>
        <div className="sg-detail-actions">
          <SaveEventButton eventId={event.id} isSaved={isSaved} t={t} onToggle={onToggleSaved} />
          <Button className="sg-primary-button" asChild>
            <a href={event.sourceUrl} target="_blank" rel="noreferrer">
              {t.officialSource}
              <ChevronRight size={17} />
            </a>
          </Button>
        </div>
      </section>

      <section className="sg-metadata-grid">
        {metadata.map((item) => (
          <div className="sg-metadata-card" key={item.label}>
            <span>{item.icon}{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
        <div className="sg-metadata-card">
          <span>{t.status}</span>
          <EventStatusBadge status={event.status} t={t} />
        </div>
        <div className="sg-metadata-card">
          <span>{t.source}</span>
          <EventSourceLabel sourceUrl={event.sourceUrl} t={t} />
        </div>
      </section>
    </div>
  );
}
