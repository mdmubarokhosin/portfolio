"use client";

/**
 * YouTubePage — public /youtube section (v2, feature-rich).
 *
 * Data comes from /api/youtube which chains: API key → keyless channel-page
 * scrape (logo, banner, subscribers, total views…) → RSS video list. So the
 * page shows FULL channel stats even without a valid API key.
 *
 * Features:
 *   • Channel header card — banner, logo, handle, country, joined date,
 *     description, animated stat pills, Subscribe / Visit buttons
 *   • Animated stat cards (videos / subscribers / total views)
 *   • Search, sort (newest / oldest / most viewed / A–Z), grid ⇄ list toggle
 *   • Lightbox modal player (embedded, watch without leaving the site)
 *   • Copy-link with toast, Load-more pagination, refresh + "updated X ago"
 *   • Dismissible warning when the saved API key is expired/invalid
 *   • Full bn/en localization + skeleton + friendly error states
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownWideNarrow,
  CalendarDays,
  Check,
  Copy,
  Eye,
  ExternalLink,
  Globe2,
  Info,
  LayoutGrid,
  List,
  Loader2,
  Play,
  RefreshCw,
  Search,
  SearchX,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";

// ── API payload types (mirror of src/lib/server/youtube-feed.ts) ────

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  published: string;
  url: string;
  views?: number | null;
  duration?: string | null;
  position: number;
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  handle?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscribers?: number | null;
  videos?: number | null;
  views?: number | null;
  joined?: string;
  country?: string;
  url: string;
}

interface YouTubePayload {
  ok: true;
  source: "api" | "scrape+rss" | "scrape" | "rss";
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  fetchedAt: string;
  apiKeyState?: "invalid" | "expired" | "quota" | "error";
}

type FeedError = "not_configured" | "load_failed" | null;
type SortKey = "newest" | "oldest" | "views" | "title";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 9;

// ── Small formatting helpers ────────────────────────────────────────

/** {n} / {total} / {ago} interpolation for translation strings. */
function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) =>
    k in vars ? String(vars[k]) : _m
  );
}

/**
 * 950 → "950", 12400 → "12.4K", 1200000 → "1.2M".
 * Bangla mode uses the South-Asian numbering system (হাজার / লাখ / কোটি)
 * with Bengali digits — exactly how YouTube renders counts for bn viewers.
 */
function formatCount(n: number | null | undefined, isBn = false): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (!isBn) {
    if (n < 1000) return String(Math.round(n));
    if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
    if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    return `${(n / 1_000_000_000).toFixed(1)}B`;
  }
  if (n < 1000) return localizeDigits(Math.round(n), true);
  if (n < 100_000) return `${localizeDigits((n / 1000).toFixed(1), true)} হাজার`;
  if (n < 10_000_000) return `${localizeDigits((n / 100_000).toFixed(1), true)} লাখ`;
  return `${localizeDigits((n / 10_000_000).toFixed(1), true)} কোটি`;
}

/** Locale-aware date for joined/published strings — Bengali digits & month names in bn mode. */
function localeDate(iso: string | undefined, isBn: boolean): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return localizeDigits(iso, isBn);
  return d.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "3 months ago" style relative time — localized digits + words in Bangla. */
