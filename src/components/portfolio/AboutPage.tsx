"use client";

import { motion } from "framer-motion";
import { Star, User, Languages, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { BiIcon } from "@/components/BiIcon";

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

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

export default function AboutPage({ onNavigate: _onNavigate }: AboutPageProps) {
  const { isBn, t } = useLanguage();
  const { data: portfolioData, loading } = usePortfolioData();
  const personal = portfolioData?.personal;
  const bioParagraphs = isBn
    ? (personal?.bio?.fullBn || personal?.bio?.full || [])
    : (personal?.bio?.full || []);

  const profileImageUrl = personal?.profileImage || "";

  if (loading || !personal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-10 w-48 bg-muted rounded-lg mx-auto" />
          <div className="h-6 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 space-y-16 sm:space-y-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">{t("about.aboutMe")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("about.getToKnowMe")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("about.aboutDesc")}</p>
        </FadeIn>

        {/* Profile Photo + Info */}
        <div className="mb-16">
          <FadeIn className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary via-primary to-red-500 animate-pulse-glow" />
              <div className="relative bg-card rounded-2xl p-1">
                <div className="rounded-xl overflow-hidden">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={isBn ? (personal.nameBn || personal.name) : personal.name}
                      className="w-48 h-48 sm:w-56 sm:h-56 object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-primary/10 text-primary">
                      <Camera className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-sm font-medium opacity-60 text-center px-4 break-words">
                        {isBn ? "ছবি যুক্ত করুন" : "Add Photo"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Name + Title */}
          <FadeIn className="text-center mb-8" delay={0.1}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
              {isBn ? (personal.nameBn || personal.name) : personal.name}
            </h2>
            <p className="text-primary font-medium text-lg break-words">
              {isBn ? (personal.titleBn || personal.title) : personal.title}
            </p>
          </FadeIn>

          {/* Info Cards */}
          <FadeIn className="mb-8" delay={0.15}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              <Card className="p-3 sm:p-4 flex flex-col items-center gap-2 text-center card-glow hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t("about.name")}</p>
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {isBn ? (personal.nameBn || personal.name) : personal.name}
                  </p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 flex flex-col items-center gap-2 text-center card-glow hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <BiIcon icon="bi-geo-alt-fill" className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t("about.location")}</p>
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {isBn ? (personal.location || personal.locationEn) : (personal.locationEn || personal.location)}
                  </p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 flex flex-col items-center gap-2 text-center card-glow hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <BiIcon icon="bi-envelope-fill" className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t("about.email")}</p>
                  <p className="text-xs sm:text-sm font-medium break-all">{personal.email || ""}</p>
                </div>
              </Card>
              <Card className="p-3 sm:p-4 flex flex-col items-center gap-2 text-center card-glow hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <Languages className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t("about.language")}</p>
                  <p className="text-xs sm:text-sm font-medium break-words">
                    {Array.isArray(personal.languages) ? personal.languages.join(", ") : ""}
                  </p>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Bio */}
          <FadeIn className="max-w-3xl mx-auto" delay={0.2}>
            <div className="space-y-4 text-center">
              {bioParagraphs.map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-sm break-words">
                  {para}
                </p>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="section-divider mx-auto max-w-xs mb-16" />

        {/* Services */}
        <FadeIn className="mb-16">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">{t("about.whatIDo")}</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold break-words">{t("home.myServices")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(portfolioData.services || []).map((service, i) => (
              <Card key={i} className="p-5 card-glow hover:shadow-md transition-all group text-center">
                <CardContent className="p-0">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3 text-white transition-transform group-hover:scale-110 mx-auto"
                    style={{ backgroundColor: service.color }}
                  >
                    <BiIcon icon={service.icon || 'bi-globe2'} className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1.5 break-words">{isBn ? service.titleBn : service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">{isBn ? service.descriptionBn : service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        <div className="section-divider mx-auto max-w-xs mb-16" />

        {/* Testimonials */}
        <FadeIn>
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">{t("home.testimonials")}</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold break-words">{t("about.whatPeopleSay")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {(portfolioData.testimonials || []).map((test, i) => (
              <Card key={i} className="p-6 card-glow">
                <CardContent className="p-0">
                  <div className="flex gap-0.5 mb-3 justify-center sm:justify-start">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic break-words text-center sm:text-left">
                    &ldquo;{isBn ? test.textBn : test.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold bg-primary shrink-0"
                    >
                      {test.avatar}
                    </div>
                    <div className="min-w-0 text-center sm:text-left">
                      <p className="font-semibold text-sm break-words">{test.name}</p>
                      <p className="text-xs text-muted-foreground break-words">{isBn ? test.roleBn : test.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}