"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Star, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData, type Project } from "@/context/PortfolioDataContext";
import { localizeDigits } from "@/lib/i18n-utils";
import SectionVideoBackground from "./SectionVideoBackground";
import VideoCover from "./VideoCover";
import { Icon } from "@/components/icons";

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export default function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const { isBn, t } = useLanguage();
  const { data } = usePortfolioData();
  const { projects, projectCategories } = data;
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.category === active)),
    [active, projects]
  );

  return (
    <div className="relative overflow-hidden pb-20 pt-24 sm:pt-28">
      {/* ambient background film */}
      <SectionVideoBackground
        src="/videos/bg-grid.mp4"
        poster="/videos/bg-grid-poster.jpg"
        className="h-[340px] sm:h-[460px]"
        opacityClass="opacity-60 dark:opacity-40"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[340px] sm:h-[460px] bg-gradient-to-b from-transparent via-background/30 to-background" />

      {/* Header */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="mb-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {t("projects.myProjects")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {t("projects.portfolioShowcase")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {isBn
            ? "প্রতিটি প্রজেক্টের পেছনে আছে যত্ন, কৌতূহল ও পরিষ্কার কোড"
            : "Every project carries care, curiosity and clean code"}
        </p>
      </div>

      <div className="relative mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {projectCategories.map((cat) => {
            const isActive = active === cat.id;
            const count =
              cat.id === "all"
                ? projects.length
                : projects.filter((p) => p.category === cat.id).length;
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
                  {localizeDigits(count, isBn)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Project grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card
                  className="card-glow group h-full cursor-pointer overflow-hidden rounded-2xl border-border/70 bg-card"
                  onClick={() => setSelected(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(project);
                    }
                  }}
                  aria-label={`${project.title} — ${t("projects.viewDetails")}`}
                >
                  {/* Cover */}
                  <div className="relative h-44 overflow-hidden">
                    {project.coverVideo ? (
                      <VideoCover
                        src={project.coverVideo}
                        poster={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        zoomOnHover
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}, ${project.color}77)`,
                        }}
                      >
                        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                          <Icon name={project.icon} className="h-10 w-10" />
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                    {project.featured && (
                      <Badge className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 text-xs text-slate-900 backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {t("projects.featured")}
                      </Badge>
                    )}
                    <Badge className="absolute bottom-3 left-3 rounded-full bg-black/35 text-[11px] text-white backdrop-blur-sm">
                      {(projectCategories.find((c) => c.id === project.category)?.labelBn &&
                      isBn
                        ? projectCategories.find((c) => c.id === project.category)?.labelBn
                        : projectCategories.find((c) => c.id === project.category)?.label) ??
                        project.category}
                    </Badge>
                  </div>

                  <CardContent className="p-5 text-center">
                    <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                      {isBn ? project.titleBn ?? project.title : project.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {isBn ? project.descriptionBn ?? project.description : project.description}
                    </p>
                    <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `${project.color}14`,
                            color: project.color,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {project.liveUrl ? (
                        <Button
                          size="sm"
                          className="h-8 rounded-full px-4 text-xs text-white"
                          style={{ backgroundColor: project.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          {t("projects.liveDemo")}
                        </Button>
                      ) : (
                        <span className="inline-flex h-8 items-center rounded-full bg-muted px-4 text-xs font-medium text-muted-foreground">
                          {t("projects.comingSoon")}
                        </span>
                      )}
                      {project.codeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-4 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.codeUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <Github className="mr-1 h-3.5 w-3.5" />
                          {t("projects.sourceCode")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-teal-600 px-6 py-12 text-center text-white shadow-xl shadow-primary/25"
        >
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-white/85" aria-hidden="true" />
          <h2 className="text-xl font-bold sm:text-2xl">
            {t("projects.interestedInWorking")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            {t("projects.discussProject")}
          </p>
          <Button
            onClick={() => onNavigate("contact")}
            className="mt-6 h-11 rounded-full bg-white px-7 font-semibold text-cyan-700 hover:bg-white/90"
          >
            {t("home.getInTouch")}
          </Button>
        </motion.div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
          {selected && (
            <div>
              <div className="relative h-40 sm:h-48">
                {selected.coverVideo ? (
                  <VideoCover
                    src={selected.coverVideo}
                    poster={selected.coverImage}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${selected.color}, ${selected.color}88)`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <DialogTitle className="absolute bottom-3 left-5 right-5 text-center text-xl font-bold text-white">
                  {isBn ? selected.titleBn ?? selected.title : selected.title}
                </DialogTitle>
              </div>
              <div className="p-6 text-center">
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {isBn ? selected.descriptionBn ?? selected.description : selected.description}
                </DialogDescription>

                <h4 className="mb-2 mt-5 text-sm font-bold">
                  {t("projects.technologies")}
                </h4>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${selected.color}14`,
                        color: selected.color,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {selected.liveUrl && (
                    <Button
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: selected.color }}
                      onClick={() =>
                        window.open(selected.liveUrl, "_blank", "noopener,noreferrer")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("projects.liveDemo")}
                    </Button>
                  )}
                  {selected.codeUrl && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() =>
                        window.open(selected.codeUrl, "_blank", "noopener,noreferrer")
                      }
                    >
                      <Github className="mr-2 h-4 w-4" />
                      {t("projects.sourceCode")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
