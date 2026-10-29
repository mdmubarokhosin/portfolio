import type { Metadata } from "next";
import SiteShell from "@/components/portfolio/SiteShell";
import LegalPage from "@/components/portfolio/pages/LegalPage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using MD Mubarok Hossain's portfolio website and engaging the offered services — scope, intellectual property, liability and contact.",
  alternates: { canonical: "/terms/" },
};

export default function TermsRoute() {
  return (
    <SiteShell>
      <LegalPage kind="terms" />
    </SiteShell>
  );
}
