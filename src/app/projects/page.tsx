import type { Metadata } from "next";
import ProjectsPageRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Projects — Web Apps, Dashboards & Platforms",
  description: "Selected projects built by MD Mubarok Hossain — live demos and source code.",
};

export default function ProjectsPageRoute() {
  return <ProjectsPageRouteClient />;
}
