import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

/**
 * Dynamic site origin — no hardcoded domain anywhere.
 *
 * Detects protocol + host from the incoming request headers on every
 * render, so the site works automatically on any domain: localhost,
 * Hostinger, a custom domain, behind a proxy, HTTP or HTTPS.
 * Used by metadata (OG/canonical), robots.txt and sitemap.xml.
 */
export const getSiteOrigin = cache(async (): Promise<string> => {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
});
