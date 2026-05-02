import { ExternalLink } from "lucide-react";
import type { Translation } from "@/i18n/translations";

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function EventSourceLabel({ sourceUrl, t }: { sourceUrl: string; t: Translation }) {
  const host = sourceHost(sourceUrl);

  return (
    <span className="event-source-label">
      <ExternalLink size={14} />
      {host || t.officialSource}
    </span>
  );
}
