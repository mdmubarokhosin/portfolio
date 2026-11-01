# MD Mubarok Hossain — Portfolio (মো. মোবারক হোসেন)

Bilingual (বাংলা + English) developer portfolio — Next.js 16 App Router, Tailwind CSS v4,
Firebase RTDB দিয়ে live CMS + Admin Panel, এবং AI Chatbot.

> **Deployment target: Hostinger (Node.js hosting)** — Cloudflare Pages থেকে মাইগ্রেট করা হয়েছে।

---

## 🚀 Hostinger-এ ডিপ্লয় (২টি উপায়)

### উপায় ১ — Hostinger Web Hosting প্যানেল থেকে Git ডিপ্লয় (রেকমেন্ডেড)

1. **hPanel → Website → Dashboard → Deployment** (অথবা *Git Deployment*) এ যান।
2. Repository: `https://github.com/mdmubarokhosin/portfolio` — Branch: `main`
3. Build configuration:
   | Field | Value |
   |---|---|
   | Application type | **Next.js** |
   | Build command | `npm run build` |
   | Output directory | `.next` |
   | Node.js version | **22** (ডিফল্টই থাক) |
4. **Deploy** চাপুন। ব্যাস!

### উপায় ২ — ZIP আপলোড

1. hPanel → **File Manager** খুলুন (অথবা SSH/FTP)।
2. প্রজেক্ট ফোল্ডারে (যেখানে অ্যাপ রাখবেন, যেমন `~/portfolio`) zip-এর ভেতরের ফাইলগুলো আপলোড/এক্সট্র্যাক্ট করুন।
3. SSH থাকলে:
   ```bash
   cd ~/portfolio
   npm install
   npm run build
   npm start        # অথবা Hostinger-এর Node.js অ্যাপ রানার ব্যবহার করুন
   ```
4. Hostinger-এর **Node.js App** ফিচারে Application root হিসেবে এই ফোল্ডার সেট করুন।

### ✅ ডিপ্লয়ের আগে কী জানা দরকার

- **কোনো `.env` ফাইল লাগবে না** — Firebase config `src/lib/firebase.ts`-এ আছে (public web
  config, ডিজাইন অনুযায়ীই পাবলিক), আর চ্যাটবটের API key Admin Panel-এ সেভ থাকে।
- `npm run build` **webpack** দিয়ে বিল্ড হয় (`next build --webpack`)। Turbopack কিছু
  শেয়ার্ড-হোস্টিং স্যান্ডবক্সে PostCSS worker process চালু করতে গিয়ে crash করে — তাই
  প্রোডাকশন বিল্ডে webpack ব্যবহার করা হয়েছে। লোকাল dev-এ Turbopack-ই চলে (দ্রুত HMR)।
- প্রথম ডিপ্লয়ের পর ডোমেইন/SSL সেট আপ করতে ভুলবেন না (hPanel → Security → SSL)।

---

## 🛠 Local Development

```bash
npm install        # dependencies ইনস্টল
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # প্রোডাকশন বিল্ড (webpack → .next)
npm run start      # প্রোডাকশন সার্ভার লোকাল টেস্ট
npm run lint       # ESLint চেক
```

Node.js **20.9+** লাগবে (20 LTS বা 22 রেকমেন্ডেড)।

---

## 🧩 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), tw-animate-css, shadcn/ui |
| Animation | Framer Motion, CSS keyframes |
| Charts | Chart.js + react-chartjs-2, Recharts |
| CMS / Database | Firebase Realtime Database (REST API — কোনো SDK নেই) |
| AI Chatbot | `/api/chatbot` route → OpenRouter / Groq / OpenAI / Gemini / custom |
| Fonts | Self-hosted: Inter, Space Grotesk, SolaimanLipi |

## 📁 প্রজেক্ট স্ট্রাকচার

```
├── src/
│   ├── app/                    # App Router pages + /api/chatbot
│   ├── components/portfolio/   # সাইটের সব সেকশন/পেজ কম্পোনেন্ট
│   │   └── admin/              # Admin Panel (CMS editors)
│   ├── components/ui/          # shadcn/ui কম্পোনেন্ট
│   ├── components/chatbot/     # ChatbotWidget
│   ├── context/                # Theme / Language / Admin / PortfolioData
│   ├── data/                   # portfolio.json, translations.json (fallback content)
│   └── lib/firebase.ts         # Firebase RTDB REST client (browser-side)
├── public/                     # videos, images, fonts, robots, sitemap, manifest
├── next.config.ts              # Hostinger-optimized Next config
└── .env.example                # কোনো env var আসলে লাগে না — ডকুমেন্টেশনের জন্য
```

