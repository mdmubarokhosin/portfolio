/**
 * Service pages model — slugs + detail content
 *
 * Every service gets its own real page at /Services/<Slug> (e.g.
 * /Services/Web-Development). Slugs are derived from the service title
 * ("Web Development" → "Web-Development"), or from an optional custom
 * `slug` field the admin can set in the panel.
 *
 * The four bundled services ship with curated bilingual detail content
 * (overview, feature list, technologies). Admin-entered overview/features
 * always win over the curated defaults, and services created in the admin
 * panel fall back to a sensible generic description — so every service
 * automatically gets a working detail page.
 */

import type { Service } from "@/context/PortfolioDataContext";

/* ── Slug helpers ──────────────────────────────────────────────────── */

/**
 * "Web Development" → "Web-Development", "UI/UX Design" → "UI-UX-Design",
 * "Performance & SEO" → "Performance-SEO". Bengali-only titles fall back
 * to "service-<index>" so URLs stay clean ASCII.
 */
export function serviceSlug(service: Pick<Service, "title" | "slug">, index = 0): string {
  const base = (service.slug || "").trim() || (service.title || "").trim();
  const slug = base
    .replace(/&/g, " ")
    .replace(/[/\\,+_]+/g, "-")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Keep URLs ASCII-safe (Bengali titles would percent-encode into noise)
  if (!slug || !/[A-Za-z0-9]/.test(slug)) return `service-${index + 1}`;
  return slug;
}

/** Real URL for a service detail page, e.g. /Services/Web-Development */
export function serviceHref(service: Pick<Service, "title" | "slug">, index = 0): string {
  return `/Services/${serviceSlug(service, index)}`;
}

/** The four bundled services — also used by generateStaticParams */
export const DEFAULT_SERVICE_SLUGS = [
  "Web-Development",
  "UI-UX-Design",
  "Responsive-Design",
  "Performance-SEO",
] as const;

/** Brand palette rotation for service icon tiles (cyan → teal family) */
export const serviceColors = ["#06b6d4", "#14b8a6", "#0e7490", "#22d3ee"] as const;

/* ── Curated detail content (seed services) ────────────────────────── */

export interface CuratedServiceDetail {
  slug: string;
  overview: string;
  overviewBn: string;
  features: string[];
  featuresBn: string[];
  tech: string[];
}

