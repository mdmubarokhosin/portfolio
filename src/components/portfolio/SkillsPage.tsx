"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";
import { Icon } from "@/components/icons";
import AnimatedCounter from "./AnimatedCounter";
import SectionVideoBackground from "./SectionVideoBackground";
import { SkillsRadar, SkillsCategoryDoughnut } from "./SkillsCharts";

export default function SkillsPage() {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { skills, skillCategories, additionalTools } = data;
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () => (active === "all" ? skills : skills.filter((s) => s.category === active)),
    [active, skills]
  );

  const average = useMemo(
    () =>
      skills.length
        ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
        : 0,
    [skills]
  );

  const catColor: Record<string, string> = {
    frontend: "#06b6d4",
    backend: "#0e7490",
    tools: "#14b8a6",
  };

  const catCount = (id: string) =>
    id === "all" ? skills.length : skills.filter((s) => s.category === id).length;

  const doughnutEntries = useMemo(
    () =>
      skillCategories
        .filter((c) => c.id !== "all")
        .map((c) => ({
          label: isBn ? c.labelBn ?? c.label : c.label,
          value: skills.filter((s) => s.category === c.id).length,
        })),
    [skillCategories, skills, isBn]
  );

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <SectionVideoBackground
        src="/videos/bg-waves.mp4"
        poster="/videos/bg-waves-poster.jpg"
        className="h-[340px] sm:h-[460px]"
        opacityClass="opacity-60 dark:opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-transparent via-background/30 to-background sm:h-[460px]"
      />

      {/* Header */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge
          variant="secondary"
          className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("skills.overview")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("skills.skillsShowcase")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {isBn
            ? "আইডিয়াকে বাস্তবে রূপ দিতে আমি যে প্রযুক্তিগুলো ব্যবহার করি"
            : "A snapshot of the technologies I use to bring ideas to life"}
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Summary cards — compact 3-col row, centered like the original site */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {(["frontend", "backend", "tools"] as const).map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 160, damping: 18 }}
            >
              <Card className="card-glow group h-full rounded-2xl border-border/70 bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12"
                  style={{
                    backgroundColor: catColor[cat],
                    boxShadow: `0 8px 20px ${catColor[cat]}45`,
                  }}
                >
                  <Icon name={cat} className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-2xl font-bold sm:text-3xl" style={{ color: catColor[cat] }}>
                  <AnimatedCounter value={catCount(cat)} />
                </div>
                <p className="mt-0.5 text-sm font-semibold sm:mt-1 sm:text-base">
                  {t(`skills.${cat}`)}
                </p>
                <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                  {t(`skills.${cat}Desc`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Overall average — centered card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-6 rounded-2xl border border-border/70 bg-card p-5 text-center card-glow sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("skills.overallAverage")}
          </p>
          <p className="gradient-text mt-1 text-3xl font-black tabular-nums sm:text-4xl">
            <AnimatedCounter value={average} suffix="%" />
          </p>
          <div className="mx-auto mt-3 h-3.5 max-w-xl overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${average}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 0.68, 0.31, 1] }}
              className="relative h-full overflow-hidden rounded-full"
              style={{
                background: "linear-gradient(90deg, #06b6d4, #22d3ee, #14b8a6)",
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 60%)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Chart.js visualisations — radar (top skills) + doughnut (category mix) */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card-glow h-full rounded-2xl border-border/70 bg-card p-5 sm:p-6">
              <h3 className="mb-1 text-center text-base font-bold sm:text-lg">
                {isBn ? "দক্ষতা রাডার — সেরা ৮" : "Skill Radar — Top 8"}
              </h3>
              <p className="mb-2 text-center text-xs text-muted-foreground">
                {isBn
                  ? "সবচেয়ে দক্ষ প্রযুক্তিগুলোর তুলনামূলক চিত্র"
                  : "How my strongest technologies compare"}
              </p>
              <SkillsRadar skills={skills} height={280} />
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="card-glow flex h-full flex-col rounded-2xl border-border/70 bg-card p-5 sm:p-6">
              <h3 className="mb-1 text-center text-base font-bold sm:text-lg">
                {isBn ? "ক্যাটাগরি বিভাজন" : "Category Breakdown"}
              </h3>
              <p className="mb-2 text-center text-xs text-muted-foreground">
                {isBn
                  ? "প্রতিটি বিভাগে কতগুলো দক্ষতা আছে"
                  : "How my skills are distributed across areas"}
              </p>
              <div className="flex-1">
                <SkillsCategoryDoughnut entries={doughnutEntries} height={252} />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filter tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {skillCategories.map((cat) => {
            const isActive = active === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActive(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
                aria-pressed={isActive}
              >
                <Icon name={cat.icon} className="h-4 w-4" />
                {isBn ? cat.labelBn ?? cat.label : cat.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20" : "bg-muted"
                  }`}
                >
                  {localizeDigits(catCount(cat.id), isBn)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Skill cards — centered content, old-site inspired */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="contents"
            >
              {filtered.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group"
                >
                  <Card className="card-glow h-full rounded-2xl border-border/70 bg-card p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
                      {skill.logoUrl ? (
                        <img
                          src={skill.logoUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className={`h-7 w-7 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 ${
                            skill.name === "Next.js" ? "rounded-lg bg-slate-900 p-0.5" : ""
                          }`}
                        />
                      ) : (
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: skill.color }}
                        >
                          <Icon name={skill.icon} className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-semibold transition-colors group-hover:text-primary sm:text-base">
                        {skill.name}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums"
                        style={{ backgroundColor: `${skill.color}16`, color: skill.color }}
                      >
                        <AnimatedCounter value={skill.level} suffix="%" />
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.1,
                          delay: i * 0.05,
                          ease: [0.22, 0.68, 0.31, 1],
                        }}
                        className="relative h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${skill.color}cc, ${skill.color})`,
                          boxShadow: `0 0 12px ${skill.color}55`,
                        }}
                      >
                        {/* inner gloss */}
                        <span
                          className="absolute inset-0 opacity-30"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
                          }}
                        />
                        {/* shine sweep on hover */}
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute inset-y-0 w-1/2 -translate-x-[150%] skew-x-[-20deg] bg-white/30 transition-transform duration-700 group-hover:translate-x-[300%]" />
                        </span>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Also experienced with */}
        <div className="mt-14">
          <h3 className="mb-5 text-center text-lg font-bold sm:text-xl">
            {t("skills.alsoExperiencedWith")}
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {additionalTools.map((tool, i) => (
              <motion.span
                key={tool.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.06, y: -2 }}
                className="flex cursor-default items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:border-primary/40 hover:shadow-md"
              >
                {tool.logoUrl ? (
                  <img
                    src={tool.logoUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-4.5 w-4.5"
                  />
                ) : (
                  <Icon name={tool.icon} className="h-4 w-4 text-primary" />
                )}
                {tool.name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
