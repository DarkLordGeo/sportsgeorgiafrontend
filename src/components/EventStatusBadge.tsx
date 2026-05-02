import { Badge } from "@/components/ui/badge";
import type { Translation } from "@/i18n/translations";
import type { Status } from "@/mock/schedule";

export function EventStatusBadge({ status, t }: { status: Status; t: Translation }) {
  const label = t.statusLabels[status] ?? status;

  return (
    <Badge variant="outline" className={`event-status-badge ${status}`}>
      {label}
    </Badge>
  );
}
