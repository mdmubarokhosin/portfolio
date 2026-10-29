"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { isBn, t, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { data } = usePortfolioData();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { personal, pages, socialLinks } = data;

  const handleNav = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/80 shadow-sm shadow-primary/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label={isBn ? "প্রধান নেভিগেশন" : "Main navigation"}
      >
        {/* Logo */}
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={personal.name}
        >
          {personal.siteLogo ? (
             
            <img
              src={personal.siteLogo}
              alt={personal.name}
              className="h-9 w-9 rounded-lg object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30">
              {personal.initials}
            </span>
          )}
          <span className="text-lg font-bold tracking-tight">
            {isBn ? personal.firstNameBn ?? personal.firstName : personal.firstName}
            <span className="text-primary">.</span>
          </span>
        </button>

        {/* Desktop menu (lg+ — 6 items + controls need ≥1024px) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {pages.map((page) => {
            const active = currentPage === page.id;
            return (
              <li key={page.id}>
                <button
                  onClick={() => handleNav(page.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon name={page.icon} className="h-4 w-4" />
                  {isBn ? page.labelBn ?? page.label : page.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 gap-1.5 px-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            aria-label={isBn ? "Switch to English" : "বাংলায় দেখুন"}
          >
            <Languages className="h-4 w-4" />
            <span>{isBn ? "EN" : "বাংলা"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-primary"
            aria-label={
              isBn
                ? isDark
                  ? "লাইট মোডে সুইচ করুন"
                  : "ডার্ক মোডে সুইচ করুন"
                : isDark
                  ? "Switch to light mode"
                  : "Switch to dark mode"
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={
              isBn ? (open ? "মেনু বন্ধ করুন" : "মেনু খুলুন") : open ? "Close menu" : "Open menu"
            }
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {pages.map((page, i) => {
                const active = currentPage === page.id;
                return (
                  <motion.li
                    key={page.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => handleNav(page.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon name={page.icon} className="h-4.5 w-4.5" />
                      {isBn ? page.labelBn ?? page.label : page.label}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <div className="flex items-center justify-center gap-2 border-t border-border/60 px-4 py-3">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <Icon name={s.icon} className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
