/**
 * Portfolio data store — Firebase RTDB ↔ site model
 *
 * The database is the single source of truth for everything the visitor
 * sees (portfolio content, settings, contact messages, visitor stats).
 * The bundled seed (portfolio.json) is used as:
 *   1. instant first paint (no skeleton flash)
 *   2. fallback when a section is missing in Firebase
 *   3. enrichment for media (Remotion cover videos) not set in the admin
 */

import defaultData from "@/data/portfolio.json";
import type { PortfolioData, Project } from "@/context/PortfolioDataContext";
import { dbGet, dbSet, dbRemove, dbUpdate, generateId, nowISO } from "./firebase";

export type PortfolioSectionKey = keyof PortfolioData;

export const SECTION_KEYS: PortfolioSectionKey[] = [
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

export const seedData = defaultData as PortfolioData;

// ── Fetch every section from Firebase ───────────────────────────────
export async function fetchFirebasePortfolio(): Promise<Partial<Record<PortfolioSectionKey, unknown>> | null> {
  const raw = await dbGet<Record<string, { dataJson?: string } | null>>("portfolio");
  if (!raw) return null;
  const out: Partial<Record<PortfolioSectionKey, unknown>> = {};
  for (const [section, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue;
    try {
      const parsed = value.dataJson != null ? JSON.parse(value.dataJson) : value;
      out[section as PortfolioSectionKey] = parsed;
    } catch {
      /* skip corrupt section */
    }
  }
  return out;
}

// ── Save one section (same node format as the original admin) ───────
export async function savePortfolioSection(
  section: PortfolioSectionKey,
  value: unknown
): Promise<void> {
  await dbSet(`portfolio/${section}`, {
    dataJson: JSON.stringify(value),
    id: section,
    updatedAt: nowISO(),
  });
}

// ── Media enrichment (Remotion videos for items without one) ────────
/**
 * All self-hosted project cover videos live in /videos/projects/ (rendered
 * by the Remotion kit). Older databases stored legacy paths like
 * "/videos/ecommerce.mp4" and legacy posters like "/images/projects/ecommerce.jpg"
 * — normalizeProjectMedia() rewrites those so every project gets a working
 * cover without the admin having to re-save anything.
 */
const PROJECT_VIDEOS = [
  "/videos/projects/ecommerce.mp4",
  "/videos/projects/dashboard.mp4",
  "/videos/projects/mobileapp.mp4",
  "/videos/projects/portfolio-site.mp4",
  "/videos/projects/devblog.mp4",
  "/videos/projects/abhijog.mp4",
  "/videos/projects/ibadat365.mp4",
  "/videos/projects/expense-manager.mp4",
  "/videos/projects/unified-geo-api.mp4",
  "/videos/projects/madrasa-management.mp4",
  "/videos/projects/chatbd.mp4",
  "/videos/projects/overtime-bd.mp4",
  "/videos/projects/bangla-font-cdn.mp4",
  "/videos/projects/free-food-map.mp4",
];

const PROJECT_VIDEO_NAMES = new Set(
  PROJECT_VIDEOS.map((u) => u.slice(u.lastIndexOf("/") + 1))
);

/** "/videos/ecommerce.mp4" → "/videos/projects/ecommerce.mp4" (legacy fix). */
function normalizeVideoUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const m = url.match(/^\/videos\/([^/]+\.mp4)$/);
  if (m && PROJECT_VIDEO_NAMES.has(m[1])) return `/videos/projects/${m[1]}`;
  return url;
}

/** Poster paired with a project video: ecommerce.mp4 → ecommerce-poster.jpg */
function posterForVideo(videoUrl: string | undefined): string | undefined {
  const m = videoUrl?.match(/\/videos\/projects\/([^/]+)\.mp4$/);
  return m ? `/images/projects/${m[1]}-poster.jpg` : undefined;
}

/** Self-hosted skill logos (Firebase may reference old /logos/* paths) */
const SKILL_LOGOS: Record<string, string> = {
  react: "/images/skills/react.svg",
  reactjs: "/images/skills/react.svg",
  "next.js": "/images/skills/nextdotjs.svg",
  nextjs: "/images/skills/nextdotjs.svg",
  typescript: "/images/skills/typescript.svg",
  tailwind: "/images/skills/tailwindcss.svg",
  "tailwind css": "/images/skills/tailwindcss.svg",
  node: "/images/skills/nodedotjs.svg",
  "node.js": "/images/skills/nodedotjs.svg",
  firebase: "/images/skills/firebase.svg",
  figma: "/images/skills/figma.svg",
  git: "/images/skills/git.svg",
  github: "/images/skills/git.svg",
  javascript: "/images/skills/javascript.svg",
  mongodb: "/images/skills/mongodb.svg",
};

function enrichSkills(skills: Array<{ name: string; logoUrl?: string } & Record<string, unknown>>) {
  return skills.map((s) => {
    const key = (s.name ?? "").toLowerCase().trim();
    const local = SKILL_LOGOS[key];
    const url = s.logoUrl ?? "";
    const broken =
      !url ||
      url.startsWith("/logos/") ||
      (!url.startsWith("http") && !url.startsWith("/images/") && !url.startsWith("data:"));
    return { ...s, logoUrl: local ?? (broken ? undefined : url) };
  });
}

/** Shipped posters are named "<video-name>-poster.jpg" (e.g. ecommerce-poster.jpg). */
const SHIPPED_POSTER_RE = /^[a-z0-9-]+-poster\.(?:jpg|jpeg|png|webp)$/i;

function isLegacyPoster(url: string): boolean {
  const file = url.slice(url.lastIndexOf("/") + 1);
  return !SHIPPED_POSTER_RE.test(file);
}

/**
 * Fix legacy media paths on a single project:
 *  • coverVideo  — rewrite legacy "/videos/<name>.mp4" to "/videos/projects/<name>.mp4"
 *  • coverImage  — legacy "/images/projects/<name>.jpg" posters (no "-poster"
 *                  suffix) no longer exist on disk → fall back to the poster
 *                  paired with the project video, then to the seed default.
 *
 * FULL external URLs are first-class: a cover video/poster from ANY hosting
 * and ANY domain (https://cdn.example.com/clip.mp4 — Cloudflare R2,
 * Cloudinary, GitHub, যেকোনো হোস্ট) is preserved verbatim and works no matter
 * which domain the site itself is deployed on.
 */
function normalizeProjectMedia<T extends { coverVideo?: string; coverImage?: string }>(
  p: T,
  seedFallback?: string
): T {
  const coverVideo = normalizeVideoUrl(p.coverVideo);
  let coverImage = p.coverImage;
  if (
    coverImage &&
    !coverImage.startsWith("http") &&
    !coverImage.startsWith("data:") &&
    isLegacyPoster(coverImage)
  ) {
    // local path not matching the shipped "*-poster.jpg" naming → legacy
    coverImage = undefined;
  }
  return {
    ...p,
    coverVideo: coverVideo || p.coverVideo,
    coverImage:
      coverImage ||
      posterForVideo(coverVideo ?? p.coverVideo) ||
      seedFallback ||
      p.coverImage,
  };
}

function enrichProjects(projects: Project[]): Project[] {
  return projects.map((p, i) => {
    const seedFallback = seedData.projects[i % seedData.projects.length]?.coverImage;
    const fixed = normalizeProjectMedia(p, seedFallback);
    return {
      ...fixed,
      id: typeof p.id === "number" ? p.id : i + 1,
      coverVideo: fixed.coverVideo || PROJECT_VIDEOS[i % PROJECT_VIDEOS.length],
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  });
}

/** Merge seed defaults with Firebase content → guaranteed-complete model. */
export function mergePortfolio(fb: Partial<Record<PortfolioSectionKey, unknown>> | null): PortfolioData {
  const merged: Record<string, unknown> = { ...seedData };
  if (fb) {
    for (const key of SECTION_KEYS) {
      const value = fb[key];
      if (value !== undefined && value !== null) {
        // Firebase may store arrays as objects with numeric keys → normalize
        (merged as Record<string, unknown>)[key] = normalize(value);
      }
    }
  }

  // enrich media so the site stays video-first even for admin-added items
  const personal = { ...seedData.personal, ...((merged.personal as object) ?? {}) };
  /* Legacy-logo migration: the original site pointed siteLogo at a third-party
     image (1flex.org) — replace it with the self-hosted brand mark so the
     branded logo always shows unless the admin sets a custom one. */
  if (
    !personal.siteLogo ||
    personal.siteLogo.includes("1flex.org") ||
    personal.siteLogo.includes("logos/")
  ) {
    personal.siteLogo = "/brand/logo-mark.png";
  }
  merged.personal = { ...personal, profileVideo: personal.profileVideo || "/videos/avatar.mp4" };
  merged.skills = enrichSkills(((merged.skills as Array<{ name: string } & Record<string, unknown>>) ?? []));
  merged.projects = enrichProjects((merged.projects as Project[]) ?? []);

  for (const key of SECTION_KEYS) {
    if (merged[key] === undefined) merged[key] = seedData[key];
  }
  return merged as unknown as PortfolioData;
}

/** Convert Firebase object-keyed arrays back into real arrays, recursively. */
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const looksLikeArray =
      entries.length > 0 && entries.every(([k]) => /^\d+$/.test(k));
    if (looksLikeArray) {
      return entries
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, v]) => normalize(v));
    }
    const obj: Record<string, unknown> = {};
    for (const [k, v] of entries) obj[k] = normalize(v);
    return obj;
  }
  return value;
}

