"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Search, PenTool, Code2, Rocket,
  Star, ChevronDown, MessageSquare, Mail,
  ExternalLink, Github,
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
import AnimatedCounter from "./AnimatedCounter";
import { BiIcon } from "@/components/BiIcon";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const statIcons = [Code2, Rocket, Star, Code2];

const processIcons = [Search, PenTool, Code2, Rocket];
const processSteps = ["discovery", "design", "development", "launch"];
const processDescs = [
  "discoveryDesc",
  "designDesc",
  "developmentDesc",
  "launchDesc",
];



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

export default function HomePage({ onNavigate }: HomePageProps) {
  const { isBn, t } = useLanguage();
  const { data: portfolioData, loading } = usePortfolioData();
  const [currentWord, setCurrentWord] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const personal = portfolioData?.personal;
  const titleStr = isBn
    ? (personal?.titleBn || personal?.title || "")
    : (personal?.title || "");
  const titleWords = titleStr ? titleStr.split(" | ") : [""];

  const typeEffect = useCallback(() => {
    const word = titleWords[currentWord];
    if (!word) return;
    if (!isDeleting) {
      setDisplayText(word.substring(0, displayText.length + 1));
      if (displayText.length === word.length) {
        setTimeout(() => setIsDeleting(true), 1500);
        return;
      }
    } else {
      setDisplayText(word.substring(0, displayText.length - 1));
      if (displayText.length === 0) {
        setIsDeleting(false);
        setCurrentWord((prev) => (prev + 1) % titleWords.length);
      }
    }
  }, [displayText, isDeleting, currentWord, titleWords]);

  useEffect(() => {
    const speed = isDeleting ? 40 : 80;
    const timer = setTimeout(typeEffect, speed);
    return () => clearTimeout(timer);
  }, [typeEffect, isDeleting]);

  const featuredProjects = Array.isArray(portfolioData?.projects)
    ? portfolioData.projects.filter((p) => p.featured).slice(0, 3)
    : [];
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialsList = Array.isArray(portfolioData?.testimonials)
    ? portfolioData.testimonials
    : [];

  useEffect(() => {
    if (testimonialsList.length === 0) return;
    const timer = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonialsList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonialsList.length]);

  // Show loading skeleton when data is not ready
  if (loading || !personal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-10 w-48 bg-muted rounded-lg mx-auto" />
          <div className="h-6 w-32 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium animate-pulse-glow">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              {isBn ? (personal.availabilityBn || personal.availability) : personal.availability}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 break-words"
          >
            {t("hero.greeting")}{" "}
            <span className="gradient-text break-words">
              {isBn ? (personal.firstNameBn || personal.firstName) : personal.firstName}
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-12 sm:h-14 flex items-center justify-center mb-6"
          >
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto break-words"
          >
            {isBn ? (personal.taglineBn || personal.tagline) : personal.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-base text-muted-foreground mb-8 max-w-xl mx-auto break-words"
          >
            {isBn ? (personal.bio?.shortBn || personal.bio?.short) : (personal.bio?.short || "")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              onClick={() => onNavigate("projects")}
              className="px-6 py-2.5 font-medium text-white"
              style={{ backgroundColor: "#006a4e" }}
            >
              {t("hero.viewWork")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("contact")}
              className="px-6 py-2.5 font-medium"
            >
              {t("hero.letsTalk")}
              <MessageSquare className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Green background with white text */}
      <section className="bg-primary text-primary-foreground py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {(portfolioData.stats || []).map((stat, i) => {
            const Icon = statIcons[i] || Code2;
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center p-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3 bg-white/15 text-white">
                    {stat.icon ? <BiIcon icon={stat.icon} className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-primary-foreground/80 mt-1 break-words">
                    {isBn ? stat.labelBn : stat.label}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("home.whatIDo")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("home.myServices")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("home.servicesDesc")}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(portfolioData.services || []).map((service, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Card className="h-full p-6 card-glow hover:shadow-lg transition-all group">
                  <CardContent className="p-0 text-center">
                    <div
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 text-white transition-transform group-hover:scale-110 mx-auto"
                      style={{ backgroundColor: service.color }}
                    >
                      <BiIcon icon={service.icon || 'bi-globe2'} className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 break-words">
                      {isBn ? service.titleBn : service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">
                      {isBn ? service.descriptionBn : service.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* Featured Projects Section - Professional Design */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("home.featuredWork")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("home.recentProjects")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("home.projectsDesc")}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredProjects.map((project, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Project color header with gradient overlay */}
                  <div className="relative h-40 overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}, ${project.color}99, ${project.color}44)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                          style={{ backgroundColor: `${project.color}CC`, backdropFilter: "blur(8px)" }}
                        >
                          {project.projectLogo ? (
                            <img src={project.projectLogo} alt="" className="h-10 w-10 object-contain" />
                          ) : (
                            <BiIcon icon={project.icon || 'bi-globe2'} className="h-7 w-7" />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <div className="h-5 w-5 rounded-full bg-white shadow-md flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {project.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="text-[10px] bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {t("home.featured")}
                        </Badge>
                      </div>
                    )}
                    {project.coverImage && (
                      <>
                        <img src={project.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30" />
                      </>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors break-words">
                      {isBn ? project.titleBn : project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed break-words">
                      {isBn ? project.descriptionBn : project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-1 rounded-md"
                          style={{ backgroundColor: `${project.color}12`, color: project.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-medium text-white"
                        style={{ backgroundColor: project.color }}
                        asChild
                      >
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> {t("home.demo")}
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
                        <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3.5 w-3.5 mr-1" /> {t("home.code")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-10">
            <Button
              variant="outline"
              onClick={() => onNavigate("projects")}
              className="font-medium px-8"
            >
              {t("home.viewAllProjects")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* Certifications Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("certificates.certificates")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("certificates.certifications")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("certificates.certDesc")}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(portfolioData.certificates || []).map((cert, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <Card className="h-full p-5 card-glow hover:shadow-md transition-all group text-center">
                  <CardContent className="p-0">
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3 text-white transition-transform group-hover:scale-110 mx-auto"
                      style={{ backgroundColor: cert.color }}
                    >
                      <BiIcon icon={cert.icon || 'bi-award-fill'} className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 break-words">
                      {isBn ? cert.titleBn : cert.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1 break-words">
                      {t("certificates.issued")} {isBn ? cert.issuerBn : cert.issuer}
                    </p>
                    <p className="text-xs text-muted-foreground">{cert.date}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* Tech Stack Marquee with Logos */}
      <section className="py-12 sm:py-16 overflow-hidden">
        <FadeIn className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">{t("skills.mySkills")}</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold break-words">{t("skills.skillsTitle")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-2 break-words">{t("skills.skillsDesc")}</p>
        </FadeIn>
        <div className="relative">
          <div className="flex animate-marquee">
            {[...(portfolioData.skills || []), ...(portfolioData.skills || [])].map((skill, i) => (
              <div
                key={`${skill.name}-${i}`}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-3 mx-1.5 sm:mx-2 rounded-xl border border-border bg-card hover:bg-accent hover:shadow-md transition-all whitespace-nowrap shrink-0"
              >
                {skill.logoUrl ? (
                  <img
                    src={skill.logoUrl}
                    alt={skill.name}
                    className="h-6 w-6 shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="h-6 w-6 rounded shrink-0"
                    style={{ backgroundColor: skill.color }}
                  />
                )}
                <span className="text-sm font-medium">{skill.name}</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: `${skill.color}15`, color: skill.color }}
                >
                  {skill.level}%
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* Working Process Section - "How I Work" */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("home.myProcess")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("home.howIWork")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("home.howIWorkDesc")}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step, i) => {
              const Icon = processIcons[i];
              return (
                <FadeIn key={step} delay={i * 0.1}>
                  <div className="relative text-center">
                    {i < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
                    )}
                    <div className="relative inline-flex mb-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
                        style={{ backgroundColor: "#006a4e" }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 text-xs font-bold" style={{ borderColor: "#006a4e", color: "#006a4e" }}>
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 break-words">{t(`home.${step}`)}</h3>
                    <p className="text-sm text-muted-foreground break-words">{t(`home.${processDescs[i]}`)}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("home.testimonials")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("home.clientReviews")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("home.clientReviewsDesc")}</p>
          </FadeIn>

          <FadeIn>
            <div className="relative max-w-2xl mx-auto">
              <Card className="p-6 sm:p-8">
                <CardContent className="p-0 text-center">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg sm:text-xl leading-relaxed mb-6 italic break-words">
                    &ldquo;{isBn
                      ? (testimonialsList[testimonialIdx]?.textBn || testimonialsList[testimonialIdx]?.text || "")
                      : (testimonialsList[testimonialIdx]?.text || "")
                    }&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold bg-primary"
                    >
                      {testimonialsList[testimonialIdx]?.avatar || "?"}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">
                        {testimonialsList[testimonialIdx]?.name || ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isBn
                          ? (testimonialsList[testimonialIdx]?.roleBn || testimonialsList[testimonialIdx]?.role || "")
                          : (testimonialsList[testimonialIdx]?.role || "")
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2 mt-6">
                {testimonialsList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === testimonialIdx ? "w-6" : "w-2"
                    }`}
                    style={{
                      backgroundColor: i === testimonialIdx ? "#006a4e" : "var(--muted-foreground)",
                      opacity: i === testimonialIdx ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-xs" />

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">{t("faq.faq")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("faq.frequentlyAsked")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("faq.faqDesc")}</p>
          </FadeIn>

          <FadeIn>
            <Accordion type="single" collapsible className="space-y-3">
              {(portfolioData.faq || []).map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-lg px-4 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline break-words">
                    {isBn ? item.questionBn : item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed break-words">
                    {isBn ? item.answerBn : item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section - Green bg, Email directly button */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn>
            <Card className="overflow-hidden">
              <div className="relative p-8 sm:p-12 text-center bg-primary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/100" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 break-words">
                    {t("home.readyToStart")}
                  </h2>
                  <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 break-words">
                    {t("home.ctaDesc")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={() => onNavigate("contact")}
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 font-medium"
                    >
                      {t("home.getInTouch")}
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </Button>
                    <a
                      href={`mailto:${personal.email || ''}`}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-transparent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                    >
                      <Mail className="h-4 w-4" />
                      {t("home.emailMeDirectly")}
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
