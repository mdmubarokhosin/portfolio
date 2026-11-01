"use client";

/**
 * ServiceDetailPage — /Services/<Slug>
 *
 * Full detail page for one service:
 *   breadcrumb hero → overview → what's included → process →
 *   technologies → other services → CTA.
 *
 * Content resolution (see resolveServiceDetail):
 *   admin-entered copy (Firebase) → curated bilingual default → generic.
 * Unknown slugs render a friendly not-found state (this also covers
 * admin-created services arriving via the Cloudflare Pages rewrite).
 */

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cog,
  Mail,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import SectionVideoBackground from "@/components/portfolio/SectionVideoBackground";
import { Breadcrumbs, ServiceNotFound } from "@/components/portfolio/pages/ServicesIndexPage";
import { Icon } from "@/components/icons";
import {
  SERVICE_PROCESS,
  resolveServiceDetail,
  serviceColors,
  serviceHref,
} from "@/lib/service-pages";

interface ServiceDetailPageProps {
  slug: string;
}

export default function ServiceDetailPage({ slug }: ServiceDetailPageProps) {
  const { isBn, t, lang } = useLanguage();
  const { data } = usePortfolioData();
  const { services, personal } = data;

  const index = services.findIndex(
    (s, i) => serviceHref(s, i) === `/Services/${slug.replace(/\/+$/, "")}`
  );
  const service = index >= 0 ? services[index] : null;
  const detail = useMemo(
    () => (service ? resolveServiceDetail(service, isBn, index) : null),
    [service, isBn, index]
  );

  const title = service
    ? isBn
      ? service.titleBn ?? service.title
      : service.title
    : slug;

  /* Client-side document title (also covers the rewrite-fallback route) */
  useEffect(() => {
    document.title = service
      ? `${title} — ${t("footer.services")} | ${isBn ? personal.nameBn ?? personal.name : personal.name}`
      : `${t("servicesPage.notFoundTitle")} | ${personal.name}`;
  }, [service, title, personal.name, personal.nameBn, isBn, t]);

  /* Service structured data for search engines */
  useEffect(() => {
    if (!service) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.serviceJsonLd = "true";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.description,
      provider: {
        "@type": "Person",
        name: personal.name,
        url: window.location.origin,
      },
      areaServed: "Worldwide",
      serviceType: service.title,
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [service, personal.name]);

  if (!service || !detail) {
    return <ServiceNotFound slug={slug} />;
  }

  const color = serviceColors[index % serviceColors.length];
  const others = services.filter((_, i) => i !== index);

  return (
    <div className="relative overflow-hidden pb-20">
      {/* ── Hero ── */}
      <div className="relative pt-24 sm:pt-28">
        <SectionVideoBackground
          src="/videos/bg-orbs.mp4"
          poster="/videos/bg-orbs-poster.jpg"
          className="h-[300px] sm:h-[400px]"
          opacityClass="opacity-60 dark:opacity-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-transparent via-background/30 to-background sm:h-[400px]"
        />

        <div className="relative mx-auto max-w-3xl px-4 pb-10 text-center sm:px-6">
          <Breadcrumbs label={title} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl"
            style={{ backgroundColor: color, boxShadow: `0 12px 32px ${color}55` }}
          >
            <Icon name={service.icon} className="h-10 w-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <Badge
              variant="secondary"
              className="mb-3 mt-5 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              {t("servicesPage.badge")}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {isBn ? service.descriptionBn ?? service.description : service.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="rounded-full px-7 font-semibold shadow-md shadow-primary/25"
                onClick={() => {
                  window.location.href = "/#/contact";
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("servicesPage.ctaButton")}
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/Services/">{t("servicesPage.viewAll")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Overview ── */}
      <section className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <Card className="card-glow rounded-3xl border-border/70 bg-card p-7 sm:p-9">
            <h2 className="text-xl font-bold sm:text-2xl">
              {isBn ? "সেবার সংক্ষিপ্ত বিবরণ" : "About this service"}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{detail.overview}</p>
          </Card>
        </motion.div>
      </section>

      {/* ── What's included ── */}
      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          label={t("servicesPage.included")}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detail.features.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="card-glow flex h-full flex-row items-center gap-3 rounded-2xl border-border/70 bg-card p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-col sm:justify-center sm:p-6">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ backgroundColor: color }}
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium leading-snug">{feature}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={<Cog className="h-4 w-4" aria-hidden="true" />}
          label={t("servicesPage.process")}
        />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t("servicesPage.processSubtitle")}
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_PROCESS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Card className="card-glow relative h-full overflow-hidden rounded-2xl border-border/70 bg-card p-6 text-center">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none text-5xl font-black tabular-nums"
                  style={{ color: `${color}14` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold">
                  {isBn ? step.titleBn : step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {isBn ? step.descBn : step.desc}
                </p>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── Technologies ── */}
      {detail.tech.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl px-4 sm:px-6">
          <SectionHeading
            icon={<Wrench className="h-4 w-4" aria-hidden="true" />}
            label={t("servicesPage.technologies")}
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {detail.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Other services ── */}
      {others.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}
            label={t("servicesPage.otherServices")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other, i) => {
              const otherIndex = services.indexOf(other);
              const otherColor = serviceColors[otherIndex % serviceColors.length];
              return (
                <motion.div
                  key={`${other.title}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Link
                    href={serviceHref(other, otherIndex)}
                    className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="card-glow group flex h-full flex-col items-center rounded-2xl border-border/70 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: otherColor }}
                      >
                        <Icon name={other.icon} className="h-6 w-6" />
                      </span>
                      <h3 className="mt-3.5 font-semibold">
                        {isBn ? other.titleBn ?? other.title : other.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {isBn ? other.descriptionBn ?? other.description : other.description}
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="mx-auto mt-14 max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-xl font-bold sm:text-2xl">{t("servicesPage.ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {t("servicesPage.ctaText")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 font-semibold shadow-md shadow-primary/25"
              onClick={() => {
                window.location.href = "/#/contact";
              }}
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("servicesPage.ctaButton")}
            </Button>
            <a
              href={`mailto:${personal.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {personal.email}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Small shared section heading (badge-style) */
function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <Badge
        variant="secondary"
        className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
      >
        {icon}
        {label}
      </Badge>
      <div className="section-divider mx-auto max-w-[7rem]" aria-hidden="true" />
    </div>
  );
}
