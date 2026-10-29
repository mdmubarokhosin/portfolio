import type { Metadata } from "next";
import SiteShell from "@/components/portfolio/SiteShell";
import ServiceDetailPage from "@/components/portfolio/pages/ServiceDetailPage";
import { SERVICE_DETAIL } from "@/lib/service-pages";

export const runtime = "edge";

/**
 * Service detail pages:
 *   /Services/Web-Development  /Services/UI-UX-Design
 *   /Services/Responsive-Design  /Services/Performance-SEO
 *
 * Runs on the Edge Runtime (required by Cloudflare Pages via next-on-pages),
 * so every slug is resolved on demand — the page component resolves the slug
 * client-side from the Firebase-backed portfolio data, which also makes
 * admin-created services work automatically without a rebuild.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const curated = SERVICE_DETAIL[slug];
  const name = curated ? curated.slug.replace(/-/g, " ") : slug.replace(/-/g, " ");
  const pretty = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    title: `${pretty} — Service`,
    description:
      curated?.overview ??
      `Professional ${pretty} service by MD Mubarok Hossain — modern, fast and built with care.`,
    alternates: { canonical: `/Services/${slug}/` },
    openGraph: {
      title: `${pretty} — Service | Mubarok Hossain`,
      description: curated?.overview ?? `Professional ${pretty} service.`,
    },
  };
}

export default async function ServiceDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <SiteShell>
      <ServiceDetailPage slug={slug} />
    </SiteShell>
  );
}
