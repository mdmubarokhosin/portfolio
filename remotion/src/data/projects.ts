/* ------------------------------------------------------------------ */
/* Real portfolio projects — data source for ProjectShowcase / Poster  */
/* সম্পাদনা করলেই নতুন ভিডিও/পোস্টার রেন্ডার হবে (README দেখুন)          */
/* ------------------------------------------------------------------ */

export type MockKind = "web" | "mobile";

export interface ProjectEntry {
  /** আউটপুট ফাইলের নাম: <slug>.mp4 / <slug>-poster.jpg */
  slug: string;
  nameEn: string;
  nameBn: string;
  taglineEn: string;
  taglineBn: string;
  /** উপরের ডান কোণার ক্যাটাগরি চিপ */
  category: string;
  /** প্রজেক্টের নিজস্ব অ্যাকসেন্ট কালার */
  accent: string;
  kind: MockKind;
  /** সর্বোচ্চ ৫টি দেখানো হয় */
  tech: string[];
  /** ৩টি ছোট বাংলা ফিচার লাইন */
  features: string[];
  /** লাইভ লিংক / প্ল্যাটফর্ম ব্যাজ (ঐচ্ছিক) */
  url?: string;
}

export const PROJECTS: ProjectEntry[] = [
  {
    slug: "abhijog",
    nameEn: "Abhijog — Complaint Platform",
    nameBn: "অভিযোগ — নাগরিক জবাবদিহিতা প্ল্যাটফর্ম",
    taglineEn: "Anonymous civic complaints — public, verifiable accountability",
    taglineBn: "নাম গোপন রেখে অভিযোগ — প্রকাশ্য ও যাচাইযোগ্য হিসাব",
    category: "PWA · Civic Tech",
    accent: "#F14A0A",
    kind: "mobile",
    tech: ["Next.js 16", "Firebase RTDB", "PWA", "Recharts", "PBKDF2 Auth"],
    features: [
      "নাম গোপন রেখে নিরাপদ অভিযোগ",
      "দুই-স্তরের যাচাই ও সমর্থন/আপত্তি",
      "GPS + ৪ ধাপের অবস্থান নির্বাচন",
    ],
    url: "domain.pages.dev",
  },
  {
    slug: "ibadat365",
    nameEn: "Ibadat 365 — Prayer Portal",
    nameBn: "ইবাদাত ৩৬৫ — নামাজ ও কুরআন পোর্টাল",
    taglineEn: "Prayer times, Qibla compass, Quran & Duas — fully offline",
    taglineBn: "নামাজের সময়, কিবলা কম্পাস, কুরআন ও দোয়া — সম্পূর্ণ অফলাইন",
    category: "Web App · Islamic",
    accent: "#059669",
    kind: "mobile",
    tech: ["React 19", "Vite", "Aladhan API", "Sensor API", "BN·EN·AR"],
    features: [
      "রিয়েল-টাইম নামাজের সময়সূচি",
      "সেন্সর-চালিত কিবলা কম্পাস",
      "ডিজিটাল তাসবিহ ও দৈনিক দুআ",
    ],
    url: "AGPL-3.0 · ওপেন সোর্স",
  },
  {
    slug: "expense-manager",
    nameEn: "Expense Manager",
    nameBn: "এক্সপেন্স ম্যানেজার — ব্যয় ব্যবস্থাপনা",
    taglineEn: "Android personal finance — accounts, budgets & insights",
    taglineBn: "অ্যান্ড্রয়েড পার্সোনাল ফাইন্যান্স — অ্যাকাউন্ট, বাজেট ও অ্যানালিটিক্স",
    category: "Android · Kotlin",
    accent: "#7C3AED",
    kind: "mobile",
    tech: ["Kotlin", "Jetpack Compose", "Material 3", "CSV Export", "Dark Theme"],
    features: [
      "মাল্টি-অ্যাকাউন্ট ও মাসিক বাজেট",
      "ট্রেন্ড ও ক্যাটাগরি চার্ট",
      "সোয়াইপ অ্যাকশন ও CSV এক্সপোর্ট",
    ],
  },
  {
    slug: "unified-geo-api",
    nameEn: "Unified Bangladesh Geo API",
    nameBn: "ইউনিফাইড বাংলাদেশ জিও এপিআই",
    taglineEn: "Free REST API for BD administrative geography",
    taglineBn: "প্রশাসনিক ভূগোলের ফ্রি REST API — বিভাগ থেকে ইউনিয়ন পর্যন্ত",
    category: "REST API · Open Data",
    accent: "#0EA5E9",
    kind: "web",
    tech: ["REST API", "Edge Runtime", "JSON", "7-Day Cache", "Docs Site"],
    features: [
      "৮ বিভাগ · ৬৪ জেলা · ৪৯৫ উপজেলা",
      "৪৫৪০ ইউনিয়নের পূর্ণাঙ্গ ডেটা ট্রি",
      "ওপেন ডকুমেন্টেশন ওয়েবসাইট",
    ],
    url: "unifiedapi.pages.dev",
  },
  {
    slug: "madrasa-management",
    nameEn: "Madrasa Management System",
    nameBn: "কওমি মাদরাসা ম্যানেজমেন্ট সিস্টেম",
    taglineEn: "28 public pages · 41 admin pages · 3 languages",
    taglineBn: "ভর্তি, ফলাফল, ফি, হিসাব — পূর্ণাঙ্গ মাদরাসা ব্যবস্থাপনা",
    category: "Enterprise · Next.js",
    accent: "#16A34A",
    kind: "web",
    tech: ["Next.js 16", "Firebase RTDB", "Tailwind 4", "shadcn/ui", "PWA"],
    features: [
      "অনলাইন ভর্তি ও ফলাফল পোর্টাল",
      "পেমেন্ট গেটওয়ে ও আর্থিক রিপোর্ট",
      "বাংলা · English · العربية সাপোর্ট",
    ],
  },
  {
    slug: "chatbd",
    nameEn: "ChatBD Messenger",
    nameBn: "চ্যাটবিডি মেসেঞ্জার",
    taglineEn: "Real-time chat, audio/video calls & 24h statuses",
    taglineBn: "রিয়েল-টাইম মেসেজিং, গ্রুপ কল ও ২৪ ঘণ্টার স্ট্যাটাস",
    category: "Messenger · WebRTC",
    accent: "#1FB858",
    kind: "mobile",
    tech: ["Next.js 16", "Firebase", "WebRTC", "Web Push", "PWA"],
    features: [
      "১:১ ও গ্রুপ অডিও/ভিডিও কল",
      "৪ ডিজিট আইডি দিয়ে খুঁজুন (#1234)",
      "স্ক্রিন শেয়ার ও কল রেকর্ডিং",
    ],
  },
  {
    slug: "overtime-bd",
    nameEn: "OvertimeCalculationBD",
    nameBn: "ওভারটাইম ক্যালকুলেশন বিডি",
    taglineEn: "Overtime tracking & salary calculation for Bangladesh",
    taglineBn: "ওভারটাইম ট্র্যাকিং, বেতন হিসাব ও অ্যাডমিন রিপোর্ট",
    category: "Productivity · SaaS",
    accent: "#F59E0B",
    kind: "web",
    tech: ["Next.js 16", "Firebase", "Chart.js", "SheetJS", "Dark Mode"],
    features: [
      "স্মার্ট OT হিসাব ও ক্যালেন্ডার ভিউ",
      "Excel / CSV রিপোর্ট এক্সপোর্ট",
      "বাল্ক স্যালারি স্লিপ ও মাস-লক",
    ],
  },
  {
    slug: "bangla-font-cdn",
    nameEn: "BanglaFontCDN",
    nameBn: "বাংলা ফন্ট সিডিএন",
    taglineEn: "Open-source Bengali font CDN platform",
    taglineBn: "বাংলা ফন্ট খুঁজুন, প্রিভিউ করুন, ব্যবহার করুন — ওপেন-সোর্স",
    category: "CDN · Design Tool",
    accent: "#E11D48",
    kind: "web",
    tech: ["Next.js 15", "Edge Runtime", "Gemini AI", "GitHub API", "npm"],
    features: [
      "১১+ ফন্টের লাইভ প্রিভিউ ও তুলনা",
      "AI-চালিত ফন্ট পেয়ারিং সুপারিশ",
      "GitHub সিঙ্ক সহ অ্যাডমিন প্যানেল",
    ],
    url: "banglafontcdn.pages.dev",
  },
  {
    slug: "free-food-map",
    nameEn: "Free Food Map",
    nameBn: "ফ্রি ফুড ম্যাপ",
    taglineEn: "Find & share free food spots across Bangladesh",
    taglineBn: "বিনামূল্যে খাবারের স্পট খুঁজুন ও যোগ করুন — সম্পূর্ণ বাংলায়",
    category: "Community · Map",
    accent: "#84CC16",
    kind: "mobile",
    tech: ["Next.js 16", "Leaflet Map", "Firebase RTDB", "Geolocation", "PWA"],
    features: [
      "লাইভ লোকেশনে নিকটতম স্পট",
      "ইন্টারঅ্যাক্টিভ ম্যাপ ও গ্যালারি",
      "কমিউনিটি ভেরিফিকেশন সিস্টেম",
    ],
  },
];

