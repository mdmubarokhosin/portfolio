"use client";

/**
 * ServicesIndexPage — /Services/
 *
 * Lists every service (from Firebase, seed fallback) as centered cards with
 * icon, title, description and a "View details" link to its real page at
 * /Services/<Slug>.
 *
 * Doubles as the smart fallback for admin-created services: when Cloudflare
 * Pages rewrites an unmatched /Services/<slug> URL here, the component
 * detects the extra path segment and renders the detail view client-side.
 */

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Home, Layers, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import SectionVideoBackground from "@/components/portfolio/SectionVideoBackground";
import ServiceDetailPage from "@/components/portfolio/pages/ServiceDetailPage";
import { Icon } from "@/components/icons";
import { serviceHref } from "@/lib/service-pages";

/* Brand palette rotation (cyan → teal family) — matches About/Home cards */
const serviceColors = ["#06b6d4", "#14b8a6", "#0e7490", "#22d3ee"];

/* ── Smart fallback for admin-created services ────────────────────────
 * When Cloudflare Pages rewrites an unmatched /Services/<slug> URL to this
 * index page (public/_redirects), the extra path segment is read via
 * useSyncExternalStore — SSR-safe: the server snapshot is null, the client
 * re-syncs right after hydration (no hydration mismatch). */
const noopSubscribe = () => () => {};

function getFallbackSlugSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0].toLowerCase() === "services") {
    const slug = decodeURIComponent(segments.slice(1).join("/"));
    return slug || null;
  }
  return null;
}

const getServerSlugSnapshot = () => null;

export default function ServicesIndexPage() {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { services, personal } = data;

  const pathSlug = useSyncExternalStore(
    noopSubscribe,
    getFallbackSlugSnapshot,
    getServerSlugSnapshot
  );

  // Any extra path segment means we are serving a slug without a static
  // file (admin-created service, or a renamed slug) — the detail component
  // resolves it from Firebase data or shows a friendly not-found state.
  if (pathSlug) {
    return <ServiceDetailPage slug={pathSlug} />;
  }

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

      {/* ── Header ── */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge
          variant="secondary"
          className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
        >
          <Layers className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {t("servicesPage.badge")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("servicesPage.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {t("servicesPage.subtitle")}
        </p>
      </div>

      {/* ── Service cards ── */}
      <div className="relative mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const color = serviceColors[i % serviceColors.length];
            const title = isBn ? service.titleBn ?? service.title : service.title;
            return (
              <motion.div
                key={`${service.title}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <Link href={serviceHref(service, i)} className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
                    <h2 className="mb-1.5 font-semibold">{title}</h2>
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
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative mx-auto mt-14 max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-xl font-bold sm:text-2xl">{t("servicesPage.ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {t("servicesPage.ctaText")}
          </p>
          <Button
            size="lg"
            className="mt-6 rounded-full px-8 font-semibold shadow-md shadow-primary/25"
            onClick={() => {
              window.location.href = "/#/contact";
            }}
          >
            {t("servicesPage.ctaButton")}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">{personal.email}</p>
        </div>
      </div>
    </div>
  );
}

/** Small breadcrumb used by both services pages */
export function Breadcrumbs({ label }: { label: string }) {
  const { t } = useLanguage();
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex max-w-6xl items-center justify-center gap-1.5 px-4 text-xs text-muted-foreground sm:px-6"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded transition-colors hover:text-primary"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        {t("servicesPage.breadcrumbHome")}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <Link
        href="/Services/"
        className="rounded transition-colors hover:text-primary"
      >
        {t("servicesPage.breadcrumbServices")}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="max-w-[14rem] truncate font-medium text-foreground/80">{label}</span>
    </nav>
  );
}

/** Shared empty state when a slug does not match any service */
export function ServiceNotFound({ slug }: { slug: string }) {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </div>
        <Badge
          variant="secondary"
          className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
        >
          404
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("servicesPage.notFoundTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {t("servicesPage.notFoundText")}
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground/70">/Services/{slug}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/Services/">{t("servicesPage.viewAll")}</Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              window.location.href = "/#/contact";
            }}
          >
            {t("servicesPage.ctaButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
