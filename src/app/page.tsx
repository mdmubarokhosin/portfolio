"use client";

import { useState, useCallback } from "react";
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
import { PortfolioDataProvider } from "@/context/PortfolioDataContext";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function PortfolioPage() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChatAction = useCallback((action: { type: string; [key: string]: any }) => {
    if (action.type === "navigate" && action.page) {
      handleNavigate(action.page);
    } else if (action.type === "contact") {
      if (action.method === "email") {
        window.open("mailto:contact.mdmubarok@gmail.com", "_blank");
      } else if (action.method === "phone") {
        window.open("tel:+8801XXXXXXXXX", "_blank");
      } else if (action.method === "whatsapp") {
        window.open("https://wa.me/8801XXXXXXXXX", "_blank");
      } else if (action.method === "telegram") {
        window.open("https://t.me/mdmubarok", "_blank");
      }
      handleNavigate("contact");
    } else if (action.type === "project" && typeof action.projectId === "number") {
      setCurrentPage("projects");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action.type === "fillForm") {
      // Navigate to contact page - form will be pre-filled via a custom event
      handleNavigate("contact");
      if (action.fields) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("chatbot-fill-form", { detail: action.fields }));
        }, 500);
      }
    } else if (action.type === "openUrl" && action.url) {
      window.open(action.url, "_blank", "noopener,noreferrer");
    }
  }, [handleNavigate]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "about":
        return <AboutPage onNavigate={handleNavigate} />;
      case "skills":
        return <SkillsPage />;
      case "projects":
        return <ProjectsPage />;
      case "experience":
        return <ExperiencePage />;
      case "contact":
        return <ContactPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <PortfolioDataProvider>
      <div className="min-h-screen flex flex-col">
        <ScrollProgress />
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer onNavigate={handleNavigate} />
        <BackToTop />
        <ChatbotWidget onAction={handleChatAction} />
      </div>
    </PortfolioDataProvider>
  );
}
