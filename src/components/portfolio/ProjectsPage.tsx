"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Star, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { BiIcon } from "@/components/BiIcon";

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

export default function ProjectsPage() {
  const { isBn, t } = useLanguage();
  const { data: portfolioData } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState("all");
  const projects = portfolioData?.projects || [];
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null);

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-24 pb-16 space-y-16 sm:space-y-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">{t("projects.myProjects")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words">{t("projects.portfolioShowcase")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto break-words">{t("projects.projectsDesc")}</p>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn className="mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {(portfolioData?.projectCategories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {isBn ? cat.labelBn : cat.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Project Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {(filteredProjects || []).map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card
                  className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Header with cover/logo/icon */}
                  <div className="relative h-44 overflow-hidden">
                    {project.coverImage ? (
                      <>
                        <img
                          src={project.coverImage}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${project.color}, ${project.color}88, ${project.color}33)`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {/* Decorative dots pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-white" />
                          <div className="absolute top-3 right-8 h-2 w-2 rounded-full bg-white" />
                          <div className="absolute top-8 right-3 h-2 w-2 rounded-full bg-white" />
                          <div className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-white" />
                          <div className="absolute bottom-3 left-8 h-2 w-2 rounded-full bg-white" />
                          <div className="absolute bottom-8 left-3 h-2 w-2 rounded-full bg-white" />
                        </div>
                      </>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {project.projectLogo ? (
                          <div
                            className="flex h-28 w-28 items-center justify-center rounded-2xl shadow-2xl shadow-black/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 bg-white/20 backdrop-blur-md overflow-hidden border border-white/30"
                          >
                            <img
                              src={project.projectLogo}
                              alt=""
                              className="h-full w-full object-contain p-2"
                            />
                          </div>
                        ) : project.icon ? (
                          <div
                            className="flex h-28 w-28 items-center justify-center rounded-2xl text-white shadow-2xl shadow-black/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 backdrop-blur-sm border border-white/20"
                            style={{ backgroundColor: `${project.color}DD` }}
                          >
                            <BiIcon icon={project.icon} className="text-5xl" />
                          </div>
                        ) : (
                          <div
                            className="flex h-28 w-28 items-center justify-center rounded-2xl text-white shadow-2xl shadow-black/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 backdrop-blur-sm border border-white/20"
                            style={{ backgroundColor: `${project.color}DD` }}
                          >
                            <BiIcon icon="bi-globe2" className="text-5xl" />
                          </div>
                        )}
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
                          {t("projects.featured")}
                        </Badge>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        className="text-[10px] bg-black/20 text-white backdrop-blur-sm border-0"
                      >
                        {project.category === "fullstack" ? "Full Stack" : project.category === "frontend" ? "Frontend" : project.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors break-words">
                      {isBn ? project.titleBn : project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed break-words">
                      {isBn ? project.descriptionBn : project.description}
                    </p>

                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags?.slice(0, 4).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
                          style={{ backgroundColor: `${project.color}12`, color: project.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        className="flex-1 text-xs font-medium text-white hover:opacity-90"
                        style={{ backgroundColor: project.color }}
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> {t("projects.liveDemo")}
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3.5 w-3.5 mr-1" /> {t("projects.sourceCode")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA bottom */}
        <FadeIn className="mt-16">
          <Card className="overflow-hidden">
            <div className="relative p-8 sm:p-12 text-center" style={{ background: `linear-gradient(135deg, #006a4e, #00875a)` }}>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
                  {t("projects.interestedInWorking")}
                </h3>
                <p className="text-white/80 text-sm mb-6 max-w-lg mx-auto break-words">
                  {t("projects.discussProject")}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    className="bg-white text-green-800 hover:bg-white/90 font-medium"
                    onClick={() => window.location.hash = "#contact"}
                  >
                    {t("home.getInTouch")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedProject && (
            <>
              {/* Modal header */}
              <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                {selectedProject.coverImage ? (
                  <>
                    <img
                      src={selectedProject.coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${selectedProject.color}, ${selectedProject.color}88)`,
                    }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedProject.projectLogo ? (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl shadow-2xl shadow-black/30 bg-white/20 backdrop-blur-md overflow-hidden border border-white/30">
                      <img
                        src={selectedProject.projectLogo}
                        alt=""
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  ) : selectedProject.icon ? (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl text-white shadow-2xl shadow-black/30 backdrop-blur-sm border border-white/20">
                      <BiIcon icon={selectedProject.icon} className="text-5xl" />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl text-white shadow-2xl shadow-black/30 backdrop-blur-sm border border-white/20">
                      <BiIcon icon="bi-globe2" className="text-5xl" />
                    </div>
                  )}
                </div>
              </div>

              <DialogHeader>
                <div className="flex-1">
                  <DialogTitle className="text-left text-lg break-words">
                    {isBn ? selectedProject.titleBn : selectedProject.title}
                  </DialogTitle>
                  {selectedProject.featured && (
                    <Badge className="text-xs mt-2 bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      {t("projects.featured")}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              <DialogDescription className="text-left break-words leading-relaxed">
                {isBn ? selectedProject.descriptionBn : selectedProject.description}
              </DialogDescription>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2 py-1 rounded-md"
                        style={{ backgroundColor: `${selectedProject.color}12`, color: selectedProject.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 text-white"
                    style={{ backgroundColor: selectedProject.color }}
                    asChild
                  >
                    <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" /> {t("projects.liveDemo")}
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={selectedProject.codeUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-1" /> {t("projects.sourceCode")}
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}