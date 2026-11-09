import "server-only";

/**
 * GET /api/youtube — public YouTube feed for the portfolio's /youtube page.
 *
 * Reads the channel config from the PUBLIC `settings/` node in Firebase:
 *   • youtube_channel_id   (required — e.g. "UC8NnfB_RnZa3TwSVmQBLAZQ")
 *   • youtube_api_key      (optional — enables YouTube Data API v3)
 *   • youtube_videos_limit (optional — default 12, clamped 1–50)
 *
 * The heavy lifting lives in src/lib/server/youtube-feed.ts which chains:
 *   A) API key (if saved) → B) keyless channel-page scrape (logo, banner,
 *   subscribers, total views…) → C) RSS for the video list.
 * If the saved API key is expired/invalid the payload carries
 * `apiKeyState` so the UI + admin can surface a renewal hint instead of
 * failing silently.
 *
 * Successful payloads are cached in-memory for 15 minutes per channel.
 *
 * Test helper: `?channel=UC…` overrides the settings value — harmless,
 * used for manual verification without touching the database.
 */

import { NextResponse } from "next/server";
import { dbGet } from "@/lib/firebase";
import { buildYouTubeFeed, type YouTubeFeedPayload } from "@/lib/server/youtube-feed";

export const dynamic = "force-dynamic";

// ── In-memory cache (15 min, per channel+key+limit) ─────────────────

const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 32;
const cache = new Map<string, { at: number; data: YouTubeFeedPayload }>();

function clampLimit(raw: unknown): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return 12;
  return Math.min(50, Math.max(1, Math.round(n)));
}

// ── GET ─────────────────────────────────────────────────────────────

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const overrideChannel = url.searchParams.get("channel")?.trim() ?? "";

  let channelId = overrideChannel;
  let apiKey = "";
  let limit = 12;

  if (!overrideChannel) {
    // Settings node is publicly readable; a read failure must NOT crash the
    // endpoint — behave exactly like "not configured".
    let settings: Record<string, { value?: string } | string> | null = null;
    try {
      settings = await dbGet<Record<string, { value?: string } | string>>("settings");
    } catch {
      settings = null;
    }

    const read = (key: string): string => {
      const v = settings?.[key];
      if (v == null) return "";
      return typeof v === "string" ? v : (v.value ?? "");
    };

    channelId = read("youtube_channel_id").trim();
    apiKey = read("youtube_api_key").trim();
    limit = clampLimit(read("youtube_videos_limit") || 12);
  }

  if (!channelId) {
    return NextResponse.json({ ok: false, error: "not_configured" });
  }

  const cacheKey = `${channelId}|${apiKey ? "api" : "rss"}|${limit}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.data);
  }

  const { payload, apiKeyState } = await buildYouTubeFeed(channelId, apiKey, limit);

  if (!payload) {
    return NextResponse.json({ ok: false, error: "load_failed" }, { status: 502 });
  }

  // Surface a broken key so the UI/admin can act on it.
  const body: YouTubeFeedPayload & Record<string, unknown> = { ...payload };
  if (apiKey && apiKeyState) body.apiKeyState = apiKeyState;

  cache.set(cacheKey, { at: Date.now(), data: body });
  if (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }

  return NextResponse.json(body);
}
