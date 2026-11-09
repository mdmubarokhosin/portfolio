"use client";

import PublicShell from "@/components/portfolio/PublicShell";
import ContactPage from "@/components/portfolio/ContactPage";
import { useAppNavigation } from "@/lib/use-app-navigation";

export default function ContactPageRouteClient() {
  const navigate = useAppNavigation();
  return (
    <PublicShell>
      <ContactPage onNavigate={navigate} />
    </PublicShell>
  );
}
