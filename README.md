# মোবারকের পোর্টফোলিও — Mubarok's Portfolio v3

আধুনিক, দ্বিভাষিক (বাংলা ⇄ English), সম্পূর্ণ রেসপন্সিভ ডেভেলপার পোর্টফোলিও — **Next.js 16 + TypeScript + Tailwind CSS 4** দিয়ে তৈরি। **Firebase Realtime Database দিয়ে চলমান CMS**, পূর্ণাঙ্গ **Admin Panel**, আর **Remotion দিয়ে বানানো মোশন-ব্যাকগ্রাউন্ড ভিডিও** — স্ট্যাটিক এক্সপোর্ট সাপোর্ট সহ, তাই **Cloudflare Pages, GitHub Pages, Netlify, Vercel** — যেকোনো জায়গায় হোস্ট করা যায়।

> MD Mubarok Hossain (মো. মোবারক হোসেন) — Web Developer, Bangladesh

---

## ✨ ফিচারসমূহ (Features)

### সামনের অংশ (Public site)
- 🌐 **দ্বিভাষিক** — বাংলা ⇄ English এক ক্লিকে, ভাষা মনে রাখা হয়
- 🔥 **সব কনটেন্ট Firebase থেকে লোড হয়** — পার্সোনাল তথ্য, স্ট্যাটস, সার্ভিস, স্কিল, প্রজেক্ট, এক্সপেরিয়েন্স, এডুকেশন, টেস্টিমোনিয়াল, সার্টিফিকেট, FAQ, সোশ্যাল লিংক — সবকিছু রিয়েলটাইম; অফলাইনে হলে বিল্ট-ইন সিড ডেটায় স্বয়ংক্রিয় ফলব্যাক
- 🎬 **Remotion ভিডিও ব্যাকগ্রাউন্ড** — hero + প্রতিটি সেকশনে সায়ান/টিল অ্যানিমেশন (ব্লেন্ড-মোড দিয়ে লাইট/ডার্ক দুই থিমেই মানানসই), ভিউপোর্টে থাকলে প্লে, বাইরে গেলে অটো-পজ; `prefers-reduced-motion` হলে পোস্টার ফ্রেম
- 🎥 **প্রজেক্ট শোরিল ভিডিও** — প্রতিটি ফিচার্ড প্রজেক্টে Remotion-নির্মিত প্রিভিউ ফিল্ম
- 🎨 **রিডিজাইন করা About ও Skills পেজ** — পুরনো সাইট থেকে অনুপ্রাণিত সেন্টার-অ্যালাইন্ড ডিজাইন: সেন্টার করা ইনফো কার্ড, কোট-কার্ডে বায়ো + স্ট্যাট চিপস, নম্বর-ওয়াটারমার্ক সহ রঙিন সার্ভিস টাইল, স্টার-রেটেড টেস্টিমোনিয়াল; Skills-এ **Chart.js স্কিল রাডার (Top 8)** ও **ক্যাটাগরি ডোনাট** (লাইট/ডার্ক থিম-অ্যাওয়্যার), কাউন্টার-সহ **সেন্টারড স্কিল কার্ড** (লোগো + নাম + % পিল + গ্লো বার)
- 🏅 **সার্টিফিকেট সেকশন (সরাসরি সাইটে)** — About পেজে সার্টিফিকেট ও অর্জনের সেন্টারড কার্ড গ্রিড (অ্যাকসেন্ট রিবন + ইস্যুকারী + তারিখ); Admin Panel → Certificates থেকে সম্পাদনাযোগ্য, খালি থাকলে হেল্পফুল empty-state
- 🦶 **নতুন Footer ডিজাইন** — ব্র্যান্ড ব্লক (লোগো + নাম + বর্ণনা + আউটলাইন সোশ্যাল আইকন) + ৪টি কলাম (আমার সম্পর্কে / পেজসমূহ / সেবাসমূহ / যোগাযোগ) — ড্যাশ-প্রিফিক্স হভার লিংক, ডেকোরেটিভ ডট, availability চিপ, কপিরাইট বার; মোবাইলে ২-কলাম, ডেস্কটপে ৪-কলাম গ্রিড
- 🃏 **সব কার্ডে সেন্টার কনটেন্ট** — পুরো সাইটে সার্ভিস/প্রজেক্ট/প্রসেস/টেস্টিমোনিয়াল/FAQ/এক্সপেরিয়েন্স/কন্টাক্ট কার্ডের কনটেন্ট সেন্টার-অ্যালাইন্ড
- 🙈 **হিডেন Admin পোর্টাল** — পাবলিক সাইটে এডমিনে যাওয়ার কোনো লিংক নেই; শুধু সরাসরি `#/admin` URL-এ প্রবেশ
- 🤖 **AI চ্যাট সহকারী (আগের সাইটের মতো, আরও শক্তিশালী)** — লাইভ Firebase ডেটা থেকে তৈরি system prompt নিয়ে LLM উত্তর দেয়; প্রোভাইডার বাছাইযোগ্য (OpenRouter / Gemini / Groq / OpenAI / custom); key না দিলে স্মার্ট অফলাইন ইঞ্জিন; অ্যাকশন বাটন সহ
- 📮 **কন্টাক্ট ফর্ম** — মেসেজ সরাসরি Firebase-এ জমা হয় (Admin ইনবক্সে লাইভ দেখা যায়) + FormSubmit ইমেইল কপি + **Telegram নোটিফিকেশন** (settings-এ bot token/chat id দিলে), ব্যর্থ হলে mailto ফলব্যাক
- 🧭 **Hash-synced navigation** (`#/projects`) — back/forward, শেয়ারযোগ্য লিংক, পেজ বদলালে স্বয়ংক্রিয় স্ক্রল-টু-টপ
- 🌙 **ডার্ক মোড** — একই কালার প্যালেট থেকে ডিরাইভ করা
- ♿ **অ্যাক্সেসিবিলিটি** — skip-link, ARIA লেবেল, `aria-current`, কীবোর্ড নেভিগেশন, reduced-motion সাপোর্ট
- 🔍 **SEO** — মেটাডেটা, Open Graph/Twitter কার্ড, **JSON-LD (schema.org Person)**, favicon, PWA manifest, robots.txt, 404 + error boundary পেজ

