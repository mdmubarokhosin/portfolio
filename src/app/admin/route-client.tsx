"use client";

import AdminPage from "@/components/portfolio/admin/AdminPage";
import { PortfolioDataProvider } from "@/context/PortfolioDataContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdminProvider } from "@/context/AdminContext";
import { useAppNavigation } from "@/lib/use-app-navigation";

/**
 * /admin — full-screen CMS with its own layout (no public chrome),
 * exactly like the old hash page but on a real route.
 */
export default function AdminRouteClient() {
  const navigate = useAppNavigation();
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PortfolioDataProvider>
          <AdminProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AdminPage onExit={() => navigate("home")} />
            </div>
          </AdminProvider>
        </PortfolioDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