export const SERVICE_DETAIL: Record<string, CuratedServiceDetail> = {
  "Web-Development": {
    slug: "Web-Development",
    overview:
      "From a single landing page to a full-scale web application — I design and build modern web products with React, Next.js and TypeScript. Clean architecture, reusable components and careful attention to accessibility and performance mean your site not only looks great but stays easy to grow and maintain.",
    overviewBn:
      "একটি সাধারণ ল্যান্ডিং পেজ থেকে শুরু করে পূর্ণাঙ্গ ওয়েব অ্যাপ্লিকেশন — React, Next.js ও TypeScript দিয়ে আমি আধুনিক ওয়েব প্রোডাক্ট ডিজাইন ও ডেভেলপ করি। পরিচ্ছন্ন আর্কিটেকচার, পুনঃব্যবহারযোগ্য কম্পোনেন্ট এবং অ্যাক্সেসিবিলিটি ও পারফরম্যান্সের প্রতি বিশেষ যত্নের ফলে আপনার সাইট দেখতে শুধু সুন্দরই নয়, ভবিষ্যতে বাড়ানো ও রক্ষণাবেক্ষণও সহজ হয়।",
    features: [
      "Custom React / Next.js front-end development",
      "TypeScript codebase with strict typing",
      "Reusable component library & design system",
      "REST API / Firebase backend integration",
      "Authentication, forms & real-time features",
      "Deployment on Cloudflare Pages / Vercel with CI",
    ],
    featuresBn: [
      "কাস্টম React / Next.js ফ্রন্ট-এন্ড ডেভেলপমেন্ট",
      "স্ট্রিক্ট টাইপিংসহ TypeScript কোডবেস",
      "পুনঃব্যবহারযোগ্য কম্পোনেন্ট লাইব্রেরি ও ডিজাইন সিস্টেম",
      "REST API / Firebase ব্যাকএন্ড ইন্টিগ্রেশন",
      "অথেনটিকেশন, ফর্ম ও রিয়েল-টাইম ফিচার",
      "Cloudflare Pages / Vercel-এ CI সহ ডিপ্লয়মেন্ট",
    ],
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Firebase", "Node.js"],
  },

  "UI-UX-Design": {
    slug: "UI-UX-Design",
    overview:
      "Great products start with great design. I craft clean, intuitive interfaces guided by real user journeys — from wireframes to a pixel-perfect, developer-ready design system in Figma, so the final build feels effortless on every screen.",
    overviewBn:
      "চমৎকার প্রোডাক্ট শুরু হয় চমৎকার ডিজাইন থেকে। ব্যবহারকারীর প্রকৃত জার্নি অনুসরণ করে আমি পরিচ্ছন্ন, স্বজ্ঞাত ইন্টারফেস তৈরি করি — ওয়্যারফ্রেম থেকে শুরু করে Figma-তে পিক্সেল-নিখুঁত, ডেভেলপার-রেডি ডিজাইন সিস্টেম পর্যন্ত, যাতে চূড়ান্ত প্রোডাক্ট প্রতিটি স্ক্রিনে নিখুঁত অনুভূত হয়।",
    features: [
      "User research & wireframing",
      "High-fidelity UI design in Figma",
      "Design system & reusable components",
      "Interactive prototypes for stakeholder review",
      "Accessible color & typography choices",
      "Developer handoff with design tokens",
    ],
    featuresBn: [
      "ইউজার রিসার্চ ও ওয়্যারফ্রেমিং",
      "Figma-তে হাই-ফিডেলিটি UI ডিজাইন",
      "ডিজাইন সিস্টেম ও পুনঃব্যবহারযোগ্য কম্পোনেন্ট",
      "স্টেকহোল্ডার রিভিউয়ের জন্য ইন্টারঅ্যাক্টিভ প্রোটোটাইপ",
      "অ্যাক্সেসিবল কালার ও টাইপোগ্রাফি নির্বাচন",
      "ডিজাইন টোকেনসহ ডেভেলপার হ্যান্ডঅফ",
    ],
    tech: ["Figma", "Adobe XD", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Lucide Icons"],
  },

  "Responsive-Design": {
    slug: "Responsive-Design",
    overview:
      "More than half of your visitors are on a phone. I build layouts that adapt fluidly to every screen size — mobile-first, touch-friendly and tested on real devices — so your site feels native everywhere and never loses content or usability.",
    overviewBn:
      "আপনার অর্ধেকেরও বেশি ভিজিটর মোবাইলে। আমি এমন লেআউট তৈরি করি যা প্রতিটি স্ক্রিন সাইজে সাবলীলভাবে মানিয়ে নেয় — মোবাইল-ফার্স্ট, টাচ-ফ্রেন্ডলি এবং বাস্তব ডিভাইসে পরীক্ষিত — ফলে আপনার সাইট সব জায়গায় নেটিভের মতো অনুভূত হয়, কনটেন্ট বা ব্যবহারযোগ্যতা কখনো হারায় না।",
    features: [
      "Mobile-first fluid layouts (Tailwind CSS)",
      "Flexible grids, typography & spacing scales",
      "Touch-friendly targets & gesture support",
      "Cross-browser testing (Chrome, Safari, Firefox)",
      "Real-device QA — phone, tablet, desktop",
      "Dark mode & reduced-motion support",
    ],
    featuresBn: [
      "মোবাইল-ফার্স্ট ফ্লুইড লেআউট (Tailwind CSS)",
      "নমনীয় গ্রিড, টাইপোগ্রাফি ও স্পেসিং স্কেল",
      "টাচ-ফ্রেন্ডলি টার্গেট ও জেসচার সাপোর্ট",
      "ক্রস-ব্রাউজার টেস্টিং (Chrome, Safari, Firefox)",
      "বাস্তব ডিভাইসে QA — ফোন, ট্যাবলেট, ডেস্কটপ",
      "ডার্ক মোড ও রিডিউসড-মোশন সাপোর্ট",
    ],
    tech: ["Tailwind CSS", "CSS Grid & Flexbox", "Container Queries", "Framer Motion", "Lighthouse"],
  },

  "Performance-SEO": {
    slug: "Performance-SEO",
    overview:
      "Speed sells. I audit and tune every layer — images, fonts, JavaScript, caching and Core Web Vitals — then apply technical SEO so search engines can find, understand and rank your pages. The result: faster loads, better rankings, higher conversions.",
    overviewBn:
      "গতি বিক্রি বাড়ায়। আমি প্রতিটি স্তর অডিট ও অপটিমাইজ করি — ছবি, ফন্ট, জাভাস্ক্রিপ্ট, ক্যাশিং ও Core Web Vitals — এরপর টেকনিক্যাল এসইও প্রয়োগ করি যাতে সার্চ ইঞ্জিন আপনার পেজ সহজে খুঁজে পায়, বুঝতে পায় ও র‍্যাংক করে। ফলাফল: দ্রুত লোড, ভালো র‍্যাংকিং, বেশি কনভার্সন।",
    features: [
      "Core Web Vitals audit & optimisation",
      "Image, font & script optimisation",
      "Caching & CDN strategy (Cloudflare)",
      "Technical SEO — meta, sitemap, structured data",
      "Accessibility (a11y) improvements",
      "Lighthouse / PageSpeed score reports",
    ],
    featuresBn: [
      "Core Web Vitals অডিট ও অপটিমাইজেশন",
      "ছবি, ফন্ট ও স্ক্রিপ্ট অপটিমাইজেশন",
      "ক্যাশিং ও CDN কৌশল (Cloudflare)",
      "টেকনিক্যাল এসইও — মেটা, সাইটম্যাপ, স্ট্রাকচার্ড ডেটা",
      "অ্যাক্সেসিবিলিটি (a11y) উন্নয়ন",
      "Lighthouse / PageSpeed স্কোর রিপোর্ট",
    ],
    tech: ["Lighthouse", "WebPageTest", "Next.js", "Cloudflare", "Schema.org", "Search Console"],
  },
};

/* ── Shared delivery process (all service pages) ───────────────────── */

export interface ProcessStep {
  title: string;
  titleBn: string;
  desc: string;
  descBn: string;
}

export const SERVICE_PROCESS: ProcessStep[] = [
  {
    title: "Discover",
    titleBn: "আবিষ্কার",
    desc: "We discuss goals, audience and scope, then agree on a clear plan and timeline.",
    descBn: "আমরা লক্ষ্য, দর্শক ও পরিধি নিয়ে আলোচনা করি, তারপর স্পষ্ট পরিকল্পনা ও সময়সূচি নির্ধারণ করি।",
  },
  {
    title: "Design",
    titleBn: "ডিজাইন",
    desc: "Wireframes evolve into a polished interface aligned with your brand.",
    descBn: "ওয়্যারফ্রেম আপনার ব্র্যান্ডের সাথে মানানসই নিখুঁত ইন্টারফেসে রূপ নেয়।",
  },
  {
    title: "Build",
    titleBn: "নির্মাণ",
    desc: "Clean, tested code with regular previews — you see progress at every step.",
    descBn: "পরিচ্ছন্ন, পরীক্ষিত কোড এবং নিয়মিত প্রিভিউ — প্রতিটি ধাপে আপনি অগ্রগতি দেখেন।",
  },
  {
    title: "Launch & support",
    titleBn: "লঞ্চ ও সাপোর্ট",
    desc: "Deployment, analytics and ongoing improvements even after go-live.",
    descBn: "ডিপ্লয়মেন্ট, অ্যানালিটিক্স এবং লঞ্চের পরেও ধারাবাহিক উন্নয়ন।",
  },
];

/* ── Generic fallbacks (admin-created services) ────────────────────── */

const GENERIC_FEATURES = [
  "Requirements analysis & planning",
  "Design aligned with your brand",
  "Development with clean, maintainable code",
  "Testing on modern browsers & devices",
  "Deployment and post-launch support",
];

const GENERIC_FEATURES_BN = [
  "প্রয়োজনীয়তা বিশ্লেষণ ও পরিকল্পনা",
  "আপনার ব্র্যান্ডের সাথে মানানসই ডিজাইন",
  "পরিচ্ছন্ন, রক্ষণাবেক্ষণ-সহজ কোডে ডেভেলপমেন্ট",
  "আধুনিক ব্রাউজার ও ডিভাইসে টেস্টিং",
  "ডিপ্লয়মেন্ট ও লঞ্চ-পরবর্তী সাপোর্ট",
];

/* ── Resolver ──────────────────────────────────────────────────────── */

export interface ResolvedServiceDetail {
  overview: string;
  features: string[];
  tech: string[];
}

/**
 * Merge order for copy: admin field → curated default → generic fallback.
 * `features` is stored as a newline-separated string in the admin panel.
 */
export function resolveServiceDetail(service: Service, isBn: boolean, index = 0): ResolvedServiceDetail {
  const curated = SERVICE_DETAIL[serviceSlug(service, index)];

  const fallbackOverview = isBn
    ? `${service.descriptionBn ?? service.description} আপনার প্রজেক্টের জন্য এই সেবাটি কীভাবে কাস্টমাইজ করা যায় তা নিয়ে আলোচনা করতে যোগাযোগ করুন।`
    : `${service.description} Get in touch to discuss how this service can be tailored to your project.`;

  const overview =
    (isBn ? service.overviewBn || curated?.overviewBn : service.overview || curated?.overview) ??
    fallbackOverview;

  const parseList = (raw?: string) =>
    (raw ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
      .filter(Boolean);

  const features =
    parseList(isBn ? service.featuresBn || service.features : service.features).length > 0
      ? parseList(isBn ? service.featuresBn || service.features : service.features)
      : (isBn ? curated?.featuresBn : curated?.features) ??
        (isBn ? GENERIC_FEATURES_BN : GENERIC_FEATURES);

  return { overview, features, tech: curated?.tech ?? [] };
}
