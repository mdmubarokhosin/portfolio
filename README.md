# MD Mubarok Hossain — Portfolio (মো. মোবারক হোসেন)

Bilingual (বাংলা + English) developer portfolio — Next.js 16 App Router, Tailwind CSS v4,
Firebase RTDB দিয়ে live CMS + Admin Panel, AI Chatbot (অনলাইন + অফলাইন), YouTube চ্যানেল পেজ।

> **Deployment target: Hostinger (Node.js hosting)**

---

## 🆕 v4.2 — সম্পূর্ণ নম্বর লোকালাইজেশন (সাইটব্যাপী)

| বদল | বিস্তারিত |
|---|---|
| 🔢 **YouTube পেজের সব সংখ্যা বাংলা** | ভিডিও সংখ্যা, সাবস্ক্রাইবার, মোট ভিউ, প্রতিটি ভিডিওর views, ভিডিওর duration (৩০:৪৭), চ্যানেল join-এর তারিখ, "(৫)", "+৯" — বাংলা ভাষায় সবই বাংলা সংখ্যায় (০-৯) দেখায়; ইংরেজিতে আবার ইংরেজি সংখ্যায় ফিরে যায় |
| 🇧🇩 **South-Asian কাউন্টিং** | বাংলা মোডে বড় সংখ্যা YouTube বাংলাদেশের মতোই: ১২.৪ হাজার → ৫.২ লাখ → ১.৩ কোটি (ইংরেজিতে 12.4K / 520K / 1.3M) |
| 🌐 **সাইটব্যাপী অডিট** | Home stats, About, Skills, Projects, Experience, Resume, Contact, Services, Legal, Footer — প্রতিটি পেজ স্ক্যান করে বাকি সব ইংরেজি সংখ্যা বাংলা করা হয়েছে (About/Services-এর ০১-০৪ সেকশন নম্বর, Experience/Resume-এর period/certificate তারিখ ফলব্যাক সহ) |
| 📦 **Production-ready source zip** | অপ্রয়োজনীয় ফাইল বাদ দিয়ে সম্পূর্ণ এডিটেবল সোর্স কোড প্যাকেজ |

---

## 🆕 v4.1 — জরুরি ফিক্স

| ফিক্স | বিস্তারিত |
|---|---|
| 🐛 **"unauthorized" বাগ (মূল কারণ)** | সার্ভার Firebase ID token RTDB-তে ভুল প্যারামে (`access_token=`) পাঠাচ্ছিল — RTDB সবসময় 401 দিত। এখন সঠিক `auth=` প্যারাম — Admin Panel-এর **সব** সেভ (Channel ID সহ) কাজ করে |
| 🔔 **বন্ধুত্বপূর্ণ এরর মেসেজ** | সেশন শেষ/নিয়ম-ব্লক/নেটওয়ার্ক সমস্যায় এখন পরিষ্কার বাংলা-ইংরেজি নির্দেশনা দেখায় — কাঁচা "unauthorized" টেক্সট আর নয় |
| 🚨 **লিক হওয়া users নোড মুছে ফেলা** | পুরনো সিস্টেমের plaintext পাসওয়ার্ড-সহ `users` + `sessions` নোড লাইভ DB থেকে সরানো হয়েছে; Firebase Auth-এ অ্যাডমিন অ্যাকাউন্ট তৈরি + verify/reset মেইল পাঠানো হয়েছে |
| 📖 **README সংশোধন** | ধাপ ২-এর ভুল rules উদাহরণ (`.write: false` → `isAdmin()`) ঠিক করা — আগেরটা কপি করলে অ্যাডমিন সেভ বন্ধ হয়ে যেত |

---

## 🆕 v4.0 — এই ভার্সনে যা যা বদলেছে

