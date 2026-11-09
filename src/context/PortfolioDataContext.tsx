"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchFirebasePortfolio,
  normalizePortfolio,
  fetchSettings,
} from "@/lib/portfolio-store";
import type { SiteSettings } from "@/lib/site-settings";
import { FIREBASE_CONFIG } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────

export interface Personal {
  name: string;
  nameBn?: string;
  firstName: string;
  firstNameBn?: string;
  initials: string;
  title: string;
  titleBn?: string;
  tagline: string;
  taglineBn?: string;
  bio: { short: string; shortBn?: string; full: string[]; fullBn?: string[] };
  email: string;
  location: string;
  locationEn?: string;
  languages: string[];
  languagesBn?: string[];
  availability: string;
  availabilityBn?: string;
  workingHours?: string;
  workingHoursBn?: string;
  profileImage?: string;
  profileVideo?: string;
  resumeUrl?: string;
  siteLogo?: string;
}

export interface Stat {
  label: string;
  labelBn?: string;
  value: number;
  suffix: string;
  suffixBn?: string;
  icon: string;
}

export interface PageItem {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
}

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

export interface Service {
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  icon: string;
  slug?: string;
  overview?: string;
  overviewBn?: string;
  features?: string;
  featuresBn?: string;
}

export interface Skill {
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  logoUrl?: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
}

export interface ToolItem {
  name: string;
  icon: string;
  logoUrl?: string;
}

export interface Project {
  id: number;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  tags: string[];
  icon: string;
  color: string;
  liveUrl: string;
  codeUrl: string;
  featured: boolean;
  category: string;
  coverImage?: string;
  coverVideo?: string;
}

export interface Experience {
  title: string;
  titleBn?: string;
  company: string;
  companyBn?: string;
  period: string;
  periodBn?: string;
  description: string;
  descriptionBn?: string;
  icon: string;
  type: string;
  typeBn?: string;
}

export interface Education {
  degree: string;
  degreeBn?: string;
  institution: string;
  institutionBn?: string;
  period: string;
  periodBn?: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  nameBn?: string;
  role: string;
  roleBn?: string;
  quote: string;
  quoteBn?: string;
}

export interface Certificate {
  title: string;
  titleBn?: string;
  issuer: string;
  issuerBn?: string;
  date: string;
  dateBn?: string;
  color?: string;
}

export interface FAQ {
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
}

export interface ContactInfo {
  icon: string;
  title: string;
  titleBn?: string;
  value: string;
  valueEn?: string;
  link?: string | null;
}

export interface PortfolioData {
  personal: Personal;
  stats: Stat[];
  pages: PageItem[];
  socialLinks: SocialLink[];
  services: Service[];
  skills: Skill[];
  skillCategories: CategoryItem[];
  additionalTools: ToolItem[];
  projects: Project[];
  projectCategories: CategoryItem[];
  experiences: Experience[];
  education: Education[];
  testimonials: Testimonial[];
  certificates: Certificate[];
  faq: FAQ[];
  contactInfo: ContactInfo[];
}

/** Empty skeleton — content comes 100% from Firebase (no bundled seed). */
const EMPTY_DATA: PortfolioData = {
  personal: {
    name: "",
    firstName: "",
    initials: "",
    title: "",
    tagline: "",
    bio: { short: "", full: [] },
    email: "",
    location: "",
    languages: [],
    availability: "",
  },
  stats: [],
  pages: [],
  socialLinks: [],
  services: [],
  skills: [],
  skillCategories: [],
  additionalTools: [],
  projects: [],
  projectCategories: [],
  experiences: [],
  education: [],
  testimonials: [],
  certificates: [],
  faq: [],
  contactInfo: [],
};

// ─── Context ─────────────────────────────────────────────────────────

export type DataStatus = "loading" | "ready" | "error";

