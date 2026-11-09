import "server-only";

/**
 * YouTube feed engine — three strategies, tried in order:
 *
 *   A) API key (optional, saved in settings) → YouTube Data API v3.
 *      Full stats; any failure reports back a keyState so the admin can
 *      see WHY it failed (expired / invalid / quota).
 *
 *   B) Keyless channel-page scrape (NEW — the main fix): one server-side
 *      fetch of youtube.com/channel/{id}/about?hl=en&gl=US yields
 *      EVERYTHING — avatar (og:image), banner (imageBannerViewModel),
 *      handle, subscribers, video count, TOTAL VIEWS, joined date,
 *      country and full description — from ytInitialData.
 *      No API key required, never rate-limited in practice.
 *
 *   C) RSS feed → the actual video list (title, thumbnail, published,
 *      views). YouTube's RSS sends no CORS headers, so this MUST be a
 *      server-side fetch.
 *
 * Channel meta preference: API > scrape. Videos preference: API > RSS.
 * Everything normalizes into ONE payload shape (YouTubeFeedPayload).
 */

// ── Types ───────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  published: string; // ISO date
  url: string;
  views?: number | null;
  duration?: string | null; // human "1:02:03" / "02:03"
  position: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  handle?: string; // "@VoiceOfAnweshan" (from the page scrape)
  avatarUrl?: string;
  bannerUrl?: string;
  subscribers?: number | null;
  videos?: number | null;
  views?: number | null;
  joined?: string; // "Feb 8, 2025"
  country?: string; // "Bangladesh"
  url: string;
}

export type YouTubeSource = "api" | "scrape+rss" | "scrape" | "rss";

export type ApiKeyState = "invalid" | "expired" | "quota" | "error";

export interface YouTubeFeedPayload {
  ok: true;
  source: YouTubeSource;
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  fetchedAt: string; // ISO — lets the UI show "updated X ago"
  /** Present ONLY when a saved API key exists but failed. */
  apiKeyState?: ApiKeyState;
}

// ── Small helpers ───────────────────────────────────────────────────

const TIMEOUT_MS = 8000;

const BROWSER_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
} as const;

/** Decode XML entities (numeric, hex and the five named ones). */
function decodeXmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h: string) =>
      String.fromCodePoint(parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&"); // must be last
}

function decodeXml(raw: string): string {
  return decodeXmlEntities(raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).trim();
}

function firstMatch(text: string, re: RegExp): string {
  const m = re.exec(text);
  return m?.[1]?.trim() ?? "";
}

/** ISO8601 duration (PT1H2M3S) → human "1:02:03" / "02:03". */
function isoDurationToHuman(iso: string): string | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso || "");
  if (!m) return null;
  const days = parseInt(m[1] || "0", 10);
  const h = parseInt(m[2] || "0", 10) + days * 24;
  const min = parseInt(m[3] || "0", 10);
  const s = parseInt(m[4] || "0", 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${pad(min)}:${pad(s)}`;
}

/** Seconds → human "1:02:03" / "02:03" (RSS yt:duration bonus). */
function secondsToHuman(total: number): string | null {
  if (!Number.isFinite(total) || total <= 0) return null;
  const h = Math.floor(total / 3600);
  const min = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${pad(min)}:${pad(s)}`;
}

/** Keep long RSS descriptions from bloating the payload. */
function clampText(s: string, max = 800): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
}

/**
 * "7 views" → 7, "12,345" → 12345, "1.2K subscribers" → 1200,
 * "3.4M views" → 3400000. Returns null when nothing numeric is found.
 */
export function parseCompactNumber(raw: string): number | null {
  const m = /(\d[\d.,]*)\s*([KMB])?/i.exec(raw || "");
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const mult = m[2]?.toUpperCase();
  if (mult === "K") return Math.round(n * 1_000);
  if (mult === "M") return Math.round(n * 1_000_000);
  if (mult === "B") return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

/** Recursively collect values for a key inside a JSON blob (depth-capped). */
function findKey(obj: unknown, key: string, out: unknown[], depth = 0): void {
  if (depth > 20 || out.length > 8) return;
  if (Array.isArray(obj)) {
    for (const v of obj) findKey(v, key, out, depth + 1);
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === key) out.push(v);
      findKey(v, key, out, depth + 1);
    }
  }
}

