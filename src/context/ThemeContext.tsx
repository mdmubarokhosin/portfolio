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

type Theme = "light" | "dark";

let currentTheme: Theme = "light";
const listeners = new Set<() => void>();
const STORAGE_KEY = "portfolio-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function setThemeGlobal(theme: Theme) {
  if (typeof window === "undefined") return;
  currentTheme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable */
  }
  applyTheme(theme);
  emit();
}

function emit() {
  listeners.forEach((l) => l());
}

const ThemeContext = createContext<null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme: Theme = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    currentTheme = theme;
    applyTheme(theme);
    emit();

    // Prevent theme flash: set background as early as possible on next loads
    return () => listeners.clear();
  }, []);

  return <ThemeContext.Provider value={null}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => currentTheme,
    () => "light" as Theme
  );

  const toggleTheme = useCallback(() => {
    setThemeGlobal(currentTheme === "light" ? "dark" : "light");
  }, []);

  return useMemo(() => ({ theme, isDark: theme === "dark", toggleTheme }), [theme, toggleTheme]);
}
