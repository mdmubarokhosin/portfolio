"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import defaultData from "@/data/portfolio.json";

// ---------------------------------------------------------------------------
// Types – mirrors the top-level keys in portfolio.json
// ---------------------------------------------------------------------------

interface Personal {
  name: string;
  nameBn: string;
  firstName: string;
  firstNameBn: string;
  initials: string;
  title: string;
  titleBn: string;
  tagline: string;
  taglineBn: string;
  bio: {
    short: string;
    shortBn: string;
    full: string[];
    fullBn: string[];
  };
  email: string;
  phone: string;
  location: string;
  locationEn: string;
  languages: string[];
  availability: string;
  availabilityBn: string;
  profileImage: string;
  resumeUrl: string;
  siteLogo: string;
  [key: string]: unknown;
}

interface Stat {
  label: string;
  labelBn?: string;
  value: number;
  suffix?: string;
  icon: string;
  [key: string]: unknown;
}

interface PageItem {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
  [key: string]: unknown;
}

interface SocialLink {
  name: string;
  icon: string;
  url: string;
  [key: string]: unknown;
}

interface Service {
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  icon: string;
  color: string;
  [key: string]: unknown;
}

interface Skill {
  name: string;
  icon: string;
  level: number;
  color: string;
  category: string;
  logoUrl?: string;
  [key: string]: unknown;
}

interface SkillCategory {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
  [key: string]: unknown;
}

interface AdditionalTool {
  name: string;
  icon: string;
  logoUrl?: string;
  [key: string]: unknown;
}

interface Project {
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
  projectLogo: string;
  coverImage: string;
  [key: string]: unknown;
}

interface ProjectCategory {
  id: string;
  label: string;
  labelBn?: string;
  icon: string;
  [key: string]: unknown;
}

interface Experience {
  title: string;
  titleBn?: string;
  company: string;
  period: string;
  periodBn?: string;
  description: string;
  descriptionBn?: string;
  icon: string;
  type: string;
  [key: string]: unknown;
}

interface Education {
  degree: string;
  degreeBn?: string;
  institution: string;
  institutionBn?: string;
  period: string;
  periodBn?: string;
  icon: string;
  [key: string]: unknown;
}

interface Testimonial {
  name: string;
  role: string;
  roleBn?: string;
  text: string;
  textBn?: string;
  avatar: string;
  [key: string]: unknown;
}

interface Certificate {
  title: string;
  titleBn?: string;
  issuer: string;
  issuerBn?: string;
  date: string;
  icon: string;
  color: string;
  url: string;
  [key: string]: unknown;
}

interface FAQ {
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  [key: string]: unknown;
}

interface ContactInfo {
  icon: string;
  title: string;
  titleBn?: string;
  value: string;
  valueEn?: string;
  link: string | null;
  [key: string]: unknown;
}

export interface PortfolioData {
  personal: Personal;
  stats: Stat[];
  pages: PageItem[];
  socialLinks: SocialLink[];
  services: Service[];
  skills: Skill[];
  skillCategories: SkillCategory[];
  additionalTools: AdditionalTool[];
  projects: Project[];
  projectCategories: ProjectCategory[];
  experiences: Experience[];
  education: Education[];
  testimonials: Testimonial[];
  certificates: Certificate[];
  faq: FAQ[];
  contactInfo: ContactInfo[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PortfolioDataContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(
  undefined
);

export function usePortfolioData(): PortfolioDataContextType {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    throw new Error(
      "usePortfolioData must be used within a <PortfolioDataProvider>"
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(
    defaultData as unknown as PortfolioData
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PortfolioData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch portfolio data, using fallback:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Keep the default data already set in state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PortfolioDataContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}
