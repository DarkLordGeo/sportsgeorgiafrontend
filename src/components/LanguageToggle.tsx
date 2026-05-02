import type { Language, Translation } from "@/i18n/translations";

export function LanguageToggle({
  language,
  t,
  onChange,
}: {
  language: Language;
  t: Translation;
  onChange: (language: Language) => void;
}) {
  return (
    <div className="language-toggle" aria-label={t.language}>
      {(["ka", "en"] as const).map((option) => (
        <button
          className={language === option ? "active" : ""}
          key={option}
          type="button"
          onClick={() => onChange(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
