"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Menu, X, Languages } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { isBn, toggleLanguage } = useLanguage();
  const { data: portfolioData } = usePortfolioData();
  const navItems = Array.isArray(portfolioData.pages)
    ? portfolioData.pages.filter((p) => p.id !== "resume")
    : [];
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          {portfolioData.personal?.siteLogo ? (
            <img
              src={portfolioData.personal.siteLogo}
              alt="Logo"
              className="h-9 w-9 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
              {portfolioData.personal?.initials || "M"}
            </div>
          )}
          <span className="font-bold text-lg tracking-tight break-words" suppressHydrationWarning>
            {isBn
              ? (portfolioData.personal?.firstNameBn || portfolioData.personal?.firstName || "")
              : (portfolioData.personal?.firstName || "")}
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                currentPage === item.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {isBn ? item.labelBn : item.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{isBn ? "EN" : "বাংলা"}</span>
          </button>

          {/* Theme toggle with amber icons */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-accent transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNav(item.id)}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {isBn ? item.labelBn : item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
