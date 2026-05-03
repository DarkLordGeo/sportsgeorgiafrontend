import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSourceLabel } from "@/components/EventSourceLabel";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { SaveEventButton } from "@/components/SaveEventButton";
import type { Language, Translation } from "@/i18n/translations";
import { countryFlagEmoji, formatDate, formatDateRange, formatLocation } from "@/lib/event-format";
import type { EventRecord } from "@/mock/schedule";

function getDateParts(dateValue: string, language: Language) {
  const source = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(source.getTime())) {
    return {
      month: "",
      day: dateValue,
      year: "",
    };
  }

  return {
    month: new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-US", { month: "short" }).format(source),
    day: new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-US", { day: "2-digit" }).format(source),
    year: new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-US", { year: "numeric" }).format(source),
  };
}

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
  const countryFlag = countryFlagEmoji(event.country);
  const startDateParts = getDateParts(event.startDate, language);
  const endDateLabel = event.endDate && event.endDate !== event.startDate
    ? formatDate(event.endDate, language)
    : null;

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
      <div className="event-card-header">
        <div className="event-card-dateblock" aria-label={formatDateRange(event, language)}>
          <span className="event-card-date-month">{startDateParts.month}</span>
          <strong className="event-card-date-day">{startDateParts.day}</strong>
          <span className="event-card-date-year">{startDateParts.year}</span>
        </div>
        <div className="event-card-topline">
          <EventStatusBadge status={event.status} t={t} />
          <EventSourceLabel sourceUrl={event.sourceUrl} t={t} />
        </div>
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <div className="event-card-date-range">
          <CalendarDays size={15} />
          <span>
            {formatDate(event.startDate, language)}
            {endDateLabel ? ` - ${endDateLabel}` : ""}
          </span>
        </div>
        <div className="event-card-meta">
          <span className="event-card-meta-item">{event.sport}</span>
          <span className="event-card-meta-separator" aria-hidden="true">/</span>
          <span className="event-card-meta-item">{event.organization}</span>
        </div>
      </div>
      <div className="event-card-facts">
        <span className="event-card-location">
          <MapPin size={15} />
          {countryFlag ? (
            <span className="event-location-flag" aria-hidden="true">
              {countryFlag}
            </span>
          ) : null}
          <span className="event-location-text">{formatLocation(event)}</span>
        </span>
        <span>
          <CalendarDays size={15} />
          {formatDateRange(event, language)}
        </span>
      </div>
      <div className="event-card-actions" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <Button className="event-card-primary-action" variant="outline" onClick={openDetails}>
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