// ── Strategy A: YouTube Data API v3 ─────────────────────────────────

interface ApiThumbPool {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
}

function bestThumb(pool: ApiThumbPool | undefined): string | undefined {
  if (!pool) return undefined;
  const t = pool.maxres ?? pool.standard ?? pool.high ?? pool.medium ?? pool.default;
  return t?.url;
}

function classifyApiError(status: number, body: string): ApiKeyState {
  if (status === 400 && /expired/i.test(body)) return "expired";
  if (status === 400) return "invalid";
  if (status === 403 && /quota|limit/i.test(body)) return "quota";
  if (status === 403) return "invalid";
  return "error";
}

export interface ApiAttempt {
  payload: (Omit<YouTubeFeedPayload, "ok" | "fetchedAt"> & { videos: YouTubeVideo[] }) | null;
  keyState?: ApiKeyState;
}

export async function viaApiKey(
  channelId: string,
  apiKey: string,
  limit: number
): Promise<ApiAttempt> {
  try {
    // 1) Channel (title, description, stats, uploads playlist, banner)
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${encodeURIComponent(
        channelId
      )}&key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }
    );
    if (!chRes.ok) {
      const body = await chRes.text().catch(() => "");
      return { payload: null, keyState: classifyApiError(chRes.status, body) };
    }

    const chJson = (await chRes.json()) as {
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          description?: string;
          customUrl?: string;
          thumbnails?: ApiThumbPool;
        };
        statistics?: {
          subscriberCount?: string;
          videoCount?: string;
          viewCount?: string;
        };
        contentDetails?: { relatedPlaylists?: { uploads?: string } };
        brandingSettings?: { image?: { bannerExternalUrl?: string } };
      }>;
    };

    const ch = chJson.items?.[0];
    if (!ch?.id) return { payload: null, keyState: "invalid" };

    const num = (v: string | undefined): number | null => {
      const n = v == null ? NaN : Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const channel: YouTubeChannel = {
      id: ch.id,
      title: ch.snippet?.title?.trim() || "YouTube",
      description: ch.snippet?.description?.trim() ?? "",
      customUrl: ch.snippet?.customUrl?.trim() || undefined,
      avatarUrl: bestThumb(ch.snippet?.thumbnails),
      // bannerExternalUrl is only the BASE — append a width descriptor so
      // the browser actually gets an image (otherwise it 404s/renders raw).
      bannerUrl: ch.brandingSettings?.image?.bannerExternalUrl
        ? `${ch.brandingSettings.image.bannerExternalUrl}=w1060`
        : undefined,
      subscribers: num(ch.statistics?.subscriberCount),
      videos: num(ch.statistics?.videoCount),
      views: num(ch.statistics?.viewCount),
      url: `https://www.youtube.com/channel/${ch.id}`,
    };

    // 2) Latest uploads
    const uploads = ch.contentDetails?.relatedPlaylists?.uploads;
    let videos: YouTubeVideo[] = [];
    if (uploads) {
      const plRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
          uploads
        )}&maxResults=${limit}&key=${encodeURIComponent(apiKey)}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }
      );
      if (plRes.ok) {
        const plJson = (await plRes.json()) as {
          items?: Array<{
            snippet?: {
              title?: string;
              description?: string;
              publishedAt?: string;
              thumbnails?: ApiThumbPool;
              resourceId?: { videoId?: string };
            };
            contentDetails?: { videoId?: string; videoPublishedAt?: string };
          }>;
        };

        videos = (plJson.items ?? [])
          .map((item): YouTubeVideo | null => {
            const id =
              item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? "";
            if (!id) return null;
            const title = item.snippet?.title?.trim() ?? "";
            // playlistItems includes private/deleted placeholders — skip them
            if (!title || /^private video$/i.test(title) || /^deleted video$/i.test(title)) {
              return null;
            }
            return {
              id,
              title,
              description: item.snippet?.description?.trim() ?? "",
              thumbnail:
                bestThumb(item.snippet?.thumbnails) ??
                `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
              published:
                item.contentDetails?.videoPublishedAt ??
                item.snippet?.publishedAt ??
                new Date().toISOString(),
              url: `https://www.youtube.com/watch?v=${id}`,
              views: null,
              duration: null,
              position: 0,
            };
          })
          .filter((v): v is YouTubeVideo => v !== null)
          .slice(0, limit);

        // 3) Duration + views per video (single batched call)
        const ids = videos.map((v) => v.id);
        if (ids.length > 0) {
          try {
            const vRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${ids.join(
                ","
              )}&key=${encodeURIComponent(apiKey)}`,
              { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }
            );
            if (vRes.ok) {
              const vJson = (await vRes.json()) as {
                items?: Array<{
                  id?: string;
                  contentDetails?: { duration?: string };
                  statistics?: { viewCount?: string };
                }>;
              };
              const byId = new Map(
                (vJson.items ?? [])
                  .filter((i) => Boolean(i.id))
                  .map((i) => [i.id as string, i])
              );
              for (const v of videos) {
                const extra = byId.get(v.id);
                v.views = num(extra?.statistics?.viewCount);
                v.duration = extra?.contentDetails?.duration
                  ? isoDurationToHuman(extra.contentDetails.duration)
                  : null;
              }
            }
          } catch {
            /* durations/views are a bonus — videos stay usable without them */
          }
        }

        videos = videos.map((v, i) => ({ ...v, position: i }));
      }
    }

    return { payload: { source: "api", channel, videos } };
  } catch {
    // Network-level failure (timeout etc.) — not a key problem.
    return { payload: null, keyState: "error" };
  }
}

/** Fill in fields the Data API doesn't expose (joined, country, handle). */
async function enrichFromScrape(channel: YouTubeChannel): Promise<void> {
  if (channel.joined && channel.country && channel.handle) return;
  try {
    const extra = await scrapeChannelMeta(channel.id);
    if (!extra) return;
    channel.joined = channel.joined ?? extra.joined;
    channel.country = channel.country ?? extra.country;
    channel.handle = channel.handle ?? extra.handle;
    channel.avatarUrl = channel.avatarUrl || extra.avatarUrl;
    channel.bannerUrl = channel.bannerUrl || extra.bannerUrl;
  } catch {
    /* enrichment is a bonus — never break the feed for it */
  }
}

// ── Strategy B: keyless channel-page scrape (the main fix) ──────────

interface ScrapeMeta {
  title?: string;
  description?: string;
  handle?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  subscribers?: number | null;
  videos?: number | null;
  views?: number | null;
  joined?: string;
  country?: string;
  canonicalUrl?: string;
}

/**
 * ONE fetch of /channel/{id}/about?hl=en&gl=US gives the complete public
 * channel profile without any API key:
 *   • og:image            → avatar (logo)
 *   • imageBannerViewModel → banner
 *   • aboutChannelViewModel → subscribers / video count / TOTAL VIEWS /
 *     joined date / country / canonical URL / description
 *   • metadataRows → @handle
 */
export async function scrapeChannelMeta(
  channelId: string
): Promise<ScrapeMeta | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/channel/${encodeURIComponent(
        channelId
      )}/about?hl=en&gl=US`,
      {
        signal: AbortSignal.timeout(TIMEOUT_MS + 4000),
        cache: "no-store",
        headers: BROWSER_HEADERS,
      }
    );
    if (!res.ok) return null;

    const html = await res.text();
    if (!html || html.length < 1024) return null;

    const meta: ScrapeMeta = {};

    // og:image → avatar (highest-res variant YouTube exposes)
    const ogAvatar = firstMatch(
      html,
      /<meta\s+property="og:image"\s+content="([^"]+)"/
    );
    if (ogAvatar) meta.avatarUrl = decodeXmlEntities(ogAvatar);
    const ogTitle = firstMatch(
      html,
      /<meta\s+property="og:title"\s+content="([^"]+)"/
    );
    if (ogTitle) meta.title = decodeXmlEntities(ogTitle);

    // ytInitialData — the structured goldmine
    const m =
      /var ytInitialData = (\{.+?\});<\/script>/.exec(html) ??
      /window\["ytInitialData"\] = (\{.+?\});/.exec(html);
    if (m?.[1]) {
      let data: unknown;
      try {
        data = JSON.parse(m[1]);
      } catch {
        data = null;
      }

      if (data) {
        // banner
        const banners: unknown[] = [];
        findKey(data, "imageBannerViewModel", banners);
        if (banners.length > 0) {
          const sources = (banners[0] as { image?: { sources?: Array<{ url?: string; width?: number }> } })
            .image?.sources;
          const best = sources
            ?.filter((s) => s.url)
            .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
          if (best?.url) meta.bannerUrl = best.url;
        }

        // about section (views / joined / country / description / counts)
        const abouts: unknown[] = [];
        findKey(data, "aboutChannelViewModel", abouts);
        if (abouts.length > 0) {
          const about = abouts[0] as {
            viewCountText?: string;
            videoCountText?: string;
            subscriberCountText?: string;
            joinedDateText?: { content?: string };
            country?: string;
            canonicalChannelUrl?: string;
            description?: string;
          };
          if (about.viewCountText) meta.views = parseCompactNumber(about.viewCountText);
          if (about.videoCountText) meta.videos = parseCompactNumber(about.videoCountText);
          if (about.subscriberCountText)
            meta.subscribers = parseCompactNumber(about.subscriberCountText);
          const joinedRaw = about.joinedDateText?.content?.trim();
          if (joinedRaw) {
            // "Joined Feb 8, 2025" → "Feb 8, 2025"
            meta.joined = joinedRaw.replace(/^joined\s+/i, "");
          }
          if (about.country) meta.country = about.country.trim();
          if (about.canonicalChannelUrl)
            meta.canonicalUrl = about.canonicalChannelUrl.trim();
          if (about.description?.trim()) meta.description = about.description.trim();
        }

        // header metadata rows → @handle (+ subscriber/video fallback)
        // NOTE: each "metadataRows" value is an ARRAY of row objects.
        const rows: unknown[] = [];
        findKey(data, "metadataRows", rows);
        for (const row of rows) {
          const rowList = Array.isArray(row) ? row : [row];
          for (const r of rowList) {
            const parts = (r as { metadataParts?: Array<{ text?: { content?: string } }> })
              .metadataParts;
            for (const part of parts ?? []) {
              const text = part.text?.content?.trim();
              if (!text) continue;
              if (!meta.handle && text.startsWith("@")) meta.handle = text;
              if (meta.subscribers == null && /subscriber/i.test(text))
                meta.subscribers = parseCompactNumber(text);
              if (meta.videos == null && /\bvideo/i.test(text))
                meta.videos = parseCompactNumber(text);
            }
          }
        }
      }
    }

    // description fallback (meta tag) — keep short only if scrape missed
    if (!meta.description) {
      const md = firstMatch(html, /<meta\s+name="description"\s+content="([^"]+)"/);
      if (md) meta.description = decodeXmlEntities(md);
    }

    // At least ONE useful field must have been extracted.
    const useful =
      meta.avatarUrl ||
      meta.subscribers != null ||
      meta.videos != null ||
      meta.views != null ||
      meta.title;
    return useful ? meta : null;
  } catch {
    return null;
  }
}

