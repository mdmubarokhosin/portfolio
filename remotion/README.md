# 🎬 Mubarok Remotion Studio — সম্পূর্ণ ভিডিও সোর্স প্রজেক্ট

MD Mubarok Hossain (মোঃ মোবারক হুসেন)-এর পোর্টফোলিও ওয়েবসাইটে ব্যবহৃত **সবগুলো ভিডিওর Remotion সোর্স প্রজেক্ট** — ভবিষ্যতে যেকোনো কিছু এডিট করে পুনরায় রেন্ডার করার জন্য।

## 📁 ফোল্ডার স্ট্রাকচার

```
remotion/
├── src/
│   ├── data/projects.ts        ← ৯টি প্রজেক্টের তথ্য + ৫টি কভার (এখানেই সব টেক্সট এডিট হয়)
│   ├── Logo.tsx                ← ব্র্যান্ড রং (BRAND), ফন্ট CSS, লোগো কম্পোনেন্ট
│   ├── kit.tsx                 ← শেয়ার্ড ডিজাইন কিট (ব্যাকগ্রাউন্ড, কার্ড, চার্ট, চিপ...)
│   ├── compositions/
│   │   ├── ProjectShowcase.tsx ← ৯টি প্রজেক্ট শোকেস ভিডিও (960×540 · ৮ সেকেন্ড)
│   │   ├── ProjectPoster.tsx   ← ৯টি প্রজেক্ট পোস্টার (960×540 JPG)
│   │   ├── CoverShowcase.tsx   ← সাইটের পুরনো কভার ভিডিওর পুনর্নির্মাণ
│   │   ├── BrandIdent.tsx      ← avatar.mp4 ("MMH." আইডেন্ট, 512×512)
│   │   └── Backgrounds.tsx     ← bg-grid / bg-orbs / bg-waves / bg-hero (লাইট লুপ)
│   ├── Showreel.tsx            ← hero.mp4 (৫৪ সেকেন্ডের ডেভেলপার শোরিল, 1080p)
│   └── Root.tsx                ← সব কম্পোজিশন রেজিস্ট্রি
├── public/fonts/               ← Space Grotesk · Inter · SolaimanLipi (বাংলা)
├── scripts/                    ← রেন্ডার ব্যাশ-স্ক্রিপ্ট
└── renders/                    ← রেন্ডার করা সব আউটপুট (নিচে দেখুন)
    ├── projects/               ← ৯ ভিডিও + ৯ পোস্টার ⭐ নতুন
    ├── site-videos/            ← সাইটে ব্যবহৃত মূল ভিডিওগুলোর আর্কাইভ
    ├── showreel/showreel.mp4   ← hero.mp4-এর কপি (শোরিল)
    └── brand/                  ← logo-video.mp4 · logo-mark.png · logo-full-light/dark.png
```

## 🚀 সেটআপ

```bash
bun install        # অথবা: npm install (Node.js 18+)
npm run studio     # লাইভ প্রিভিউ স্টুডিও → http://localhost:3000
```

> ⚠️ রেন্ডারিংয়ের জন্য ডেস্কটপ/ল্যাপটপ সবচেয়ে ভালো (Remotion প্রথমবার চালালে Headless Chrome নামিয়ে নেয়)। Termux-এ স্টুডিও প্রিভিউ চলে, কিন্তু রেন্ডার ধীর হতে পারে।

## 🎥 রেন্ডার কমান্ড (সবগুলো)

| আউটপুট | কমান্ড |
|---|---|
| **৯টি প্রজেক্ট ভিডিও একসাথে** | `npm run render:projects` → `renders/projects/*.mp4` |
| **৯টি পোস্টার একসাথে** | `npm run still:posters` → `renders/projects/*-poster.jpg` |
| একটি প্রজেক্ট ভিডিও | `npx remotion render src/index.ts ProjectShowcase renders/projects/abhijog.mp4 --props '{"slug":"abhijog"}' --codec=h264 --crf=20` |
| একটি পোস্টার | `npx remotion still src/index.ts ProjectPoster renders/projects/abhijog-poster.jpg --props '{"slug":"abhijog"}' --quality=100` |
| সাইটের কভার ভিডিও (৫টি + avatar) | `npm run render:covers` → `renders/site-videos/` |
| ব্যাকগ্রাউন্ড লুপ (৪টি) | `npm run render:backgrounds` → `renders/site-videos/` |
| শোরিল (hero.mp4, 1080p) | `npm run render:showreel` |
| লোগো ভিডিও | `npm run render:logo` |
| লোগো PNG (মার্ক/লাইট/ডার্ক) | `npm run still:mark` · `still:light` · `still:dark` |

**slug তালিকা:** `abhijog` · `ibadat365` · `expense-manager` · `unified-geo-api` · `madrasa-management` · `chatbd` · `overtime-bd` · `bangla-font-cdn` · `free-food-map`

**কভার slug:** `ecommerce` · `mobileapp` · `dashboard` · `devblog` · `portfolio-site`

## ✏️ কীভাবে এডিট করবেন

### ১. প্রজেক্টের টেক্সট/তথ্য বদলাতে
`src/data/projects.ts` খুলুন — প্রতিটি প্রজেক্টের নাম (EN/BN), ট্যাগলাইন, ফিচার, টেক স্ট্যাক, URL, **অ্যাকসেন্ট রং** সব এখানে। এডিট করে আবার `npm run render:projects` চালালেই নতুন ভিডিও।

### ২. নতুন প্রজেক্ট যোগ করতে
`projects.ts`-এর `PROJECTS` অ্যারেতে নতুন এন্ট্রি যোগ করুন, তারপর `scripts/render-projects.sh` ও `scripts/still-posters.sh`-এর `SLUGS=(...)` তালিকায় নতুন slug লিখুন।

### ৩. রং/ফন্ট বদলাতে
- ব্র্যান্ড রং: `src/Logo.tsx` → `BRAND` অবজেক্ট (সাইটের চার রঙের সাথে মিলিত: `#0f172a` · `#06b6d4` · `#f8fafc` · `#ffffff`)
- প্রতিটি ভিডিওর নিজস্ব অ্যাকসেন্ট: `projects.ts` → `accent` ফিল্ড
- ফন্ট ফাইল: `public/fonts/` (বাংলার জন্য SolaimanLipi)

### ৪. ডিজাইন কম্পোনেন্ট
`src/kit.tsx` — ব্যাকগ্রাউন্ড, মকআপ ফ্রেম (ব্রাউজার/ফোন), চার্ট (Bars/Donut), ফিচার-লাইন, চিপ — সব শেয়ার্ড; এখানে বদলালে সব ভিডিওতে একসাথে প্রযোজ্য হবে।

## 📌 নোট

- `renders/` ফোল্ডারের ফাইলগুলোই বর্তমান সাইটে ব্যবহৃত সংস্করণ (site-videos/) ও নতুন আউটপুট (projects/)।
- সাইটের `public/videos/`-এ নতুন প্রজেক্ট ভিডিও ব্যবহার করতে চাইলে `renders/projects/*.mp4` + `*-poster.jpg` কপি করে Admin Panel-এর Projects এডিটরে ভিডিও URL বসান।
- সব কম্পোজিশন seamless-loop মাথায় রেখে বানানো (ব্যাকগ্রাউন্ডগুলো পারফেক্ট লুপ হয়)।
- লাইসেন্স: ব্যক্তিগত পোর্টফোলিও — MD Mubarok Hossain