| বদল | বিস্তারিত |
|---|---|
| 🧭 **হ্যাশ রাউটিং সম্পূর্ণ বাদ** | আর `#/about` নেই — এখন আসল রুট: `/`, `/about`, `/skills`, `/projects`, `/experience`, `/youtube`, `/contact`, `/admin`। প্রতিটি পেজ SEO-indexable, সরাসরি লিংকযোগ্য |
| 🗃️ **Seed data (portfolio.json) পুরোপুরি বাদ** | সাইট ১০০% Firebase RTDB থেকে লোড হয়। লোডিংয়ে skeleton, ডেটাবেস ডাউন থাকলে বাংলা-ইংরেজি retry স্ক্রিন |
| 🔐 **Firebase Security — secret-মুক্ত** | Admin লেখায় Firebase Auth ID token (শুধু verified অ্যাডমিন ইমেইল), সার্ভারে কোনো secret নেই। পাবলিক শুধু contact form + visitor counter লিখতে পারে (rules-validated) |
| 🔁 **পোলিং অপ্টিমাইজ** | ২০s হার্ভ পোল নেই — এখন টাইব `sync` মার্কার (৪০ বাইট) ৩০ সেকেন্ডে, ট্যাব hidden থাকলে পোলিং বন্ধ, কিছু বদলালে তবেই বড় fetch |
| ⚡ **ভিডিও lazy-load** | প্রজেক্ট কভার ও ব্যাকগ্রাউন্ড ভিডিও viewport-এর ৪০০px কাছে গেলে তবেই ডাউনলোড হয় |
| 🍔 **Hamburger drawer মেনু** | মোবাইল মেনু নতুন ডিজাইন — স্লাইড-ইন drawer, অ্যাকটিভ পিল হাইলাইট, নিচে social + ভাষা/থিম টগল |
| ▶️ **YouTube চ্যানেল পেজ** | `/youtube` — চ্যানেল পরিসংখ্যান + সব ভিডিও অটো-লোড (Channel ID দিলেই চলে; API key থাকলে আরও সমৃদ্ধ) |
| 🤖 **চ্যাটবট দুই মোড** | API key দিলে AI (OpenRouter/Groq/OpenAI/Gemini/custom), না দিলে built-in অফলাইন ইঞ্জিন — Admin Panel-এ টেস্ট বাটনসহ |
| 🌐 **Dynamic SITE_URL** | ডোমেইন কোথাও hardcode নেই — request header থেকে অটো-ডিটেক্ট। যেকোনো ডোমেইনে OG/canonical/sitemap স্বয়ংক্রিয় ঠিক |
| 🗺️ **Dynamic robots.txt + sitemap.xml** | `public/` এর স্ট্যাটিক ফাইল বাদ — এখন `/robots.ts` + `/sitemap.ts` রুট থেকে জেনারেট |

---

## 🚀 Hostinger-এ ডিপ্লয়

### ধাপ ১ — কোড ডিপ্লয়

1. **hPanel → Website → Dashboard → Deployment** (অথবা *Git Deployment*) এ যান।
2. Repository: `https://github.com/mdmubarokhosin/portfolio` — Branch: `main`
3. Build configuration:
   | Field | Value |
   |---|---|
   | Application type | **Next.js** |
   | Build command | `npm run build` |
   | Output directory | `.next` |
   | Node.js version | **22** (ডিফল্টই থাক) |
4. **Deploy** চাপুন।

ZIP আপলোড পথে: ফাইলগুলো `~/portfolio`-তে এক্সট্র্যাক্ট → `npm install` → `npm run build` → `npm start`।

### ধাপ ২ — Firebase Security Rules বসান (অবশ্যই! 🔴)

এই ভার্সনে ডেটাবেস লক করা বাধ্যতামূলক — না করলে পৃথিবীর যে কেউ আপনার ডেটা মুছতে পারবে।

1. `firebase.rules.json` ফাইলটি খুলুন (প্রজেক্ট root-এ আছে)।
2. Firebase Console → **Realtime Database → Rules** ট্যাবে যান।
3. ফাইলের সম্পূর্ণ কনটেন্ট কপি করে বসিয়ে **Publish** চাপুন।

> ⚠️ সাবধান: `portfolio` / `settings` নোডের `.write` অবশ্যই `"isAdmin()"` থাকতে হবে —
> `false` করলে Admin Panel থেকে কিছুই সেভ হবে না ("permission denied")।
> ফাইলের সারসংক্ষেপ (সম্পূর্ণটা `firebase.rules.json`-এ আছে):
>
> ```json
> {
>   "rules": {
>     "isAdmin": "auth != null && auth.token.email_verified == true && auth.token.email != null && auth.token.email.toLower() == 'contact.mdmubarok@gmail.com'",
>     ".read": false,
>     ".write": false,
>     "portfolio": { ".read": true, ".write": "isAdmin()" },
>     "settings":  { ".read": true, ".write": "isAdmin()" },
>     "sync":      { ".read": true, ".write": "isAdmin()" },
>     "stats":     { ".read": true, ".write": false,
>                    "visitors": { ".write": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000000" } },
>     "contactMessages": { ".read": "isAdmin()", ".write": "newData.hasChildren(['name','email','subject','message','createdAt']) || isAdmin()" },
>     "users":    { ".read": false, ".write": false },
>     "sessions": { ".read": false, ".write": false },
>     "$other":   { ".read": false, ".write": false }
>   }
> }
> ```

### ধাপ ৩ — Admin চালু করুন (Firebase Authentication — কোনো secret লাগে না ✅)

