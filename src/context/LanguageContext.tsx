"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import translations from "@/data/translations.json";

type Lang = "en" | "bn";

let currentLang: Lang = "en";
const listeners = new Set<() => void>();
const STORAGE_KEY = "portfolio-lang";

function emit() {
  listeners.forEach((l) => l());
}

function setLangGlobal(lang: Lang) {
  if (typeof window === "undefined") return;
  currentLang = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = lang;
  emit();
}

function getSnapshot(): Lang {
  return currentLang;
}

function getServerSnapshot(): Lang {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const lang: Lang = stored === "bn" || stored === "en" ? stored : "en";
    currentLang = lang;
    document.documentElement.lang = lang;
    emit();
  }, []);

  return <LanguageContext.Provider value={null}>{children}</LanguageContext.Provider>;
}

const LanguageContext = createContext<null>(null);

export function useLanguage() {
  const lang = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    getServerSnapshot
  );

  const toggleLanguage = useCallback(() => {
    setLangGlobal(currentLang === "en" ? "bn" : "en");
  }, []);

  const t = useCallback(
    (key: string): string => {
      const walk = (tree: Record<string, unknown>, path: string[]): string | undefined => {
        let node: unknown = tree;
        for (const part of path) {
          if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
            node = (node as Record<string, unknown>)[part];
          } else {
            return undefined;
          }
        }
        return typeof node === "string" ? node : undefined;
      };

      const path = key.split(".");
      return (
        walk(translations[lang] as Record<string, unknown>, path) ??
        walk(translations.en as Record<string, unknown>, path) ??
        key
      );
    },
    [lang]
  );

  return useMemo(
    () => ({ lang, isBn: lang === "bn", t, toggleLanguage }),
    [lang, t, toggleLanguage]
  );
}
