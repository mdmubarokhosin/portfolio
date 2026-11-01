"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, User, Mail as MailIcon, Tag, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import SectionVideoBackground from "./SectionVideoBackground";
import { createContactMessage } from "@/lib/portfolio-store";
import { Icon } from "@/components/icons";

/**
 * Fire-and-forget Telegram notification (same behaviour as the original
 * site's /api/admin/contact). Reads the admin-configured bot token + chat id
 * from Firebase settings and sends the message straight from the browser —
 * Telegram's API allows cross-origin calls, so no server is required.
 */
async function sendTelegramNotification(msg: {
  name: string;
  email: string;
  subject: string;
  budget?: string;
  message: string;
}): Promise<void> {
  try {
    const { fetchSettings } = await import("@/lib/portfolio-store");
    const s = await fetchSettings();
    const token = s.telegram_bot_token || "";
    const chatId = s.telegram_chat_id || "";
    if (!token || !chatId) return; // not configured → skip silently

    const esc = (t: string) => t.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
    const budget = msg.budget ? `\n💰 Budget: ${esc(msg.budget)}` : "";
    const text =
      `📬 *New Portfolio Message*\n\n` +
      `👤 *Name:* ${esc(msg.name)}\n` +
      `📧 *Email:* ${esc(msg.email)}\n` +
      `📝 *Subject:* ${esc(msg.subject)}${budget}\n\n` +
      `${esc(msg.message).slice(0, 1500)}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
    }).catch(() => undefined);
  } catch {
    /* notification is best-effort, never blocks the form */
  }
}

interface ContactPageProps {
  onNavigate?: (page: string) => void;
}

interface FillEventDetail {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  budget?: string;
}

export default function ContactPage(_props: ContactPageProps) {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { personal, contactInfo, socialLinks } = data;

  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    budget: "",
    message: "",
  });

  // AI-chatbot form prefill (+ pending prefill bridged across full-page
  // navigations from the standalone routes, see SiteShell)
  useEffect(() => {
    const apply = (detail: FillEventDetail) => {
      setForm((f) => ({
        ...f,
        name: detail.name ?? f.name,
        email: detail.email ?? f.email,
        subject: detail.subject ?? f.subject,
        message: detail.message ?? f.message,
        budget: detail.budget ?? f.budget,
      }));
      toast.success(t("contact.prefilled"));
    };

    try {
      const pending = sessionStorage.getItem("chatbot-fill-form-pending");
      if (pending) {
        sessionStorage.removeItem("chatbot-fill-form-pending");
        apply(JSON.parse(pending) as FillEventDetail);
      }
    } catch {
      /* malformed pending data — ignore */
    }

    const handler = (e: Event) => apply((e as CustomEvent<FillEventDetail>).detail);
    window.addEventListener("chatbot-fill-form", handler);
    return () => window.removeEventListener("chatbot-fill-form", handler);
  }, [t]);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const buildMailto = () => {
    const body = [
      `${t("contact.name")}: ${form.name}`,
      `${t("contact.email")}: ${form.email}`,
      `${t("contact.budget")}: ${form.budget || "-"}`,
      "",
      form.message,
    ].join("\n");
    return `mailto:${personal.email}?subject=${encodeURIComponent(
      form.subject || (isBn ? "পোর্টফোলিও যোগাযোগ" : "Portfolio Contact")
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1) Store the message in Firebase (admin inbox reads it live)
      await createContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        budget: form.budget || undefined,
        message: form.message,
      });

      // 2) Telegram push to the owner (original-site feature, best-effort)
      sendTelegramNotification({
        name: form.name,
        email: form.email,
        subject: form.subject,
        budget: form.budget || undefined,
        message: form.message,
      });

      // 2) Best-effort email copy via FormSubmit (silent — never blocks UX)
      fetch(`https://formsubmit.co/ajax/${personal.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Portfolio: ${form.subject}`,
          _template: "table",
          _captcha: "false",
          name: form.name,
          email: form.email,
          budget: form.budget,
          message: form.message,
        }),
      }).catch(() => undefined);

      toast.success(t("contact.success"));
      setForm({ name: "", email: "", subject: "", budget: "", message: "" });
    } catch {
      // Graceful fallback: open the visitor's mail app
      toast.error(t("contact.networkError"));
      window.location.href = buildMailto();
    } finally {
      setSubmitting(false);
    }
  };

  const titleMap: Record<string, string> = {
    Email: "mail",
    "Working Hours": "clock",
    Location: "map-pin",
    Availability: "checkcircle",
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <SectionVideoBackground
        src="/videos/bg-orbs.mp4"
        poster="/videos/bg-orbs-poster.jpg"
        className="h-[340px] sm:h-[460px]"
        opacityClass="opacity-60 dark:opacity-40"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[340px] sm:h-[460px] bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Header */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {t("contact.title")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("contact.getInTouch")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        {/* Form */}
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-3">
          <CardContent className="p-6 sm:p-8">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("contact.name")} *
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => update("name")(e.target.value)}
                      placeholder={t("contact.namePlaceholder")}
                      className="h-11 rounded-xl bg-background pl-10"
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("contact.email")} *
                  </Label>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email")(e.target.value)}
                      placeholder={t("contact.emailPlaceholder")}
                      className="h-11 rounded-xl bg-background pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    {t("contact.subject")} *
                  </Label>
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="subject"
                      required
                      value={form.subject}
                      onChange={(e) => update("subject")(e.target.value)}
                      placeholder={t("contact.subjectPlaceholder")}
                      className="h-11 rounded-xl bg-background pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("contact.budget")}</Label>
                  <div className="relative">
                    <Wallet className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select value={form.budget} onValueChange={update("budget")}>
                      <SelectTrigger className="h-11 rounded-xl bg-background pl-10">
                        <SelectValue
                          placeholder={
                            isBn ? "বাজেট নির্বাচন করুন" : "Select a budget range"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under500">{t("contact.budgetUnder")}</SelectItem>
                        <SelectItem value="500to2000">{t("contact.budget500")}</SelectItem>
                        <SelectItem value="2000to5000">{t("contact.budget2000")}</SelectItem>
                        <SelectItem value="above5000">{t("contact.budgetAbove")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {t("contact.message")} *
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => update("message")(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  className="resize-none rounded-xl bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("contact.sending")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t("contact.send")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info sidebar */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="rounded-2xl border-border/70 bg-card">
            <CardContent className="space-y-5 p-6">
              {contactInfo.map((info) => {
                const value = isBn
                  ? info.value ?? info.valueEn
                  : info.valueEn ?? info.value;
                return (
                  <div key={info.title} className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon name={titleMap[info.title] ?? info.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {isBn ? info.titleBn ?? info.title : info.title}
                      </p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="break-words text-sm font-semibold hover:text-primary"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="break-words text-sm font-semibold">{value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-card">
            <CardContent className="p-6 text-center">
              <h3 className="mb-4 font-semibold">{t("contact.followMe")}</h3>
              <div className="flex justify-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon name={social.icon} className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-xs leading-relaxed text-accent-foreground">
                {isBn
                  ? "📧 ফর্মটি পাঠালে সরাসরি আমার ইমেইলে পৌঁছাবে — দ্রুত উত্তর পাবেন।"
                  : "📧 Your message lands directly in my inbox — expect a quick reply."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
