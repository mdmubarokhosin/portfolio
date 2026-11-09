import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-origin";
import { dbGet } from "@/lib/firebase";
import { serviceHref } from "@/lib/service-pages";

/** Static routes (admin + api are excluded). */
const STATIC_PATHS = [
  "",
  "about",
  "skills",
  "projects",
  "experience",
  "youtube",
  "contact",
  "Services",
  "resume",
  "privacy-policy",
  "terms",
];

/** Dynamic sitemap — origin auto-detected, service pages pulled live from Firebase. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: p === "" ? `${origin}/` : `${origin}/${p}/`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const services = await dbGet<{ dataJson?: string }>("portfolio/services");
    const parsed = JSON.parse(String(services?.dataJson ?? "[]")) as Array<{
      title: string;
      slug?: string;
    }>;
    parsed.forEach((s, i) => {
      const href = serviceHref(s as never, i);
      if (href?.startsWith("/")) {
        entries.push({
          url: `${origin}${href}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    });
  } catch {
    /* Firebase unreachable → static entries only */
  }

  return entries;
}
