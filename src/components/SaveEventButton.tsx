import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Translation } from "@/i18n/translations";

export function SaveEventButton({
  eventId,
  isSaved,
  t,
  onToggle,
}: {
  eventId: number;
  isSaved: boolean;
  t: Translation;
  onToggle: (eventId: number) => void;
}) {
  return (
    <Button
      className="save-event-button"
      type="button"
      variant={isSaved ? "secondary" : "outline"}
      onClick={() => onToggle(eventId)}
    >
      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      {isSaved ? t.saved : t.save}
    </Button>
  );
}
