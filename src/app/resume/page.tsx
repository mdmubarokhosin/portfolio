import type { Metadata } from "next";
import SiteShell from "@/components/portfolio/SiteShell";
import ResumePage from "@/components/portfolio/pages/ResumePage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Resume — MD Mubarok Hossain",
  description:
    "Printable résumé of MD Mubarok Hossain (মো. মোবারক হোসেন) — web developer from Bangladesh: experience, education, skills and certificates, generated live from the portfolio.",
  alternates: { canonical: "/resume/" },
};

export default function ResumeRoute() {
  return (
    <SiteShell>
      <ResumePage />
    </SiteShell>
  );
}
