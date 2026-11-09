import type { Metadata } from "next";
import SkillsPageRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Skills — React, Next.js, TypeScript & More",
  description: "Technologies and tools MD Mubarok Hossain works with every day.",
};

export default function SkillsPageRoute() {
  return <SkillsPageRouteClient />;
}
