"use client";

/**
 * Portfolio data store — Firebase RTDB ↔ site model (NO bundled seed).
 *
 * The Firebase database is the single source of truth for everything the
 * visitor sees (portfolio content, settings, contact messages, visitor
 * stats). There is deliberately no portfolio.json fallback anymore:
 *
 *   • Public reads happen directly (portfolio/, settings/, stats/ are the
 *     only publicly readable nodes — see firebase.rules.json).
 *   • EVERY write goes through this app's server API routes, which hold
 *     the RTDB secret. The browser never touches a write URL.
 *   • Media helpers below only fix legacy self-hosted paths (Remotion
 *     videos / skill logos) and pair posters with videos — they never
 *     inject content.
 */

import type { PortfolioData, Project } from "@/context/PortfolioDataContext";
import { dbGet, generateId, nowISO } from "./firebase";
import { apiAdmin, apiContact, apiVisit } from "./admin-api";

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

// ── Fetch every section from Firebase (public read) ─────────────────
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

// ── Save one section (server proxy — same node format as before) ────
export async function savePortfolioSection(
  section: PortfolioSectionKey,
  value: unknown
): Promise<void> {
  await apiAdmin("saveSection", { section, value: JSON.stringify(value) });
}

// ── Media enrichment (self-hosted Remotion covers, path fixes) ──────
/**
 * All self-hosted project cover videos live in /videos/projects/. Legacy
 * databases stored paths like "/videos/ecommerce.mp4" — normalizeProjectMedia()
 * rewrites those so every project gets a working cover without the admin
 * having to re-save anything. FULL external URLs are preserved verbatim.
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
 * Fix legacy media paths on a single project (video path rewrite, poster
 * pairing). External URLs from any hosting are preserved verbatim.
 */
function normalizeProjectMedia<T extends { coverVideo?: string; coverImage?: string }>(p: T): T {
  const coverVideo = normalizeVideoUrl(p.coverVideo);
  let coverImage = p.coverImage;
  if (
    coverImage &&
    !coverImage.startsWith("http") &&
    !coverImage.startsWith("data:") &&
    isLegacyPoster(coverImage)
  ) {
    coverImage = undefined;
  }
  return {
    ...p,
    coverVideo: coverVideo || p.coverVideo,
    coverImage: coverImage || posterForVideo(coverVideo ?? p.coverVideo) || p.coverImage,
  };
}

