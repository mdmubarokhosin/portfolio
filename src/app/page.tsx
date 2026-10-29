"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/portfolio/Navbar";
import ScrollProgress from "@/components/portfolio/ScrollProgress";
import BackToTop from "@/components/portfolio/BackToTop";
import HomePage from "@/components/portfolio/HomePage";
import AboutPage from "@/components/portfolio/AboutPage";
import SkillsPage from "@/components/portfolio/SkillsPage";
import ProjectsPage from "@/components/portfolio/ProjectsPage";
import ExperiencePage from "@/components/portfolio/ExperiencePage";
import ContactPage from "@/components/portfolio/ContactPage";
import Footer from "@/components/portfolio/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import AdminPage from "@/components/portfolio/admin/AdminPage";
import SiteIdentity from "@/components/SiteIdentity";
import { PortfolioDataProvider } from "@/context/PortfolioDataContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdminProvider } from "@/context/AdminContext";

export const runtime = "edge";

const VALID_PAGES = ["home", "about", "skills", "projects", "experience", "contact", "admin"];

function readHashPage(): string {
  if (typeof window === "undefined") return "home";
  const hash = window.location.hash.replace(/^#\/?/, "").trim();
  return VALID_PAGES.includes(hash) ? hash : "home";
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const getServerPage = () => "home";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PortfolioApp() {
  // URL hash is the single source of truth → back/forward + shareable links work
  const currentPage = useSyncExternalStore(subscribeHash, readHashPage, getServerPage);

  // Same-document hash navigation keeps the browser's scroll position — disable
  // that so back/forward, direct URL edits and shared links always start clean.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Every page change (UI nav, back/forward, manual hash edit) starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [currentPage]);

  const handleNavigate = useCallback((page: string) => {
    if (!VALID_PAGES.includes(page)) return;
    const newHash = `#/${page}`;
    if (window.location.hash !== newHash) {
      window.history.pushState(null, "", newHash);
      // pushState does not fire hashchange — notify subscribers manually
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSkipToContent = useCallback(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.focus();
    main.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  }, []);

  const handleExitAdmin = useCallback(() => {
    handleNavigate("home");
  }, [handleNavigate]);

  const handleChatAction = useCallback(
    (action: { type: string; [key: string]: unknown }) => {
      if (action.type === "navigate" && typeof action.page === "string") {
        handleNavigate(action.page);
      } else if (action.type === "contact") {
        if (action.method === "email") {
          window.open("mailto:contact.mdmubarok@gmail.com", "_blank");
        }
        handleNavigate("contact");
      } else if (action.type === "project") {
        handleNavigate("projects");
      } else if (action.type === "fillForm") {
        handleNavigate("contact");
        if (action.fields) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("chatbot-fill-form", { detail: action.fields })
            );
          }, 500);
        }
      } else if (action.type === "openUrl" && typeof action.url === "string") {
        window.open(action.url, "_blank", "noopener,noreferrer");
      }
    },
    [handleNavigate]
  );

  const content = useMemo(() => {
    switch (currentPage) {
      case "about":
        return <AboutPage onNavigate={handleNavigate} />;
      case "skills":
        return <SkillsPage />;
      case "projects":
        return <ProjectsPage onNavigate={handleNavigate} />;
      case "experience":
        return <ExperiencePage />;
      case "contact":
        return <ContactPage />;
      case "admin":
        return <AdminPage onExit={handleExitAdmin} />;
      case "home":
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  }, [currentPage, handleNavigate, handleExitAdmin]);

  // Admin has its own full-screen layout (no public chrome)
  const isAdmin = currentPage === "admin";

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PortfolioDataProvider>
          <AdminProvider>
          <SiteIdentity />
          {isAdmin ? (
              <div className="min-h-screen bg-background text-foreground">{content}</div>
            ) : (
              <div className="flex min-h-screen flex-col bg-background text-foreground">
                <button
                  type="button"
                  onClick={handleSkipToContent}
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
                >
                  Skip to content
                </button>
                <ScrollProgress />
                <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

                <main className="flex-1 outline-none" id="main-content" tabIndex={-1}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {content}
                    </motion.div>
                  </AnimatePresence>
                </main>

                <Footer onNavigate={handleNavigate} />
                <BackToTop />
                <ChatbotWidget onAction={handleChatAction} />
              </div>
            )}
          </AdminProvider>
        </PortfolioDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
