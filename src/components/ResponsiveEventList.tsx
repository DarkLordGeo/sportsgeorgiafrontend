import { EventCardMobile } from "@/components/EventCardMobile";
import { EventTableDesktop } from "@/components/EventTableDesktop";
import type { Language, Translation } from "@/i18n/translations";
import type { EventRecord } from "@/mock/schedule";

export function ResponsiveEventList({
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
  if (events.length === 0) {
    return <div className="sg-empty-state">{t.emptyEvents}</div>;
  }

  return (
    <>
      <EventTableDesktop
        events={events}
        language={language}
        t={t}
        isSaved={isSaved}
        onToggleSaved={onToggleSaved}
        onOpenDetails={onOpenDetails}
      />
      <div className="event-card-list-mobile">
        {events.map((event) => (
          <EventCardMobile
            event={event}
            isSaved={isSaved(event.id)}
            key={event.id}
            language={language}
            t={t}
            onOpenDetails={onOpenDetails}
            onToggleSaved={onToggleSaved}
          />
        ))}
      </div>
    </>
  );
}
