/* Real portfolio content (Firebase + curated) — used by the Showreel scenes */

export const SR = {
  personal: {
    name: "MD MUBAROK HOSIN",
    nameBn: "মোঃ মোবারক হুসেন",
    role: "Web Developer — React & Next.js Specialist",
    roleBn: "ওয়েব ডেভেলপার — React ও Next.js স্পেশালিস্ট",
    tagline: "Building modern web experiences with clean code",
    taglineBn: "পরিষ্কার কোডের সাথে আধুনিক ওয়েব অভিজ্ঞতা",
    location: "Bangladesh",
    locationBn: "বাংলাদেশ",
    email: "contact.mdmubarok@gmail.com",
  },
  stats: [
    { value: 10, suffix: "+", label: "Projects", labelBn: "প্রজেক্ট" },
    { value: 20, suffix: "+", label: "Technologies", labelBn: "টেকনোলজি" },
    { value: 2, suffix: "", label: "Years Experience", labelBn: "বছরের অভিজ্ঞতা" },
    { value: 15, suffix: "+", label: "Happy Clients", labelBn: "সন্তুষ্ট ক্লায়েন্ট" },
  ],
  skills: [
    { name: "JavaScript", level: 92 },
    { name: "React", level: 90 },
    { name: "Tailwind CSS", level: 88 },
    { name: "Next.js", level: 85 },
    { name: "Git & GitHub", level: 85 },
    { name: "TypeScript", level: 80 },
    { name: "Node.js", level: 75 },
    { name: "Figma", level: 72 },
    { name: "Firebase", level: 70 },
    { name: "MongoDB", level: 68 },
  ],
  projects: [
    {
      title: "E-Commerce Platform",
      desc: "Full-featured store — catalog, cart, secure checkout, admin dashboard",
      tags: ["Next.js", "TypeScript", "MongoDB"],
    },
    {
      title: "Analytics Dashboard",
      desc: "Real-time charts, data filters, dark mode and role-based access",
      tags: ["React", "Chart.js", "REST API"],
    },
    {
      title: "Task Flow Mobile App",
      desc: "Kanban boards, reminders, offline sync — PWA with app-like feel",
      tags: ["React", "PWA", "Firebase"],
    },
  ],
  moreProjects: ["Portfolio Website — Next.js · TypeScript · Remotion", "Dev Blog Platform — MDX · Contentlayer"],
  services: [
    { icon: "globe", title: "Web Development", titleBn: "ওয়েব ডেভেলপমেন্ট", desc: "Modern, fast & scalable web apps with React, Next.js and TypeScript" },
    { icon: "palette", title: "UI/UX Design", titleBn: "ইউআই/ইউএক্স ডিজাইন", desc: "Clean, accessible interfaces designed with care in Figma" },
    { icon: "phone", title: "Responsive Design", titleBn: "রেসপন্সিভ ডিজাইন", desc: "Pixel-perfect on every screen — mobile, tablet and desktop" },
    { icon: "zap", title: "Performance & SEO", titleBn: "পারফরম্যান্স ও এসইও", desc: "Core Web Vitals, best practices and search-friendly markup" },
  ],
  timeline: [
    { title: "Junior Web Developer", org: "Tech Company", period: "2023 — Present", desc: "React, Next.js and TypeScript web applications" },
    { title: "Freelance Web Developer", org: "Self-employed", period: "2022 — 2023", desc: "Client projects — from landing pages to full products" },
    { title: "BSc — Bachelor of Science", org: "National University, Bangladesh", period: "2020 — 2024", desc: "" },
  ],
  certificates: [
    { title: "Meta Front-End Developer", issuer: "Coursera · Meta", date: "2024" },
    { title: "React — The Complete Guide", issuer: "Udemy", date: "2024" },
    { title: "JavaScript Algorithms & Data Structures", issuer: "freeCodeCamp", date: "2023" },
    { title: "Responsive Web Design", issuer: "freeCodeCamp", date: "2023" },
    { title: "Complete Web Development Bootcamp", issuer: "Programming Hero", date: "2023" },
  ],
  socials: [
    { short: "GH", label: "github.com/mdmubarokhosin" },
    { short: "in", label: "linkedin.com/in/mdmubarokhosin" },
    { short: "f", label: "facebook.com/mdmubarokhosin" },
  ],
};

/* Scene layout (30fps frames) */
export const SCENES = {
  intro: { from: 0, dur: 160 },      // logo reveal (reuse LogoVideo)
  hero: { from: 160, dur: 185 },
  stats: { from: 345, dur: 170 },
  skills: { from: 515, dur: 200 },
  projects: { from: 715, dur: 240 },
  services: { from: 955, dur: 170 },
  timeline: { from: 1125, dur: 180 },
  certs: { from: 1305, dur: 140 },
  outro: { from: 1445, dur: 180 },
};
export const SHOWREEL_DURATION =
  SCENES.outro.from + SCENES.outro.dur; // 1625f ≈ 54.2s
