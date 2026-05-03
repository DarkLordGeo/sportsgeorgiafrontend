import { CalendarDays, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EventCardSkeletonGrid } from "@/components/EventCardSkeletonGrid";
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

function mergeFilterOptions(...groups: Array<Array<FilterOption | null | undefined>>): FilterOption[] {
  return Array.from(
    new Map(
      groups
        .flat()
        .filter((option): option is FilterOption => Boolean(option?.value))
        .map((option) => [option.value, option]),
    ).values(),
  );
}

function FilterSelect({
  label, placeholder, value, options, renderOption, onChange, helperText, emptyLabel
}: {
  label: string; placeholder: string; value: string; options: FilterOption[];
  renderOption?: (value: string) => string; onChange: (value: string) => void; helperText?: string; emptyLabel?: string;
}) {
  const isDisabled = options.length === 0;
  return (
    <label className="sg-field">
      <span>{label}</span>
      <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
        <SelectTrigger disabled={isDisabled}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {isDisabled ? (
            <SelectItem value="__empty" disabled>
              {emptyLabel ?? "No options yet"}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem value={option.value} key={option.value}>
              {renderOption ? renderOption(option.value) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText ? <small className="sg-field-helper">{helperText}</small> : null}
    </label>
  );
}

export function EventsPage({ language, t }: { language: Language; t: Translation }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") || "");

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
    refetch,
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

  useEffect(() => {
    setSearchDraft(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const normalizedDraft = searchDraft.trim();
    if ((filters.search || "") === normalizedDraft) return;

    const timeout = window.setTimeout(() => {
      updateSearch({ search: normalizedDraft });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [filters.search, searchDraft, searchParams]);
  
  const sportsFromApi = (sportsData ?? []).map((sport: any) => ({
    label: String(sport.name),
    value: String(sport.slug),
  }));
  const sportsFromEvents = events
    .filter((event) => event.sportSlug && event.sport)
    .map((event) => ({ label: event.sport, value: event.sportSlug }));
  const sports = mergeFilterOptions(
    sportsFromApi,
    sportsFromEvents,
    filters.sport ? [{ label: filters.sport, value: filters.sport }] : [],
  );

  const organizationsFromApi = (orgsData ?? [])
    .filter((org: any) => !filters.sport || String(org.sport?.slug ?? org.sport_slug) === filters.sport)
    .map((org: any) => ({
      label: String(org.name),
      value: String(org.slug),
    }));
  const organizationsFromEvents = events
    .filter((event) => (!filters.sport || event.sportSlug === filters.sport) && event.organizationSlug && event.organization)
    .map((event) => ({ label: event.organization, value: event.organizationSlug }));
  const organizations = mergeFilterOptions(
    organizationsFromApi,
    organizationsFromEvents,
    filters.organization ? [{ label: filters.organization, value: filters.organization }] : [],
  );
  const countries = mergeFilterOptions(
    Array.from(new Set(events.map((event) => event.country).filter(Boolean)))
      .sort((left, right) => left.localeCompare(right))
      .map((country) => ({ label: country, value: country })),
    filters.country ? [{ label: filters.country, value: filters.country }] : [],
  );
  const cities = mergeFilterOptions(
    Array.from(new Set(events.map((event) => event.city).filter(Boolean)))
      .sort((left, right) => left.localeCompare(right))
      .map((city) => ({ label: city, value: city })),
    filters.city ? [{ label: filters.city, value: filters.city }] : [],
  );
  const statuses = STATUS_OPTIONS.map((status) => ({ label: t.statusLabels[status], value: status }));

  const updateSearch = (updates: Partial<EventFilters>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchDraft("");
    setSearchParams(new URLSearchParams());
  };
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const sportHelper = sports.length > 0 ? `${sports.length} available now` : "No live sport options yet";
  const organizationHelper = organizations.length > 0 ? `${organizations.length} available now` : "No live organizations yet";
  const countryHelper = countries.length > 0 ? `${countries.length} available on this list` : "No location options for these results yet";
  const cityHelper = cities.length > 0 ? `${cities.length} available on this list` : "No city options for these results yet";
  const activeFilterChips = [
    filters.search ? { key: "search", label: `Search: ${filters.search}`, onRemove: () => { setSearchDraft(""); updateSearch({ search: "" }); } } : null,
    filters.sport ? { key: "sport", label: `${t.sport}: ${sports.find((option) => option.value === filters.sport)?.label ?? filters.sport}`, onRemove: () => updateSearch({ sport: "", organization: "" }) } : null,
    filters.organization ? { key: "organization", label: `${t.organization}: ${organizations.find((option) => option.value === filters.organization)?.label ?? filters.organization}`, onRemove: () => updateSearch({ organization: "" }) } : null,
    filters.country ? { key: "country", label: `${t.country}: ${filters.country}`, onRemove: () => updateSearch({ country: "" }) } : null,
    filters.city ? { key: "city", label: `${t.city}: ${filters.city}`, onRemove: () => updateSearch({ city: "" }) } : null,
    filters.status ? { key: "status", label: `${t.status}: ${t.statusLabels[filters.status as Status] ?? filters.status}`, onRemove: () => updateSearch({ status: "" }) } : null,
    filters.date_from ? { key: "date_from", label: `${t.dateFrom}: ${filters.date_from}`, onRemove: () => updateSearch({ date_from: "" }) } : null,
    filters.date_to ? { key: "date_to", label: `${t.dateTo}: ${filters.date_to}`, onRemove: () => updateSearch({ date_to: "" }) } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;
  const isGridLoading = isLoading || (isFetchingNextPage && events.length === 0);

  return (
    <div className="sg-events-layout">
      <div className={`sg-filter-shell ${filtersOpen ? "is-open" : ""}`}>
        <aside className="sg-filters">
          <div className="sg-filters-heading">
            <div>
              <span className="sg-eyebrow">{t.advancedFilters}</span>
              <h2>{t.filters}</h2>
            </div>
            <Button className="sg-filter-close" variant="ghost" size="icon-sm" onClick={() => setFiltersOpen(false)}>
              <X size={16} />
            </Button>
          </div>

          <label className="sg-field">
            <span>{t.event}</span>
            <Input
              value={searchDraft}
              placeholder={`${t.event}, ${t.city}, ${t.country}`}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </label>

          <div className="sg-filter-section">
            <div className="sg-filter-section-title">{t.quickLinks}</div>
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
          </div>

          <div className="sg-filter-section">
            <div className="sg-filter-section-title">{t.filters}</div>
            <FilterSelect
              label={t.sport}
              placeholder={t.allSports}
              value={filters.sport}
              options={sports}
              onChange={(sport) => updateSearch({ sport, organization: "" })}
              helperText={sportHelper}
              emptyLabel="No sports available"
            />
            <FilterSelect
              label={t.organization}
              placeholder={t.allOrganizations}
              value={filters.organization}
              options={organizations}
              onChange={(organization) => updateSearch({ organization })}
              helperText={organizationHelper}
              emptyLabel="No organizations available"
            />
            <FilterSelect
              label={t.country}
              placeholder={t.allCountries}
              value={filters.country}
              options={countries}
              onChange={(country) => updateSearch({ country })}
              helperText={countryHelper}
              emptyLabel="No countries in these results"
            />
            <FilterSelect
              label={t.city}
              placeholder={t.allCities}
              value={filters.city || ""}
              options={cities}
              onChange={(city) => updateSearch({ city })}
              helperText={cityHelper}
              emptyLabel="No cities in these results"
            />
            <FilterSelect
              label={t.status}
              placeholder={t.allStatuses}
              value={filters.status}
              options={statuses}
              renderOption={(status) => t.statusLabels[status as Status]}
              onChange={(status) => updateSearch({ status })}
            />
          </div>

          <div className="sg-filter-section">
            <div className="sg-filter-section-title">{t.dates}</div>
            <div className="sg-date-fields">
              <label className="sg-field">
                <span>{t.dateFrom}</span>
                <Input type="date" value={filters.date_from || ""} onChange={(e) => updateSearch({ date_from: e.target.value })} />
              </label>
              <label className="sg-field">
                <span>{t.dateTo}</span>
                <Input type="date" value={filters.date_to || ""} onChange={(e) => updateSearch({ date_to: e.target.value })} />
              </label>
            </div>
          </div>

          <Button className="sg-clear-button" variant="secondary" onClick={clearFilters}>{t.clear}</Button>
        </aside>
      </div>

      <section className="sg-panel">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.navEvents}</span>
            <h1>{t.allEvents}</h1>
            <p className="sg-section-copy">{t.homeHeroSubtitle}</p>
          </div>
          <div className="sg-section-actions">
            <strong>{totalCount} {t.results}</strong>
            <Button
              className="sg-filter-toggle"
              variant="outline"
              onClick={() => setFiltersOpen((current) => !current)}
            >
              <Filter size={16} />
              {t.filters}
              {activeFiltersCount > 0 ? <span className="sg-filter-count">{activeFiltersCount}</span> : null}
            </Button>
          </div>
        </div>
        <div className="sg-toolbar">
          <label className="sg-search">
            <Search size={18} />
            <Input
              value={searchDraft}
              placeholder={`${t.event}, ${t.city}, ${t.country}, ${t.organization}`}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </label>
          <div className="sg-toolbar-quickdates">
            <Button className="sg-date-chip" variant="outline" onClick={() => updateSearch(getPresetRange("today"))}>
              <CalendarDays size={15} />
              {t.today}
            </Button>
            <Button className="sg-date-chip" variant="outline" onClick={() => updateSearch(getPresetRange("week"))}>
              {t.thisWeek}
            </Button>
            <Button className="sg-date-chip" variant="outline" onClick={() => updateSearch(getPresetRange("month"))}>
              {t.thisMonth}
            </Button>
          </div>
        </div>
        {activeFilterChips.length > 0 ? (
          <div className="sg-active-filters" aria-label="Active filters">
            <span className="sg-active-filters-label">Active filters</span>
            <div className="sg-active-filters-list">
              {activeFilterChips.map((chip) => (
                <button className="sg-filter-chip" key={chip.key} type="button" onClick={chip.onRemove}>
                  <span>{chip.label}</span>
                  <X size={14} />
                </button>
              ))}
              <Button className="sg-clear-inline" variant="ghost" onClick={clearFilters}>
                {t.clear}
              </Button>
            </div>
          </div>
        ) : null}
        {isGridLoading ? (
          <EventCardSkeletonGrid count={6} />
        ) : isError ? (
          <div className="sg-empty-state sg-state-stack">
            <div>{t.apiError}</div>
            <Button variant="outline" onClick={() => void refetch()}>
              {("retry" in t ? (t as Translation & { retry: string }).retry : "Try again")}
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="sg-empty-state sg-state-stack">
            <div>{t.noEventsMatchFilters}</div>
            <Button variant="outline" onClick={clearFilters}>
              {t.clear}
            </Button>
          </div>
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
          {isFetchingNextPage && events.length > 0 ? t.loadingMoreEvents : hasNextPage ? t.scrollForMore : events.length > 0 ? t.allEventsLoaded : ""}
        </div>
      </section>
    </div>
  );
}
