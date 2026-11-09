import type { Metadata } from "next";
import AdminRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default function AdminRoute() {
  return <AdminRouteClient />;
}