export const getProject = (slug: string): ProjectEntry =>
  PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0];

/* ------------------------------------------------------------------ */
/* Site cover videos — editable Remotion sources for the originals     */
/* ------------------------------------------------------------------ */

export type CoverKind =
  | "shop" // ecommerce.mp4
  | "mobile" // mobileapp.mp4
  | "dashboard" // dashboard.mp4
  | "blog" // devblog.mp4
  | "site"; // portfolio-site.mp4

export interface CoverEntry {
  /** আউটপুট ফাইল: <slug>.mp4 */
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  kind: CoverKind;
}

export const COVERS: CoverEntry[] = [
  {
    slug: "ecommerce",
    title: "E-Commerce Platform",
    subtitle: "Catalog · Cart · Secure Checkout",
    accent: "#22d3ee",
    kind: "shop",
  },
  {
    slug: "mobileapp",
    title: "Task Flow Mobile App",
    subtitle: "Kanban · Reminders · Offline Sync",
    accent: "#14b8a6",
    kind: "mobile",
  },
  {
    slug: "dashboard",
    title: "Analytics Dashboard",
    subtitle: "Real-time Charts · Role-based Access",
    accent: "#06b6d4",
    kind: "dashboard",
  },
  {
    slug: "devblog",
    title: "Dev Blog Platform",
    subtitle: "MDX · Contentlayer · Syntax Highlight",
    accent: "#818cf8",
    kind: "blog",
  },
  {
    slug: "portfolio-site",
    title: "Portfolio Website",
    subtitle: "Next.js · TypeScript · Remotion",
    accent: "#06b6d4",
    kind: "site",
  },
];

export const getCover = (slug: string): CoverEntry =>
  COVERS.find((c) => c.slug === slug) ?? COVERS[0];
