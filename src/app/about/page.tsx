import type { Metadata } from "next";
import AboutPageRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "About — MD Mubarok Hossain",
  description: "Get to know MD Mubarok Hossain — a passionate web developer from Bangladesh.",
};

export default function AboutPageRoute() {
  return <AboutPageRouteClient />;
}