### Admin Panel (`/#/admin`)
- 🔐 **Firebase ভিত্তিক লগইন** — সেশন Realtime Database-এ `sessions/{token}` হিসেবে থাকে; পুরনো সাইটের পাসওয়ার্ড (plain / sha256 / salted) সব ফরম্যাট সাপোর্টেড
- 📊 **ড্যাশবোর্ড** — ভিজিটর কাউন্টার, অপঠিত মেসেজ, প্রজেক্ট/স্কিল সংখ্যা, লাইভ Firebase স্ট্যাটাস, পাসওয়ার্ড পরিবর্তন, Quick-jump গ্রিড
- 📊 **Chart.js চার্ট (আসল `chart.js` + `react-chartjs-2`)** — সেকশন-ভিত্তিক আইটেম বার চার্ট, মেসেজ read/unread ডোনাট, **স্কিল রাডার**, ব্যাকআপ পেজে সেকশন-সাইজ হরাইজন্টাল বার + স্টোরেজ ডিস্ট্রিবিউশন ডোনাট — সব থিম-কালার অ্যাওয়্যার
- ✏️ **১৩টি কনটেন্ট এডিটর** — Personal & Hero, Stats, Navigation, Services, Skills, Projects, Experience, Education, Testimonials, Certificates, FAQ, Contact Info, Social Links — দ্বিভাষিক ফিল্ড, **ভিজ্যুয়াল আইকন পিকার**, **কালার পিকার**, **ক্যাটাগরি ড্রপডাউন**, লাইভ প্রিভিউ, সার্চ/ডুপ্লিকেট/এক্সপ্যান্ড-অল, সরাসরি Firebase-এ সেভ
- 📬 **মেসেজ ইনবক্স** — কন্টাক্ট ফর্মের সব মেসেজ, **All/Unread/Read ফিল্টার + সার্চ**, **Mark-all-read / Delete-read বাল্ক অ্যাকশন**, **JSON/CSV এক্সপোর্ট**, রিপ্লাই, ডিলিট
- ⚙️ **সাইট সেটিংস (A-Z)** — site name/description, **SEO keywords**, **og:image**, **footer text**, **লোগো আপলোড (ফাইল → সরাসরি Firebase)** বা URL, থিম কালার (preset সহ), চ্যাটবট নাম/চালু-বন্ধ/সিস্টেম প্রম্পট/welcome/placeholder, **AI প্রোভাইডার (provider/model/api key/temperature/max tokens)**, **Telegram bot token + chat id**, **কাস্টম ফন্ট (URL + family)**
- 💾 **Backup & Sync — ডেটাবেজ কন্ট্রোল সেন্টার** — সেকশন/সেটিংস/মেসেজ/ভিজিটর KPI, প্রতিটি সেকশনের সাইজ ও updatedAt টেবিল, **per-section download / reset-to-default / delete**, full backup ডাউনলোড, **restore-এ messages সহ + delete-missing মোড**, per-section JSON ডাউনলোড, মেসেজ JSON/CSV এক্সপোর্ট + Delete-all, ভিজিটর কাউন্টার রিসেট, Danger-zone (সব রিসেট)
- 📧 **এডমিন ইমেইল পরিবর্তন** — পাসওয়ার্ড ভেরিফাই করে Firebase `users` নোড রি-কি
- 🧹 **ডেটাবেজ ক্লিনআপ** — অরফান key স্ক্যান (আগের সাইটের /api/admin/cleanup এর মতো) + এক ক্লিকে ডিলিট
- 🛡️ **এডিট সেফটি** — Firebase পোলিং চলাকালীন অসম্পূর্ণ ড্রাফট আর overwrite হয় না (dirty-tracking + content-equality diff)

