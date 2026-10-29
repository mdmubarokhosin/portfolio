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
import defaultData from "@/data/portfolio.json";
import {
  fetchFirebasePortfolio,
  fetchSettings,
  mergePortfolio,
  seedMissingSections,
  type SiteSettings,
} from "@/lib/portfolio-store";

// ─── Types (mirroring portfolio.json) ────────────────────────────────

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
  /** Bengali suffix, e.g. " বছর" for " Years" — falls back to a word map when absent */
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
  /** Optional custom URL slug for /Services/<slug> (derived from title when empty) */
  slug?: string;
  /** Long overview copy for the service detail page (EN) */
  overview?: string;
  /** Long overview copy for the service detail page (BN) */
  overviewBn?: string;
  /** Newline-separated "what's included" list (EN) */
  features?: string;
  /** Newline-separated "what's included" list (BN) */
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

// ─── Context ─────────────────────────────────────────────────────────

type DataSource = "loading" | "firebase" | "offline";

interface PortfolioContextValue {
  data: PortfolioData;
  settings: SiteSettings;
  source: DataSource;
  lastSync: Date | null;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

const POLL_MS = 20_000;

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  // Bundled seed paints instantly; Firebase content replaces it on load.
  const [data, setData] = useState<PortfolioData>(defaultData as PortfolioData);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [source, setSource] = useState<DataSource>("loading");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const firstLoad = useRef(true);
  // Monotonic request id — discards stale responses so an in-flight poll that
  // started BEFORE an admin save can never overwrite the newer state after it.
  const reqId = useRef(0);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    try {
      const [fbPortfolio, fbSettings] = await Promise.all([
        fetchFirebasePortfolio(),
        fetchSettings(),
      ]);

      // A newer load() (or a post-save refresh) superseded this one → drop it
      if (id !== reqId.current) return;

      // Only swap state when content actually changed — otherwise every poll
      // would replace object references and wipe in-progress admin drafts.
      if (fbSettings && Object.keys(fbSettings).length) {
        setSettings((prev) => (stableEqual(prev, fbSettings) ? prev : fbSettings));
      }

      if (fbPortfolio && Object.keys(fbPortfolio).length > 0) {
        const merged = mergePortfolio(fbPortfolio);
        setData((prev) => (stableEqual(prev, merged) ? prev : merged));
        setSource("firebase");
        setLastSync(new Date());
      } else if (fbPortfolio !== null) {
        // Database reachable but empty → seed it so Firebase becomes the source
        await seedMissingSections();
        if (id !== reqId.current) return;
        const seeded = await fetchFirebasePortfolio();
        if (id !== reqId.current) return;
        const merged = mergePortfolio(seeded);
        setData((prev) => (stableEqual(prev, merged) ? prev : merged));
        setSource("firebase");
        setLastSync(new Date());
      } else {
        // Database unreachable → keep seed, flag offline
        setSource((s) => (s === "firebase" ? s : "offline"));
      }
    } catch {
      setSource((s) => (s === "firebase" ? s : "offline"));
    } finally {
      firstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(load, POLL_MS);

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
    () => ({ data, settings, source, lastSync, refresh: load }),
    [data, settings, source, lastSync, load]
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
