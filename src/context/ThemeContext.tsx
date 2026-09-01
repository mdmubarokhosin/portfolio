"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// External store for theme — SSR-safe via useSyncExternalStore
let currentTheme: Theme = "light";
const themeListeners = new Set<() => void>();

function subscribeTheme(cb: () => void) { themeListeners.add(cb); return () => themeListeners.delete(cb); }
function getThemeSnapshot(): Theme { return currentTheme; }
function getServerThemeSnapshot(): Theme { return "light"; }

function setThemeExternal(theme: Theme) {
  currentTheme = theme;
  try { localStorage.setItem("portfolio-theme", theme); } catch { /* ignore */ }
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  themeListeners.forEach((cb) => cb());
}

// Initialize from localStorage (client-only, after module loads)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("portfolio-theme") as Theme | null;
    if (saved === "light" || saved === "dark") currentTheme = saved;
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) currentTheme = "dark";
  } catch { /* ignore */ }
  // Sync DOM on first load
  if (currentTheme === "dark") document.documentElement.classList.add("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = useCallback(() => {
    setThemeExternal(currentTheme === "light" ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