Admin Panel এখন **Firebase Authentication** (Email/Password) দিয়ে চলে — ডাটাবেসে কোনো পাসওয়ার্ড
সংরক্ষিত থাকে না, সার্ভারে কোনো secret রাখতে হয় না। সেটআপ মাত্র ২ মিনিটের:

1. `/admin` লগইন স্ক্রিনে **"নতুন অ্যাকাউন্ট"** ট্যাবে যান।
2. আপনার অ্যাডমিন ইমেইল দিন — ডিফল্টভাবে rules এই ইমেইলটাকে অ্যাডমিন মানে:
   `contact.mdmubarok@gmail.com` (বদলাতে চাইলে `firebase.rules.json`-এর `isAdmin` লাইনে ইমেইল বদলান)
   — সাথে একটা পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) দিয়ে **Create account** চাপুন।
3. Firebase আপনার ইমেইলে একটা **verification লিঙ্ক** পাঠাবে — সেটায় ক্লিক করুন।
4. এবার **লগইন** ট্যাব থেকে লগইন করুন — ব্যাস! সব এডিট/সেভ কাজ করবে।

> পাসওয়ার্ড ভুলে গেলে লগইন স্ক্রিনের **"রিসেট"** ট্যাব — ইমেইলে রিসেট লিঙ্ক যাবে।
>
> **নিরাপত্তা:** rules-এ `email_verified == true` বাধ্যতামূলক — অন্য কেউ আপনার ইমেইল দিয়ে
> অ্যাকাউন্ট খুললেও verify করতে না পারলে কিছুই লিখতে পারবে না। পাবলিক শুধু Contact form-এ
> মেসেজ পাঠাতে পারে ও visitor কাউন্টার বাড়াতে পারে — দুটোই rules-এ validate করা।

### ধাপ ৪ — ডোমেইন/SSL

প্রথম ডিপ্লয়ের পর hPanel → Security → SSL সেট আপ করুন। SITE_URL কিছু করতে হয় না —
সব কিছু অটোমেটিক আপনার ডোমেইন ধরে নেবে।

---

## 🛠 Local Development

```bash
npm install        # dependencies ইনস্টল
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # প্রোডাকশন বিল্ড (webpack → .next)
npm run start      # প্রোডাকশন সার্ভার লোকাল টেস্ট
npm run lint       # ESLint চেক (0 errors)
```

Node.js **20.9+** লাগবে (20 LTS বা 22 রেকমেন্ডেড)।

> **bun ব্যবহারকারীদের জন্য:** bun npm-এর `overrides` (file:) সমর্থন করে না — lint চালাতে
> `ln -sfn ../tools/minimatch-bridge node_modules/minimatch` চালান। Hostinger/npm-এ সমস্যা নেই।

---

## 🧩 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), tw-animate-css, shadcn/ui |
| Animation | Framer Motion, CSS keyframes |
| Charts | Chart.js + react-chartjs-2, Recharts |
| CMS / Database | Firebase Realtime Database (REST API — কোনো SDK নেই, সার্ভার-প্রক্সিড write) |
| AI Chatbot | `/api/chatbot` → OpenRouter / Groq / OpenAI / Gemini / custom + offline engine |
| YouTube | `/api/youtube` → Data API v3 (key থাকলে) বা RSS fallback, ১৫ মিনিট ক্যাশ |
| Fonts | Self-hosted: Inter, Space Grotesk, SolaimanLipi |

## 📁 প্রজেক্ট স্ট্রাকচার

```
├── src/
│   ├── app/                    # App Router routes + API routes
│   │   ├── page.tsx            # /  (হোম)
│   │   ├── about|skills|projects|experience|youtube|contact/
│   │   ├── admin/              # ফুল-স্ক্রিন CMS
│   │   └── api/
│   │       ├── admin/          # 🔐 সব privileged Firebase operation (rules-সুরক্ষিত)
│   │       ├── chatbot/        # AI চ্যাটবট (offline fallback সহ)
│   │       ├── contact/        # কন্টাক্ট ফর্ম (sanitized + rate-limited)
│   │       ├── visitors/       # ভিজিটর কাউন্টার
│   │       └── youtube/        # ইউটিউব ফিড (RSS/API + ক্যাশ)
│   ├── components/portfolio/   # সাইটের সব সেকশন/পেজ কম্পোনেন্ট
│   │   └── admin/              # Admin Panel (CMS editors)
│   ├── components/ui/          # shadcn/ui কম্পোনেন্ট
│   ├── context/                # Theme / Language / Admin / PortfolioData
│   ├── data/                   # translations.json (UI অনুবাদ)
│   ├── lib/
│   │   ├── firebase.ts         # পাবলিক READ client (ব্রাউজার)
│   │   ├── server/fb-admin.ts  # 🔐 token-relay client (শুধু সার্ভার, secret-মুক্ত)
│   │   ├── firebase-auth.ts    # Firebase Auth REST (লগইন/টোকেন রিফ্রেশ — ব্রাউজার)
│   │   ├── portfolio-store.ts  # ডেটা normalize + API কল
│   │   └── navigation.ts       # রুট ম্যাপ
│   └── app/robots.ts|sitemap.ts  # ডাইনামিক SEO
├── public/                     # videos, images, fonts, manifest
├── firebase.rules.json         # 🔴 Firebase Console-এ বসানোর রুল
└── next.config.ts              # Hostinger-optimized config
```

