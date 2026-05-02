import { Search } from "lucide-react";
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
import { useEvents, useSports, useOrganizations } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import type { Status } from "@/mock/schedule";

function FilterSelect({
  label, placeholder, value, options, renderOption, onChange
}: {
  label: string; placeholder: string; value: string; options: string[];
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
            <SelectItem value={option} key={option}>
              {renderOption ? renderOption(option) : option}
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

  const filters = {
    date: searchParams.get("date") || "",
    sport: searchParams.get("sport") || "",
    organization: searchParams.get("organization") || "",
    country: searchParams.get("country") || "",
    status: searchParams.get("status") || "",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    query: searchParams.get("query") || "",
  };

  const { data, isLoading } = useEvents(filters as any);
  const { data: sportsData } = useSports();
  const { data: orgsData } = useOrganizations();
  const { isSaved, toggleSaved } = useSavedEvents();

  const events = data?.results || [];
  
  const sports = sportsData?.map((s: any) => s.name) || [];
  const organizations = orgsData?.map((o: any) => o.name) || [];
  const countries = Array.from(new Set(events.map(e => e.country).filter(Boolean))).sort() as string[];
  const statuses: Status[] = ["upcoming", "live", "completed"];

  const updateSearch = (updates: Partial<typeof filters>) => {
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
        <QuickDateTabs value={filters.date as DatePreset} t={t} onChange={(date) => updateSearch({ date, from: "", to: "" })} />
        <FilterSelect label={t.sport} placeholder={t.allSports} value={filters.sport} options={sports} onChange={(sport) => updateSearch({ sport })} />
        <FilterSelect label={t.organization} placeholder={t.allOrganizations} value={filters.organization} options={organizations} onChange={(organization) => updateSearch({ organization })} />
        <FilterSelect label={t.country} placeholder={t.allCountries} value={filters.country} options={countries} onChange={(country) => updateSearch({ country })} />
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
          <Input type="date" value={filters.from} onChange={(e) => updateSearch({ from: e.target.value, date: "" })} />
        </label>
        <label className="sg-field">
          <span>{t.dateTo}</span>
          <Input type="date" value={filters.to} onChange={(e) => updateSearch({ to: e.target.value, date: "" })} />
        </label>
        <Button variant="secondary" onClick={clearFilters}>{t.clear}</Button>
      </aside>

      <section className="sg-panel">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.navEvents}</span>
            <h1>{t.allEvents}</h1>
          </div>
          <strong>{data?.count || events.length} {t.results}</strong>
        </div>
        <div className="sg-toolbar">
          <label className="sg-search">
            <Search size={18} />
            <Input value={filters.query} placeholder={`${t.event}, ${t.country}, ${t.organization}`} onChange={(e) => updateSearch({ query: e.target.value })} />
          </label>
        </div>
        {isLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : events.length === 0 ? (
          <div className="sg-empty-state">No events found</div>
        ) : (
          <ResponsiveEventList
            events={events}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={(id) => navigate(`/events/${id}`)}
            onToggleSaved={toggleSaved}
          />
        )}
      </section>
    </div>
  );
}