/** First-run seeding: write any section that does not exist yet in Firebase. */
export async function seedMissingSections(): Promise<number> {
  const raw = await dbGet<Record<string, unknown>>("portfolio");
  let written = 0;
  for (const key of SECTION_KEYS) {
    if (!raw || raw[key] === undefined || raw[key] === null) {
      await savePortfolioSection(key, seedData[key]);
      written++;
    }
  }
  return written;
}

/** Full sync: overwrite every section in Firebase with the current data. */
export async function syncAllSections(data: PortfolioData): Promise<void> {
  for (const key of SECTION_KEYS) {
    await savePortfolioSection(key, data[key]);
  }
}

// ── Contact messages ────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  budget?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function createContactMessage(msg: {
  name: string;
  email: string;
  subject: string;
  budget?: string;
  message: string;
}): Promise<void> {
  const id = generateId();
  await dbSet(`contactMessages/${id}`, { ...msg, read: false, createdAt: nowISO() });
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const raw = await dbGet<Record<string, Omit<ContactMessage, "id">>>("contactMessages");
  if (!raw) return [];
  return Object.entries(raw)
    .map(([id, value]) => ({ id, ...(value ?? {}) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  await dbUpdate(`contactMessages/${id}`, { read });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await dbRemove(`contactMessages/${id}`);
}

// ── Site settings ───────────────────────────────────────────────────
export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  seo_keywords?: string;
  og_image?: string;
  footer_text?: string;
  chatbot_enabled?: string;
  chatbot_name?: string;
  chatbot_system_prompt?: string;
  [key: string]: string | undefined;
}

export async function fetchSettings(): Promise<SiteSettings> {
  const raw = await dbGet<Record<string, { value?: string } | string>>("settings");
  if (!raw) return {};
  const out: SiteSettings = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = typeof value === "string" ? value : (value?.value ?? "");
  }
  return out;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await dbSet(`settings/${key}`, { value, updatedAt: nowISO(), id: key });
}

// ── Visitor stats ───────────────────────────────────────────────────
export async function fetchVisitors(): Promise<number> {
  const v = await dbGet<number>("stats/visitors");
  return typeof v === "number" ? v : 0;
}

export async function incrementVisitors(): Promise<void> {
  try {
    const current = await fetchVisitors();
    await dbSet("stats/visitors", current + 1);
  } catch {
    /* non-critical */
  }
}

// ── Backup / restore ────────────────────────────────────────────────
export interface BackupBundle {
  exportedAt: string;
  version?: 2;
  portfolio: Partial<Record<PortfolioSectionKey, unknown>>;
  settings: SiteSettings;
  stats: unknown;
  contactMessages?: ContactMessage[];
}

export async function backupAll(): Promise<BackupBundle> {
  const [portfolio, settings, stats, messages] = await Promise.all([
    fetchFirebasePortfolio(),
    fetchSettings(),
    dbGet("stats"),
    fetchContactMessages(),
  ]);
  return {
    exportedAt: nowISO(),
    version: 2,
    portfolio: portfolio ?? {},
    settings,
    stats,
    contactMessages: messages,
  };
}

/**
 * Restore a backup bundle.
 *  • withMessages — also restores contact messages (merges by id)
 *  • deleteMissing — removes Firebase portfolio sections absent from the bundle
 */
export async function restoreBackup(
  bundle: BackupBundle,
  opts: { withMessages?: boolean; deleteMissing?: boolean } = {}
): Promise<{ sections: number; settings: number; messages: number }> {
  let sectionCount = 0;
  let settingCount = 0;
  let messageCount = 0;

  if (bundle.portfolio) {
    for (const [key, value] of Object.entries(bundle.portfolio)) {
      if (SECTION_KEYS.includes(key as PortfolioSectionKey)) {
        await savePortfolioSection(key as PortfolioSectionKey, value);
        sectionCount++;
      }
    }
    if (opts.deleteMissing) {
      const raw = await dbGet<Record<string, unknown>>("portfolio");
      for (const key of Object.keys(raw ?? {})) {
        if (SECTION_KEYS.includes(key as PortfolioSectionKey) && !(key in bundle.portfolio)) {
          await dbRemove(`portfolio/${key}`);
        }
      }
    }
  }
  if (bundle.settings) {
    for (const [key, value] of Object.entries(bundle.settings)) {
      if (typeof value === "string") {
        await saveSetting(key, value);
        settingCount++;
      }
    }
  }
  if (opts.withMessages && Array.isArray(bundle.contactMessages)) {
    for (const msg of bundle.contactMessages) {
      const { id, ...rest } = msg as ContactMessage & { id: string };
      if (!id) continue;
      await dbSet(`contactMessages/${id}`, rest);
      messageCount++;
    }
  }
  return { sections: sectionCount, settings: settingCount, messages: messageCount };
}

/** Reset one section back to the bundled seed default. */
export async function resetSectionToSeed(section: PortfolioSectionKey): Promise<void> {
  await savePortfolioSection(section, seedData[section]);
}

/** Reset the visitor counter. */
export async function resetVisitors(): Promise<void> {
  await dbSet("stats/visitors", 0);
}

// ── Database cleanup (mirrors the original /api/admin/cleanup) ───────
export const KNOWN_SETTINGS_KEYS = [
  "chatbot_provider", "chatbot_model", "chatbot_apiKey", "chatbot_base_url",
  "chatbot_system_prompt", "chatbot_welcomeMessage", "chatbot_welcomeMessageBn",
  "chatbot_placeholder", "chatbot_placeholderBn", "chatbot_maxTokens",
  "chatbot_temperature", "chatbot_enabled", "chatbot_name",
  "site_name", "site_description", "seo_keywords", "og_image", "footer_text",
  "telegram_bot_token", "telegram_chat_id",
  "custom_font_url", "custom_font_family",
];

export interface CleanupReport {
  orphanSections: { key: string; size: number }[];
  unknownSettings: { key: string; size: number }[];
  totalOrphanBytes: number;
}

function roughBytes(v: unknown): number {
  try {
    return JSON.stringify(v)?.length ?? 0;
  } catch {
    return 0;
  }
}

/** Scan Firebase for keys the site never reads (orphans / typos / leftovers). */
export async function cleanupScan(): Promise<CleanupReport> {
  const [raw, settings] = await Promise.all([
    dbGet<Record<string, unknown>>("portfolio"),
    dbGet<Record<string, unknown>>("settings"),
  ]);

  const orphanSections: { key: string; size: number }[] = [];
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (!SECTION_KEYS.includes(key as PortfolioSectionKey)) {
      orphanSections.push({ key, size: roughBytes(value) });
    }
  }

  const unknownSettings: { key: string; size: number }[] = [];
  for (const [key, value] of Object.entries(settings ?? {})) {
    if (!KNOWN_SETTINGS_KEYS.includes(key)) {
      unknownSettings.push({ key, size: roughBytes(value) });
    }
  }

  return {
    orphanSections,
    unknownSettings,
    totalOrphanBytes:
      orphanSections.reduce((a, b) => a + b.size, 0) +
      unknownSettings.reduce((a, b) => a + b.size, 0),
  };
}

/** Delete a specific orphan key (portfolio or settings namespace). */
export async function cleanupDeleteKey(namespace: "portfolio" | "settings", key: string): Promise<void> {
  await dbRemove(`${namespace}/${key}`);
}
