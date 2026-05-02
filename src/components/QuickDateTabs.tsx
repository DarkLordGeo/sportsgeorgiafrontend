import type { Translation } from "@/i18n/translations";

export type DatePreset = "" | "today" | "week" | "month";

export function QuickDateTabs({
  value,
  t,
  onChange,
}: {
  value: DatePreset;
  t: Translation;
  onChange: (value: DatePreset) => void;
}) {
  const tabs: Array<{ value: DatePreset; label: string }> = [
    { value: "today", label: t.today },
    { value: "week", label: t.thisWeek },
    { value: "month", label: t.thisMonth },
  ];

  return (
    <div className="quick-date-tabs" aria-label={t.quickLinks}>
      {tabs.map((tab) => (
        <button
          className={value === tab.value ? "active" : ""}
          key={tab.value}
          type="button"
          onClick={() => onChange(value === tab.value ? "" : tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
