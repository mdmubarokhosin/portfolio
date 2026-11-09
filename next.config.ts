import type { NextConfig } from "next";

/**
 * Hostinger (Node.js hosting) — standard Next.js server build
 *
 * Hostinger deployment settings (Git deploy → Build configuration):
 *   Build command:           npm run build
 *   Output directory:        .next
 *   Application type:        Next.js
 *   Node.js version:         20.9+ (Hostinger default Node 22 is fine)
 *   Start:                   managed by Hostinger (npm start → next start)
 *
 * NOTE: `npm run build` intentionally uses `next build --webpack`.
 * Turbopack's build panics on some shared-hosting sandboxes
 * ("node process exited before we could connect to it" while running the
 * PostCSS/Tailwind loader). Webpack runs PostCSS in-process and is stable.
 *
 * Locally:
 *   npm run dev     → dev server (Turbopack, fast HMR)
 *   npm run build   → production build (webpack)
 *   npm run start   → production server
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  images: {
    // Shared-hosting friendly — serve optimized assets directly, no runtime
    // image optimizer needed (also matches the previous CDN behaviour).
    unoptimized: true,
  },
};

export default nextConfig;