interface PortfolioContextValue {
  data: PortfolioData;
  settings: SiteSettings;
  status: DataStatus;
  source: "firebase" | "offline";
  lastSync: Date | null;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

/** Poll cadence (only while the tab is visible). */
const POLL_MS = 30_000;
/**
 * When the lightweight `sync` marker node is missing (legacy database), fall
 * back to a full refetch — but at a relaxed cadence to save quota.
 */
const FULL_FALLBACK_EVERY = 2; // ticks → ~60s

type SyncMeta = { portfolio?: number; settings?: number } | null;

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(EMPTY_DATA);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [status, setStatus] = useState<DataStatus>("loading");
  const [source, setSource] = useState<"firebase" | "offline">("firebase");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monotonic request id — discards stale responses
  const reqId = useRef(0);
  // Last seen sync markers (null = unknown → full fetch)
  const lastSyncMeta = useRef<SyncMeta>(null);
  const tick = useRef(0);
  const statusRef = useRef<DataStatus>("loading");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const loadPortfolio = useCallback(async (id: number): Promise<boolean> => {
    const fbPortfolio = await fetchFirebasePortfolio();
    if (id !== reqId.current) return true; // superseded
    if (!fbPortfolio) return false; // unreachable
    const merged = normalizePortfolio(
      Object.keys(fbPortfolio).length ? fbPortfolio : {}
    );
    setData((prev) => (stableEqual(prev, merged) ? prev : merged));
    return true;
  }, []);

  const loadSettings = useCallback(async (id: number): Promise<boolean> => {
    const fbSettings = await fetchSettings();
    if (id !== reqId.current) return true;
    if (!fbSettings) return false;
    setSettings((prev) => (stableEqual(prev, fbSettings) ? prev : fbSettings));
    return true;
  }, []);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    try {
      // Tiny marker node tells us whether anything changed since last poll.
      let meta: SyncMeta = null;
      try {
        const res = await fetch(
          `${FIREBASE_CONFIG.databaseURL.replace(/\/$/, "")}/sync.json`,
          { cache: "no-store" }
        );
        if (res.ok) meta = (await res.json()) as SyncMeta;
      } catch {
        meta = null;
      }
      if (id !== reqId.current) return;

      const prev = lastSyncMeta.current;
      let needPortfolio: boolean;
      let needSettings: boolean;

      if (meta !== null && prev !== null) {
        // Sync markers present → fetch only the parts that actually changed.
        needPortfolio = (meta.portfolio ?? 0) !== (prev.portfolio ?? 0);
        needSettings = (meta.settings ?? 0) !== (prev.settings ?? 0);
      } else if (meta === null && prev === null) {
        // Legacy database without sync markers → relaxed full refetch
        tick.current += 1;
        const due = tick.current % FULL_FALLBACK_EVERY === 1;
        needPortfolio = due || statusRef.current === "error";
        needSettings = due || statusRef.current === "error";
      } else {
        // Marker appeared/disappeared → full refresh
        needPortfolio = true;
        needSettings = true;
      }

      lastSyncMeta.current = meta;

      let okP = true;
      let okS = true;
      if (needPortfolio) okP = await loadPortfolio(id);
      if (needSettings) okS = await loadSettings(id);
      if (id !== reqId.current) return;

      if (!okP || !okS) {
        setStatus((s) => (s === "ready" ? s : "error"));
        setSource((s) => (s === "firebase" ? s : "offline"));
      } else {
        setStatus("ready");
        setSource("firebase");
        setLastSync(new Date());
      }
    } catch {
      setStatus((s) => (s === "ready" ? s : "error"));
      setSource((s) => (s === "firebase" ? s : "offline"));
    }
  }, [loadPortfolio, loadSettings]);

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      // Pause polling entirely while the tab is hidden (saves quota)
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        load();
      }
    }, POLL_MS);

    // Instant refresh when the visitor comes back
    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const value = useMemo(
    () => ({ data, settings, status, source, lastSync, refresh: load }),
    [data, settings, status, source, lastSync, load]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolioData() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolioData must be used within PortfolioDataProvider");
  return ctx;
}

/** Deep value equality via stable JSON serialization (key-sorted objects). */
function stableEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try {
    return stableStringify(a) === stableStringify(b);
  } catch {
    return false;
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

// Helper: pick localized field
export function pick<T>(isBn: boolean, base: T, bn?: T | undefined): T {
  return (isBn && bn !== undefined && bn !== null ? bn : base) as T;
}
