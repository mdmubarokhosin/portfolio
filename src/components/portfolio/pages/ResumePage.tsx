"use client";

/**
 * ResumePage — /resume
 *
 * A print-friendly, data-driven résumé built entirely from the Firebase
 * portfolio data (personal, skills, experiences, education, certificates).
 * Visitors can print / save it as PDF with one click; if the admin set a
 * resumeUrl, a direct download button appears too.
 * Print styles hide the site chrome (handled in SiteShell with print:hidden).
 */

import { useEffect } from "react";
import {
  Award,
  Briefcase,
  CircleCheck,
  Download,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Printer,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { Icon } from "@/components/icons";

export default function ResumePage() {
  const { isBn, t } = useLanguage();
  const { data, settings } = usePortfolioData();
  const { personal, skills, skillCategories, experiences, education, certificates, socialLinks } =
    data;

  useEffect(() => {
    document.title = `${isBn ? "রেজিউমে" : "Resume"} — ${isBn ? personal.nameBn ?? personal.name : personal.name}`;
  }, [isBn, personal.name, personal.nameBn]);

  const displayName = isBn ? personal.nameBn ?? personal.name : personal.name;
  const displayTitle = isBn ? personal.titleBn ?? personal.title : personal.title;

  const skillsByCategory = skillCategories
    .map((category) => ({
      category: isBn ? category.labelBn ?? category.label : category.label,
      items: skills.filter((s) => s.category === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen pb-20 pt-24 print:pt-4">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Toolbar (never printed) */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              window.location.href = "/#/experience";
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            {isBn ? "সাইটে ফিরুন" : "Back to site"}
          </Button>
          <Button className="rounded-full shadow-md shadow-primary/25" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            {isBn ? "প্রিন্ট / PDF সেভ করুন" : "Print / Save as PDF"}
          </Button>
          {personal.resumeUrl && (
            <Button asChild variant="secondary" className="rounded-full">
              <a href={personal.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {isBn ? "ডাউনলোড" : "Download"}
              </a>
            </Button>
          )}
        </div>

        {/* Resume sheet */}
        <Card className="card-glow overflow-hidden rounded-3xl border-border/70 bg-card shadow-lg print:border-0 print:shadow-none">
          {/* ── Header ── */}
          <header className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-7 text-center sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
            <p className="mt-1 text-sm font-semibold text-primary sm:text-base">{displayTitle}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {personal.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {isBn ? personal.location : personal.locationEn ?? personal.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {(isBn ? personal.languagesBn ?? personal.languages : personal.languages).join(", ")}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 print:hidden">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon name={social.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </header>

          <div className="space-y-8 p-7 sm:p-9">
            {/* ── Summary ── */}
            <section>
              <ResumeHeading
                title={isBn ? "সারসংক্ষেপ" : "Summary"}
                icon={<CircleCheck className="h-4 w-4" aria-hidden="true" />}
              />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {isBn ? personal.bio.fullBn ?? personal.bio.full : personal.bio.full}
              </p>
            </section>

            {/* ── Experience ── */}
            {experiences.length > 0 && (
              <section>
                <ResumeHeading
                  title={isBn ? "কাজের অভিজ্ঞতা" : "Work Experience"}
                  icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
                />
                <div className="mt-4 space-y-5">
                  {experiences.map((exp) => (
                    <div key={exp.title} className="relative border-l-2 border-primary/25 pl-4">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background"
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="text-sm font-semibold">
                          {isBn ? exp.titleBn ?? exp.title : exp.title}
                          <span className="text-muted-foreground"> · {isBn ? exp.companyBn ?? exp.company : exp.company}</span>
                        </h3>
                        <span className="text-xs font-medium text-primary">
                          {isBn ? exp.periodBn ?? exp.period : exp.period}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {isBn ? exp.descriptionBn ?? exp.description : exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Education ── */}
            {education.length > 0 && (
              <section>
                <ResumeHeading
                  title={isBn ? "শিক্ষা" : "Education"}
                  icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
                />
                <div className="mt-4 space-y-4">
                  {education.map((edu) => (
                    <div key={edu.degree} className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-sm font-semibold">
                        {isBn ? edu.degreeBn ?? edu.degree : edu.degree}
                        <span className="text-muted-foreground">
                          {" "}
                          · {isBn ? edu.institutionBn ?? edu.institution : edu.institution}
                        </span>
                      </h3>
                      <span className="text-xs font-medium text-primary">
                        {isBn ? edu.periodBn ?? edu.period : edu.period}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Skills ── */}
            {skillsByCategory.length > 0 && (
              <section>
                <ResumeHeading
                  title={isBn ? "দক্ষতা" : "Skills"}
                  icon={<CircleCheck className="h-4 w-4" aria-hidden="true" />}
                />
                <div className="mt-4 space-y-4">
                  {skillsByCategory.map((group) => (
                    <div key={group.category}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {group.category}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.items.map((skill) => (
                          <span
                            key={skill.name}
                            className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Certificates ── */}
            {certificates.length > 0 && (
              <section>
                <ResumeHeading
                  title={isBn ? "সার্টিফিকেট" : "Certificates"}
                  icon={<Award className="h-4 w-4" aria-hidden="true" />}
                />
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {certificates.map((cert) => (
                    <li
                      key={cert.title}
                      className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/60 p-3 text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: cert.color || "#06b6d4" }}
                      />
                      <span>
                        <span className="font-semibold">
                          {isBn ? cert.titleBn ?? cert.title : cert.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {isBn ? cert.issuerBn ?? cert.issuer : cert.issuer}
                          {cert.date ? ` · ${isBn ? cert.dateBn ?? cert.date : cert.date}` : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ── Sheet footer ── */}
          <footer className="border-t border-border/60 bg-muted/40 p-5 text-center text-xs text-muted-foreground print:hidden">
            {isBn
              ? `এই রেজিউমেটি সরাসরি ${settings.site_name || displayName}-এর ওয়েবসাইট থেকে তৈরি — সর্বশেষ তথ্যের জন্য ওয়েবসাইট ভিজিট করুন।`
              : `Generated live from ${settings.site_name || displayName}'s website — visit the site for the latest information.`}
          </footer>
        </Card>
      </div>
    </div>
  );
}

function ResumeHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      {title}
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </h2>
  );
}
