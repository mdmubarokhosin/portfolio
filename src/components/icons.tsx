"use client";

import { createElement } from "react";
import {
  type LucideIcon,
  Home,
  User,
  Code2,
  Folder,
  Briefcase,
  Mail,
  Layers,
  Users,
  Globe,
  Palette,
  Smartphone,
  Zap,
  FileCode2,
  Braces,
  Server,
  Database,
  GitBranch,
  Grid3x3,
  Monitor,
  Wrench,
  Triangle,
  Cloud,
  Send,
  Bug,
  ShoppingCart,
  BarChart3,
  CheckSquare,
  FileText,
  Laptop,
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle2,
  Github,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  user: User,
  code: Code2,
  folder: Folder,
  briefcase: Briefcase,
  mail: Mail,
  layers: Layers,
  users: Users,
  globe: Globe,
  palette: Palette,
  smartphone: Smartphone,
  zap: Zap,
  filecode: FileCode2,
  braces: Braces,
  server: Server,
  database: Database,
  gitbranch: GitBranch,
  grid: Grid3x3,
  monitor: Monitor,
  wrench: Wrench,
  triangle: Triangle,
  cloud: Cloud,
  send: Send,
  bug: Bug,
  shoppingcart: ShoppingCart,
  barchart: BarChart3,
  checksquare: CheckSquare,
  filetext: FileText,
  laptop: Laptop,
  graduationcap: GraduationCap,
  "map-pin": MapPin,
  clock: Clock,
  checkcircle: CheckCircle2,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  figma: Palette,
};

/** Normalize icon names coming from Firebase (bootstrap/FontAwesome style) */
function normalizeIconName(raw: string): string {
  const name = (raw ?? "").toLowerCase().trim();
  return name
    .replace(/^(bi|fa|fas|far|mdi|ri)-/, "")
    .replace(/^(globe2|globe-americas|global)$/, "globe")
    .replace(/^(code-slash|codeblock)$/, "code")
    .replace(/^(briefcase-fill|work)$/, "briefcase")
    .replace(/^(envelope|email)$/, "mail")
    .replace(/^(send-fill|paper-plane)$/, "send")
    .replace(/^(chat|chat-dots|message)$/, "messagecircle")
    .replace(/^(telephone|phone-fill)$/, "smartphone")
    .replace(/^(pin|geo-alt|geo)$/, "map-pin")
    .replace(/^(mortarboard)$/, "graduationcap")
    .replace(/^(award|patch-check)$/, "checkcircle")
    .replace(/^(clock-history|watch)$/, "clock")
    .replace(/^(graph-up|bar-chart)$/, "barchart")
    .replace(/^(cart|cart-check)$/, "shoppingcart")
    .replace(/^(file-earmark-code|file-earmark)$/, "filecode")
    .replace(/^(terminal|terminal-fill)$/, "filecode")
    .replace(/^(github|github-logo)$/, "github")
    .replace(/^(linkedin|linkedin-logo)$/, "linkedin")
    .replace(/^(twitter-x)$/, "twitter")
    .replace(/^(brush|brush-fill)$/, "palette")
    .replace(/^(lightning-charge|lightning|bolt)$/, "zap")
    .replace(/^(phone|phone-vibrate)$/, "smartphone")
    .replace(/^(person|person-fill)$/, "user")
    .replace(/^(house|house-door)$/, "home")
    .replace(/^(wrench|hammer)$/, "wrench")
    .replace(/^(shield-check|shield)$/, "checkcircle");
}

/** Choices for the Admin Panel visual icon picker */
export const ICON_CHOICES: { value: string; label: string }[] = [
  "home", "user", "code", "folder", "briefcase", "mail", "layers", "users",
  "globe", "palette", "smartphone", "zap", "filecode", "braces", "server",
  "database", "gitbranch", "grid", "monitor", "wrench", "triangle", "cloud",
  "send", "bug", "shoppingcart", "barchart", "checksquare", "filetext",
  "laptop", "graduationcap", "map-pin", "clock", "checkcircle",
  "github", "linkedin", "facebook", "twitter", "instagram", "youtube",
  "messagecircle", "figma",
].map((value) => ({ value, label: value }));

export function getIcon(name: string): LucideIcon {
  return iconMap[normalizeIconName(name)] ?? Code2;
}

export function Icon({
  name,
  className,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(getIcon(name), { className, strokeWidth, "aria-hidden": true });
}
