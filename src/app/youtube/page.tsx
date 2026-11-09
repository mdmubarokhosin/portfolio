import type { Metadata } from "next";
import YouTubeRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "YouTube Channel",
  description:
    "Videos, tutorials and projects from MD Mubarok Hossain's YouTube channel — loaded automatically from the channel feed.",
  alternates: { canonical: "/youtube" },
};

export default function YouTubeRoute() {
  return <YouTubeRouteClient />;
}
