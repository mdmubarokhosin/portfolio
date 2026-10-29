import type { Metadata, Viewport } from "next";
import { cache } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// NOTE: After deploying to your own domain, update metadataBase below.
const SITE_URL = "https://mubarok-portfolio.pages.dev";

/* ── Firebase settings → SEO (server-side, cached per request) ──────
 * The admin's "Site Settings" (site_name, site_description, seo_keywords,
 * og_image) are the single source of truth. If Firebase is unreachable
 * (offline build / blocked egress) we silently fall back to the bundled
 * defaults below, so builds never fail because of metadata.            */
const RTDB = "https://md-mubarok-hossain-default-rtdb.firebaseio.com";

const DEFAULTS = {
  name: "Mubarok Hossain",
  title: "Mubarok Hossain — Web Developer | মো. মোবারক হোসেন",
  description:
    "MD Mubarok Hossain (মো. মোবারক হোসেন) — a passionate web developer from Bangladesh specializing in React, Next.js, TypeScript and modern web technologies.",
} as const;

const getFbSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const res = await fetch(`${RTDB}/settings.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return {};
    const raw = (await res.json()) as Record<string, { value?: string } | string> | null;
    if (!raw) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = typeof v === "string" ? v : (v?.value ?? "");
    }
    return out;
  } catch {
    return {};
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getFbSettings();
  const siteName = s.site_name?.trim() || DEFAULTS.name;
  const description = s.site_description?.trim() || DEFAULTS.description;
  const customKeywords = (s.seo_keywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImage = s.og_image?.trim();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName === DEFAULTS.name ? DEFAULTS.title : `${siteName} — ${description.slice(0, 60)}`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "Mubarok Hossain",
      "মোবারক হোসেন",
      "Web Developer Bangladesh",
      "React Developer",
      "Next.js Developer",
      "Frontend Developer",
      "Portfolio",
      ...customKeywords,
    ],
    authors: [{ name: "MD Mubarok Hossain" }],
    creator: "MD Mubarok Hossain",
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "bn_BD",
      url: SITE_URL,
      siteName: `${siteName} — Portfolio`,
      title: siteName === DEFAULTS.name ? "Mubarok Hossain — Web Developer" : siteName,
      description,
      images: [
        {
          url: ogImage && ogImage.length > 0 ? ogImage : "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${siteName} — Web Developer Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName === DEFAULTS.name ? "Mubarok Hossain — Web Developer" : siteName,
      description,
      images: [ogImage && ogImage.length > 0 ? ogImage : "/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    manifest: "/manifest.json",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD description follows the admin's site_description when set
  const s = await getFbSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "MD Mubarok Hossain",
    "alternateName": "মো. মোবারক হোসেন",
    "url": SITE_URL,
    "email": "mailto:contact.mdmubarok@gmail.com",
    "jobTitle": "Web Developer",
    "nationality": "Bangladesh",
    "knowsLanguage": ["bn", "en"],
    "knowsAbout": [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Firebase",
      "MongoDB",
    ],
    "description":
      s.site_description?.trim() ||
      "A passionate web developer from Bangladesh specializing in React, Next.js, and modern web technologies.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
