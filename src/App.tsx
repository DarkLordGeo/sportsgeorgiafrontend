import { CalendarDays, CircleDot, LayoutDashboard, Moon, Star, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SavedEventsPage } from "@/components/SavedEventsPage";
import { translations, type Language } from "@/i18n/translations";
import { HomePage } from "@/pages/HomePage";
import { EventsPage } from "@/pages/EventsPage";
import { EventDetailsPage } from "@/pages/EventDetailsPage";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { useEvents } from "@/hooks/queries";

type Theme = "light" | "dark";
const themeStorageKey = "sportsgeorgia-theme";
const languageStorageKey = "sportsgeorgia-language";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ka";
  const storedLanguage = window.localStorage.getItem(languageStorageKey);
  return storedLanguage === "en" ? "en" : "ka";
}

function useThemeMode() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);
  return { theme, toggleTheme: () => setTheme((c) => (c === "dark" ? "light" : "dark")) };
}

function useLanguageMode() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  useEffect(() => {
    document.documentElement.lang = language === "ka" ? "ka-GE" : "en";
    window.localStorage.setItem(languageStorageKey, language);
  }, [language]);
  return { language, setLanguage };
}

function upsertMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={`sg-nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );
}

export function App() {
  const { theme, toggleTheme } = useThemeMode();
  const { language, setLanguage } = useLanguageMode();
  const t = translations[language];
  const navigate = useNavigate();
  const location = useLocation();

  // Load all events for SavedEventsPage since it expects EventRecord[]
  // In a real app we might fetch by ID list, but this is a simple adaptation
  const { data: allEventsData } = useEvents();

  const allEvents = allEventsData?.results || [];
  const { savedIds, isSaved, toggleSaved } = useSavedEvents();
  const savedEvents = allEvents.filter((event) => savedIds.includes(event.id));

  useEffect(() => {
    const baseTitle = "SportsGeorgia";
    const pageTitle = location.pathname === "/"
      ? `${baseTitle} | Sports Schedule Aggregator`
      : location.pathname.startsWith("/events/")
        ? `${baseTitle} | Event Details`
        : location.pathname.startsWith("/events")
          ? `${baseTitle} | Events`
          : `${baseTitle} | Saved Events`;

    const description = location.pathname.startsWith("/events")
      ? "Browse upcoming Georgian and international sports events with filters for date, sport, organization, country, city, and status."
      : "Track official sports schedules in a clean dashboard built for fast scanning, saved events, and Georgia-first event discovery.";

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:url"]', "property", "og:url", window.location.href);
  }, [location.pathname]);

  return (
    <div className="sg-app">
      <header className="sg-header">
        <div className="sg-topbar">
          <button className="sg-brand" type="button" onClick={() => navigate("/")}>
            <span className="sg-brand-mark"><CircleDot size={19} /></span>
            <span><strong>{t.appName}</strong><small>{t.tagline}</small></span>
          </button>
          <div className="sg-header-actions">
            <LanguageToggle language={language} t={t} onChange={setLanguage} />
            <button
              className="theme-toggle" type="button"
              title={theme === "dark" ? t.lightMode : t.darkMode}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === "dark" ? t.light : t.dark}</span>
            </button>
          </div>
        </div>

        <nav className="sg-nav" aria-label={t.mainNavigation}>
          <NavButton active={location.pathname === "/"} icon={<LayoutDashboard />} label={t.navHome} onClick={() => navigate("/")} />
          <NavButton active={location.pathname.startsWith("/events")} icon={<CalendarDays />} label={t.navEvents} onClick={() => navigate("/events")} />
          <NavButton active={location.pathname === "/saved"} icon={<Star />} label={t.navSaved} onClick={() => navigate("/saved")} />
        </nav>
      </header>

      <main className="sg-content">
        <Routes>
          <Route path="/" element={<HomePage language={language} t={t} />} />
          <Route path="/events" element={<EventsPage language={language} t={t} />} />
          <Route path="/events/:id" element={<EventDetailsPage language={language} t={t} />} />
          <Route path="/saved" element={
            <SavedEventsPage 
              events={savedEvents} 
              isSaved={isSaved} 
              language={language} 
              t={t} 
              onOpenDetails={(id) => navigate(`/events/${id}`)} 
              onToggleSaved={toggleSaved} 
            />
          } />
        </Routes>
      </main>
    </div>
  );
}
