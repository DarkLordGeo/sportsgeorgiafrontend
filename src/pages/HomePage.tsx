import { CalendarDays, ChevronRight, Globe2, MapPin } from "lucide-react";
import { useMemo } from "react";
import { EventCardSkeletonGrid } from "@/components/EventCardSkeletonGrid";
import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import type { EventRecord, Status } from "@/mock/schedule";
import { useNavigate } from "react-router-dom";

function dateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getQuickRange(kind: "today" | "week" | "month") {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const rangeStart = new Date(start);
  const rangeEnd = new Date(start);

  if (kind === "week") {
    const dayOfWeek = rangeStart.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    rangeStart.setDate(rangeStart.getDate() - offset);
    rangeEnd.setDate(rangeStart.getDate() + 6);
  } else if (kind === "month") {
    rangeEnd.setMonth(rangeStart.getMonth() + 1, 0);
  }

  return {
    date_from: dateOnly(rangeStart),
    date_to: dateOnly(rangeEnd),
  };
}

function deriveDisplayStatus(event: EventRecord): Status {
  const searchable = `${event.title} ${event.status}`.toLowerCase();
  if (searchable.includes("cancel") || searchable.includes("postpon")) return "cancelled";
  if (event.status !== "unknown") return event.status;

  if (!event.startDate) return "unknown";

  const today = dateOnly(new Date());
  const endDate = event.endDate || event.startDate;

  if (event.startDate <= today && endDate >= today) return "live";
  if (event.startDate > today) return "upcoming";
  if (endDate < today) return "completed";

  return "unknown";
}

function withDisplayStatuses(events: EventRecord[]): EventRecord[] {
  return events.map((event) => ({
    ...event,
    status: deriveDisplayStatus(event),
  }));
}

function byNearestDate(a: EventRecord, b: EventRecord): number {
  return a.startDate.localeCompare(b.startDate);
}

function isGeorgiaEvent(event: EventRecord): boolean {
  const haystack = `${event.country} ${event.city} ${event.location} ${event.title}`.toLowerCase();
  return haystack.includes("georgia") || haystack.includes("tbilisi") || haystack.includes("batumi");
}

