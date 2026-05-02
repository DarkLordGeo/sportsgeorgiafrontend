import { Badge } from "@/components/ui/badge";
import type { Translation } from "@/i18n/translations";
import type { Status } from "@/mock/schedule";

export function EventStatusBadge({ status, t }: { status: Status; t: Translation }) {
  return <Badge className={`event-status-badge ${status}`}>{t.statusLabels[status]}</Badge>;
}
