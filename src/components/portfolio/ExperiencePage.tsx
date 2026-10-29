"use client";

import { motion } from "framer-motion";
import { Clock, Briefcase, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import SectionVideoBackground from "./SectionVideoBackground";
import { Icon } from "@/components/icons";

export default function ExperiencePage() {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { experiences, education } = data;

  const typeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-primary/12 text-primary border-primary/30";
      case "freelance":
        return "bg-teal-500/12 text-teal-600 dark:text-teal-400 border-teal-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <SectionVideoBackground
        src="/videos/bg-waves.mp4"
        poster="/videos/bg-waves-poster.jpg"
        className="h-[340px] sm:h-[460px]"
        opacityClass="opacity-60 dark:opacity-40"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[340px] sm:h-[460px] bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Header */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {t("experience.myJourney")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("experience.myJourney")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {isBn
            ? "আমার পেশাগত যাত্রার মাইলফলকগুলো"
            : "Milestones along my professional path"}
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-3xl px-4 sm:px-6">
        {/* Work experience */}
        <h2 className="mb-8 flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-5 w-5" />
          </span>
          {t("experience.workExperience")}
        </h2>

        <div className="relative space-y-6 pl-8 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-primary/25 sm:pl-10">
          {experiences.map((exp, i) => (
            <motion.div
              key={`${exp.title}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <span
                className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary sm:-left-10 ${
                  i === 0 ? "bg-primary" : "bg-background"
                }`}
                aria-hidden="true"
              >
                {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>

              <Card className="card-glow rounded-2xl border-border/70 bg-card p-5 text-center sm:p-6">
                <div className="mb-3 flex flex-col items-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={exp.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-snug">
                      {isBn ? exp.titleBn ?? exp.title : exp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isBn ? exp.companyBn ?? exp.company : exp.company}
                    </p>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  >
                    <Clock className="h-3 w-3" />
                    {isBn ? exp.periodBn ?? exp.period : exp.period}
                  </Badge>
                  <Badge
                    className={`rounded-full border px-3 py-1 text-xs ${typeColor(exp.type)}`}
                    variant="outline"
                  >
                    {(() => {
                      // "full-time" → "fullTime" so t() hits the experience.fullTime key
                      const typeKey = exp.type.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
                      const translated = t(`experience.${typeKey}`);
                      return translated !== `experience.${typeKey}`
                        ? translated
                        : isBn
                          ? exp.typeBn ?? exp.type
                          : exp.type;
                    })()}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {isBn ? exp.descriptionBn ?? exp.description : exp.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <h2 className="mb-8 mt-14 flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          {t("experience.education")}
        </h2>

        <div className="relative space-y-6 pl-8 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-primary/25 sm:pl-10">
          {education.map((edu, i) => (
            <motion.div
              key={`${edu.degree}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <span
                className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary sm:-left-10"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>

              <Card className="card-glow rounded-2xl border-border/70 bg-card p-5 text-center sm:p-6">
                <div className="mb-3 flex flex-col items-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={edu.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-snug">
                      {isBn ? edu.degreeBn ?? edu.degree : edu.degree}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isBn ? edu.institutionBn ?? edu.institution : edu.institution}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="mx-auto flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs"
                >
                  <Clock className="h-3 w-3" />
                  {isBn ? edu.periodBn ?? edu.period : edu.period}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
