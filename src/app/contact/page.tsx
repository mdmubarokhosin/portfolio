import type { Metadata } from "next";
import ContactPageRouteClient from "./route-client";

export const metadata: Metadata = {
  title: "Contact — Let's Build Something Together",
  description: "Get in touch with MD Mubarok Hossain for projects, collaborations or questions.",
};

export default function ContactPageRoute() {
  return <ContactPageRouteClient />;
}
