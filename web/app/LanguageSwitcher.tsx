"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, LOCALE_INFO } from "./LocaleContext";
import { Locale } from "./locales";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const locales: Locale[] = ["en", "zh", "jp", "es"];
  const currentInfo = LOCALE_INFO[locale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wide transition-all hover:text-[var(--primary)] hover:bg-[rgba(139,92,246,0.1)] rounded"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-secondary)" }}
        aria-label="Change language"
        title="Change language"
      >
        <span className="text-lg">{currentInfo.flag}</span>
        <span className="hidden sm:inline">{currentInfo.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 py-2 w-48 rounded-lg overflow-hidden z-50"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {locales.map((loc) => {
            const info = LOCALE_INFO[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-[rgba(139,92,246,0.2)] ${
                  isActive ? "bg-[rgba(139,92,246,0.15)]" : ""
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="text-xl">{info.flag}</span>
                <div className="flex-1 text-left">
                  <div style={{ color: isActive ? "#FBBF24" : "var(--text-primary)", fontWeight: isActive ? 600 : 400 }}>
                    {info.nativeName}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {info.name}
                  </div>
                </div>
                {isActive && (
                  <span style={{ color: "#22C55E" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
