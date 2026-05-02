import { ChevronRight } from "lucide-react";
import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/queries";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import type { Language, Translation } from "@/i18n/translations";
import { useNavigate } from "react-router-dom";

export function HomePage({ language, t }: { language: Language; t: Translation }) {
  const { data, isLoading } = useEvents();
  const { isSaved, toggleSaved } = useSavedEvents();
  const navigate = useNavigate();

  const events = data?.results || [];
  const upcomingEvents = [...events].slice(0, 5);

  const onOpenDetails = (id: number) => navigate(`/events/${id}`);
  const onOpenEventsWith = (params: Record<string, string>) => {
    const search = new URLSearchParams(params).toString();
    navigate(`/events?${search}`);
  };

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
        ) : upcomingEvents.length === 0 ? (
          <div className="sg-empty-state">No upcoming events found</div>
        ) : (
          <ResponsiveEventList
            events={upcomingEvents}
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
