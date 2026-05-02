import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSourceLabel } from "@/components/EventSourceLabel";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { SaveEventButton } from "@/components/SaveEventButton";
import type { Language, Translation } from "@/i18n/translations";
import { formatDateRange, formatLocation } from "@/lib/event-format";
import type { EventRecord } from "@/mock/schedule";

export function EventCardMobile({
  event,
  language,
  t,
  isSaved,
  onToggleSaved,
  onOpenDetails,
}: {
  event: EventRecord;
  language: Language;
  t: Translation;
  isSaved: boolean;
  onToggleSaved: (eventId: number) => void;
  onOpenDetails: (eventId: number) => void;
}) {
  const openDetails = () => onOpenDetails(event.id);

  return (
    <article
      className="event-card-mobile"
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(eventKey) => {
        if (eventKey.key === "Enter" || eventKey.key === " ") {
          eventKey.preventDefault();
          openDetails();
        }
      }}
    >
      <div className="event-card-topline">
        <EventStatusBadge status={event.status} t={t} />
        <EventSourceLabel sourceUrl={event.sourceUrl} t={t} />
      </div>
      <h3>{event.title}</h3>
      <div className="event-card-meta">
        <span>{event.sport}</span>
        <span>{event.organization}</span>
      </div>
      <div className="event-card-facts">
        <span>
          <MapPin size={15} />
          {formatLocation(event)}
        </span>
        <span>
          <CalendarDays size={15} />
          {formatDateRange(event, language)}
        </span>
      </div>
      <div className="event-card-actions" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <Button variant="outline" onClick={openDetails}>
          {t.openDetails}
        </Button>
        <SaveEventButton
          eventId={event.id}
          isSaved={isSaved}
          t={t}
          onToggle={onToggleSaved}
        />
      </div>
    </article>
  );
}
