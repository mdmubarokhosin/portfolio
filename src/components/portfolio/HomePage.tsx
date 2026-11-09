"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Github,
  Mail,
  MessageSquare,
  Search,
  PenTool,
  Code2,
  Rocket,
  Star,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";
import AnimatedCounter from "./AnimatedCounter";
import VideoCover from "./VideoCover";
import SectionVideoBackground from "./SectionVideoBackground";
import { serviceHref } from "@/lib/service-pages";
import { Icon } from "@/components/icons";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const statIcons = ["code", "layers", "briefcase", "users"];
const processIcons = [Search, PenTool, Code2, Rocket];
const processSteps = ["discovery", "design", "development", "launch"];

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <FadeIn className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
      <Badge variant="secondary" className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
        {badge}
      </Badge>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </FadeIn>
  );
}

/* ── Typewriter for hero title ─────────────────────────────────── */
function Typewriter({ phrases }: { phrases: string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const current = phrases[index % phrases.length] ?? "";
    let delay = deleting ? 38 : 82;
    if (!deleting && sub === current.length) delay = 1600;
    if (deleting && sub === 0) delay = 420;

    const timer = setTimeout(() => {
      if (!deleting && sub === current.length) {
        setDeleting(true);
      } else if (deleting && sub === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else {
        setSub((s) => s + (deleting ? -1 : 1));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [sub, deleting, index, phrases, reduce]);

  const current = reduce
    ? phrases[0]
    : (phrases[index % phrases.length] ?? "").slice(0, sub);

  return (
    <span className="text-primary font-semibold">
      {/* animated text is decorative for screen readers; a static phrase is exposed instead */}
      <span aria-hidden="true">
        {current}
        <span className="typing-caret h-[1em] align-[-0.12em]" aria-hidden="true" />
      </span>
      <span className="sr-only">{phrases[0] ?? ""}</span>
    </span>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(true);

  const { personal, stats, services, projects, testimonials, faq } = data;

  const titles = useMemo(
    () =>
      (isBn ? personal.titleBn ?? personal.title : personal.title)
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean),
    [isBn, personal.title, personal.titleBn]
  );

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const allTitles = titles.length ? titles : [isBn ? "ওয়েব ডেভেলপার" : "Web Developer"];
  const showreelTitle = t("hero.showreelTitle");
  const showreelSubtitle = t("hero.showreelSubtitle");

  return (
    <div>
      {/* ═══════════ HERO — full-bleed background film ═══════════ */}
      <section className="hero-gradient relative overflow-hidden pb-14 pt-28 sm:pt-32 md:pb-20 md:pt-36">
        {/* ambient Remotion background film */}
        <SectionVideoBackground
          src="/videos/bg-hero.mp4"
          poster="/videos/bg-hero-poster.jpg"
          className="-top-24 h-[calc(100%+6rem)]"
          eager
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background"
        />

        {/* floating decor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="animate-pulse-glow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground sm:text-sm"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {isBn ? personal.availabilityBn ?? personal.availability : personal.availability}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            {t("hero.greeting")}{" "}
            <span className="gradient-text">
              {isBn ? personal.firstNameBn ?? personal.firstName : personal.firstName}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-4 min-h-[1.6em] text-lg font-medium sm:text-xl md:text-2xl"
            aria-live="polite"
          >
            <Typewriter phrases={allTitles} />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg"
          >
            {isBn ? personal.taglineBn ?? personal.tagline : personal.tagline} —{" "}
            {isBn ? personal.bio.shortBn ?? personal.bio.short : personal.bio.short}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => onNavigate("projects")}
              className="h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] sm:text-base"
            >
              {t("hero.viewWork")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("contact")}
              className="h-12 rounded-full border-2 px-7 text-sm font-semibold hover:border-primary hover:text-primary sm:text-base"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("hero.letsTalk")}
            </Button>
          </motion.div>

          {/* ── SHOWREEL VIDEO — the heart of the hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.21, 0.65, 0.35, 1] }}
            className="mx-auto mt-12 max-w-4xl"
          >
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Play className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{showreelTitle}</span>
            </div>

            <div className="video-frame">
              <div className="video-frame-inner relative aspect-video">
                {videoOk ? (
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    src="/videos/hero.mp4"
                    poster="/videos/hero-poster.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setVideoOk(false)}
                    aria-label={showreelSubtitle}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#164e63] to-[#0f172a] text-cyan-100">
                    <Code2 className="mb-3 h-12 w-12 text-cyan-400" aria-hidden="true" />
                    <p className="font-mono text-lg font-bold">&lt;Mubarok /&gt;</p>
                    <p className="mt-1 font-mono text-xs text-cyan-300/70">
                      React · Next.js · TypeScript
                    </p>
                  </div>
                )}
                {/* subtle caption chip */}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-4 py-1.5 backdrop-blur-md">
                  <p className="whitespace-nowrap text-[11px] font-medium text-white/90 sm:text-xs">
                    {showreelSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          onClick={() => onNavigate("about")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary md:flex"
          aria-label={t("hero.scroll")}
        >
          {t("hero.scroll")}
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.button>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-cyan-500 to-teal-500 py-10 md:py-12">
        {/* subtle depth: radial highlights + fine grid so the band doesn't read flat */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.14),transparent_40%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((stat, i) => {
            return (
              <FadeIn key={stat.label} delay={i * 0.08} className="flex flex-col items-center text-center text-white">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Icon name={statIcons[i % statIcons.length]} className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} suffixBn={stat.suffixBn} />
                </div>
                <p className="mt-1 text-xs font-medium text-white/85 sm:text-sm">
                  {isBn ? stat.labelBn ?? stat.label : stat.label}
                </p>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ═══════════ SERVICES — ambient orbs ═══════════ */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <SectionVideoBackground
          src="/videos/bg-orbs.mp4"
          poster="/videos/bg-orbs-poster.jpg"
          opacityClass="opacity-70 dark:opacity-50"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={t("home.whatIDo")}
            title={t("home.myServices")}
            subtitle={isBn ? personal.taglineBn ?? personal.tagline : personal.tagline}
          />
          <div
            className={`grid gap-5 sm:grid-cols-2 ${
              services.length === 2
                ? "mx-auto max-w-2xl lg:grid-cols-2"
                : services.length === 3
                  ? "mx-auto max-w-4xl lg:grid-cols-3"
                  : "lg:grid-cols-4"
            }`}
          >
            {services.map((service, i) => (
              <FadeIn key={`${service.title}-${i}`} delay={i * 0.08}>
                <a
                  href={serviceHref(service, i)}
                  className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={isBn ? service.titleBn ?? service.title : service.title}
                >
                  <Card className="card-glow group flex h-full flex-col items-center rounded-2xl border-border/70 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon name={service.icon} className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {isBn ? service.titleBn ?? service.title : service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {isBn ? service.descriptionBn ?? service.description : service.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {t("servicesPage.viewDetails")}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Card>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════ FEATURED PROJECTS — tech grid film ═══════════ */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <SectionVideoBackground
          src="/videos/bg-grid.mp4"
          poster="/videos/bg-grid-poster.jpg"
          opacityClass="opacity-60 dark:opacity-45"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading badge={t("home.featuredWork")} title={t("home.featuredWork")} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <FadeIn key={project.id} delay={i * 0.1}>
                <Card className="card-glow group h-full overflow-hidden rounded-2xl border-border/70 bg-card">
                  <div className="relative h-44 overflow-hidden">
                    {project.coverVideo ? (
                      <VideoCover
                        src={project.coverVideo}
                        poster={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        zoomOnHover
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}, ${project.color}88)`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {project.featured && (
                      <Badge className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 text-xs text-slate-900 backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {t("home.featured")}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 text-center">
                    <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                      {isBn ? project.titleBn ?? project.title : project.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {isBn ? project.descriptionBn ?? project.description : project.description}
                    </p>
                    <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `${project.color}14`,
                            color: project.color,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {project.liveUrl && (
                        <Button
                          size="sm"
                          className="h-8 rounded-full px-4 text-xs text-white"
                          style={{ backgroundColor: project.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          {t("home.demo")}
                        </Button>
                      )}
                      {project.codeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-4 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.codeUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <Github className="mr-1 h-3.5 w-3.5" />
                          {t("home.code")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => onNavigate("projects")}
              className="rounded-full border-2 px-6 font-semibold hover:border-primary hover:text-primary"
            >
              {t("home.allProjects")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ TECH MARQUEE ═══════════ */}
      <section className="border-y border-border/60 bg-card/60 py-8">
        <div className="marquee-paused relative overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-4 px-4">
            {[...data.skills, ...data.skills].map((skill, i) => (
              <div
                key={`${skill.name}-${i}`}
                className="flex items-center gap-2.5 rounded-full border border-border/70 bg-card px-4 py-2 shadow-sm"
              >
                {skill.logoUrl && (
                   
                  <img
                    src={skill.logoUrl}
                    alt=""
                    aria-hidden="true"
                    className={`h-5 w-5 ${skill.name === "Next.js" ? "rounded-md bg-slate-900 p-0.5" : ""}`}
                    loading="lazy"
                  />
                )}
                <span className="whitespace-nowrap text-sm font-medium">{skill.name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: `${skill.color}18`, color: skill.color }}
                >
                  {localizeDigits(`${skill.level}%`, isBn)}
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
        </div>
      </section>

      {/* ═══════════ HOW I WORK — flowing waves ═══════════ */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <SectionVideoBackground
          src="/videos/bg-waves.mp4"
          poster="/videos/bg-waves-poster.jpg"
          opacityClass="opacity-60 dark:opacity-45"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading badge={t("home.howIWork")} title={t("home.myProcess")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => {
              const StepIcon = processIcons[i];
              return (
                <FadeIn key={step} delay={i * 0.1} className="relative">
                  <Card className="card-glow h-full rounded-2xl border-border/70 bg-card p-6 text-center">
                    <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <StepIcon className="h-7 w-7" aria-hidden="true" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-[11px] font-bold text-primary">
                        {localizeDigits(i + 1, isBn)}
                      </span>
                    </div>
                    <h3 className="mb-2 font-semibold">{t(`home.${step}`)}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {t(`home.${step}Desc`)}
                    </p>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS (only when data exists) ═══════════ */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionHeading badge={t("home.reviewsBadge")} title={t("home.testimonials")} />
            <div className="grid gap-5 sm:grid-cols-2">
              {testimonials.map((tst, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <Card className="card-glow flex h-full flex-col rounded-2xl border-border/70 bg-card p-6 text-center">
                    <div className="mb-3 flex justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mb-4 flex-1 text-sm italic leading-relaxed text-muted-foreground">
                      “{isBn ? tst.quoteBn ?? tst.quote : tst.quote}”
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {(isBn ? tst.nameBn ?? tst.name : tst.name).charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{isBn ? tst.nameBn ?? tst.name : tst.name}</p>
                        <p className="text-xs text-muted-foreground">{isBn ? tst.roleBn ?? tst.role : tst.role}</p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="section-divider" />

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading badge={t("home.faqBadge")} title={t("home.faq")} />
          <Accordion type="single" collapsible className="space-y-3">
            {faq.map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="rounded-xl border border-border/70 bg-card px-5 text-center shadow-sm data-[state=open]:border-primary/30 data-[state=open]:shadow-md data-[state=open]:shadow-primary/10"
                >
                  <AccordionTrigger className="justify-center py-4 text-center text-sm font-semibold hover:text-primary hover:no-underline sm:text-base">
                    {isBn ? item.questionBn ?? item.question : item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-center text-sm leading-relaxed text-muted-foreground">
                    {isBn ? item.answerBn ?? item.answer : item.answer}
                  </AccordionContent>
                </AccordionItem>
              </FadeIn>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════ CTA — film-textured gradient card ═══════════ */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-teal-600 px-6 py-14 text-center text-white shadow-2xl shadow-primary/30 sm:px-12">
            {/* living texture under the gradient */}
            <SectionVideoBackground
              src="/videos/bg-orbs.mp4"
              poster="/videos/bg-orbs-poster.jpg"
              className="rounded-3xl"
              blendClass="mix-blend-soft-light"
              opacityClass="opacity-90"
            />
            <div
              aria-hidden="true"
              className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <h2 className="relative text-2xl font-bold sm:text-3xl md:text-4xl">
              {t("home.readyToStart")}
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              {t("home.ctaDesc")}
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => onNavigate("contact")}
                className="h-12 rounded-full bg-white px-7 font-semibold text-cyan-700 hover:bg-white/90"
              >
                <Mail className="mr-2 h-4 w-4" />
                {t("home.getInTouch")}
              </Button>
              <a
                href={`mailto:${personal.email}`}
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-sm font-semibold transition-colors hover:bg-white/10 sm:text-base"
              >
                {t("home.emailMeDirectly")}
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
