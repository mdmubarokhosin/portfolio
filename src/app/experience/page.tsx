import type { Metadata } from "next";
import ExperiencePageRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Experience & Education",
  description: "Work experience and education timeline of MD Mubarok Hossain.",
};

export default function ExperiencePageRoute() {
  return <ExperiencePageRouteClient />;
}