## ⚙️ Admin Panel & Chatbot

- **Admin Panel:** সাইটে `#/admin` হ্যাশে যান (ন্যাভবার বা URL: `yoursite.com/#/admin`)।
  লগইন করে সব কনটেন্ট (personal, skills, projects, services, experiences, education,
  social links, FAQ, settings) Firebase RTDB-তে লাইভ এডিট করা যায়।
- **AI Chatbot:** Admin → Site Settings থেকে provider (openrouter/groq/openai/gemini/custom),
  model, API key সেট করুন। Key না থাকলে চ্যাটবট নিজের built-in offline assistant-এ ফলব্যাক করে।

## 🔄 Cloudflare Pages থেকে যা বদলেছে (v3.3.0)

| বদল | কারণ |
|---|---|
| `@cloudflare/next-on-pages` ডিপেন্ডেন্সি বাদ | Next 16-র সাথে peer conflict (ERESOLVE error) এবং আর দরকার নেই |
| সব পেজ থেকে `export const runtime = "edge"` বাদ | Cloudflare edge function ছিল; Hostinger Node.js সার্ভারে দরকার নেই |
| `next build --webpack` | Turbopack বিল্ড শেয়ার্ড-হোস্টিং স্যান্ডবক্সে panic করছিল (globals.css/PostCSS worker) |
| Prisma + অব্যবহৃত ২০টি প্যাকেজ বাদ | কোথাও import ছিল না — বিল্ড দ্রুত ও হালকা হয়েছে |
| `tailwind.config.ts` বাদ | Tailwind v4 CSS-first config (`@theme`) ব্যবহার হচ্ছে, JS config লোডই হতো না |
| `mini-services/`, `remotion/` বাদ | এগুলো ডিপ্লয়ের অংশ নয় (remotion দিয়ে ভিডিও রেন্ডার হয় — মূল git রিপোতে আছে) |
| `bun.lock` বাদ, `package-lock.json` যোগ | Hostinger npm ব্যবহার করে |

## 🔐 Security (v3.3.1) — CVE-2026-118764

**minimatch DoS vulnerability সম্পূর্ণ প্যাচ করা হয়েছে** — ট্রিতে ছিল `minimatch@10.2.6`
(`@typescript-eslint/typescript-estree` থেকে) ও `minimatch@3.1.5` (ESLint টুলচেইন থেকে),
দুটোই `< 11.0.1` affected রেঞ্জে।

- `tools/minimatch-bridge/` — ছোট একটা compatibility shim যা প্যাচড **minimatch@11.0.3**-কে
  পুরনো v3-style callable API-র পেছনে মুড়িয়ে দেয় (পুরনো ESLint প্লাগিনগুলো
  `require("minimatch")`-এর রেজাল্ট সরাসরি function হিসেবে কল করে, কিন্তু minimatch 11-এর
  CJS build টা namespace object — তাই এই bridge ছাড়া প্লাগিনগুলো ভেঙে যেত)।
- Root `package.json`-এ `overrides` এন্ট্রি ট্রির **সব** `minimatch`-কে এই bridge-এর দিকে
  পাঠায়; আসল প্যাচড প্যাকেজটি root devDependency `"minimatch-real": "npm:minimatch@^11.0.3"` হিসেবে আছে।
- ফলাফল: `npm audit` → **0 vulnerabilities**।
- **ভবিষ্যতে:** যখন eslint-config-next-এর প্লাগিনগুলো সরাসরি minimatch ≥ 11 সাপোর্ট করবে,
  `tools/minimatch-bridge/` ফোল্ডার + `overrides` ব্লক মুছে ফেলে `npm install` দিলেই হবে
  (bridge ফাইলের মন্তব্যেও লেখা আছে)।

## 📄 License

MIT — বিস্তারিত `LICENSE` ফাইলে দেখুন।
