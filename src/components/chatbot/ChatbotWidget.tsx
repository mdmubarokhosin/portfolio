"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Send,
  X,
  Sparkles,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   Mubarok's Assistant — three-tier chat engine:
   1. Server AI  → POST /api/chatbot (Next.js edge route — Cloudflare Pages
                   via @cloudflare/next-on-pages in prod, next dev locally)
                → POST /api/chatbot?XTransformPort=3030 (dev AI mini-service)
      Both build a data-aware system prompt from live Firebase content,
      exactly like the original site's AI assistant.
   2. Local intent engine (offline fallback) with bilingual answers
      and actionable buttons (navigate / email / open URL).
   ──────────────────────────────────────────────────────────────── */

interface ChatAction {
  label: string;
  icon?: "navigate" | "email" | "url";
  page?: string;
  url?: string;
}

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  actions?: ChatAction[];
  time: number;
}

let nextId = 1;

/* Tiny inline markdown: **bold**, `code`, line breaks */
function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code
          key={i}
          className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    } else {
      // line breaks
      const lines = part.split("\n");
      lines.forEach((line, j) => {
        if (j > 0) nodes.push(<br key={`${i}-${j}-br`} />);
        if (line) nodes.push(<span key={`${i}-${j}`}>{line}</span>);
      });
    }
  });
  return <>{nodes}</>;
}

