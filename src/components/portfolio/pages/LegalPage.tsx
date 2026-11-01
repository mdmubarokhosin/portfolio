"use client";

/**
 * LegalPage — shared renderer for /privacy-policy and /terms
 *
 * Clean, bilingual (BN/EN) legal pages written for this portfolio: the
 * contact form stores messages in Firebase RTDB, the site itself is static
 * and hosted on Cloudflare Pages, and preferences (language/theme) live in
 * localStorage. Personalized from Firebase data where it makes sense.
 */

import { useEffect } from "react";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";

export type LegalKind = "privacy" | "terms";

interface LegalSection {
  heading: string;
  body: string[];
}

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { personal } = data;
  const name = isBn ? personal.nameBn ?? personal.name : personal.name;
  const email = personal.email;

  useEffect(() => {
    const titleBn = kind === "privacy" ? "গোপনীয়তা নীতি" : "ব্যবহারের শর্তাবলী";
    const titleEn = kind === "privacy" ? "Privacy Policy" : "Terms of Service";
    document.title = `${isBn ? titleBn : titleEn} — ${name}`;
  }, [kind, isBn, name]);

  const isPrivacy = kind === "privacy";

  const content: {
    badge: string;
    title: string;
    updated: string;
    intro: string;
    sections: LegalSection[];
  } = isPrivacy
    ? {
        badge: t("footer.privacy"),
        title: isBn ? "গোপনীয়তা নীতি" : "Privacy Policy",
        updated: isBn ? "সর্বশেষ হালনাগাদ: ফেব্রুয়ারি ২০২৬" : "Last updated: February 2026",
        intro: isBn
          ? `${name}-এর ওয়েবসাইটে আপনাকে স্বাগতম। আপনার গোপনীয়তা আমার কাছে গুরুত্বপূর্ণ — এই নীতিতে ব্যাখ্যা করা হয়েছে কোন তথ্য সংগ্রহ করা হয়, কেন করা হয় এবং কীভাবে সুরক্ষিত রাখা হয়।`
          : `Welcome to ${name}'s website. Your privacy matters — this policy explains what information is collected, why, and how it is kept safe.`,
        sections: [
          {
            heading: isBn ? "কী তথ্য সংগ্রহ করা হয়" : "What information is collected",
            body: [
              isBn
                ? "যোগাযোগ ফর্ম পূরণ করলে আপনার নাম, ইমেইল, বাজেট ও বার্তা সংরক্ষিত হয় — শুধুমাত্র আপনার অনুমতিতে। এছাড়া সাইটের পরিসংখ্যানের জন্য গুমোট ভিজিট সংখ্যা গণনা করা হয় (কোনো ব্যক্তিগত পরিচয় ছাড়াই)।"
                : "When you submit the contact form, your name, email, budget and message are stored — only with your consent. An anonymous visitor counter is also kept for site statistics (no personal identity involved).",
            ],
          },
          {
            heading: isBn ? "তথ্য কীভাবে ব্যবহার হয়" : "How the information is used",
            body: [
              isBn
                ? "আপনার বার্তা শুধুমাত্র আপনার অনুরোধের উত্তর দিতে ও প্রজেক্ট আলোচনার জন্য ব্যবহার করা হয়। এটি কখনো বিক্রি, ভাড়া বা তৃতীয় পক্ষের বিজ্ঞাপনের জন্য ব্যবহৃত হয় না।"
                : "Your message is used solely to reply to you and discuss your project. It is never sold, rented, or used for third-party advertising.",
            ],
          },
          {
            heading: isBn ? "কুকিজ ও লোকাল স্টোরেজ" : "Cookies & local storage",
            body: [
              isBn
                ? "সাইটটি কোনো বিজ্ঞাপন-ট্র্যাকিং কুকি ব্যবহার করে না। শুধু আপনার পছন্দ (ভাষা, থিম) ও সেশন পরিসংখ্যান আপনার ব্রাউজারের localStorage/sessionStorage-এ সংরক্ষিত থাকে — যা শুধু আপনার ডিভাইসেই থাকে।"
                : "The site does not use advertising or tracking cookies. Only your preferences (language, theme) and session statistics live in your browser's localStorage/sessionStorage — they never leave your device.",
            ],
          },
          {
            heading: isBn ? "তৃতীয় পক্ষের সেবা" : "Third-party services",
            body: [
              isBn
                ? "যোগাযোগ বার্তা Google Firebase (Realtime Database)-এ এবং সাইটটি Cloudflare Pages-এ হোস্ট করা। এই সেবাগুলো নিজস্ব গোপনীয়তা নীতি মেনে চলে এবং অবকাঠামো হিসেবেই ব্যবহৃত হয়।"
                : "Contact messages are stored in Google Firebase (Realtime Database) and the site is hosted on Cloudflare Pages. These providers operate under their own privacy policies and are used purely as infrastructure.",
            ],
          },
          {
            heading: isBn ? "আপনার অধিকার" : "Your rights",
            body: [
              isBn
                ? `আপনার তথ্য দেখা, সংশোধন বা মুছে ফেলার জন্য যেকোনো সময় ${email}-এ ইমেইল করুন — দ্রুত ব্যবস্থা নেওয়া হবে।`
                : `To view, correct or delete any of your data, email ${email} at any time — it will be handled promptly.`,
            ],
          },
        ],
      }
    : {
        badge: t("footer.terms"),
        title: isBn ? "ব্যবহারের শর্তাবলী" : "Terms of Service",
        updated: isBn ? "সর্বশেষ হালনাগাদ: ফেব্রুয়ারি ২০২৬" : "Last updated: February 2026",
        intro: isBn
          ? `${name}-এর ওয়েবসাইট ও সেবা ব্যবহারের আগে এই শর্তগুলো পড়ে নিন। সাইট ব্যবহার করা মানেই আপনি এই শর্তগুলোতে সম্মত।`
          : `Please read these terms before using ${name}'s website and services. Using the site means you agree to them.`,
        sections: [
          {
            heading: isBn ? "সেবাসমূহ" : "Services",
            body: [
              isBn
                ? "এখানে প্রদত্ত সেবার মধ্যে রয়েছে ওয়েব ডেভেলপমেন্ট, UI/UX ডিজাইন, রেসপনসিভ ডিজাইন ও পারফরম্যান্স/এসইও অপটিমাইজেশন। প্রতিটি প্রজেক্টের সুযোগ, সময়সূচি ও মূল্য আলোচনাসাপেক্ষে আলাদা চুক্তিতে নির্ধারিত হয়।"
                : "Services offered include web development, UI/UX design, responsive design and performance/SEO optimisation. Scope, timeline and pricing for every project are agreed separately per engagement.",
            ],
          },
          {
            heading: isBn ? "মেধাস্বত্ব" : "Intellectual property",
            body: [
              isBn
                ? "সাইটের ডিজাইন, কোড ও কনটেন্টের স্বত্ব ${name}-এর। প্রজেক্ট ডেলিভারি ও নির্ধারিত পেমেন্ট সম্পন্ন হলে ক্লায়েন্ট তাদের প্রজেক্টের কোডের মালিকানা পান — পোর্টফোলিওতে কাজটি দেখানোর অধিকার সংরক্ষিত থাকে।"
                : `The design, code and content of this site belong to ${name}. Upon delivery and agreed payment, clients own the code for their project — the right to showcase the work in the portfolio is reserved.`,
            ],
          },
          {
            heading: isBn ? "দায় ও ওয়ারেন্টি" : "Liability & warranty",
            body: [
              isBn
                ? "সাইটের তথ্য “যেমন আছে” ভিত্তিতে দেওয়া। প্রজেক্ট ডেলিভারির পর বুগ-ফিক্সের জন্য যুক্তিসঙ্গত সাপোর্ট উইন্ডো দেওয়া হয়; তবে কোনো পরোক্ষ ক্ষতির জন্য দায় সীমিত।"
                : "Site information is provided \"as is\". A reasonable support window for bug fixes is included after project delivery; liability for indirect damages is limited.",
            ],
          },
          {
            heading: isBn ? "শর্তাবলীর পরিবর্তন" : "Changes to these terms",
            body: [
              isBn
                ? "এই শর্তাবলী সময়ে সময়ে হালনাগাদ হতে পারে — উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে পেজের তারিখ হালনাগাদ করা হবে।"
                : "These terms may be updated over time — significant changes will be reflected in the date above.",
            ],
          },
          {
            heading: isBn ? "যোগাযোগ" : "Contact",
            body: [
              isBn
                ? `শর্তাবলী সম্পর্কে প্রশ্ন থাকলে ${email}-এ ইমেইল করুন।`
                : `Questions about these terms? Email ${email}.`,
            ],
          },
        ],
      };

  // Fix the template-literal placeholder in the BN IP section (kept literal above)
  const sections = content.sections.map((s) => ({
    ...s,
    body: s.body.map((p) => p.replace("${name}", name)),
  }));

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <section
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-primary/10 via-transparent to-transparent"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            {isPrivacy ? (
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            {content.badge}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">{content.updated}</p>
        </div>

        <Card className="card-glow mt-9 rounded-3xl border-border/70 bg-card p-7 sm:p-9">
          <p className="leading-relaxed text-muted-foreground">{content.intro}</p>
          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="flex items-center gap-2.5 text-base font-bold sm:text-lg">
                  <span aria-hidden="true" className="h-4 w-1 rounded-full bg-primary" />
                  {section.heading}
                </h2>
                <div className="mt-2.5 space-y-2.5 pl-[1.15rem]">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>

        <div className="mt-8 text-center print:hidden">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            {isBn ? "সাইটে ফিরুন" : "Back to site"}
          </Button>
        </div>
      </div>
    </div>
  );
}