function enrichProjects(projects: Project[]): Project[] {
  return projects.map((p, i) => {
    const fixed = normalizeProjectMedia(p);
    return {
      ...fixed,
      id: typeof p.id === "number" ? p.id : i + 1,
      // video-first design: a self-hosted motion cover for items without one
      coverVideo: fixed.coverVideo || PROJECT_VIDEOS[i % PROJECT_VIDEOS.length],
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  });
}

/** Normalize raw Firebase sections into a guaranteed-complete model (no seed). */
export function normalizePortfolio(
  fb: Partial<Record<PortfolioSectionKey, unknown>> | null
): PortfolioData {
  const out: Record<string, unknown> = {};

  if (fb) {
    for (const key of SECTION_KEYS) {
      const value = fb[key];
      if (value !== undefined && value !== null) {
        // Firebase may store arrays as objects with numeric keys → normalize
        out[key] = normalize(value);
      }
    }
  }

  const personal = (out.personal as Record<string, unknown> | undefined) ?? {};
  /* Legacy-logo migration: replace third-party logo pointers with the
     self-hosted brand mark unless the admin set a custom one. */
  const siteLogo = personal.siteLogo;
  if (
    typeof siteLogo !== "string" ||
    !siteLogo ||
    siteLogo.includes("1flex.org") ||
    siteLogo.includes("logos/")
  ) {
    personal.siteLogo = "/brand/logo-mark.png";
  }
  if (!personal.profileVideo) personal.profileVideo = "/videos/avatar.mp4";
  out.personal = personal;

  out.skills = enrichSkills((out.skills as Array<{ name: string } & Record<string, unknown>>) ?? []);
  out.projects = enrichProjects((out.projects as Project[]) ?? []);
  out.stats = out.stats ?? [];
  out.pages = out.pages ?? [];
  out.socialLinks = out.socialLinks ?? [];
  out.services = out.services ?? [];
  out.skillCategories = out.skillCategories ?? [];
  out.additionalTools = out.additionalTools ?? [];
  out.projectCategories = out.projectCategories ?? [];
  out.experiences = out.experiences ?? [];
  out.education = out.education ?? [];
  out.testimonials = out.testimonials ?? [];
  out.certificates = out.certificates ?? [];
  out.faq = out.faq ?? [];
  out.contactInfo = out.contactInfo ?? [];

  return out as unknown as PortfolioData;
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

/** Full sync: overwrite every section in Firebase with the given data. */
export async function syncAllSections(data: PortfolioData): Promise<void> {
  await apiAdmin("syncAll", {
    data: Object.fromEntries(
      SECTION_KEYS.map((key) => [key, JSON.stringify(data[key])])
    ),
  });
}

/** Wipe one section back to an empty collection (no seed exists anymore). */
export async function clearPortfolioSection(section: PortfolioSectionKey): Promise<void> {
  const empty = section === "personal" ? {} : [];
  await savePortfolioSection(section, empty);
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
  await apiContact(msg);
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const res = await apiAdmin<{ ok: true; messages: ContactMessage[] }>("messages.list");
  return res.messages ?? [];
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  await apiAdmin("messages.markRead", { id, read });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await apiAdmin("messages.delete", { id });
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
  youtube_channel_id?: string;
  youtube_api_key?: string;
  youtube_videos_limit?: string;
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
  await apiAdmin("settings.save", { key, value });
}

// ── Visitor stats (server-counted — no public write) ────────────────
export async function fetchVisitors(): Promise<number> {
  const v = await dbGet<number>("stats/visitors");
  return typeof v === "number" ? v : 0;
}

export async function incrementVisitors(): Promise<void> {
  await apiVisit();
}

export async function resetVisitors(): Promise<void> {
  await apiAdmin("stats.resetVisitors");
}

// ── Backup / restore (server proxy) ─────────────────────────────────
export interface BackupBundle {
  exportedAt: string;
  version?: 2;
  portfolio: Partial<Record<PortfolioSectionKey, unknown>>;
  settings: SiteSettings;
  stats: unknown;
  contactMessages?: ContactMessage[];
}

export async function backupAll(): Promise<BackupBundle> {
  const res = await apiAdmin<{ ok: true; bundle: BackupBundle }>("backup");
  return res.bundle;
}

export async function restoreBackup(
  bundle: BackupBundle,
  opts: { withMessages?: boolean; deleteMissing?: boolean } = {}
): Promise<{ sections: number; settings: number; messages: number }> {
  const res = await apiAdmin<{ ok: true; sections: number; settings: number; messages: number }>(
    "restore",
    { bundle, withMessages: !!opts.withMessages, deleteMissing: !!opts.deleteMissing }
  );
  return { sections: res.sections, settings: res.settings, messages: res.messages };
}

// ── Database cleanup (server proxy) ─────────────────────────────────
export const KNOWN_SETTINGS_KEYS = [
  "chatbot_provider", "chatbot_model", "chatbot_apiKey", "chatbot_base_url",
  "chatbot_system_prompt", "chatbot_welcomeMessage", "chatbot_welcomeMessageBn",
  "chatbot_placeholder", "chatbot_placeholderBn", "chatbot_maxTokens",
  "chatbot_temperature", "chatbot_enabled", "chatbot_name",
  "site_name", "site_description", "seo_keywords", "og_image", "footer_text",
  "telegram_bot_token", "telegram_chat_id",
  "custom_font_url", "custom_font_family",
  "youtube_channel_id", "youtube_api_key", "youtube_videos_limit",
];

export interface CleanupReport {
  orphanSections: { key: string; size: number }[];
  unknownSettings: { key: string; size: number }[];
  totalOrphanBytes: number;
}

export async function cleanupScan(): Promise<CleanupReport> {
  const res = await apiAdmin<{ ok: true; report: CleanupReport }>("cleanup.scan");
  return res.report;
}

export async function cleanupDeleteKey(namespace: "portfolio" | "settings", key: string): Promise<void> {
  await apiAdmin("cleanup.delete", { namespace, key });
}

export { generateId, nowISO };
