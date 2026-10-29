import type { NextConfig } from "next";

/**
 * Cloudflare Pages deployment — @cloudflare/next-on-pages
 *
 * Build configuration (Cloudflare Pages dashboard):
 *   Build command:           npx @cloudflare/next-on-pages
 *   Build output directory:  .vercel/output/static
 *   Compatibility flag:      nodejs_compat   (Settings → Functions → Compatibility flags)
 *   Environment variable:    NODE_VERSION = 20
 *
 * Locally:
 *   npm run build:pages    → next-on-pages build (output: .vercel/output/static)
 *   npm run preview:pages  → build + preview with `wrangler pages dev`
 *
 * NOTE: `output: "export"` is intentionally NOT used — @cloudflare/next-on-pages
 * requires the standard Next.js build. Pages without server features are still
 * prerendered to static HTML inside .vercel/output/static, while dynamic routes
 * (e.g. /Services/[slug] for admin-created services) and the /api/chatbot edge
 * route are served by Cloudflare edge functions.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  images: {
    // Cloudflare Pages cannot run the Next.js image optimizer without a paid
    // Cloudflare Images subscription — ship all assets as-is instead.
    unoptimized: true,
  },
};

export default nextConfig;
