import { CalendarDays, ChevronRight, Globe2, MapPin, ShieldCheck } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { EventSourceLabel } from "@/components/EventSourceLabel";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { SaveEventButton } from "@/components/SaveEventButton";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import { formatDateRange, formatLocation } from "@/lib/event-format";

export function EventDetailsPage({ language, t }: { language: Language; t: Translation }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: event, isLoading } = useEvent(id!);
  const { isSaved, toggleSaved } = useSavedEvents();

  if (isLoading) {
    return <div className="sg-page-stack"><div className="sg-empty-state">{t.loadingEvents}</div></div>;
  }

  if (!event) {
    return <div className="sg-page-stack"><div className="sg-empty-state">{t.eventNotFound}</div></div>;
  }

  const metadata = [
    { label: t.sport, value: event.sport, icon: <ShieldCheck size={17} /> },
    { label: t.organization, value: event.organization, icon: <Globe2 size={17} /> },
    { label: t.location, value: formatLocation(event), icon: <MapPin size={17} /> },
    { label: t.dates, value: formatDateRange(event, language), icon: <CalendarDays size={17} /> },
  ];

  return (
    <div className="sg-page-stack">
      <Button
        className="sg-back-button"
        variant="ghost"
        onClick={() => navigate(location.search ? `/events${location.search}` : "/events")}
      >
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
          <SaveEventButton eventId={event.id} isSaved={isSaved(event.id)} t={t} onToggle={toggleSaved} />
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
