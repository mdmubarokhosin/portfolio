"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Github, Linkedin, Facebook, Twitter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { BiIcon } from "@/components/BiIcon";

const socialIcons: Record<string, React.ReactNode> = {
  GitHub: <Github className="h-5 w-5" />,
  LinkedIn: <Linkedin className="h-5 w-5" />,
  Facebook: <Facebook className="h-5 w-5" />,
  Twitter: <Twitter className="h-5 w-5" />,
};

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const { isBn, t } = useLanguage();
  const { data: portfolioData } = usePortfolioData();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    budget: "",
    message: "",
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const fields = (e as CustomEvent).detail;
      if (fields) {
        setForm((prev) => ({
          ...prev,
          ...(fields.name && { name: fields.name }),
          ...(fields.email && { email: fields.email }),
          ...(fields.subject && { subject: fields.subject }),
          ...(fields.message && { message: fields.message }),
        }));
        toast.success("Form pre-filled by AI assistant!");
      }
    };
    window.addEventListener("chatbot-fill-form", handler);
    return () => window.removeEventListener("chatbot-fill-form", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          budget: form.budget,
          message: form.message,
        }),
      });

      if (res.ok) {
        toast.success(t("contact.success"));
        setForm({ name: "", email: "", subject: "", budget: "", message: "" });
      } else {
        toast.error(t("contact.networkError"));
      }
    } catch {
      toast.error(t("contact.networkError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 pb-16 space-y-16 sm:space-y-20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">{t("contact.contact")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("contact.getInTouch")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("contact.contactDesc")}</p>
        </FadeIn>

        <div className="grid lg:grid-cols-5 gap-8">
          <FadeIn className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              <CardContent className="p-0">
                <h2 className="text-xl font-bold mb-6 break-words">{t("contact.sendMeAMessage")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">{t("contact.yourName")}</Label>
                      <Input id="name" placeholder={t("contact.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">{t("contact.yourEmail")}</Label>
                      <Input id="email" type="email" placeholder={t("contact.emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-background text-foreground" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">{t("contact.subject")}</Label>
                      <Input id="subject" placeholder={t("contact.subjectPlaceholder")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="bg-background text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-foreground">{t("contact.budgetRange")}</Label>
                      <Select value={form.budget} onValueChange={(val) => setForm({ ...form, budget: val })}>
                        <SelectTrigger id="budget" className="bg-background text-foreground">
                          <SelectValue placeholder={t("contact.selectBudget")} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                          <SelectItem value="under500">{t("contact.under500")}</SelectItem>
                          <SelectItem value="500to2000">{t("contact.500to2000")}</SelectItem>
                          <SelectItem value="2000to5000">{t("contact.2000to5000")}</SelectItem>
                          <SelectItem value="above5000">{t("contact.above5000")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">{t("contact.message")}</Label>
                    <Textarea id="message" placeholder={t("contact.messagePlaceholder")} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-background text-foreground" />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full text-white font-medium bg-primary hover:bg-primary/90">
                    {sending ? (
                      <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{t("contact.sending")}</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />{t("contact.sendMessage")}</>
                    )}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4 text-center break-words">{t("contact.formInfo")}</p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn className="lg:col-span-2 space-y-4" delay={0.1}>
            {(portfolioData?.contactInfo || []).map((info, i) => {
              const titleMap: Record<string, string> = {
                Email: t("contact.emailTitle"),
                Phone: t("contact.phoneTitle"),
                Location: t("contact.locationTitle"),
                "Working Hours": t("contact.workingHoursTitle"),
              };
              const value = isBn
                ? (info.value || info.valueEn)
                : (info.valueEn || info.value);
              return (
                <Card key={i} className="p-4 card-glow hover:shadow-md transition-shadow">
                  <CardContent className="p-0 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                      <BiIcon icon={info.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{titleMap[info.title] || info.title}</p>
                      {info.link ? (
                        <a href={info.link} className="text-sm font-medium text-primary hover:underline break-all" target={info.link.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">{value}</a>
                      ) : (
                        <p className="text-sm font-medium break-words">{value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="p-4">
              <CardContent className="p-0">
                <h3 className="font-semibold text-sm mb-3 break-words">{t("contact.followMe")}</h3>
                <div className="flex gap-2 flex-wrap">
                  {(portfolioData?.socialLinks || []).map((social) => (
                    <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" aria-label={social.name}>
                      {socialIcons[social.name] || <BiIcon icon={social.icon} className="h-5 w-5" />}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