## ⚙️ Admin Panel, চ্যাটবট ও YouTube

- **Admin Panel:** সরাসরি `/admin` রুটে যান। সব কনটেন্ট লাইভ এডিট; পরিবর্তন সাথে সাথে
  লাইভ ভিজিটরদের কাছে পৌঁছে যায় (sync মার্কার দিয়ে)।
- **AI চ্যাটবট (দুই মোড):** Admin → Site Settings → AI Provider-এ provider/model/API key
  দিন। **Test connection** বাটনে যাচাই করুন — key থাকলে AI উত্তর দেয়, না থাকলে বিল্ট-ইন
  অফলাইন স্মার্ট-রিপ্লাই ইঞ্জিন (দুই ভাষাতেই) চলে — ভিজিটর কখনো খালি উত্তর পায় না।
- **YouTube:** Admin → Site Settings → YouTube Channel-এ **Channel ID** (`UC...`) দিন —
  ব্যাস, `/youtube` পেজে চ্যানেল হেডার + ভিডিও গ্রিড অটো লোড। ঐচ্ছিক API key দিলে
  সাবস্ক্রাইবার/ভিউ স্ট্যাটসও আসবে (Google Cloud Console → YouTube Data API v3)।

## 🔐 Security মডেল (v4.1)

```
ব্রাউজার ──read──▶ portfolio/settings/stats/sync          (rules: read-only)
ব্রাউজার ──POST──▶ /api/admin ──idToken(auth=)──▶ RTDB    (rules যাচাই করে; CRUD, ব্যাকআপ, ক্লিনআপ)
ব্রাউজার ──POST──▶ /api/contact ──rules-validated write▶ RTDB (sanitize + IP rate-limit)
ব্রাউজার ──POST──▶ /api/visitors ──rules-validated write▶ RTDB (কাউন্টার ইনক্রিমেন্ট)
সব অন্য পথ (users/sessions/contactMessages সরাসরি)  → rules: deny all
```

- **কোনো secret নেই** — সার্ভার শুধু ব্রাউজারের Firebase Auth ID token RTDB-তে রিলে করে
  (`?auth=<idToken>`; ভুল প্যারাম `access_token=` হলে RTDB 401 "Unauthorized request." দেয় —
  এটাই আগের ভার্সনের "unauthorized" বাগ ছিল)।
- লেখার অনুমতি শুধু **verified** `contact.mdmubarok@gmail.com` — rules-এ `isAdmin()` যাচাই করে।
- সেশন টোকেন (১ ঘণ্টা ID token + refresh) localStorage-এ থাকে, মেয়াদ শেষের আগে অটো-রিফ্রেশ;
  শেষ হলে Admin Panel পরিষ্কার বাংলা মেসেজে আবার লগইন করতে বলে।
- পাবলিক লেখা: Contact form (fields-validated) ও visitor counter (সংখ্যা-validated) — দুটোই rules-এ বাউন্ডেড।

### 🚨 নিরাপত্তা ঘটনা (v4.1-এ ঠিক করা)

পুরনো সিস্টেম RTDB-র `users` নোডে **প্লেইনটেক্সট পাসওয়ার্ড** রাখত এবং ডাটাবেস rules ছাড়া
খোলা ছিল — যে কেউ পড়তে পারত। v4.1-এ:

1. লিক হওয়া `users` + `sessions` নোড ডাটাবেস থেকে মুছে দেওয়া হয়েছে (নতুন সিস্টেমে দরকারই নেই)।
2. **আপনার করণীয়:** ওই ইমেইলের পাসওয়ার্ড যদি অন্য কোথাও ব্যবহার করে থাকেন — **এখনই বদলান**
   (বিশেষত Gmail)। Admin Panel-এর "রিসেট" ট্যাব দিয়ে নতুন পাসওয়ার্ড সেট করুন।
3. `firebase.rules.json` Firebase Console-এ **Publish** করুন — না করলে ডাটাবেস এখনো খোলা।

## 📄 License

MIT — বিস্তারিত `LICENSE` ফাইলে দেখুন।