export default function ChatbotWidget({
  onAction,
}: {
  onAction: (action: { type: string; [key: string]: unknown }) => void;
}) {
  const { isBn, t } = useLanguage();
  const { data, settings } = usePortfolioData();
  const { personal, skills, projects, experiences, services, education, socialLinks } = data;

  // Firebase settings control the widget (admin panel → Site Settings)
  const chatbotEnabled = (settings.chatbot_enabled ?? "true") !== "false";
  const fabName = settings.chatbot_name || t("chatbot.name");

  const [open, setOpen] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const botName = fabName;
  const ownerName = personal.name || "Mubarok";

  // Admin-editable welcome + placeholder (Site Settings), with bn variants
  const welcomeText =
    (isBn
      ? settings.chatbot_welcomeMessageBn || settings.chatbot_welcomeMessage
      : settings.chatbot_welcomeMessage) || t("chatbot.welcome");
  const placeholderText =
    (isBn ? settings.chatbot_placeholderBn || settings.chatbot_placeholder : settings.chatbot_placeholder) ||
    t("chatbot.placeholder");

  const greeting = useMemo<ChatMessage>(
    () => ({
      id: nextId++,
      from: "bot",
      text: welcomeText,
      time: Date.now(),
    }),
    [open, welcomeText]
  );

  // Reset the thread each time the panel opens (fresh welcome, small footprint)
  useEffect(() => {
    if (open) setMessages([greeting]);
  }, [open, greeting]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const quickActions = useMemo(
    () => [
      { key: "skills", label: t("chatbot.quickSkills"), msg: isBn ? "তোমার দক্ষতা কী কী?" : "What are your skills?" },
      { key: "projects", label: t("chatbot.quickProjects"), msg: isBn ? "প্রজেক্টগুলো দেখাও" : "Show me your projects" },
      { key: "experience", label: t("chatbot.quickExperience"), msg: isBn ? "তোমার অভিজ্ঞতা সম্পর্কে বলো" : "Tell me about your experience" },
      { key: "services", label: t("chatbot.quickServices"), msg: isBn ? "তুমি কী কী সেবা দাও?" : "What services do you offer?" },
      { key: "contact", label: t("chatbot.quickContact"), msg: isBn ? "যোগাযোগের তথ্য" : "Contact info" },
    ],
    [isBn, t]
  );

  /* ── Intent engine (EN + BN keywords) ── */
  const answer = useCallback(
    (raw: string): { text: string; actions?: ChatAction[] } => {
      const q = raw.toLowerCase();
      const has = (...words: string[]) => words.some((w) => q.includes(w));

      if (has("hi", "hello", "hey", "সালাম", "হ্যালো", "হাই", "আসসালাম")) {
        return {
          text: isBn
            ? `হ্যালো! 😊 আমি **${botName}**। ${ownerName}-এর দক্ষতা, প্রজেক্ট বা সেবা নিয়ে যেকোনো প্রশ্ন করতে পারেন।`
            : `Hello! 😊 I'm **${botName}**. Ask me anything about ${ownerName}'s skills, projects or services.`,
        };
      }

      if (has("skill", "tech", "stack", "দক্ষতা", "প্রযুক্তি")) {
        const top = skills
          .slice(0, 5)
          .map((s) => `**${s.name}** (${localizeDigits(s.level, isBn)}%)`)
          .join(", ");
        return {
          text: isBn
            ? `${ownerName}-এর প্রধান দক্ষতাগুলো:\n${top}\nএছাড়াও Git, Figma, VS Code ইত্যাদিতে দক্ষ।`
            : `${ownerName}'s core skills:\n${top}\nPlus Git, Figma, VS Code and more.`,
          actions: [
            { label: isBn ? "দক্ষতা দেখুন" : "View Skills", icon: "navigate", page: "skills" },
          ],
        };
      }

      if (has("project", "portfolio", "work", "কাজ", "প্রজেক্ট")) {
        const names = projects
          .slice(0, 4)
          .map((p) => `**${isBn ? p.titleBn ?? p.title : p.title}**`)
          .join(", ");
        return {
          text: isBn
            ? `উল্লেখযোগ্য প্রজেক্টগুলো:\n${names}\nবিস্তারিত দেখতে প্রজেক্ট পেজে যান।`
            : `Notable projects:\n${names}\nHead to the projects page for details.`,
          actions: [
            { label: isBn ? "সব প্রজেক্ট" : "All Projects", icon: "navigate", page: "projects" },
            ...(socialLinks[0]
              ? [{ label: "GitHub", icon: "url" as const, url: socialLinks[0].url }]
              : []),
          ],
        };
      }

      if (has("experience", "career", "job", "অভিজ্ঞতা", "চাকরি", "ক্যারিয়ার")) {
        const exp = experiences[0];
        const edu = education[0];
        return {
          text: isBn
            ? exp
              ? `**${exp.titleBn ?? exp.title}** — ${exp.companyBn ?? exp.company} (${exp.periodBn ?? exp.period})\n${exp.descriptionBn ?? exp.description}`
              : "অভিজ্ঞতার বিবরণ শীঘ্রই যোগ করা হবে।"
            : exp
              ? `**${exp.title}** at ${exp.company} (${exp.period})\n${exp.description}`
              : "Experience details coming soon.",
          actions: [
            { label: isBn ? "পূর্ণ যাত্রা" : "Full Journey", icon: "navigate", page: "experience" },
          ],
        };
      }

      if (has("service", "hire", "offer", "সেবা", "হায়ার", "কাজ কর")) {
        const list = services.map((s) => `• **${isBn ? s.titleBn ?? s.title : s.title}**`).join("\n");
        return {
          text: isBn
            ? `${ownerName} যে সেবাগুলো দিয়ে থাকেন:\n${list}\n\nআপনার প্রজেক্ট নিয়ে কথা বলতে চান?`
            : `Services ${ownerName} offers:\n${list}\n\nWant to discuss your project?`,
          actions: [
            { label: isBn ? "ফর্ম পূরণ করুন" : "Fill Contact Form", icon: "navigate", page: "contact" },
          ],
        };
      }

      if (has("contact", "email", "reach", "যোগাযোগ", "ইমেইল", "মেইল")) {
        return {
          text: isBn
            ? `সরাসরি ইমেইল করুন: **${personal.email}**\nঅথবা নিচের বাটনে ক্লিক করে ফর্ম পূরণ করুন — দ্রুত উত্তর পাবেন। ✉️`
            : `Email directly: **${personal.email}**\nOr tap the button below to fill the contact form — quick replies guaranteed. ✉️`,
          actions: [
            { label: isBn ? "ফর্ম পূরণ করুন" : "Fill Contact Form", icon: "navigate", page: "contact" },
            { label: isBn ? "ইমেইল অ্যাপ" : "Open Email App", icon: "email" },
          ],
        };
      }

      if (has("available", "freelance", "open to", "available?", "ফ্রিল্যান্স", "উপলব্ধ")) {
        return {
          text: isBn
            ? "হ্যাঁ! বর্তমানে **ফ্রিল্যান্স প্রজেক্ট ও ফুল-টাইম সুযোগের** জন্য উন্মুক্ত। 🚀"
            : `Yes! ${ownerName} is currently **open to freelance projects and full-time opportunities**. 🚀`,
          actions: [
            { label: isBn ? "যোগাযোগ করুন" : "Get In Touch", icon: "navigate", page: "contact" },
          ],
        };
      }

      if (has("price", "cost", "budget", "rate", "দাম", "খরচ", "বাজেট")) {
        return {
          text: isBn
            ? "প্রতিটি প্রজেক্টের স্কোপ অনুযায়ী খরচ আলাদা। কন্টাক্ট ফর্মে বাজেট রেঞ্জ উল্লেখ করে পাঠালে দ্রুত প্রাইমেট পেয়ে যাবেন। 💰"
            : "Pricing depends on each project's scope. Send a budget range through the contact form and you'll get a fast estimate. 💰",
          actions: [
            { label: isBn ? "ফর্ম পূরণ করুন" : "Fill Contact Form", icon: "navigate", page: "contact" },
          ],
        };
      }

      if (has("education", "study", "degree", "শিক্ষা", "পড়াশোনা", "ডিগ্রি")) {
        const edu = education[0];
        return {
          text: edu
            ? isBn
              ? `**${edu.degreeBn ?? edu.degree}** — ${edu.institutionBn ?? edu.institution} (${edu.periodBn ?? edu.period})`
              : `**${edu.degree}** — ${edu.institution} (${edu.period})`
            : isBn
              ? "শিক্ষাগত তথ্য শীঘ্রই যোগ করা হবে।"
              : "Education details coming soon.",
        };
      }

      if (has("who", "about", "কে", "সম্পর্কে", "পরিচয়")) {
        return {
          text: isBn
            ? `**${personal.nameBn ?? personal.name}** — ${personal.taglineBn ?? personal.tagline}।\n${personal.bio.shortBn ?? personal.bio.short}`
            : `**${personal.name}** — ${personal.tagline}.\n${personal.bio.short}`,
          actions: [
            { label: isBn ? "আরও জানুন" : "More About Me", icon: "navigate", page: "about" },
          ],
        };
      }

      if (has("thank", "ধন্যবাদ", "থ্যাংকস")) {
        return {
          text: isBn
            ? "আপনাকেও ধন্যবাদ! 😊 আরও কিছু জানতে চাইলে বলুন।"
            : "You're welcome! 😊 Ask me anything else.",
        };
      }

      // Fallback
      return {
        text: isBn
          ? "দুঃখিত, সেটা নিয়ে আমার হাতে তথ্য নেই। 😅 তবে দক্ষতা, প্রজেক্ট, সেবা বা যোগাযোগ নিয়ে জিজ্ঞেস করতে পারেন — অথবা সরাসরি ইমেইল করুন।"
          : "Sorry, I don't have that in my notes yet. 😅 Try asking about skills, projects, services or contact — or email directly.",
        actions: [
          { label: isBn ? "যোগাযোগ" : "Contact", icon: "navigate", page: "contact" },
          ...(socialLinks[0]
            ? [{ label: "GitHub", icon: "url" as const, url: socialLinks[0].url }]
            : []),
        ],
      };
    },
    [botName, education, experiences, isBn, ownerName, personal, projects, services, skills, socialLinks]
  );

  const pushBot = useCallback((text: string, actions?: ChatAction[], delay = 900) => {
    setTyping(true);
    const wait = Math.min(delay, 350 + text.length * 6);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: nextId++, from: "bot", text, actions, time: Date.now() },
      ]);
    }, wait);
  }, []);

  /** Ask the server AI (edge route / dev service); null = unavailable */
  const askServerAI = useCallback(
    async (text: string, history: ChatMessage[]): Promise<string | null> => {
      // Local dev: the AI mini-service behind the gateway answers first (port
      // routed via the query); the Next edge route is the local fallback.
      // Production (Cloudflare Pages): the edge route is the primary AI.
      const isLocal =
        typeof window !== "undefined" &&
        ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const endpoints = isLocal
        ? ["/api/chatbot?XTransformPort=3030", "/api/chatbot"]
        : ["/api/chatbot", "/api/chatbot?XTransformPort=3030"];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              lang: isBn ? "bn" : "en",
              history: history
                .filter((m) => m.from !== undefined && !m.actions?.length)
                .slice(-8)
                .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
            }),
          });
          if (!res.ok) continue;
          const out = (await res.json()) as { success?: boolean; reply?: string };
          if (out.success && out.reply) return out.reply;
        } catch {
          /* try next endpoint */
        }
      }
      return null;
    },
    [isBn]
  );

  const send = useCallback(
    (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || typing) return;
      setInput("");
      const history = [...messages, { id: nextId++, from: "user" as const, text, time: Date.now() }];
      setMessages(history);
      setTyping(true);

      (async () => {
        const aiReply = await askServerAI(text, messages);
        if (aiReply) {
          setAiMode(true);
          setTyping(false);
          setMessages((m) => [...m, { id: nextId++, from: "bot", text: aiReply, time: Date.now() }]);
          return;
        }
        // Offline intent engine fallback
        const reply = answer(text);
        pushBot(reply.text, reply.actions);
      })();
    },
    [answer, askServerAI, input, messages, pushBot, typing]
  );

  const runAction = useCallback(
    (action: ChatAction) => {
      if (action.icon === "navigate" && action.page) {
        setOpen(false);
        onAction({ type: action.page === "contact" ? "contact" : "navigate", page: action.page });
      } else if (action.icon === "email") {
        window.open(`mailto:${personal.email}`, "_blank");
      } else if (action.icon === "url" && action.url) {
        window.open(action.url, "_blank", "noopener,noreferrer");
      }
    },
    [onAction, personal.email]
  );

  const reset = () => setMessages([greeting]);

  // Admin can disable the widget from Firebase settings
  if (!chatbotEnabled) return null;

  return (
    <>
      {/* Floating action button */}
      <AnimatePresence>
        {showFab && !open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-500 text-white shadow-xl shadow-primary/40 sm:bottom-6 sm:right-6"
            aria-label={isBn ? "চ্যাট খুলুন" : "Open chat"}
          >
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30" />
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label={botName}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden border border-border/70 bg-card shadow-2xl shadow-primary/20",
              // Mobile: full sheet with safe areas; Desktop: floating panel
              "inset-x-0 bottom-0 top-0 rounded-none sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(620px,calc(100dvh-5rem))] sm:w-[400px] sm:rounded-3xl"
            )}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-teal-500 px-4 py-3.5 text-white sm:px-5">
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5.5 w-5.5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                    {botName}
                    {aiMode && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-white/85">
                    {typing ? t("chatbot.typing") : t("chatbot.online")}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="rounded-lg p-2 transition-colors hover:bg-white/15"
                  aria-label={isBn ? "রিসেট" : "Reset chat"}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-white/15"
                  aria-label={isBn ? "বন্ধ করুন" : "Close chat"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-background/60 px-3.5 py-4 sm:px-4"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                      m.from === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border/70 bg-card text-foreground"
                    )}
                  >
                    {m.from === "user" ? (
                      <span>{m.text}</span>
                    ) : (
                      <>
                        <RichText text={m.text} />
                        {m.actions && m.actions.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {m.actions.map((a, i) => (
                              <button
                                key={i}
                                onClick={() => runAction(a)}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                              >
                                {a.icon === "email" ? (
                                  <Mail className="h-3 w-3" />
                                ) : a.icon === "url" ? (
                                  <ExternalLink className="h-3 w-3" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-3 shadow-sm">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-border/60 bg-background/80 px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickActions.map((qa) => (
                <button
                  key={qa.key}
                  onClick={() => send(qa.msg)}
                  className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-border/60 bg-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholderText}
                className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                aria-label={t("chatbot.placeholder")}
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                aria-label={isBn ? "পাঠান" : "Send"}
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
