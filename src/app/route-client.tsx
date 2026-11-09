"use client";

import PublicShell from "@/components/portfolio/PublicShell";
import HomePage from "@/components/portfolio/HomePage";
import { useAppNavigation } from "@/lib/use-app-navigation";

export default function HomeRouteClient() {
  const navigate = useAppNavigation();
  return (
    <PublicShell>
      <HomePage onNavigate={navigate} />
    </PublicShell>
  );
}
