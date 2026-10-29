import type { Metadata } from "next";
import SiteShell from "@/components/portfolio/SiteShell";
import LegalPage from "@/components/portfolio/pages/LegalPage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How MD Mubarok Hossain's portfolio collects, uses and protects information — contact messages (Firebase), local preferences and visitor statistics.",
  alternates: { canonical: "/privacy-policy/" },
};

export default function PrivacyPolicyRoute() {
  return (
    <SiteShell>
      <LegalPage kind="privacy" />
    </SiteShell>
  );
}
