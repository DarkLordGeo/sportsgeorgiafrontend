import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventSourceLabel } from "@/components/EventSourceLabel";
import { EventStatusBadge } from "@/components/EventStatusBadge";
import { SaveEventButton } from "@/components/SaveEventButton";
import type { Language, Translation } from "@/i18n/translations";
import { formatDateRange, formatLocation } from "@/lib/event-format";
import type { EventRecord } from "@/mock/schedule";

export function EventTableDesktop({
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
    <div className="event-table-desktop">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.event}</TableHead>
            <TableHead>{t.sport}</TableHead>
            <TableHead>{t.organization}</TableHead>
            <TableHead>{t.location}</TableHead>
            <TableHead>{t.dates}</TableHead>
            <TableHead>{t.status}</TableHead>
            <TableHead>{t.source}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <strong>{event.title}</strong>
              </TableCell>
              <TableCell>{event.sport}</TableCell>
              <TableCell>{event.organization}</TableCell>
              <TableCell>
                <span className="location-cell">
                  <MapPin size={15} />
                  {formatLocation(event)}
                </span>
              </TableCell>
              <TableCell>{formatDateRange(event, language)}</TableCell>
              <TableCell>
                <EventStatusBadge status={event.status} t={t} />
              </TableCell>
              <TableCell>
                <EventSourceLabel sourceUrl={event.sourceUrl} t={t} />
              </TableCell>
              <TableCell>
                <div className="table-actions">
                  <Button variant="outline" onClick={() => onOpenDetails(event.id)}>
                    {t.details}
                  </Button>
                  <SaveEventButton
                    eventId={event.id}
                    isSaved={isSaved(event.id)}
                    t={t}
                    onToggle={onToggleSaved}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