---

## 🚀 দ্রুত শুরু (Quick Start)

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল
npm install        # অথবা: bun install

# ২. ডেভ সার্ভার চালু
npm run dev        # → http://localhost:3000

# ৩. প্রোডাকশন বিল্ড (স্ট্যাটিক এক্সপোর্ট)
npm run build      # → ./out ফোল্ডার
npm run start      # লোকাল প্রিভিউ of ./out
```

---

## ☁️ Cloudflare Pages-এ ডিপলয় (ধাপে ধাপে)

### পদ্ধতি ১ — GitHub দিয়ে (সুপারিশকৃত)

1. এই প্রজেক্টটি আপনার GitHub রিপোজিটরিতে push করুন:
   ```bash
   git init
   git add .
   git commit -m "Portfolio v3 — Firebase CMS + Admin Panel + Motion backgrounds"
   git branch -M main
   git remote add origin https://github.com/mdmubarokhosin/portfolio.git
   git push -u origin main
   ```
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. রিপোটি সিলেক্ট করে বিল্ড সেটিংস দিন:
   - **Framework preset:** `None` (বা Next.js)
   - **Build command:** `npx next build`
   - **Build output directory:** `out`
   - **Environment variable:** `NODE_VERSION` = `20`
4. **Save and Deploy** → কয়েক মিনিটেই লাইভ! 🎉

### পদ্ধতি ২ — সরাসরি আপলোড (Direct Upload)

```bash
npm run build
npx wrangler pages deploy out --project-name=portfolio
```

---

## 🔥 Firebase কনফিগারেশন

ডেটাবেজ কানেকশন `src/lib/firebase.ts`-এ আছে (Realtime Database REST API — কোনো extra SDK/সার্ভার লাগে না, তাই স্ট্যাটিক হোস্টিং-এও পুরো কাজ করে):

```
databaseURL: https://md-mubarok-hossain-default-rtdb.firebaseio.com
```

### ডেটাবেজ স্ট্রাকচার

```
portfolio/
  personal  | stats | pages | services | skills | projects |
  experience | education | testimonials | certificates |
  faq | contact-info | social-links
    → { dataJson: "<JSON string>", id, updatedAt }
