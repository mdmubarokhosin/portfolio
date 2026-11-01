"use client";

/**
 * SiteShell — the public site chrome for the standalone real routes
 * (/Services/…, /resume, /privacy-policy, /terms).
 *
 * It mirrors the main single-page app shell in src/app/page.tsx: same
 * providers (theme, language, Firebase-backed portfolio data, admin), same
 * Navbar / Footer / ScrollProgress / BackToTop / AI chatbot, so every real
 * page looks and behaves exactly like the main site.
 *
 * Hash navigation from these routes hands off to the main app via /#/<page>.
 */

import { useCallback, useEffect, type ReactNode } from "react";
import Navbar from "@/components/portfolio/Navbar";
import ScrollProgress from "@/components/portfolio/ScrollProgress";
import BackToTop from "@/components/portfolio/BackToTop";
import Footer from "@/components/portfolio/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import SiteIdentity from "@/components/SiteIdentity";
import { PortfolioDataProvider } from "@/context/PortfolioDataContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

interface SiteShellProps {
  children: ReactNode;
}

/** Bilingual skip link (lives inside LanguageProvider). */
function SkipToContent({ onSkip }: { onSkip: () => void }) {
  const { isBn } = useLanguage();
  return (
    <button
      type="button"
      onClick={onSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
    >
      {isBn ? "সরাসরি কনটেন্টে যান" : "Skip to content"}
    </button>
  );
}

export default function SiteShell({ children }: SiteShellProps) {
  const handleNavigate = useCallback((page: string) => {
    // Hand off to the main single-page app (hash router lives there)
    window.location.href = `/#/${page}`;
  }, []);

  const handleSkipToContent = useCallback(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.focus();
    main.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  }, []);

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
        // Bridge across the full-page navigation: the contact page picks
        // this up on mount (see ContactPage).
        if (action.fields) {
          try {
            sessionStorage.setItem("chatbot-fill-form-pending", JSON.stringify(action.fields));
          } catch {
            /* storage unavailable */
          }
        }
        handleNavigate("contact");
      } else if (action.type === "openUrl" && typeof action.url === "string") {
        window.open(action.url, "_blank", "noopener,noreferrer");
      }
    },
    [handleNavigate]
  );

  // Every real-route visit starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PortfolioDataProvider>
          <SiteIdentity />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SkipToContent onSkip={handleSkipToContent} />
            <ScrollProgress />
            <div className="print:hidden">
              <Navbar onNavigate={handleNavigate} currentPage="" />
            </div>

            <main className="flex-1 outline-none" id="main-content" tabIndex={-1}>
              {children}
            </main>

            <div className="print:hidden">
              <Footer onNavigate={handleNavigate} />
            </div>
            <BackToTop />
            <div className="print:hidden">
              <ChatbotWidget onAction={handleChatAction} />
            </div>
          </div>
        </PortfolioDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
