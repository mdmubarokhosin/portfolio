/**
 * Central navigation model — real Next.js App Router routes.
 *
 * The old single-page hash router (#/home, #/about …) has been replaced by
 * genuine routes so every page is directly linkable, SSR-friendly and
 * SEO-indexable. Everything that needs to "go to a page" (navbar, footer,
 * chatbot actions, service pages) funnels through the helpers below.
 */

export const SITE_PAGES = [
  "home",
  "about",
  "skills",
  "projects",
  "experience",
  "youtube",
  "contact",
] as const;

export type SitePage = (typeof SITE_PAGES)[number];

/** Valid pages that a navigation request (chatbot, footer, …) may target. */
export const NAVIGABLE_PAGES: readonly string[] = [
  ...SITE_PAGES,
  "admin",
];

/** Site page id → real route path (admin lives on its own route). */
export function pagePath(page: string): string {
  switch (page) {
    case "home":
      return "/";
    case "admin":
      return "/admin";
    default:
      if ((SITE_PAGES as readonly string[]).includes(page)) return `/${page}`;
      return "/";
  }
}

/** Inverse: current pathname → page id ("" or unknown → "home"). */
export function pageFromPath(pathname: string | null | undefined): string {
  if (!pathname) return "home";
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return "home";
  const id = clean.slice(1);
  return NAVIGABLE_PAGES.includes(id) ? id : "";
}
