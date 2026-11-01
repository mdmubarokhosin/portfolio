"use client";

import { useEffect } from "react";
import { usePortfolioData } from "@/context/PortfolioDataContext";

const DEFAULT_TITLE = "Mubarok Hossain — Web Developer | মো. মোবারক হোসেন";
const DEFAULT_DESCRIPTION =
  "MD Mubarok Hossain (মো. মোবারক হোসেন) — a passionate web developer from Bangladesh specializing in React, Next.js, TypeScript and modern web technologies.";
const DEFAULT_FAVICON = "/icon.svg";

/**
 * SiteIdentity — makes the admin's branding settings actually take effect on
 * the public site (feature parity with the original site's admin panel, and
 * beyond: theme colors now apply live too).
 *
 *  • settings.site_name            → <title> (browser tab)
 *  • settings.site_description     → <meta name="description"> + og meta
 *  • settings.seo_keywords         → <meta name="keywords">
 *  • settings.og_image             → og:image / twitter:image
 *  • personal.siteLogo             → favicon + used by Navbar/Footer
 *  • settings.theme_primary_color  → --primary / --ring CSS variables
 *  • settings.theme_accent_color   → --accent-gradient-2 CSS variable
 *  • settings.custom_font_*        → font stylesheet + --site-font (reactive)
 */
export default function SiteIdentity() {
  const { data, settings } = usePortfolioData();
  const {
    site_name: siteName,
    site_description: siteDescription,
    seo_keywords: seoKeywords,
    og_image: ogImage,
  } = settings;
  const logo = (data.personal.siteLogo || "").trim();

  /* Browser tab title */
  useEffect(() => {
    const title = (siteName || "").trim();
    document.title = title || DEFAULT_TITLE;
  }, [siteName]);

  /* Meta description + Open Graph */
  useEffect(() => {
    const description = (siteDescription || "").trim() || DEFAULT_DESCRIPTION;
    const setMeta = (selector: string, attr: "name" | "property", key: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", description);
    };
    setMeta('meta[name="description"]', "name", "description");
    setMeta('meta[property="og:description"]', "property", "og:description");
    setMeta('meta[property="og:title"]', "property", "og:title");
    document
      .querySelector<HTMLMetaElement>('meta[property="og:title"]')
      ?.setAttribute("content", (siteName || "").trim() || DEFAULT_TITLE);
  }, [siteName, siteDescription]);

  /* SEO keywords + og:image / twitter:image */
  useEffect(() => {
    const keywords = (seoKeywords || "").trim();
    if (keywords) {
      let kw = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement("meta");
        kw.setAttribute("name", "keywords");
        document.head.appendChild(kw);
      }
      kw.setAttribute("content", keywords);
    }

    const image = (ogImage || "").trim();
    if (image) {
      for (const [selector, attr, key] of [
        ['meta[property="og:image"]', "property", "og:image"],
        ['meta[name="twitter:image"]', "name", "twitter:image"],
      ] as const) {
        let el = document.head.querySelector<HTMLMetaElement>(selector);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute("content", image);
      }
    }
  }, [seoKeywords, ogImage]);

  /* Favicon follows the site logo (empty → bundled icon.svg) */
  useEffect(() => {
    const href = logo || DEFAULT_FAVICON;
    for (const rel of ["icon", "apple-touch-icon", "shortcut icon"]) {
      let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    }
  }, [logo]);

  /* Theme colors → CSS variables (live, both light & dark) */
  useEffect(() => {
    const root = document.documentElement;
    const primary = (settings.theme_primary_color || "").trim();
    const accent = (settings.theme_accent_color || "").trim();

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(primary)) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--site-accent", primary);
      root.style.setProperty("--color-cyan-glow", hexToRgba(primary, 0.35));
    } else {
      ["--primary", "--ring", "--site-accent", "--color-cyan-glow"].forEach((v) =>
        root.style.removeProperty(v)
      );
    }

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent)) {
      root.style.setProperty("--accent-gradient-2", accent);
      root.style.setProperty("--accent-gradient", lightenHex(accent, 0.35));
    } else {
      root.style.removeProperty("--accent-gradient-2");
      root.style.removeProperty("--accent-gradient");
    }
  }, [settings.theme_primary_color, settings.theme_accent_color]);

  /* Custom font — reactive version of the original site's CustomFontLoader */
  useEffect(() => {
    const url = (settings.custom_font_url || "").trim();
    const family = (settings.custom_font_family || "").replace(/["'`]/g, "").trim();
    const root = document.documentElement;
    const existing = document.head.querySelector<HTMLLinkElement>("link[data-custom-font]");

    if (url && family) {
      const link = existing ?? document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.dataset.customFont = family;
      if (!existing) document.head.appendChild(link);
      root.style.setProperty("--site-font", `'${family}'`);
    } else {
      existing?.remove();
      root.style.removeProperty("--site-font");
    }
  }, [settings.custom_font_url, settings.custom_font_family]);

  return null;
}

/* #06b6d4 → rgba(6,182,212,0.35) */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* Blend a hex color toward white — 0 keeps the color, 1 returns white */
function lightenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