users/{uid}                          → { email, passwordHash }
sessions/{token}                     → { uid, createdAt, expiresAt }
contactMessages/{id}                 → { name, email, subject, message, read, createdAt }
settings/{key}                       → { value, id, updatedAt }
stats/visitors                       → { count, updatedAt }
```

নতুন ডেটাবেজ ব্যবহার করতে চাইলে শুধু `src/lib/firebase.ts`-এ `FIREBASE_CONFIG` বদলে দিন — Admin প্যানেলের **"Seed missing sections"** বাটন প্রথম লোডে সব ডিফল্ট কনটেন্ট বসিয়ে দেবে।

### Admin লগইন

- লিংক: `আপনার-সাইট/#/admin` — **Admin পোর্টাল সম্পূর্ণ হিডেন**; পাবলিক সাইটে (হোমপেজ, ফুটার, মেনু) এডমিনে যাওয়ার কোনো লিংক/বাটন নেই। শুধুমাত্র সরাসরি এই URL দিয়েই লগইন করা যায় — লিংকটি বুকমার্ক করে রাখুন।
- প্রথমবার: পুরনো সাইটের এডমিন ইমেইল/পাসওয়ার্ড কাজ করবে; নতুন ডেটাবেজে প্রথম সিডের সময় `users` নোডে ডিফল্ট অ্যাকাউন্ট তৈরি হয় — **লগইনের পরই Dashboard → Change password থেকে পাসওয়ার্ড বদলে নিন।**

---

## 🤖 AI চ্যাটবট কীভাবে চলে

তিন স্তরের ইঞ্জিন — যেকোনো পরিবেশেই উত্তর দেয়:

1. **Cloudflare Pages Function** (`functions/api/chatbot.ts`) — প্রোডাকশনে স্ট্যাটিক সাইটের পাশেই এজ ফাংশন হিসেবে চলে। Site Settings-এ প্রোভাইডার + API key দিলে (OpenRouter/Gemini/Groq/OpenAI/custom) সেটিই উত্তর দেয়, ঠিক আগের সাইটের মতো।
2. **ডেভ AI সার্ভিস** (`mini-services/chatbot-service/`, port 3030) — লোকাল প্রিভিউয়ে বিল্ট-ইন LLM দিয়ে উত্তর দেয়।
3. **অফলাইন ইঞ্জিন** — উপরের কোনোটাই না পেলে ব্রাউজারেই Firebase ডেটা দিয়ে স্মার্ট রিপ্লাই (intent engine, বাংলা+ইংরেজি)।

সব স্তরেই system prompt লাইভ Firebase কনটেন্ট (personal/skills/projects/services/experience/education/FAQ) থেকে তৈরি হয় — Admin-এ কনটেন্ট বদলালে চ্যাটবটের উত্তরও সাথে সাথে বদলায়।

## 🎬 Remotion ভিডিও পুনঃতৈরি

`public/videos/`-এ সব ভিডিও আগেই রেন্ডার করা আছে (bg-hero, bg-waves, bg-orbs, bg-grid + প্রজেক্ট শোরিলগুলো, প্রতিটির `-poster.jpg` সহ)। নিজে নতুন করে বানাতে চাইলে:

```bash
npx create-video@latest   # Remotion প্রজেক্ট খুলুন
# compositions: BgHero (450f), BgWaves / BgOrbs / BgGrid (300f) — 1280x720 @ 30fps
npx remotion render <comp> out.mp4   # তারপর public/videos/-তে কপি করুন
```

লাইট থিমে ভিডিওগুলো `mix-blend-multiply`, ডার্ক থিমে `invert + hue-rotate + screen` ব্লেন্ডে চলে — তাই সাদা বেসের ভিডিওই যথেষ্ট।

### 🎬 ডেভেলপার শোরিল (`public/videos/hero.mp4`)

