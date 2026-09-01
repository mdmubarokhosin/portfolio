import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Allow cross-origin requests from preview panel
  allowedDevOrigins: [
    "https://preview-chat-d608f71b-f8dc-49be-8113-3396adba907e.space-z.ai",
  ],
};

export default nextConfig;
