"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale, TranslationKey } from "./locales";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const LOCALE_STORAGE_KEY = "agentkred_locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && ["en", "zh", "jp", "es"].includes(saved)) {
      setLocaleState(saved as Locale);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  };

  // Prevent hydration mismatch by rendering default locale until mounted
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: "en", setLocale, t: (key) => translations.en[key] || key }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

// Language display names and flags
export const LOCALE_INFO: Record<Locale, { flag: string; name: string; nativeName: string }> = {
  en: { flag: "🇺🇸", name: "English", nativeName: "English" },
  zh: { flag: "🇨🇳", name: "Chinese", nativeName: "中文" },
  jp: { flag: "🇯🇵", name: "Japanese", nativeName: "日本語" },
  es: { flag: "🇪🇸", name: "Spanish", nativeName: "Español" },
};