function timeAgo(
  iso: string,
  isBn?: boolean,
  t?: (key: string) => string
): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60_000);

  const bn = (key: string, n: number): string =>
    t ? localizeDigits(fmt(t(key), { n }), true) : "";

  if (mins < 1) return isBn && t ? t("youtube.now") : "just now";
  if (mins < 60) return isBn && t ? bn("youtube.minutes", mins) : `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isBn && t ? bn("youtube.hours", hours) : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return isBn && t ? bn("youtube.days", days) : `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return isBn && t ? bn("youtube.months", months) : `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return isBn && t ? bn("youtube.years", years) : `${years} year${years === 1 ? "" : "s"} ago`;
}

/** Animate 0 → target with ease-out cubic (rAF; no sync state in effect). */
function useAnimatedNumber(target: number, duration = 1400): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/** Clipboard with a legacy fallback (file:// and older browsers). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// ── Component ───────────────────────────────────────────────────────

export default function YouTubePage() {
  const { settings } = usePortfolioData();
  const { isBn, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<FeedError>(null);
  const [payload, setPayload] = useState<YouTubePayload | null>(null);

  // browser toolbar state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const [keyWarnOpen, setKeyWarnOpen] = useState(true);

  // re-render tick so "updated X ago" stays fresh
  const [, setTick] = useState(0);
  const tickRef = useRef(0);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const res = await fetch("/api/youtube", { cache: "no-store" });
      const json = (await res.json()) as Partial<YouTubePayload> & {
        ok?: boolean;
        error?: string;
      };
      if (json?.ok && json.channel && Array.isArray(json.videos)) {
        setPayload(json as YouTubePayload);
        setError(null);
      } else {
        setPayload(null);
        setError(json?.error === "not_configured" ? "not_configured" : "load_failed");
      }
    } catch {
      setPayload(null);
      setError("load_failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch: state updates happen after await
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => setTick(++tickRef.current), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const channel = payload?.channel;

  // ── derived video list (search + sort) ────────────────────────────
  const allVideos = payload?.videos ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? allVideos.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.description ?? "").toLowerCase().includes(q)
        )
      : allVideos;
    const arr = [...base];
    switch (sort) {
      case "oldest":
        arr.sort((a, b) => a.published.localeCompare(b.published));
        break;
      case "views":
        arr.sort((a, b) => (b.views ?? -1) - (a.views ?? -1));
        break;
      case "title":
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        arr.sort((a, b) => b.published.localeCompare(a.published));
    }
    return arr;
  }, [allVideos, query, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  const stats = channel
    ? [
        {
          key: "videos",
          icon: Youtube,
          value: channel.videos ?? null,
          label: t("youtube.stats_videos"),
        },
        {
          key: "subs",
          icon: Users,
          value: channel.subscribers ?? null,
          label: t("youtube.stats_subscribers"),
        },
        {
          key: "views",
          icon: Eye,
          value: channel.views ?? null,
          label: t("youtube.stats_views"),
        },
      ]
    : [];

  const subscribeUrl = channel ? `${channel.url}/featured?sub_confirmation=1` : "#";

  return (
    <div className="hero-gradient relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ─── Hero header ─── */}
      <section className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Badge
            variant="secondary"
            className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            {t("nav.youtube")}
          </Badge>
          <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("youtube.title")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t("youtube.subtitle")}
          </p>
        </motion.div>
      </section>

      <div className="relative mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ─── Loading skeletons ─── */}
        {loading && <YouTubeSkeletons />}

        {/* ─── Friendly error states ─── */}
        {!loading && error && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-xl"
            aria-live="polite"
          >
            <Card className="rounded-3xl border-border/70 bg-card p-8 text-center sm:p-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/10 text-red-600">
                <Youtube className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold">{t("youtube.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error === "not_configured"
                  ? t("youtube.notConfigured")
                  : t("youtube.loadError")}
              </p>
              {error === "not_configured" &&
                (settings.youtube_channel_id ?? "").trim() && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {isBn
                      ? "চ্যানেল আইডি সেভ করা আছে — কিছুক্ষণ পরে পেজটি রিফ্রেশ করুন।"
                      : "A channel ID is already saved — try refreshing in a moment."}
                  </p>
                )}
              {error === "load_failed" && (
                <Button
                  variant="outline"
                  onClick={() => void load()}
                  className="mt-5 rounded-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isBn ? "আবার চেষ্টা করুন" : "Try again"}
                </Button>
              )}
            </Card>
          </motion.section>
        )}

        {/* ─── Content ─── */}
        {!loading && !error && payload && channel && (
          <>
            {/* API key warning (dismissible) */}
            {payload.apiKeyState && keyWarnOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
                role="status"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {t("youtube.apiKeyWarnTitle")}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-700/90 dark:text-amber-400/90">
                      {t("youtube.apiKeyWarnBody")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeyWarnOpen(false)}
                    aria-label={t("youtube.dismiss")}
                    className="rounded-full p-1 text-amber-600 transition-colors hover:bg-amber-500/20"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Channel card ─── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-label={channel.title}
            >
              <Card className="card-glow overflow-hidden rounded-3xl border-border/70 bg-card">
                {/* banner */}
                <div className="relative h-28 w-full sm:h-44">
                  {channel.bannerUrl ? (
                    <img
                      src={channel.bannerUrl}
                      alt=""
                      aria-hidden="true"
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-full w-full bg-gradient-to-r from-red-600/25 via-primary/15 to-teal-500/25"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent"
                  />
                </div>

                {/* body */}
                <div className="relative px-5 pb-6 pt-12 sm:px-7 sm:pt-14">
                  {/* avatar — overlaps the banner */}
                  <div className="absolute -top-10 left-5 sm:-top-12 sm:left-7">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-gradient-to-br from-red-600 to-red-500 shadow-lg sm:h-24 sm:w-24">
                      {channel.avatarUrl ? (
                        <img
                          src={channel.avatarUrl}
                          alt={`${channel.title} logo`}
                          loading="eager"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Youtube
                          className="h-8 w-8 text-white sm:h-10 sm:w-10"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="text-xl font-bold sm:text-2xl">
                          {channel.title}
                        </h2>
                        {channel.handle && (
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-xs font-semibold text-foreground/80"
                          >
                            <Check className="mr-1 h-3 w-3 text-teal-500" aria-hidden="true" />
                            {channel.handle}
                          </Badge>
                        )}
                      </div>

                      {channel.description && (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      )}

                      {/* meta chips */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {channel.country && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-xs font-medium text-foreground/80">
                            <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {channel.country}
                          </span>
                        )}
                        {channel.joined && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-xs font-medium text-foreground/80">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            {t("youtube.joined")} {localeDate(channel.joined, isBn)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span
                            aria-hidden="true"
                            className="relative flex h-1.5 w-1.5"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          {payload.source === "api"
                            ? t("youtube.sourceLive")
                            : t("youtube.sourceFeed")}
                        </span>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={subscribeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/35"
                      >
                        <Youtube className="mr-2 h-4.5 w-4.5" aria-hidden="true" />
                        {t("youtube.visitChannel")}
                      </a>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-border/80 bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t("youtube.channel")}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* ─── Stats row (animated) ─── */}
            {stats.length > 0 && (
              <section
                className="mt-8"
                aria-label={`${t("youtube.stats_videos")} / ${t("youtube.stats_subscribers")} / ${t("youtube.stats_views")}`}
              >
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  {stats.map((s, i) => (
                    <StatCard key={s.key} icon={s.icon} value={s.value} label={s.label} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── Toolbar: search / sort / view / refresh ─── */}
            <section className="mt-12" aria-label={t("youtube.latest")}>
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="text-lg font-bold sm:text-xl"
                >
                  {t("youtube.latest")}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({localizeDigits(filtered.length, isBn)})
                  </span>
                </motion.h2>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* search */}
                  <div className="relative min-w-[180px] flex-1 sm:flex-none">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder={t("youtube.search")}
                      aria-label={t("youtube.search")}
                      className="h-10 rounded-full border-border/70 bg-card pl-9 pr-9 text-sm"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setPage(1);
                        }}
                        aria-label={t("youtube.clearSearch")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* sort */}
                  <Select
                    value={sort}
                    onValueChange={(v) => {
                      setSort(v as SortKey);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger
                      className="h-10 w-[172px] rounded-full border-border/70 bg-card text-sm"
                      aria-label={t("youtube.sortLabel")}
                    >
                      <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t("youtube.sortNewest")}</SelectItem>
                      <SelectItem value="oldest">{t("youtube.sortOldest")}</SelectItem>
                      <SelectItem value="views">{t("youtube.sortViews")}</SelectItem>
                      <SelectItem value="title">{t("youtube.sortTitle")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* grid/list toggle */}
                  <div
                    className="flex items-center rounded-full border border-border/70 bg-card p-1"
                    role="group"
                    aria-label={t("youtube.gridView") + " / " + t("youtube.listView")}
                  >
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      aria-pressed={view === "grid"}
                      aria-label={t("youtube.gridView")}
                      className={`rounded-full p-2 transition-colors ${
                        view === "grid"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      aria-pressed={view === "list"}
                      aria-label={t("youtube.listView")}
                      className={`rounded-full p-2 transition-colors ${
                        view === "list"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* refresh */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void load("refresh")}
                    disabled={refreshing}
                    aria-label={t("youtube.refresh")}
                    className="h-10 w-10 rounded-full border-border/70 bg-card"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>

              {/* videos */}
              {filtered.length === 0 ? (
                /* empty search state */
                <Card className="rounded-3xl border-border/70 bg-card p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <SearchX className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <p className="font-semibold">{t("youtube.noResults")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("youtube.noResultsHint")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                    className="mt-4 rounded-full"
                  >
                    {t("youtube.clearSearch")}
                  </Button>
                </Card>
              ) : view === "grid" ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((video, i) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      index={i}
                      onOpen={() => setActiveVideo(video)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {visible.map((video, i) => (
                    <VideoRow
                      key={video.id}
                      video={video}
                      index={i}
                      onOpen={() => setActiveVideo(video)}
                    />
                  ))}
                </div>
              )}

              {/* load more */}
              {filtered.length > visible.length && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full px-8"
                  >
                    {t("youtube.loadMore")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      +{localizeDigits(Math.min(PAGE_SIZE, filtered.length - visible.length), isBn)}
                    </span>
                  </Button>
                </div>
              )}

              {/* footer meta */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
                {filtered.length > 0 &&
                  localizeDigits(
                    fmt(t("youtube.showing"), {
                      n: visible.length,
                      total: filtered.length,
                    }),
                    isBn
                  )}
                {payload.fetchedAt &&
                  ` · ${fmt(t("youtube.lastUpdated"), {
                    ago: timeAgo(payload.fetchedAt, isBn, t),
                  })}`}
              </p>
            </section>
          </>
        )}
      </div>

      {/* ─── Lightbox player ─── */}
      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}

// ── Stat card (animated count-up) ───────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  index,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  value: number | null;
  label: string;
  index: number;
}) {
  const { isBn } = useLanguage();
  const animated = useAnimatedNumber(value ?? 0);
  const display = value == null ? "—" : formatCount(animated, isBn);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 160, damping: 18 }}
    >
      <Card className="card-glow group h-full rounded-2xl border-border/70 bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/15 to-red-500/10 text-red-600 shadow-sm transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden={true} />
        </div>
        <div className="text-xl font-bold tabular-nums sm:text-3xl">{display}</div>
        <p className="mt-0.5 text-[11px] font-semibold sm:mt-1 sm:text-sm">{label}</p>
      </Card>
    </motion.div>
  );
}

// ── Video card (grid) ───────────────────────────────────────────────

function VideoCard({
  video,
  index,
  onOpen,
}: {
  video: YouTubeVideo;
  index: number;
  onOpen: () => void;
}) {
  const { isBn, t } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.05, duration: 0.4 }}
    >
      <div className="card-glow group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors duration-300 hover:border-primary/30">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${t("youtube.watchNow")}: ${video.title}`}
          className="block w-full text-left"
        >
          {/* 16:9 thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {video.duration && (
              <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                {localizeDigits(video.duration, isBn)}
              </span>
            )}
            {/* hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-white">
                {t("youtube.watchNow")}
              </span>
            </div>
          </div>

          {/* meta */}
          <div className="p-4">
            <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:min-h-[3rem] sm:text-base">
              {video.title}
            </h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <time
                dateTime={video.published}
                title={`${t("youtube.published")}: ${new Date(video.published).toLocaleDateString(isBn ? "bn-BD" : "en-US")}`}
              >
                {timeAgo(video.published, isBn, t)}
              </time>
              {video.views != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {formatCount(video.views, isBn)} {t("youtube.views")}
                  </span>
                </>
              )}
            </p>
          </div>
        </button>

        {/* direct-open on YouTube (top-right, appears on hover) */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("youtube.openYouTube")}: ${video.title}`}
          title={t("youtube.openYouTube")}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2.5 top-2.5 rounded-full bg-black/55 p-2 text-white opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  );
}

// ── Video row (list view) ───────────────────────────────────────────

function VideoRow({
  video,
  index,
  onOpen,
}: {
  video: YouTubeVideo;
  index: number;
  onOpen: () => void;
}) {
  const { isBn, t } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 4) * 0.04, duration: 0.35 }}
    >
      <div className="card-glow group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors duration-300 hover:border-primary/30 sm:flex-row">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${t("youtube.watchNow")}: ${video.title}`}
          className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-56"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {video.duration && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {localizeDigits(video.duration, isBn)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
              <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
            </span>
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
          <button
            type="button"
            onClick={onOpen}
            className="text-left"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base">
              {video.title}
            </h3>
          </button>
          {video.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {video.description}
            </p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <time
              dateTime={video.published}
              title={`${t("youtube.published")}: ${new Date(video.published).toLocaleDateString(isBn ? "bn-BD" : "en-US")}`}
            >
              {timeAgo(video.published, isBn, t)}
            </time>
            {video.views != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {formatCount(video.views, isBn)} {t("youtube.views")}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 px-4 pb-3 sm:flex-col sm:justify-center sm:px-3 sm:pb-0">
          <CopyLinkButton url={video.url} compact />
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("youtube.openYouTube")}: ${video.title}`}
            title={t("youtube.openYouTube")}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ── Copy-link button (shared) ───────────────────────────────────────

function CopyLinkButton({ url, compact }: { url: string; compact?: boolean }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const doCopy = async () => {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      toast.success(t("youtube.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Copy failed");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void doCopy()}
      aria-label={t("youtube.copyLink")}
      title={t("youtube.copyLink")}
      className={`rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
        compact ? "p-2" : ""
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

// ── Lightbox modal player ───────────────────────────────────────────

function VideoModal({
  video,
  onClose,
}: {
  video: YouTubeVideo | null;
  onClose: () => void;
}) {
  const { isBn, t } = useLanguage();

  return (
    <Dialog open={video !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border-border/70 bg-card p-0 sm:rounded-3xl">
        {video && (
          <div>
            <DialogDescription className="sr-only">
              {video.title} — {t("youtube.watchNow")}
            </DialogDescription>
            <DialogTitle className="sr-only">{video.title}</DialogTitle>

            {/* embedded player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                key={video.id}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t("youtube.close")}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-red-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* details */}
            <div className="max-h-[42vh] overflow-y-auto p-5 sm:p-6">
              <h3 className="text-base font-bold leading-snug sm:text-lg">
                {video.title}
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <time
                  dateTime={video.published}
                  title={`${t("youtube.published")}: ${new Date(video.published).toLocaleDateString(isBn ? "bn-BD" : "en-US")}`}
                >
                  {new Date(video.published).toLocaleDateString(
                    isBn ? "bn-BD" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </time>
                {video.views != null && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      {formatCount(video.views, isBn)} {t("youtube.views")}
                    </span>
                  </>
                )}
                {video.duration && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{localizeDigits(video.duration, isBn)}</span>
                  </>
                )}
              </p>

              {video.description && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("youtube.aboutVideo")}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                    {video.description}
                  </p>
                </div>
              )}
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-1">
                <CopyLinkButton url={video.url} />
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {t("youtube.openYouTube")}
                </a>
              </div>
              <Button
                size="sm"
                onClick={onClose}
                className="h-9 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-5 font-semibold text-white shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35"
              >
                {t("youtube.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Skeletons ───────────────────────────────────────────────────────

function YouTubeSkeletons() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      {/* channel card skeleton */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="h-28 w-full bg-muted sm:h-44" />
        <div className="relative px-5 pb-6 pt-12 sm:px-7 sm:pt-14">
          <div className="absolute -top-10 left-5 h-20 w-20 rounded-full border-4 border-card bg-muted sm:-top-12 sm:left-7 sm:h-24 sm:w-24" />
          <div className="h-6 w-48 rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-72 max-w-full rounded-lg bg-muted" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* stats row skeleton */}
      <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-4 text-center sm:p-6"
          >
            <div className="mx-auto mb-2 h-10 w-10 rounded-2xl bg-muted sm:h-12 sm:w-12" />
            <div className="mx-auto h-6 w-16 rounded-md bg-muted" />
            <div className="mx-auto mt-2 h-3.5 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* toolbar skeleton */}
      <div className="mt-12 flex items-center justify-between gap-3">
        <div className="h-6 w-40 rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-10 w-48 rounded-full bg-muted" />
          <div className="h-10 w-32 rounded-full bg-muted" />
        </div>
      </div>

      {/* videos grid skeleton */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border/70 bg-card"
          >
            <div className="aspect-video w-full bg-muted" />
            <div className="p-4">
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="mt-2 h-4 w-2/3 rounded-md bg-muted" />
              <div className="mt-3 h-3 w-1/2 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