// ── Strategy C: public RSS feed (regex-parsed, no new deps) ─────────

export async function fetchRssVideos(
  channelId: string,
  limit: number
): Promise<{ videos: YouTubeVideo[]; feedTitle: string; channelUrl?: string } | null> {
  try {
    // Must be a SERVER-side fetch: YouTube's RSS endpoint sends no CORS
    // headers, so the browser could never read it directly.
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
        headers: {
          Accept: "application/atom+xml, application/xml, text/xml, */*",
          "User-Agent":
            "Mozilla/5.0 (compatible; PortfolioSite/1.0; YouTube feed reader)",
        },
      }
    );
    if (!res.ok) return null;

    const xml = await res.text();
    if (!xml || xml.length < 64) return null;

    const entryIdx = xml.indexOf("<entry>");
    const head = entryIdx === -1 ? xml : xml.slice(0, entryIdx);

    const feedTitle = decodeXml(firstMatch(head, /<title>([\s\S]*?)<\/title>/));
    const channelUrl =
      firstMatch(head, /<uri>([^<]+)<\/uri>/) ||
      `https://www.youtube.com/channel/${channelId}`;

    const rawChunks = entryIdx === -1 ? [] : xml.slice(entryIdx).split("<entry>").slice(1);

    const videos: YouTubeVideo[] = [];
    for (const chunk of rawChunks) {
      // primary: <yt:videoId>…</yt:videoId> — fallback: <id>yt:video:…</id>
      const id =
        firstMatch(chunk, /<yt:videoId>([^<]+)<\/yt:videoId>/) ||
        firstMatch(chunk, /<id>\s*yt:video:([\w-]+)/);
      if (!id) continue;

      const title = decodeXml(firstMatch(chunk, /<title>([\s\S]*?)<\/title>/));
      if (!title) continue;

      const published = firstMatch(chunk, /<published>([^<]+)<\/published>/);
      const description = decodeXml(
        firstMatch(chunk, /<media:description>([\s\S]*?)<\/media:description>/)
      );
      const thumbRaw = firstMatch(chunk, /<media:thumbnail[^>]*\burl="([^"]+)"/);
      const viewsRaw = firstMatch(chunk, /<media:statistics[^>]*\bviews="(\d+)"/);
      const durSecRaw = firstMatch(chunk, /\byt:duration="(\d+)"/); // best-effort bonus

      const viewsNum = viewsRaw ? parseInt(viewsRaw, 10) : NaN;
      const durNum = durSecRaw ? parseInt(durSecRaw, 10) : NaN;

      videos.push({
        id,
        title,
        description: clampText(description),
        thumbnail: thumbRaw || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        published: published || new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${id}`,
        views: Number.isFinite(viewsNum) ? viewsNum : null,
        duration: Number.isFinite(durNum) ? secondsToHuman(durNum) : null,
        position: videos.length,
      });

      if (videos.length >= limit) break;
    }

    return { videos, feedTitle, channelUrl };
  } catch {
    return null;
  }
}

// ── Orchestrator ────────────────────────────────────────────────────

export async function buildYouTubeFeed(
  channelId: string,
  apiKey: string,
  limit: number
): Promise<{ payload: YouTubeFeedPayload | null; apiKeyState?: ApiKeyState }> {
  let apiKeyState: ApiKeyState | undefined;
  let channel: YouTubeChannel | null = null;
  let videos: YouTubeVideo[] = [];
  let source: YouTubeSource | null = null;

  // A) API key path
  if (apiKey) {
    const api = await viaApiKey(channelId, apiKey, limit);
    if (api.payload) {
      channel = api.payload.channel;
      videos = api.payload.videos;
      source = "api";
      // joined/country/handle are missing from the Data API — top them up
      await enrichFromScrape(channel);
    } else {
      apiKeyState = api.keyState ?? "error";
    }
  }

  // B) Keyless scrape for channel meta (always when no API result)
  if (!channel) {
    const scraped = await scrapeChannelMeta(channelId);
    if (scraped) {
      channel = {
        id: channelId,
        title: scraped.title || "YouTube",
        description: scraped.description || "",
        handle: scraped.handle,
        customUrl: scraped.handle || scraped.canonicalUrl?.replace(/^https?:\/\/[^/]+/, "") || undefined,
        avatarUrl: scraped.avatarUrl,
        bannerUrl: scraped.bannerUrl,
        subscribers: scraped.subscribers ?? null,
        videos: scraped.videos ?? null,
        views: scraped.views ?? null,
        joined: scraped.joined,
        country: scraped.country,
        url: scraped.canonicalUrl || `https://www.youtube.com/channel/${channelId}`,
      };
      source = "scrape";
    }
  }

  // C) RSS for the video list (always when no API result)
  if (!source || source === "scrape") {
    const rss = await fetchRssVideos(channelId, limit);
    if (rss) {
      videos = rss.videos;
      if (channel) {
        source = "scrape+rss";
        if (channel.title === "YouTube" && rss.feedTitle) channel.title = rss.feedTitle;
      } else {
        channel = {
          id: channelId,
          title: rss.feedTitle || "YouTube",
          description: "",
          url: rss.channelUrl || `https://www.youtube.com/channel/${channelId}`,
          subscribers: null,
          videos: null,
          views: null,
        };
        source = "rss";
      }
    }
  }

  if (!channel || videos.length === 0) return { payload: null, apiKeyState };

  return {
    payload: {
      ok: true,
      // `channel` non-null implies one of the branches above assigned a source;
      // fall back defensively so the type stays YouTubeSource (never null).
      source: source ?? "rss",
      channel,
      videos,
      fetchedAt: new Date().toISOString(),
    },
    apiKeyState,
  };
}
