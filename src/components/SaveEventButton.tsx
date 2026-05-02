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
  isSaved: boolean | ((eventId: number) => boolean);
  t: Translation;
  onToggle: (eventId: number) => void;
}) {
  const saved = typeof isSaved === "function" ? isSaved(eventId) : isSaved;

  return (
    <Button
      className="save-event-button"
      type="button"
      variant={saved ? "secondary" : "outline"}
      onClick={() => onToggle(eventId)}
    >
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      {saved ? t.saved : t.save}
    </Button>
  );
}
