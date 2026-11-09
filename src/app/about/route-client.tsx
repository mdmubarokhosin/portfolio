"use client";

import PublicShell from "@/components/portfolio/PublicShell";
import AboutPage from "@/components/portfolio/AboutPage";
import { useAppNavigation } from "@/lib/use-app-navigation";

export default function AboutPageRouteClient() {
  const navigate = useAppNavigation();
  return (
    <PublicShell>
      <AboutPage onNavigate={navigate} />
    </PublicShell>
  );
}