হোমপেজের SHOWREEL কার্ডে ব্যবহৃত মূল ডেভেলপার শোরিল — **১৯২০×1080, ~৫৪ সেকেন্ড, 30fps, h264, লুপযোগ্য**। পোর্টফোলিওর আসল ডেটা দিয়ে তৈরি ৯টি সিন:

1. **ব্র্যান্ড ইন্ট্রো** — M মনোগ্রাম + নাম (EN + BN) রিভিল
2. **হিরো** — নাম, রোল, ট্যাগলাইন, Open to work ব্যাজ
3. **পরিসংখ্যান** — অ্যানিমেটেড কাউন্টার (প্রজেক্ট/টেকনোলজি/অভিজ্ঞতা/ক্লায়েন্ট)
4. **স্কিলস** — ১০টি টেকনোলজির অ্যানিমেটেড লেভেল বার
5. **প্রজেক্ট** — ফিচার্ড ৩টি প্রজেক্ট কার্ড + ট্যাগ
6. **সেবা** — ৪টি সার্ভিস (দ্বিভাষিক)
7. **অভিজ্ঞতা ও শিক্ষা** — টাইমলাইন
8. **সার্টিফিকেট** — ৫টি সার্টিফিকেট
9. **আউটরো** — যোগাযোগ, সোশ্যাল লিংক, CTA

শোরিলের কনটেন্ট পরিবর্তন করতে হলে Remotion প্রজেক্টে `showreelData.ts` ফাইলটি এডিট করুন (নাম, স্ট্যাটস, স্কিল, প্রজেক্ট, সার্ভিস, অভিজ্ঞতা, সার্টিফিকেট — সব সেখানে):

```bash
# Showreel কম্পোজিশন (1625f @30fps, 1920x1080)
npx remotion render src/index.ts Showreel out/showreel.mp4 --codec=h264 --crf=20
# তারপর public/videos/hero.mp4 হিসেবে কপি করুন
# পোস্টার: ffmpeg -i showreel.mp4 -vf "select=eq(n\\,320)" -q:v 3 hero-poster.jpg
```

## 🎨 ব্র্যান্ড লোগো (Brand Assets — `public/brand/`)

Remotion দিয়ে ডিজাইন ও রেন্ডার করা অফিসিয়াল লোগো — নাম "MD MUBAROK HOSIN" + "মোঃ মোবারক হুসেন", সাইটের প্যালেটে (slate `#0f172a` + cyan `#06b6d4`):

| ফাইল | বিবরণ |
|------|--------|
| `logo-video.mp4` | অ্যানিমেটেড লোগো রিভিল (1920×1080, ৫.৩ সেকেন্ড, h264) — ইন্ট্রো/শোরিল/সোশ্যাল হিসেবে ব্যবহারযোগ্য |
| `logo-video-poster.jpg` | ভিডিওর ফাইনাল ফ্রেম (poster) |
| `logo-mark.png` | আইকন-মার্ক (1024×1024, ট্রান্সপারেন্ট PNG) |
| `logo-mark-512/192/180/32.png` | favicon / PWA / apple-touch সাইজ |
| `logo-full-light.png` | হরাইজন্টাল লকআপ — লাইট ব্যাকগ্রাউন্ডের জন্য (2400×800, ট্রান্সপারেন্ট) |
| `logo-full-dark.png` | হরাইজন্টাল লকআপ — ডার্ক ব্যাকগ্রাউন্ডের জন্য (2400×800, ট্রান্সপারেন্ট) |

মার্কটির ভেক্টর ভার্সন `src/app/icon.svg` (favicon) ও `public/logo.svg`-এ আছে। Navbar/Footer-এর ডিফল্ট লোগো `/brand/logo-mark.png` — Admin Panel → Personal → Site Logo থেকে পরিবর্তন করা যায়।

লোগো পুনঃরেন্ডার করতে:

```bash
# Remotion প্রজেক্টে compositions: LogoVideo (160f @30fps, 1920x1080),
# LogoMark (1024x1024), LogoFullLight / LogoFullDark (2400x800)
npx remotion render src/index.ts LogoVideo out/logo-video.mp4 --codec=h264 --crf=17
npx remotion still src/index.ts LogoMark out/logo-mark.png
```

