import type { PortfolioData } from "@/context/PortfolioDataContext";

/** Every portfolio section stored under `portfolio/{key}` in Firebase. */
export const SECTION_KEYS: Array<keyof PortfolioData> = [
  "personal",
  "stats",
  "pages",
  "socialLinks",
  "services",
  "skills",
  "skillCategories",
  "additionalTools",
  "projects",
  "projectCategories",
  "experiences",
  "education",
  "testimonials",
  "certificates",
  "faq",
  "contactInfo",
];

export type PortfolioSectionKey = keyof PortfolioData;
