"use client";

/**
 * Navbar — pill bar on desktop, hamburger drawer on mobile.
 *
 * The mobile menu is a slide-in drawer (light/dark) matching the reference
 * design: logo + hamburger header, icon menu items with an active pill,
 * social row and language/theme controls at the bottom.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Moon, Sun, X, Youtube, Globe } from "lucide-react";
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

  // Lock body scroll + close on Escape while the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { personal, pages, socialLinks } = data;

  // Firebase-driven pages + a YouTube entry inserted before Contact
  const navItems = (() => {
    const items = [...pages];
    if (!items.some((p) => p.id === "youtube")) {
      const contactIndex = items.findIndex((p) => p.id === "contact");
      const yt = {
        id: "youtube",
        label: t("nav.youtube") !== "nav.youtube" ? t("nav.youtube") : "YouTube",
        labelBn: t("nav.youtube"),
        icon: "youtube",
      };
      if (contactIndex >= 0) items.splice(contactIndex, 0, yt);
      else items.push(yt);
    }
    return items;
  })();

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
          aria-label={personal.name || "Home"}
        >
          {personal.siteLogo ? (
            <img
              src={personal.siteLogo}
              alt={personal.name || "Logo"}
              className="h-9 w-9 rounded-lg object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30">
              {personal.initials || "M"}
            </span>
          )}
          <span className="text-lg font-bold tracking-tight">
            {isBn ? personal.firstNameBn || personal.firstName : personal.firstName}
            <span className="text-primary">.</span>
          </span>
        </button>

        {/* Desktop pill menu (lg+) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((page) => {
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
                  {page.id === "youtube" ? (
                    <Youtube className="h-4 w-4" />
                  ) : (
                    <Icon name={page.icon} className="h-4 w-4" />
                  )}
                  {isBn ? page.labelBn || page.label : page.label}
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

          {/* Hamburger (animated) — opens the drawer on < lg */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            aria-label={isBn ? (open ? "মেনু বন্ধ করুন" : "মেনু খুলুন") : open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <motion.span
                animate={open ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-0.5 w-full rounded-full bg-current"
              />
              <motion.span
                animate={open ? { opacity: 0, x: 6 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="block h-0.5 w-full rounded-full bg-current"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-0.5 w-full rounded-full bg-current"
              />
            </span>
          </button>
        </div>
      </nav>

      {/* ── Mobile hamburger drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="mobile-drawer"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={isBn ? "মেনু" : "Menu"}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-3 top-3 bottom-3 z-[70] flex w-[19rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              {/* Drawer header — logo + hamburger */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => handleNav("home")}
                  className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={personal.name || "Home"}
                >
                  {personal.siteLogo ? (
                    <img
                      src={personal.siteLogo}
                      alt=""
                      className="h-9 w-9 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30">
                      {personal.initials || "M"}
                    </span>
                  )}
                  <span className="text-base font-bold tracking-tight">
                    {isBn ? personal.firstNameBn || personal.firstName : personal.firstName}
                    <span className="text-primary">.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={isBn ? "মেনু বন্ধ করুন" : "Close menu"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex-1 overflow-y-auto px-4 pb-2" aria-label={isBn ? "মোবাইল মেনু" : "Mobile menu"}>
                <ul className="space-y-1">
                  {navItems.map((page, i) => {
                    const active = currentPage === page.id;
                    return (
                      <motion.li
                        key={page.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                      >
                        <button
                          onClick={() => handleNav(page.id)}
                          aria-current={active ? "page" : undefined}
                          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            active
                              ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                              active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {page.id === "youtube" ? (
                              <Youtube className="h-4 w-4" />
                            ) : (
                              <Icon name={page.icon} className="h-4 w-4" />
                            )}
                          </span>
                          <span className="flex-1 text-left">
                            {isBn ? page.labelBn || page.label : page.label}
                          </span>
                          {active && (
                            <motion.span
                              layoutId="drawer-active-dot"
                              className="h-2 w-2 rounded-full bg-primary"
                            />
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Drawer footer — socials + controls */}
              <div className="border-t border-border/60 px-5 py-4">
                <div className="flex items-center justify-center gap-2">
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
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {isBn ? "English" : "বাংলা"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    {isDark ? (isBn ? "লাইট" : "Light") : isBn ? "ডার্ক" : "Dark"}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
