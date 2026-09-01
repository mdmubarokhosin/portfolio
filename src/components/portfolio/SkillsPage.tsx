"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";

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

/* ── Animated number counter ── */
function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let raf: number;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

/* ── Animated Skill Bar ── */
function SkillBar({
  name,
  level,
  color,
  logoUrl,
  index,
}: {
  name: string;
  level: number;
  color: string;
  logoUrl?: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <motion.img
              src={logoUrl}
              alt={name}
              className="h-6 w-6 shrink-0 rounded"
              loading="lazy"
              whileHover={{ scale: 1.3, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          ) : (
            <div className="h-6 w-6 rounded shrink-0" style={{ backgroundColor: color }} />
          )}
          <span className="text-sm font-medium break-words group-hover:text-primary transition-colors">
            {name}
          </span>
        </div>
        <motion.span
          className="text-sm font-bold shrink-0 tabular-nums"
          style={{ color }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.06, type: "spring", stiffness: 200 }}
        >
          <AnimatedCounter target={level} />%
        </motion.span>
      </div>

      {/* Progress bar with shimmer */}
      <div className="h-3 rounded-full bg-muted overflow-hidden relative">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          }}
          animate={hovered ? { x: ["-100%", "200%"] } : {}}
          transition={hovered ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
        />

        {/* Fill bar */}
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            backgroundColor: color,
            boxShadow: hovered ? `0 0 12px ${color}40` : "none",
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.15 + index * 0.06,
          }}
        >
          {/* Inner shine on the bar */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SkillsPage() {
  const { isBn, t } = useLanguage();
  const { data: portfolioData } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState("all");

  const skills = portfolioData?.skills || [];
  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  const frontendCount = skills.filter((s) => s.category === "frontend").length;
  const backendCount = skills.filter((s) => s.category === "backend").length;
  const toolsCount = skills.filter((s) => s.category === "tools").length;

  // Average skill level
  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)
    : 0;

  const summaryCards = [
    { label: t("skills.frontend"), count: frontendCount, color: "#006a4e", desc: t("skills.frontendDesc") },
    { label: t("skills.backend"), count: backendCount, color: "#00875a", desc: t("skills.backendDesc") },
    { label: t("skills.tools"), count: toolsCount, color: "#f42a41", desc: t("skills.toolsDesc") },
  ];

  return (
    <div className="pt-24 pb-16 space-y-16 sm:space-y-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">{t("skills.mySkills")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("skills.skillsTitle")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("skills.skillsDesc")}</p>
        </FadeIn>

        {/* Summary Cards */}
        <FadeIn className="mb-10">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {summaryCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="p-4 sm:p-6 text-center card-glow hover:shadow-lg transition-all duration-300 group cursor-default">
                  <CardContent className="p-0">
                    <motion.div
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: card.color }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 + i * 0.1 }}
                    >
                      <AnimatedCounter target={card.count} />
                    </motion.div>
                    <p className="font-semibold text-sm sm:text-base mt-1 break-words group-hover:text-primary transition-colors">
                      {card.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block break-words">{card.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Overall Average Skill Bar */}
        <FadeIn className="mb-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {isBn ? "গড় দক্ষতা" : "Overall Average"}
              </span>
              <span className="text-lg font-bold text-primary">
                <AnimatedCounter target={avgLevel} />%
              </span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden relative">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: "linear-gradient(90deg, #006a4e, #00875a, #f42a41)",
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${avgLevel}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(portfolioData?.skillCategories || []).map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 hover:shadow-sm"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isBn ? cat.labelBn : cat.label}
              </motion.button>
            ))}
          </div>
        </FadeIn>

        {/* Skill Bars with Logos */}
        <FadeIn>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-16">
            {(filteredSkills || []).map((skill, i) => (
              <SkillBar
                key={skill.name}
                name={skill.name}
                level={skill.level}
                color={skill.color}
                logoUrl={skill.logoUrl}
                index={i}
              />
            ))}
          </div>
        </FadeIn>

        {/* Additional Tools with Logos */}
        <FadeIn>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2 break-words">{t("skills.alsoExperiencedWith")}</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {(portfolioData?.additionalTools || []).map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Badge
                  variant="outline"
                  className="px-3 py-2 text-sm font-medium hover:border-primary/50 hover:text-primary transition-all cursor-default flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  {tool.logoUrl ? (
                    <img
                      src={tool.logoUrl}
                      alt={tool.name}
                      className="h-5 w-5 shrink-0 rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded shrink-0 bg-muted" />
                  )}
                  {tool.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
