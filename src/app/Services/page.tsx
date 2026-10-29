import type { Metadata } from "next";
import SiteShell from "@/components/portfolio/SiteShell";
import ServicesIndexPage from "@/components/portfolio/pages/ServicesIndexPage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Services — Web Development, UI/UX, Responsive Design & SEO",
  description:
    "Explore the services offered by MD Mubarok Hossain: web development with React & Next.js, UI/UX design, responsive layouts and performance & SEO optimisation.",
  alternates: { canonical: "/Services/" },
};

export default function ServicesIndexRoute() {
  return (
    <SiteShell>
      <ServicesIndexPage />
    </SiteShell>
  );
}
