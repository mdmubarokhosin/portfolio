"use client";

/**
 * PublicShell — shared client chrome for every public real route
 * (/, /about, /skills, /projects, /experience, /youtube, /contact …).
 *
 * Wraps the page in the same providers (theme, language, Firebase-backed
 * portfolio data, admin) and renders Navbar / Footer / ScrollProgress /
 * BackToTop / AI chatbot — identical behaviour on all pages.
 *
 * DataGate: the site loads 100% of its content from Firebase RTDB (there is
 * no bundled seed). While the first fetch is in flight a skeleton shows;
 * if the database is unreachable a friendly retry screen appears.
 */

import { useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CloudOff, RotateCw } from "lucide-react";
import Navbar from "@/components/portfolio/Navbar";
import ScrollProgress from "@/components/portfolio/ScrollProgress";
import BackToTop from "@/components/portfolio/BackToTop";
import Footer from "@/components/portfolio/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import SiteIdentity from "@/components/SiteIdentity";
import { PortfolioDataProvider, usePortfolioData } from "@/context/PortfolioDataContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { pageFromPath } from "@/lib/navigation";
import { useAppNavigation } from "@/lib/use-app-navigation";

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

/** Full-screen skeleton shown while the first Firebase fetch is running. */
function LoadingScreen() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4" aria-busy="true" aria-live="polite">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-500 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">
          M
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-4 w-44 animate-pulse rounded-full bg-secondary" />
        <div className="h-3 w-28 animate-pulse rounded-full bg-secondary" />
      </div>
    </div>
  );
}

/** Friendly offline screen when Firebase is unreachable (no seed fallback). */
function ErrorScreen() {
  const { isBn, t } = useLanguage();
  const { refresh } = usePortfolioData();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <CloudOff className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold">
          {isBn ? "ডেটা লোড করা যায়নি" : "Could not load content"}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isBn
            ? "Firebase ডেটাবেসের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।"
            : "We could not reach the Firebase database. Check your connection and try again."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => refresh()}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95"
      >
        <RotateCw className="h-4 w-4" />
        {isBn ? "আবার চেষ্টা করুন" : t("common.retry") !== "common.retry" ? t("common.retry") : "Try again"}
      </button>
    </div>
  );
}

/** Renders children only when portfolio data is ready; skeleton/error otherwise. */
function DataGate({ children }: { children: ReactNode }) {
  const { status } = usePortfolioData();
  if (status === "loading") return <LoadingScreen />;
  if (status === "error") return <ErrorScreen />;
  return <>{children}</>;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPage = pageFromPath(pathname);
  const handleNavigate = useAppNavigation();

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

  // Real-route navigation always starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // Bridge for deep components (resume print header, service pages…) that
  // request navigation without a callback prop.
  useEffect(() => {
    const onNav = (e: Event) => {
      const page = (e as CustomEvent<string>).detail;
      if (typeof page === "string") handleNavigate(page);
    };
    window.addEventListener("app-navigate", onNav);
    return () => window.removeEventListener("app-navigate", onNav);
  }, [handleNavigate]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PortfolioDataProvider>
          <SiteIdentity />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SkipToContent onSkip={handleSkipToContent} />
            <ScrollProgress />
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

            <main className="flex-1 outline-none" id="main-content" tabIndex={-1}>
              <DataGate>
                <motion.div
                  key={pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </DataGate>
            </main>

            <Footer onNavigate={handleNavigate} />
            <BackToTop />
            <ChatbotWidget onAction={handleChatAction} />
          </div>
        </PortfolioDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
