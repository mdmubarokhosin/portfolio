"use client";

import PublicShell from "@/components/portfolio/PublicShell";
import ProjectsPage from "@/components/portfolio/ProjectsPage";
import { useAppNavigation } from "@/lib/use-app-navigation";

export default function ProjectsPageRouteClient() {
  const navigate = useAppNavigation();
  return (
    <PublicShell>
      <ProjectsPage onNavigate={navigate} />
    </PublicShell>
  );
}
