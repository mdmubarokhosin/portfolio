"use client";

import { useEffect } from "react";
import { ChevronRight, Heart, Mail, MapPin, Clock, FileText, ShieldCheck, ScrollText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";
import { incrementVisitors } from "@/lib/portfolio-store";
import { serviceHref } from "@/lib/service-pages";
import { Icon } from "@/components/icons";

interface FooterProps {
  onNavigate: (page: string) => void;
}

/** Column heading — bold label + the four decorative dots from the reference */
function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold tracking-tight">
      {children}
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1 w-1 rounded-full bg-primary/70" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/45" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
      </span>
    </h3>
  );
}

/** Link row — animated menu icon prefix (chevron slides on hover).
 *  Renders an <a> for real routes (href) or a <button> for hash pages. */
function MenuLink({
  label,
  onClick,
  href,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const shared =
    "group flex max-w-full items-center gap-1.5 rounded text-left text-sm text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";
  const badge = (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:shadow-sm group-hover:shadow-primary/30"
    >
      <ChevronRight className="h-3 w-3 text-primary transition-transform duration-300 group-hover:translate-x-px group-hover:text-primary-foreground" />
    </span>
  );
  if (href) {
    return (
      <a href={href} className={shared}>
        {badge}
        <span className="truncate">{label}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={shared}>
      {badge}
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Footer({ onNavigate }: FooterProps) {
  const { isBn, t } = useLanguage();
  const { data, settings } = usePortfolioData();
  const { personal, pages, services, socialLinks } = data;
  const footerText = (settings.footer_text || "").trim();

  // Count one visit per browser session (dashboard stat in the admin panel)
  useEffect(() => {
    if (sessionStorage.getItem("mmh_visit_counted")) return;
    sessionStorage.setItem("mmh_visit_counted", "1");
    incrementVisitors();
  }, []);

  const aboutLinks = [
    { label: t("footer.story"), page: "about" },
    { label: t("footer.mySkills"), page: "skills" },
    { label: t("footer.journey"), page: "experience" },
  ];

  return (
    <footer className="mt-auto">
      {/* Brand-gradient hairline */}
      <div
        aria-hidden="true"
        className="h-1 bg-[linear-gradient(to_right,var(--primary,#06b6d4),var(--accent-gradient,#22d3ee),var(--accent-gradient-2,#14b8a6))]"
      />

      <div className="border-t border-border/40 bg-card/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ─── Brand block — logo, name, description, socials ─── */}
          <div className="flex flex-col items-center gap-4 py-12 text-center sm:items-start sm:text-left">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={personal.name}
            >
              {personal.siteLogo ? (
                <img
                  src={personal.siteLogo}
                  alt={personal.name}
                  className="h-12 w-12 rounded-2xl bg-background object-contain p-1 shadow-sm ring-1 ring-border/60"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-500 text-base font-black text-primary-foreground shadow-md shadow-primary/30">
                  {personal.initials}
                </span>
              )}
              <span className="text-2xl font-bold tracking-tight">
                {isBn ? personal.nameBn ?? personal.name : personal.name}
              </span>
            </button>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {isBn ? personal.bio.shortBn ?? personal.bio.short : personal.bio.short}
            </p>

            {/* Social icons — outlined squares (reference style) */}
            <div className="mt-1 flex flex-wrap justify-center gap-2.5 sm:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10"
                >
                  <Icon name={social.icon} className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ─── Link columns — About / Pages / Services / Contact ─── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border/50 py-12 sm:gap-x-8 lg:grid-cols-4">
            {/* About — quick section links */}
            <nav aria-label={t("footer.aboutTitle")}>
              <ColumnTitle>{t("footer.aboutTitle")}</ColumnTitle>
              <ul className="space-y-3.5">
                {aboutLinks.map((link) => (
                  <li key={link.page}>
                    <MenuLink
                      label={link.label}
                      onClick={() => onNavigate(link.page)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Pages */}
            <nav aria-label={t("footer.pages")}>
              <ColumnTitle>{t("footer.pages")}</ColumnTitle>
              <ul className="space-y-3.5">
                {pages.map((page) => (
                  <li key={page.id}>
                    <MenuLink
                      label={isBn ? page.labelBn ?? page.label : page.label}
                      onClick={() => onNavigate(page.id)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services — each service has its own real page at /Services/<Slug> */}
            <nav aria-label={t("footer.services")}>
              <ColumnTitle>
                <a
                  href="/Services/"
                  className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("footer.services")}
                </a>
              </ColumnTitle>
              <ul className="space-y-3.5">
                {services.map((service, i) => (
                  <li key={`${service.title}-${i}`}>
                    <MenuLink
                      label={isBn ? service.titleBn ?? service.title : service.title}
                      href={serviceHref(service, i)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <div>
              <ColumnTitle>{t("footer.contact")}</ColumnTitle>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${personal.email}`}
                    className="min-w-0 break-all text-muted-foreground transition-colors hover:text-primary"
                  >
                    {personal.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {isBn ? personal.location : personal.locationEn ?? personal.location}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {isBn
                      ? personal.workingHoursBn ?? personal.workingHours ?? t("footer.workingHours")
                      : personal.workingHours ?? t("footer.workingHours")}
                  </span>
                </li>
              </ul>

              {/* availability chip */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                {isBn ? personal.availabilityBn ?? personal.availability : personal.availability}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Copyright bar ─── */}
      <div className="border-t border-border/50 bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            {footerText ? (
              footerText
            ) : (
              <>
                © {localizeDigits(new Date().getFullYear(), isBn)}{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("home")}
                  className="font-semibold text-foreground/80 transition-colors hover:text-primary"
                >
                  {isBn ? personal.nameBn ?? personal.name : personal.name}
                </button>
                . {t("footer.allRightsReserved")}
              </>
            )}
          </p>

          {/* Legal / utility links — real routes */}
          <nav
            aria-label={isBn ? "আইনি লিংক" : "Legal links"}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
          >
            <a
              href="/resume/"
              className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-primary"
            >
              <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
              {t("footer.resume")}
            </a>
            <a
              href="/privacy-policy/"
              className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("footer.privacy")}
            </a>
            <a
              href="/terms/"
              className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-primary"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {t("footer.terms")}
            </a>
          </nav>

          <p className="flex items-center gap-1.5">
            {t("footer.craftedin")}{" "}
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" aria-hidden="true" />{" "}
            {t("footer.in")}
          </p>
        </div>
      </div>
    </footer>
  );
}
