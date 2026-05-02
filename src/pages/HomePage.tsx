import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import type { EventRecord, Status } from "@/mock/schedule";
import { useNavigate } from "react-router-dom";

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
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
  const { data, isLoading } = useEvents();
  const { data: georgiaData, isLoading: isGeorgiaLoading } = useEvents({ country: "Georgia" });
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

  return (
    <div className="sg-page-stack sg-home-stack">
      <section className="sg-hero sg-home-hero">
        <div className="sg-home-hero-copy">
          <span className="sg-eyebrow">{t.homeOfficialSchedules}</span>
          <h1>{t.homeHeroTitle}</h1>
          <p>{t.homeHeroSubtitle}</p>
        </div>
        <div className="sg-home-hero-actions">
          <Button className="sg-primary-button" onClick={() => onOpenEventsWith({})}>
            {t.browseEvents}
            <ChevronRight size={17} />
          </Button>
          <Button className="sg-home-secondary-button" variant="secondary" onClick={() => navigate("/saved")}>
            {t.viewSaved}
          </Button>
        </div>
      </section>

      <section className="sg-home-highlight-strip" aria-label={t.highlightUpcoming}>
        <span>{t.highlightUpcoming}</span>
        <strong>{t.highlightTbilisiCadetCup}</strong>
        <strong>{t.highlightDushanbeGrandSlam}</strong>
        <strong>{t.highlightQazaqstanGrandSlam}</strong>
      </section>

      <section className="sg-quick-links sg-home-quick-links" aria-label={t.quickLinks}>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith({ date: "today" })}>
          <span>{t.today}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith({ date: "week" })}>
          <span>{t.thisWeek}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith({ date: "month" })}>
          <span>{t.thisMonth}</span><ChevronRight size={16} />
        </button>
        <button className="sg-quick-link" type="button" onClick={() => onOpenEventsWith({ sport: "Judo" })}>
          <span>{t.judo}</span><ChevronRight size={16} />
        </button>
      </section>

      <section className="sg-panel sg-home-preview-section">
        <div className="sg-panel-header">
          <div>
            <span className="sg-eyebrow">{t.localPriority}</span>
            <h2>{t.upcomingInGeorgia}</h2>
          </div>
          <strong>{georgiaEvents.length} {t.results}</strong>
        </div>
        {isLoading || isGeorgiaLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : georgiaEvents.length === 0 ? (
          <div className="sg-home-empty-state">
            <p>{t.georgiaEventsEmpty}</p>
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
          <strong>{internationalEvents.length} {t.results}</strong>
        </div>
        {isLoading ? (
          <div className="sg-empty-state">{t.loadingEvents}</div>
        ) : internationalEvents.length === 0 ? (
          <div className="sg-empty-state">{t.internationalEventsEmpty}</div>
        ) : (
          <ResponsiveEventList
            events={internationalEvents}
            isSaved={isSaved}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={toggleSaved}
          />
        )}
      </section>
    </div>
  );
}
