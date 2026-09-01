"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Clock } from "lucide-react";
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

export default function ExperiencePage() {
  const { isBn, t } = useLanguage();
  const { data: portfolioData } = usePortfolioData();

  return (
    <div className="pt-24 pb-16 space-y-16 sm:space-y-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">{t("experience.experience")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("experience.myJourney")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("experience.experienceDesc")}</p>
        </FadeIn>

        {/* Work Experience Timeline */}
        <FadeIn className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            {t("experience.workExperience")}
          </h2>

          <div className="relative pl-8 sm:pl-12">
            {/* Connecting line - GREEN */}
            <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-primary/30" />

            <div className="space-y-8">
              {(portfolioData?.experiences || []).map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Dot */}
                  <div
                    className="absolute -left-8 sm:-left-12 top-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-primary bg-background z-10"
                  >
                    <div
                      className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                        i === 0 ? "bg-primary" : "bg-transparent border-2 border-primary"
                      }`}
                    />
                  </div>

                  <Card className="p-5 sm:p-6 card-glow hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {isBn ? exp.periodBn : exp.period}
                        </Badge>
                        <Badge
                          className="text-xs text-primary-foreground"
                          style={{
                            backgroundColor: exp.type === "full-time" ? "#006a4e" : "#f42a41",
                          }}
                        >
                          {exp.type === "full-time"
                            ? t("experience.fullTime")
                            : t("experience.internship")}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold break-words">{isBn ? exp.titleBn : exp.title}</h3>
                      <p className="text-sm text-primary font-medium mb-2 break-words">{exp.company}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed break-words">
                        {isBn ? exp.descriptionBn : exp.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Education Section */}
        <FadeIn>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            {t("experience.education")}
          </h2>

          <div className="relative pl-8 sm:pl-12">
            <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-primary/30" />

            {(portfolioData?.education || []).map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div
                  className="absolute -left-8 sm:-left-12 top-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-primary bg-background z-10"
                >
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary" />
                </div>

                <Card className="p-5 sm:p-6 card-glow hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {isBn ? edu.periodBn : edu.period}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold break-words">{isBn ? edu.degreeBn : edu.degree}</h3>
                    <p className="text-sm text-primary font-medium break-words">{isBn ? edu.institutionBn : edu.institution}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
