import { ResponsiveEventList } from "@/components/ResponsiveEventList";
import type { Language, Translation } from "@/i18n/translations";
import type { EventRecord } from "@/mock/schedule";

export function SavedEventsPage({
  events,
  language,
  t,
  isSaved,
  onToggleSaved,
  onOpenDetails,
}: {
  events: EventRecord[];
  language: Language;
  t: Translation;
  isSaved: (eventId: number) => boolean;
  onToggleSaved: (eventId: number) => void;
  onOpenDetails: (eventId: number) => void;
}) {
  return (
    <section className="sg-panel">
      <div className="sg-panel-header">
        <div>
          <span className="sg-eyebrow">{t.navSaved}</span>
          <h1>{t.savedEvents}</h1>
          <p className="sg-section-copy">Quick access to the events you want to revisit.</p>
        </div>
        <strong>{events.length} {t.results}</strong>
      </div>
      {events.length === 0 ? (
        <div className="sg-empty-state">No saved events yet.</div>
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
  );
}
