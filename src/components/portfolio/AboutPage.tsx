"use client";

import { motion } from "framer-motion";
import { User, MapPin, Mail, Languages, Download, Quote, Award, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits, pickSuffix } from "@/lib/i18n-utils";
import VideoCover from "./VideoCover";
import SectionVideoBackground from "./SectionVideoBackground";
import { serviceHref } from "@/lib/service-pages";
import { Icon } from "@/components/icons";

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

/* Brand palette rotation for service icon tiles (cyan → teal family) */
const serviceColors = ["#06b6d4", "#14b8a6", "#0e7490", "#22d3ee"];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { personal, services, testimonials, stats, certificates } = data;

  const bioParas = isBn
    ? personal.bio.fullBn ?? personal.bio.full
    : personal.bio.full;

  const infoCards = [
    {
      icon: <User className="h-5 w-5" />,
      label: t("about.name"),
      value: isBn ? personal.nameBn ?? personal.name : personal.name,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: t("about.location"),
      value: isBn ? personal.location : personal.locationEn ?? personal.location,
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: t("about.email"),
      value: personal.email,
    },
    {
      icon: <Languages className="h-5 w-5" />,
      label: t("about.language"),
      value: (isBn
        ? personal.languagesBn ?? personal.languages
        : personal.languages
      ).join(", "),
    },
  ];

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <SectionVideoBackground
        src="/videos/bg-orbs.mp4"
        poster="/videos/bg-orbs-poster.jpg"
        className="h-[340px] sm:h-[460px]"
        opacityClass="opacity-60 dark:opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-transparent via-background/30 to-background sm:h-[460px]"
      />

      {/* ── Header ── */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge
          variant="secondary"
          className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("about.aboutMe")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("about.getToKnowMe")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {isBn ? personal.bio.shortBn ?? personal.bio.short : personal.bio.short}
        </p>
      </div>

      {/* ── Profile + info ── */}
      <div className="relative mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Monogram avatar with animated gradient ring + availability chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="animate-pulse-glow absolute -inset-1.5 rounded-3xl bg-gradient-to-br from-primary via-cyan-400 to-teal-500" />
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl bg-card sm:h-44 sm:w-44">
              {personal.profileVideo ? (
                <VideoCover
                  src={personal.profileVideo}
                  poster="/videos/avatar-poster.jpg"
                  alt={personal.name}
                  className="h-full w-full object-cover"
                />
              ) : personal.profileImage ? (
                <img
                  src={personal.profileImage}
                  alt={personal.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-primary">
                  <span className="font-display text-4xl font-bold sm:text-5xl">
                    {personal.initials}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {isBn ? personal.firstNameBn ?? personal.firstName : personal.firstName}
                  </span>
                </div>
              )}
            </div>
            {/* floating availability chip */}
            <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-semibold shadow-lg shadow-primary/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {isBn ? personal.availabilityBn ?? personal.availability : personal.availability}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-9 text-2xl font-bold sm:text-3xl"
          >
            {isBn ? personal.nameBn ?? personal.name : personal.name}
          </motion.h2>
          <p className="mt-1 text-sm font-medium text-primary sm:text-base">
            {isBn ? personal.titleBn ?? personal.title : personal.title}
          </p>

          {/* Info cards — compact & centered (2 cols on mobile, 4 on desktop) */}
          <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {infoCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
              >
                <Card className="card-glow flex h-full flex-col items-center gap-2 rounded-2xl border-border/70 bg-card p-4 text-center transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25">
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {card.label}
                    </p>
                    <p className="mt-0.5 break-words text-xs font-semibold sm:text-sm">
                      {card.value}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bio — centered, magazine style ── */}
      <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-border/70 bg-card p-6 card-glow sm:p-10"
        >
          <Quote
            className="absolute -top-5 left-1/2 h-10 w-10 -translate-x-1/2 rounded-2xl bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/30"
            aria-hidden="true"
          />
          <h3 className="mb-5 mt-2 text-center text-xl font-bold sm:text-2xl">
            {t("about.whoAmI")}
          </h3>
          <div className="space-y-4 text-center">
            {bioParas.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* quick highlights strip (from Stats — always centered) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {stats.map((s) => (
              <span
                key={s.label}
                className="rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm"
              >
                {localizeDigits(s.value, isBn)}
                {pickSuffix(isBn, s.suffix, s.suffixBn)} {isBn ? s.labelBn ?? s.label : s.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="section-divider mx-auto mt-16 max-w-xs" />

      {/* ── Services — badge header + 4-col centered cards ── */}
      <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            {t("about.whatIDo")}
          </Badge>
          <h3 className="text-2xl font-bold sm:text-3xl">{t("home.myServices")}</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const color = serviceColors[i % serviceColors.length];
            return (
              <motion.div
                key={`${service.title}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <a
                  href={serviceHref(service, i)}
                  className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={isBn ? service.titleBn ?? service.title : service.title}
                >
                  <Card className="card-glow group relative h-full overflow-hidden rounded-2xl border-border/70 bg-card p-6 pt-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {/* oversized index watermark */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1 -top-3 select-none text-5xl font-black tabular-nums transition-colors duration-300"
                      style={{ color: `${color}14` }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 8px 20px ${color}45`,
                      }}
                    >
                      <Icon name={service.icon} className="h-7 w-7" />
                    </div>
                    <h4 className="mb-1.5 font-semibold">
                      {isBn ? service.titleBn ?? service.title : service.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {isBn
                        ? service.descriptionBn ?? service.description
                        : service.description}
                    </p>
                    <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
                      {t("servicesPage.viewDetails")}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="section-divider mx-auto mt-16 max-w-xs" />

      {/* ── Certificates & Achievements (always visible — A-to-Z parity with the old site) ── */}
      <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Badge
            variant="secondary"
            className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <Award className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {t("about.certificates")}
          </Badge>
          <h3 className="text-2xl font-bold sm:text-3xl">{t("about.certificates")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("about.certificatesDesc")}</p>
        </div>
        {certificates.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, i) => {
              const color = cert.color || "#06b6d4";
              return (
                <motion.div
                  key={`${cert.title}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                >
                  <Card className="card-glow group relative h-full overflow-hidden rounded-2xl border-border/70 bg-card p-6 pt-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {/* top accent ribbon */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
                    />
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      <Award className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h4 className="mb-1 font-semibold leading-snug">
                      {isBn ? cert.titleBn ?? cert.title : cert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isBn ? cert.issuerBn ?? cert.issuer : cert.issuer}
                    </p>
                    <span
                      className="mx-auto mt-3 flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: `${color}14`, color }}
                    >
                      {isBn ? cert.dateBn ?? cert.date : cert.date}
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="card-glow mx-auto max-w-md rounded-2xl border-border/70 bg-card p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Award className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">
              {isBn
                ? "সার্টিফিকেট শীঘ্রই যুক্ত করা হবে — Admin Panel থেকে যোগ করুন।"
                : "Certificates are coming soon — add them from the Admin Panel."}
            </p>
          </Card>
        )}
      </div>

      {/* ── Testimonials (only with data) ── */}
      {testimonials.length > 0 && (
        <>
          <div className="section-divider mx-auto mt-16 max-w-xs" />
          <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <Badge
                variant="secondary"
                className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
              >
                {t("home.testimonials")}
              </Badge>
              <h3 className="text-2xl font-bold sm:text-3xl">
                {isBn ? "মানুষ যা বলে" : "What People Say"}
              </h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {testimonials.map((tst, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <Card className="card-glow flex h-full flex-col rounded-2xl border-border/70 bg-card p-6 text-center">
                    <div className="mb-3 flex justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg
                          key={s}
                          viewBox="0 0 20 20"
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        >
                          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-4 flex-1 text-sm italic leading-relaxed text-muted-foreground">
                      “{isBn ? tst.quoteBn ?? tst.quote : tst.quote}”
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                        {tst.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">
                          {isBn ? tst.nameBn ?? tst.name : tst.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isBn ? tst.roleBn ?? tst.role : tst.role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── CTA ── */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
        {personal.resumeUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(personal.resumeUrl, "_blank", "noopener,noreferrer")}
            className="h-12 rounded-full border-2 px-7 font-semibold hover:border-primary hover:text-primary"
          >
            <Download className="mr-2 h-4 w-4" />
            {isBn ? "রেজিউমে ডাউনলোড" : "Download Resume"}
          </Button>
        )}
        <Button
          onClick={() => onNavigate("contact")}
          className="h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:scale-[1.03]"
        >
          {t("home.getInTouch")}
        </Button>
      </div>
    </div>
  );
}