---

## 🌐 দ্বিভাষিক সিস্টেম (বাংলা ⇄ English — A to Z)

সাইটের প্রতিটি লেখা ভাষা টগলের সাথে সাথে বদলায় — **সংখ্যাসহ**। বাংলা মোডে সব সংখ্যা বাংলা অঙ্কে দেখায় (১০+, ২০+, ২ বছর, ১৫+)।

**কীভাবে কাজ করে:**

| স্তর | ফাইল | ব্যাখ্যা |
|------|------|---------|
| স্ট্যাটিক UI টেক্সট | `src/data/translations.json` | `en` ও `bn` দুইটি ট্রি — `t("home.faq")` এভাবে ব্যবহার হয় |
| ডাইনামিক ডেটা | `src/data/portfolio.json` | প্রতিটি ফিল্ডের পাশে `*Bn` সাইবলিং (`titleBn`, `labelBn`, `suffixBn`, `companyBn`...) |
| সংখ্যা রূপান্তর | `src/lib/i18n-utils.ts` | `localizeDigits()` (০১২৩৪৫৬৭৮৯), `pickSuffix()` (" Years"→" বছর") |
| কাউন্টার | `AnimatedCounter.tsx` | স্বয়ংক্রিয়ভাবে ভাষা অনুযায়ী অঙ্ক + suffix লোকালাইজ করে |

**ভবিষ্যতে এডিট করার নিয়ম:**

1. Admin Panel-এ সব `*Bn` ফিল্ড এডিট করা যায় (Stats → Suffix (বাংলা), Experience → Company (বাংলা) ইত্যাদি)।
2. নতুন স্ট্যাটিক লেখা যোগ করলে `translations.json`-এ `en` ও `bn` **দুই ট্রিতেই** key যোগ করুন।
3. নতুন কোনো সংখ্যা রেন্ডার করলে `{value}`-এর বদলে `{localizeDigits(value, isBn)}` ব্যবহার করুন (`useLanguage()` থেকে `isBn`)।
4. ভাষা পছন্দ `localStorage`-এ `portfolio-lang` key-তে সেভ হয়।

---

## 🗂 প্রজেক্ট স্ট্রাকচার

```
src/
  app/                 → layout, page (hash router), error/not-found, icon
  components/
    portfolio/         → HomePage, AboutPage, SkillsPage, ProjectsPage,
                         ExperiencePage, ContactPage, Navbar, Footer,
                         SectionVideoBackground, VideoCover ...
    portfolio/admin/   → AdminPage (login/dashboard/editors/messages/
                         settings/backup), AdminEditors, admin-bits
    chatbot/           → ChatbotWidget (Firebase-data aware)
    ui/                → shadcn/ui components
  context/             → PortfolioDataContext (Firebase polling + offline
                         fallback), LanguageContext, ThemeContext, AdminContext
  lib/                 → firebase.ts (REST client + auth utils),
                         portfolio-store.ts (data layer), i18n-utils.ts
                         (বাংলা অঙ্ক/suffix রূপান্তর), icons.tsx
public/
  videos/              → Remotion রেন্ডার (mp4 + poster; hero.mp4 = ডেভেলপার শোরিল)
  brand/               → ব্র্যান্ড লোগো (mp4 + png, Remotion দিয়ে রেন্ডার)
  images/skills/       → self-hosted tech logos
functions/
  api/chatbot.ts       → Cloudflare Pages Function (প্রোডাকশন AI চ্যাটবট)
mini-services/
  chatbot-service/     → লোকাল ডেভ AI চ্যাটবট সার্ভিস (bun --hot, port 3030)
```

## 🛠 টেক স্ট্যাক

Next.js 16 (App Router, static export) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Framer Motion · Firebase Realtime Database (REST) · Remotion · Lucide Icons

## 📄 লাইসেন্স

MIT — বিস্তারিত `LICENSE` ফাইলে।
