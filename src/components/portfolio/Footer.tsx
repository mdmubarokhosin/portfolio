"use client";

import { Github, Linkedin, Facebook, Twitter, MessageCircle, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";

const socialIcons: Record<string, React.ReactNode> = {
  GitHub: <Github className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  Facebook: <Facebook className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  WhatsApp: <MessageCircle className="h-4 w-4" />,
};

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { isBn, t } = useLanguage();
  const { data: portfolioData } = usePortfolioData();

  const personal = portfolioData?.personal;
  const navPages = Array.isArray(portfolioData?.pages)
    ? portfolioData.pages.filter((p) => p.id !== "resume")
    : [];

  return (
    <footer className="mt-auto">
      {/* Brand Banner */}
      <div className="relative py-12 sm:py-16 bg-primary">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {personal?.siteLogo ? (
              <img
                src={personal.siteLogo}
                alt="Logo"
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 font-bold text-white text-sm">
                {personal?.initials || "M"}
              </div>
            )}
            <span className="text-2xl font-bold text-white break-words">
              {isBn ? (personal?.firstNameBn || personal?.firstName) : (personal?.firstName || "")}
            </span>
          </div>
          <p className="text-primary-foreground/80 mb-6 break-words">
            {isBn ? (personal?.titleBn || personal?.title) : (personal?.title || "")}
          </p>
          <div className="flex justify-center gap-3">
            {(portfolioData.socialLinks || []).map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label={social.name}
              >
                {socialIcons[social.name] || <Github className="h-4 w-4" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Column Grid */}
      <div className="border-t border-border py-10 sm:py-12 bg-card">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* About Column */}
            <div>
              <h3 className="font-semibold mb-4 break-words">{t("about.aboutMe")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {isBn ? (personal?.bio?.shortBn || personal?.bio?.short) : (personal?.bio?.short || "")}
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="font-semibold mb-4 break-words">{t("footer.pages")}</h3>
              <ul className="space-y-2">
                {navPages.map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => {
                        onNavigate(page.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer break-words"
                    >
                      {isBn ? page.labelBn : page.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="font-semibold mb-4 break-words">{t("footer.services")}</h3>
              <ul className="space-y-2">
                {(portfolioData.services || []).map((service, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        onNavigate("about");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer break-words"
                    >
                      {isBn ? service.titleBn : service.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info Column */}
            <div>
              <h3 className="font-semibold mb-4 break-words">{t("footer.contact")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="break-all">{personal?.email || ""}</li>
                <li className="break-words">{personal?.phone || ""}</li>
                <li className="break-words">{isBn ? (personal?.location || personal?.locationEn) : (personal?.locationEn || personal?.location || "")}</li>
                <li className="break-words">{t("footer.workingHours")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border py-5 bg-card">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p className="text-center sm:text-left break-words">
            &copy; {new Date().getFullYear()}{" "}
            {isBn ? (personal?.nameBn || personal?.name) : (personal?.name || "")}.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <p className="flex items-center gap-1">
            {t("footer.craftedin")} <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> {t("footer.in")} {isBn ? "বাংলাদেশ" : "Bangladesh"}
          </p>
        </div>
      </div>
    </footer>
  );
}
