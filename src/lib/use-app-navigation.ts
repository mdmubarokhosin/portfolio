"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { pagePath } from "@/lib/navigation";

/** Router-based page navigation shared by navbar, footer, pages, chatbot. */
export function useAppNavigation() {
  const router = useRouter();
  return useCallback(
    (page: string) => {
      const target = pagePath(page);
      if (typeof window !== "undefined" && target !== window.location.pathname) {
        router.push(target);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router]
  );
}