export function HomePage({ language, t }: { language: Language; t: Translation }) {
  const { data, isLoading, isError, refetch } = useEvents();
  const {
    data: georgiaData,
    isLoading: isGeorgiaLoading,
    isError: isGeorgiaError,
    refetch: refetchGeorgia,
  } = useEvents({ country: "Georgia" });
  const { isSaved, toggleSaved } = useSavedEvents();
  const navigate = useNavigate();

  const events = useMemo(() => withDisplayStatuses(data?.results || []), [data]);
  const georgiaEvents = useMemo(() => {
    const directMatches = withDisplayStatuses(georgiaData?.results || []);
    const fallbackMatches = events.filter(isGeorgiaEvent);
    const byId = new Map<number, EventRecord>();

    [...directMatches, ...fallbackMatches].forEach((event) => byId.set(event.id, event));
    return Array.from(byId.values()).sort(byNearestDate).slice(0, 6);
  }, [events, georgiaData]);
  const internationalEvents = useMemo(
    () => events.filter((event) => !isGeorgiaEvent(event)).sort(byNearestDate).slice(0, 9),
    [events],
  );

  const onOpenDetails = (id: number) => navigate(`/events/${id}`);
  const onOpenEventsWith = (params: Record<string, string>) => {
    const search = new URLSearchParams(params).toString();
    navigate(search ? `/events?${search}` : "/events");
  };
  const totalUpcoming = events.length;

  return (
    <div className="sg-page-stack sg-home-stack">
      <section className="sg-overview-shell">
        <div className="sg-overview-heading">
          <div>
            <span className="sg-eyebrow">{t.homeOfficialSchedules}</span>
            <h1>{t.homeHeroTitle}</h1>
            <p>{t.homeHeroSubtitle}</p>
          </div>
          <Button className="sg-primary-button sg-overview-button" onClick={() => onOpenEventsWith({})}>
            {t.browseEvents}
            <ChevronRight size={17} />
          </Button>
        </div>
        <div className="sg-overview-metrics" aria-label="Overview">
          <div className="sg-overview-metric">
            <span>{t.navEvents}</span>
            <strong>{totalUpcoming}</strong>
            <small>{t.upcomingEvents}</small>
          </div>
          <div className="sg-overview-metric">
            <span>{t.localPriority}</span>
            <strong>{georgiaEvents.length}</strong>
            <small>{t.upcomingInGeorgia}</small>
          </div>
          <div className="sg-overview-metric">
            <span>{t.internationalCalendar}</span>
            <strong>{internationalEvents.length}</strong>
            <small>{t.upcomingInternationalEvents}</small>
          </div>
        </div>
      </section>

      <section className="sg-quick-links sg-home-quick-links" aria-label={t.quickLinks}>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith(getQuickRange("today"))}>
          <span>{t.today}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith(getQuickRange("week"))}>
          <span>{t.thisWeek}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith(getQuickRange("month"))}>
          <span>{t.thisMonth}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith({ sport: "judo" })}>
          <span>{t.judo}</span><ChevronRight size={16} />
        </button>
      </section>

      <section className="sg-home-highlight-strip" aria-label={t.highlightUpcoming}>
        <span>{t.highlightUpcoming}</span>
        <strong>{t.highlightTbilisiCadetCup}</strong>
        <strong>{t.highlightDushanbeGrandSlam}</strong>
        <strong>{t.highlightQazaqstanGrandSlam}</strong>
      </section>

      <section className="sg-panel sg-home-preview-section">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.localPriority}</span>
            <h2>{t.upcomingInGeorgia}</h2>
          </div>
          <div className="sg-section-actions">
            <strong>{georgiaEvents.length} {t.results}</strong>
            <Button className="sg-inline-action" variant="ghost" onClick={() => onOpenEventsWith({ country: "Georgia" })}>
              <MapPin size={15} />
              {t.country}
            </Button>
          </div>
        </div>
        {isLoading || isGeorgiaLoading ? (
          <EventCardSkeletonGrid count={3} />
        ) : isGeorgiaError ? (
          <div className="sg-empty-state sg-state-stack">
            <div>Failed to load events. Try again.</div>
            <Button variant="outline" onClick={() => void refetchGeorgia()}>
              Try again
            </Button>
          </div>
        ) : georgiaEvents.length === 0 ? (
          <div className="sg-home-empty-state">
            <p>No Georgian events right now.</p>
            <Button className="sg-primary-button" onClick={() => onOpenEventsWith({})}>
              {t.browseAllUpcomingEvents}
            </Button>
          </div>
        ) : (
          <ResponsiveEventList
            events={georgiaEvents}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={toggleSaved}
          />
        )}
      </section>

      <section className="sg-panel sg-home-preview-section">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.internationalCalendar}</span>
            <h2>{t.upcomingInternationalEvents}</h2>
          </div>
          <div className="sg-section-actions">
            <strong>{internationalEvents.length} {t.results}</strong>
            <Button className="sg-inline-action" variant="ghost" onClick={() => onOpenEventsWith({ sport: "judo" })}>
              <Globe2 size={15} />
              {t.judo}
            </Button>
          </div>
        </div>
        {isLoading ? (
          <EventCardSkeletonGrid count={6} />
        ) : isError ? (
          <div className="sg-empty-state sg-state-stack">
            <div>Failed to load events. Try again.</div>
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : internationalEvents.length === 0 ? (
          <div className="sg-empty-state">{t.internationalEventsEmpty}</div>
        ) : (
          <ResponsiveEventList
            events={internationalEvents.slice(0, 12)}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={toggleSaved}
          />
        )}
      </section>

      <section className="sg-panel sg-home-summary-band">
        <div className="sg-home-summary-card">
          <CalendarDays size={16} />
          <div>
            <strong>{t.today}</strong>
            <span>{t.quickLinks}</span>
          </div>
        </div>
        <div className="sg-home-summary-card">
          <MapPin size={16} />
          <div>
            <strong>{t.upcomingInGeorgia}</strong>
            <span>{t.localPriority}</span>
          </div>
        </div>
        <div className="sg-home-summary-card">
          <Globe2 size={16} />
          <div>
            <strong>{t.upcomingInternationalEvents}</strong>
            <span>{t.allEvents}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
