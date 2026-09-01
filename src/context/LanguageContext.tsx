"use client";

import { createContext, useContext, useState, useCallback, useSyncExternalStore, ReactNode } from "react";
import translations from "@/data/translations.json";

type Lang = "en" | "bn";

interface LanguageContextType {
  lang: Lang;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// External store for language — SSR-safe via useSyncExternalStore
let currentLang: Lang = "en";
const langListeners = new Set<() => void>();

function subscribeLang(cb: () => void) { langListeners.add(cb); return () => langListeners.delete(cb); }
function getLangSnapshot(): Lang { return currentLang; }
function getServerLangSnapshot(): Lang { return "en"; }

function setLangExternal(lang: Lang) {
  currentLang = lang;
  try { localStorage.setItem("portfolio-lang", lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  if (lang === "bn") document.documentElement.classList.add("lang-bn");
  else document.documentElement.classList.remove("lang-bn");
  langListeners.forEach((cb) => cb());
}

// Initialize from localStorage (client-only, after module loads)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("portfolio-lang") as Lang | null;
    if (saved === "en" || saved === "bn") currentLang = saved;
  } catch { /* ignore */ }
  // Sync DOM on first load
  document.documentElement.lang = currentLang;
  if (currentLang === "bn") document.documentElement.classList.add("lang-bn");
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);

  const toggleLanguage = useCallback(() => {
    setLangExternal(currentLang === "en" ? "bn" : "en");
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let result: unknown = translations[lang];
      for (const k of keys) {
        if (result && typeof result === "object" && k in (result as Record<string, unknown>)) {
          result = (result as Record<string, unknown>)[k];
        } else {
          let fallback: unknown = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in (fallback as Record<string, unknown>)) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else return key;
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }
      return typeof result === "string" ? result : key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t, isBn: lang === "bn" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
