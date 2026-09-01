"use client";

import { useState, useEffect } from "react";

/**
 * CustomFontLoader — Dynamically loads a custom font from admin settings.
 *
 * How it works:
 * 1. Fetches settings from /api/settings (public endpoint).
 * 2. If custom_font_url + custom_font_family are set, loads the font CSS
 *    and sets the CSS variable --site-font on :root.
 * 3. If no custom font is set, SolaimanLipi (defined via @font-face in globals.css) is used.
 *
 * The globals.css uses: font-family: var(--site-font, 'SolaimanLipi'), ... !important;
 * So when this component sets --site-font, all elements automatically pick up the new font.
 */

/**
 * Clean font family name — strips surrounding quotes and whitespace.
 * Handles: '"July"' → 'July', 'July' → 'July', "'July'" → 'July'
 */
function cleanFontFamily(raw: string): string {
  let name = raw.trim();
  // Remove surrounding quotes (single, double, or backtick)
  if (
    (name.startsWith('"') && name.endsWith('"')) ||
    (name.startsWith("'") && name.endsWith("'")) ||
    (name.startsWith("`") && name.endsWith("`"))
  ) {
    name = name.slice(1, -1);
  }
  return name.trim();
}

export function CustomFontLoader() {
  const [fontUrl, setFontUrl] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const url = data.custom_font_url || "";
          const family = cleanFontFamily(data.custom_font_family || "");
          setFontUrl(url);
          setFontFamily(family);
        }
      } catch {
        // Silently fall back to default font
      } finally {
        setLoaded(true);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (fontUrl && fontFamily) {
      // ── Step 1: Inject the custom font CSS link ──
      const linkId = "custom-font-link";
      let link = document.getElementById(linkId) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = fontUrl;

      // ── Step 2: Set CSS variable on :root for global override ──
      const root = document.documentElement;
      root.style.setProperty(
        "--site-font",
        `'${fontFamily}', SolaimanLipi, sans-serif`
      );

      // ── Step 3: Also set a direct style override for maximum specificity ──
      const styleId = "custom-font-style";
      let style = document.getElementById(styleId) as HTMLStyleElement | null;

      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }

      style.textContent = `
        :root {
          --site-font: '${fontFamily}', SolaimanLipi, sans-serif;
        }
        body, h1, h2, h3, h4, h5, h6, button, input, textarea, select, label,
        p, span, a, div, li, td, th, nav, header, footer, section, article, aside,
        blockquote, pre, code, small, strong, em, b, i, ul, ol, dd, dt, figcaption,
        [class*="text-"], [class*="font-"] {
          font-family: '${fontFamily}', SolaimanLipi, ui-sans-serif, system-ui, sans-serif !important;
        }
      `;
    } else {
      // No custom font — clear overrides, let SolaimanLipi be the default
      const root = document.documentElement;
      root.style.removeProperty("--site-font");

      const styleEl = document.getElementById("custom-font-style");
      if (styleEl) {
        styleEl.textContent = `
          :root {
            --site-font: 'SolaimanLipi', ui-sans-serif, system-ui, sans-serif;
          }
        `;
      }

      // Also remove any injected font link so custom fonts don't linger
      const linkEl = document.getElementById("custom-font-link");
      if (linkEl) {
        linkEl.remove();
      }
    }
  }, [fontUrl, fontFamily, loaded]);

  return null;
}
