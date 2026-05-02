import type { Language } from "@/i18n/translations";

export function LanguageToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div className="language-toggle" aria-label="Language">
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
