import { Search } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import { QuickDateTabs, type DatePreset } from "@/components/QuickDateTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInfiniteEvents, useSports, useOrganizations, type EventFilters } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import type { Status } from "@/mock/schedule";

type FilterOption = {
  label: string;
  value: string;
};

const STATUS_OPTIONS: Status[] = ["upcoming", "live", "completed", "cancelled", "postponed", "unknown"];

function formatDateParam(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetRange(preset: Exclude<DatePreset, "">) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);

  if (preset === "week") {
    const dayOfWeek = start.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - offset);
    end.setDate(start.getDate() + 6);
  } else if (preset === "month") {
    end.setMonth(start.getMonth() + 1, 0);
  }

  return {
    date_from: formatDateParam(start),
    date_to: formatDateParam(end),
  };
}

function presetFromDateRange(dateFrom: string, dateTo: string): DatePreset {
  if (!dateFrom || !dateTo) return "";

  const todayRange = getPresetRange("today");
  if (dateFrom === todayRange.date_from && dateTo === todayRange.date_to) return "today";

  const weekRange = getPresetRange("week");
  if (dateFrom === weekRange.date_from && dateTo === weekRange.date_to) return "week";

  const monthRange = getPresetRange("month");
  if (dateFrom === monthRange.date_from && dateTo === monthRange.date_to) return "month";

  return "";
}

function FilterSelect({
  label, placeholder, value, options, renderOption, onChange
}: {
  label: string; placeholder: string; value: string; options: FilterOption[];
  renderOption?: (value: string) => string; onChange: (value: string) => void;
}) {
  return (
    <label className="sg-field">
      <span>{label}</span>
      <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem value={option.value} key={option.value}>
              {renderOption ? renderOption(option.value) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function EventsPage({ language, t }: { language: Language; t: Translation }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filters: EventFilters = {
    search: searchParams.get("search") || "",
    sport: searchParams.get("sport") || "",
    organization: searchParams.get("organization") || "",
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    status: searchParams.get("status") || "",
    date_from: searchParams.get("date_from") || "",
    date_to: searchParams.get("date_to") || "",
  };
  const datePreset = presetFromDateRange(filters.date_from || "", filters.date_to || "");

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteEvents(filters);
  const { data: sportsData } = useSports();
  const { data: orgsData } = useOrganizations();
  const { isSaved, toggleSaved } = useSavedEvents();

  const events = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.count ?? events.length;

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  const sports = (sportsData ?? []).map((sport: any) => ({
    label: String(sport.name),
    value: String(sport.slug),
  }));
  const organizations = (orgsData ?? [])
    .filter((org: any) => !filters.sport || String(org.sport?.slug ?? org.sport_slug) === filters.sport)
    .map((org: any) => ({
      label: String(org.name),
      value: String(org.slug),
    }));
  const countries = Array.from(new Set(events.map((event) => event.country).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right))
    .map((country) => ({ label: country, value: country }));
  const cities = Array.from(new Set(events.map((event) => event.city).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right))
    .map((city) => ({ label: city, value: city }));
  const statuses = STATUS_OPTIONS.map((status) => ({ label: t.statusLabels[status], value: status }));

  const updateSearch = (updates: Partial<EventFilters>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    setSearchParams(nextParams);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  return (
    <div className="sg-events-layout">
      <aside className="sg-filters">
        <div>
          <span className="sg-eyebrow">{t.advancedFilters}</span>
          <h2>{t.filters}</h2>
        </div>
        <QuickDateTabs
          value={datePreset}
          t={t}
          onChange={(preset) => {
            if (!preset) {
              updateSearch({ date_from: "", date_to: "" });
              return;
            }
            updateSearch(getPresetRange(preset));
          }}
        />
        <FilterSelect label={t.sport} placeholder={t.allSports} value={filters.sport} options={sports} onChange={(sport) => updateSearch({ sport })} />
        <FilterSelect label={t.organization} placeholder={t.allOrganizations} value={filters.organization} options={organizations} onChange={(organization) => updateSearch({ organization })} />
        <FilterSelect label={t.country} placeholder={t.allCountries} value={filters.country} options={countries} onChange={(country) => updateSearch({ country })} />
        <FilterSelect label={t.city} placeholder={t.allCities} value={filters.city || ""} options={cities} onChange={(city) => updateSearch({ city })} />
        <FilterSelect
          label={t.status}
          placeholder={t.allStatuses}
          value={filters.status}
          options={statuses}
          renderOption={(status) => t.statusLabels[status as Status]}
          onChange={(status) => updateSearch({ status })}
        />
        <label className="sg-field">
          <span>{t.dateFrom}</span>
          <Input type="date" value={filters.date_from || ""} onChange={(e) => updateSearch({ date_from: e.target.value })} />
        </label>
        <label className="sg-field">
          <span>{t.dateTo}</span>
          <Input type="date" value={filters.date_to || ""} onChange={(e) => updateSearch({ date_to: e.target.value })} />
        </label>
        <Button variant="secondary" onClick={clearFilters}>{t.clear}</Button>
      </aside>

      <section className="sg-panel">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.navEvents}</span>
            <h1>{t.allEvents}</h1>
          </div>
          <strong>{totalCount} {t.results}</strong>
        </div>
        <div className="sg-toolbar">
          <label className="sg-search">
            <Search size={18} />
            <Input
              value={filters.search || ""}
              placeholder={`${t.event}, ${t.city}, ${t.country}, ${t.organization}`}
              onChange={(e) => updateSearch({ search: e.target.value })}
            />
          </label>
        </div>
        {isLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : isError ? (
          <div className="sg-empty-state">{error instanceof Error ? error.message : t.apiError}</div>
        ) : events.length === 0 ? (
          <div className="sg-empty-state">{t.noEventsMatchFilters}</div>
        ) : (
          <ResponsiveEventList
            events={events}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={(id) => {
              const search = searchParams.toString();
              navigate({
                pathname: `/events/${id}`,
                search: search ? `?${search}` : "",
              });
            }}
            onToggleSaved={toggleSaved}
          />
        )}
        <div className="infinite-scroll-sentinel" ref={loadMoreRef}>
          {isFetchingNextPage ? t.loadingMoreEvents : hasNextPage ? t.scrollForMore : events.length > 0 ? t.allEventsLoaded : ""}
        </div>
      </section>
    </div>
  );
}
