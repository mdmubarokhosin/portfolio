import type { Metadata } from "next";
import HomeRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Mubarok Hossain — Web Developer",
  description:
    "Bilingual developer portfolio — MD Mubarok Hossain (মো. মোবারক হোসেন). React, Next.js, TypeScript and modern web experiences.",
  alternates: { canonical: "/" },
};

export default function HomeRoute() {
  return <HomeRouteClient />;
}
