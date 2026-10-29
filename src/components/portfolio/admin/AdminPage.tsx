"use client";

/**
 * AdminPage — the Firebase CMS control center.
 *
 *  • Dashboard          — live KPIs + Chart.js bar / doughnut / radar charts
 *  • Content editors    — see AdminEditors.tsx (all fully functional)
 *  • Messages           — search, filter, bulk actions, export JSON/CSV
 *  • Site Settings      — identity (logo upload, titles, SEO), theme colors,
 *                         chatbot, AI provider, Telegram, custom font
 *  • Backup & Sync      — full database control center: size charts,
 *                         per-section download/reset/delete, restore with
 *                         options, cleanup scanner
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AtSign,
  BarChart3,
  Boxes,
  Braces,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GraduationCap,
  HardDrive,
  Home,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Palette,
  PenLine,
  Phone,
  PieChart,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/context/AdminContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import {
  backupAll,
  cleanupDeleteKey,
  cleanupScan,
  deleteContactMessage,
  fetchContactMessages,
  fetchVisitors,
  markMessageRead,
  resetSectionToSeed,
  resetVisitors,
  restoreBackup,
  savePortfolioSection,
  saveSetting,
  seedData,
  seedMissingSections,
  syncAllSections,
  SECTION_KEYS,
  type BackupBundle,
  type CleanupReport,
  type ContactMessage,
  type PortfolioSectionKey,
  type SiteSettings,
} from "@/lib/portfolio-store";
import { changeAdminEmail, dbGet, dbRemove } from "@/lib/firebase";
import { AreaField, ColorField, EditorCard, Field, SwitchField } from "./admin-bits";
import {
  MessagesDoughnut,
  SectionItemsChart,
  SectionSizeChart,
  SkillsRadarChart,
  StorageDoughnut,
  fmtKB,
} from "./admin-charts";
import {
  CertificatesEditor,
  ContactInfoEditor,
  EducationEditor,
  ExperiencesEditor,
  FaqEditor,
  PagesEditor,
  PersonalEditor,
  ProjectsEditor,
  ServicesEditor,
  SkillsEditor,
  SocialLinksEditor,
  StatsEditor,
  TestimonialsEditor,
} from "./AdminEditors";

/* ──────────────────────────────────────────────────────────────── */

type AdminTab =
  | "dashboard"
  | "personal"
  | "stats"
  | "pages"
  | "services"
  | "skills"
  | "projects"
  | "experiences"
  | "education"
  | "testimonials"
  | "certificates"
  | "faq"
  | "contactInfo"
  | "socialLinks"
  | "messages"
  | "settings"
  | "backup";

const NAV: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "personal", label: "Personal & Hero", icon: User, group: "Content" },
  { id: "stats", label: "Stats", icon: BarChart3, group: "Content" },
  { id: "pages", label: "Navigation", icon: FolderTree, group: "Content" },
  { id: "services", label: "Services", icon: Wrench, group: "Content" },
  { id: "skills", label: "Skills", icon: Braces, group: "Content" },
  { id: "projects", label: "Projects", icon: Boxes, group: "Content" },
  { id: "experiences", label: "Experience", icon: FileText, group: "Content" },
  { id: "education", label: "Education", icon: GraduationCap, group: "Content" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote, group: "Content" },
  { id: "certificates", label: "Certificates", icon: ShieldCheck, group: "Content" },
  { id: "faq", label: "FAQ", icon: AtSign, group: "Content" },
  { id: "contactInfo", label: "Contact Info", icon: Phone, group: "Communication" },
  { id: "socialLinks", label: "Social Links", icon: Home, group: "Communication" },
  { id: "messages", label: "Messages", icon: Inbox, group: "Communication" },
  { id: "settings", label: "Site Settings", icon: Settings, group: "System" },
  { id: "backup", label: "Backup & Sync", icon: HardDrive, group: "System" },
];

const SECTION_LABELS: Record<PortfolioSectionKey, string> = {
  personal: "Personal & Hero",
  stats: "Stats",
  pages: "Navigation",
  socialLinks: "Social Links",
  services: "Services",
  skills: "Skills",
  skillCategories: "Skill Categories",
  additionalTools: "Additional Tools",
  projects: "Projects",
  projectCategories: "Project Categories",
  experiences: "Experience",
  education: "Education",
  testimonials: "Testimonials",
  certificates: "Certificates",
  faq: "FAQ",
  contactInfo: "Contact Info",
};

/* ═══════════════ LOGIN ═══════════════ */
function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await login(email, password);
    if (!result.ok) {
      setError(
        result.error === "role"
          ? "এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই / Admin role required"
          : "ভুল ইমেইল বা পাসওয়ার্ড / Invalid email or password"
      );
    }
    setBusy(false);
  };

  return (
    <div className="hero-gradient relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-24">
      {/* Decorative gradient blobs — same language as the site hero */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />

      <Card className="relative w-full max-w-md rounded-3xl border-border/70 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="animate-pulse-glow mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-500 text-2xl font-black text-primary-foreground shadow-lg shadow-primary/30">
              MMH
            </div>
            <h1 className="text-xl font-bold">
              <span className="gradient-text">Admin Panel</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Firebase দিয়ে সাইটের সব কনটেন্ট নিয়ন্ত্রণ করুন
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mubarok.com"
                  className="h-11 rounded-xl bg-background pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-background pl-10"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-primary to-teal-500 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
            >
              {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            অ্যাকাউন্ট Firebase `users` নোড থেকে যাচাই হয়
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════ DASHBOARD ═══════════════ */
function Dashboard({ onGo, unread }: { onGo: (tab: AdminTab) => void; unread: number }) {
  const { data, source, lastSync, refresh } = usePortfolioData();
  const { user, changePassword } = useAdmin();
  const [visitors, setVisitors] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [em, setEm] = useState({ current: "", next: "" });
  const [emBusy, setEmBusy] = useState(false);
  const [msgStats, setMsgStats] = useState<{ read: number; unread: number }>({ read: 0, unread: 0 });

  useEffect(() => {
    fetchVisitors().then(setVisitors).catch(() => undefined);
  }, [lastSync]);

  useEffect(() => {
    fetchContactMessages()
      .then((list) => setMsgStats({
        read: list.filter((m) => m.read).length,
        unread: list.filter((m) => !m.read).length,
      }))
      .catch(() => undefined);
  }, [lastSync, unread]);

  const doSeed = async () => {
    setSeeding(true);
    try {
      const n = await seedMissingSections();
      await refresh();
      toast.success(n ? `${n} sections seeded to Firebase` : "Firebase already complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const doPw = async () => {
    if (pw.next !== pw.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setPwBusy(true);
    const result = await changePassword(pw.current, pw.next);
    if (result.ok) {
      toast.success("Password updated ✓");
      setPw({ current: "", next: "", confirm: "" });
    } else {
      toast.error(
        result.error === "short"
          ? "Password must be at least 6 characters"
          : result.error === "wrong"
            ? "Current password is incorrect"
            : "Failed to update"
      );
    }
    setPwBusy(false);
  };

  const doEmail = async () => {
    if (!user) return;
    setEmBusy(true);
    const result = await changeAdminEmail(user.email, em.current, em.next);
    if (result.ok) {
      toast.success("Email updated ✓ — পরেরবার নতুন ইমেইল দিয়ে লগইন করুন");
      setEm({ current: "", next: "" });
    } else {
      toast.error(
        result.error === "format"
          ? "Invalid email format"
          : result.error === "wrong"
            ? "Current password is incorrect"
            : result.error === "taken"
              ? "An account with this email already exists"
              : "Failed to update"
      );
    }
    setEmBusy(false);
  };

  const sectionCounts: { label: string; value: number }[] = [
    { label: "Services", value: data.services.length },
    { label: "Skills", value: data.skills.length },
    { label: "Projects", value: data.projects.length },
    { label: "Experience", value: data.experiences.length },
    { label: "Education", value: data.education.length },
    { label: "Testimonials", value: data.testimonials.length },
    { label: "Certificates", value: data.certificates.length },
    { label: "FAQ", value: data.faq.length },
  ];

  const cards = [
    { label: "Visitors", value: visitors.toLocaleString(), icon: Eye, accent: "bg-gradient-to-br from-primary/20 to-primary/5 text-primary", tab: "dashboard" as AdminTab },
    { label: "Unread", value: String(unread), icon: Inbox, accent: "bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600", tab: "messages" as AdminTab },
    { label: "Projects", value: String(data.projects.length), icon: Boxes, accent: "bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-600", tab: "projects" as AdminTab },
    { label: "Skills", value: String(data.skills.length), icon: Braces, accent: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-600", tab: "skills" as AdminTab },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards — clickable */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onGo(c.tab)}
            className="text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            aria-label={`${c.label}: ${c.value}`}
          >
            <Card className="card-glow rounded-2xl border-border/70 bg-card transition-transform hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${c.accent}`}>
                  <c.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Firebase status */}
      <Card className="rounded-2xl border-border/70 bg-card">
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Firebase Status</h2>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  source === "firebase"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : source === "offline"
                      ? "bg-red-500/10 text-red-600"
                      : ""
                }
              >
                {source === "firebase" ? "● Live — data loads from Firebase" : source === "offline" ? "○ Offline fallback" : "… connecting"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => refresh()} className="rounded-lg">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Last sync: {lastSync ? lastSync.toLocaleTimeString() : "—"} · Database:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">md-mubarok-hossain</code> · Signed in as{" "}
            <strong>{user?.email}</strong>
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => onGo("messages")} className="rounded-lg bg-primary text-primary-foreground">
              <Inbox className="mr-1.5 h-4 w-4" /> Messages inbox
            </Button>
            <Button size="sm" variant="outline" onClick={doSeed} disabled={seeding} className="rounded-lg">
              {seeding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
              Seed missing sections
            </Button>
            <Button size="sm" variant="outline" onClick={() => onGo("backup")} className="rounded-lg">
              <HardDrive className="mr-1.5 h-4 w-4" /> Backup &amp; sync
            </Button>
            <Button size="sm" variant="outline" onClick={() => onGo("settings")} className="rounded-lg">
              <Palette className="mr-1.5 h-4 w-4" /> Site settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart.js charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Items per portfolio section</h2>
              <Badge variant="secondary" className="ml-auto text-[10px]">Chart.js</Badge>
            </div>
            <SectionItemsChart entries={sectionCounts} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Messages overview</h2>
              <Badge variant="secondary" className="ml-auto text-[10px]">Chart.js</Badge>
            </div>
            <MessagesDoughnut read={msgStats.read} unread={msgStats.unread} />
            <Button size="sm" variant="outline" onClick={() => onGo("messages")} className="mt-4 w-full rounded-lg">
              <Inbox className="mr-1.5 h-3.5 w-3.5" /> Open inbox
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Braces className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Top skills radar</h2>
              <Badge variant="secondary" className="ml-auto text-[10px]">Chart.js</Badge>
            </div>
            <SkillsRadarChart skills={data.skills.map((s) => ({ name: s.name, level: s.level }))} height={280} />
          </CardContent>
        </Card>

        {/* quick jump grid */}
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Quick jump</h2>
            </div>
            <div className="grid max-h-[280px] grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-thin">
              {NAV.filter((n) => n.id !== "dashboard").map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onGo(n.id)}
                  className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50 hover:text-foreground"
                >
                  <n.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{n.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* account management */}
      <Card className="rounded-2xl border-border/70 bg-card">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <h2 className="font-bold">Change password</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="h-10 rounded-lg bg-background" autoComplete="current-password" />
            <Input type="password" placeholder="New password (min 6)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="h-10 rounded-lg bg-background" autoComplete="new-password" />
            <Input type="password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="h-10 rounded-lg bg-background" autoComplete="new-password" />
          </div>
          <Button onClick={doPw} disabled={pwBusy || !pw.current || !pw.next} className="rounded-lg bg-gradient-to-r from-primary to-teal-500 text-primary-foreground shadow-md shadow-primary/25">
            {pwBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Update password
          </Button>
          <p className="text-xs text-muted-foreground">পাসওয়ার্ড salted SHA-256 হিসেবে Firebase-এ সংরক্ষিত হয়।</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 bg-card">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary">
              <AtSign className="h-4.5 w-4.5" />
            </span>
            <h2 className="font-bold">Change admin email</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="password" placeholder="Current password" value={em.current} onChange={(e) => setEm({ ...em, current: e.target.value })} className="h-10 rounded-lg bg-background" autoComplete="current-password" />
            <Input type="email" placeholder="New email" value={em.next} onChange={(e) => setEm({ ...em, next: e.target.value })} className="h-10 rounded-lg bg-background sm:col-span-2" autoComplete="email" />
          </div>
          <Button onClick={doEmail} disabled={emBusy || !em.current || !em.next} className="rounded-lg bg-gradient-to-r from-primary to-teal-500 text-primary-foreground shadow-md shadow-primary/25">
            {emBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AtSign className="mr-2 h-4 w-4" />}
            Update email
          </Button>
          <p className="text-xs text-muted-foreground">বর্তমান: {user?.email} — পরিবর্তনের জন্য বর্তমান পাসওয়ার্ড লাগবে।</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════ MESSAGES — power inbox ═══════════════ */
type MsgFilter = "all" | "unread" | "read";

function MessagesInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MsgFilter>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await fetchContactMessages());
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notifyChange = () => window.dispatchEvent(new Event("mmh-messages-updated"));

  const openMessage = async (msg: ContactMessage) => {
    setOpenId(openId === msg.id ? null : msg.id);
    if (!msg.read) {
      await markMessageRead(msg.id);
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
      notifyChange();
    }
  };

  const removeMessage = async (id: string) => {
    if (!window.confirm("Delete this message permanently?")) return;
    await deleteContactMessage(id);
    setMessages((list) => list.filter((m) => m.id !== id));
    notifyChange();
    toast.success("Message deleted");
  };

  const markAllRead = async () => {
    const unreadList = messages.filter((m) => !m.read);
    if (unreadList.length === 0) {
      toast.info("All messages are already read");
      return;
    }
    if (!window.confirm(`Mark ${unreadList.length} message(s) as read?`)) return;
    await Promise.all(unreadList.map((m) => markMessageRead(m.id)));
    setMessages((list) => list.map((m) => ({ ...m, read: true })));
    notifyChange();
    toast.success(`${unreadList.length} message(s) marked as read ✓`);
  };

  const deleteRead = async () => {
    const readList = messages.filter((m) => m.read);
    if (readList.length === 0) {
      toast.info("No read messages to delete");
      return;
    }
    if (!window.confirm(`Permanently delete ${readList.length} read message(s)?`)) return;
    await Promise.all(readList.map((m) => deleteContactMessage(m.id)));
    setMessages((list) => list.filter((m) => !m.read));
    notifyChange();
    toast.success(`${readList.length} read message(s) deleted`);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Messages exported as JSON");
  };

  const downloadCsv = () => {
    const esc = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["name", "email", "subject", "budget", "read", "createdAt", "message"].join(","),
      ...messages.map((m) =>
        [m.name, m.email, m.subject, m.budget ?? "", String(m.read), m.createdAt, m.message].map(esc).join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Messages exported as CSV");
  };

  const budgetLabels: Record<string, string> = {
    under500: "Under $500",
    "500to2000": "$500 – $2000",
    "2000to5000": "$2000 – $5000",
    above5000: "$5000+",
  };

  const counts = {
    all: messages.length,
    unread: messages.filter((m) => !m.read).length,
    read: messages.filter((m) => m.read).length,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === "unread" && m.read) return false;
      if (filter === "read" && !m.read) return false;
      if (!q) return true;
      return `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q);
    });
  }, [messages, filter, query]);

  return (
    <Card className="rounded-2xl border-border/70 bg-card">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Contact Messages</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={load} className="rounded-lg">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reload
            </Button>
            <Button size="sm" variant="outline" onClick={downloadJson} disabled={!messages.length} className="rounded-lg">
              <FileJson className="mr-1.5 h-3.5 w-3.5" /> JSON
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCsv} disabled={!messages.length} className="rounded-lg">
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        {/* filter tabs + search + bulk */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border/70 bg-secondary/40 p-1">
            {(["all", "unread", "read"] as MsgFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>
          <div className="relative min-w-40 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, subject, message…"
              className="h-9 rounded-lg bg-background pl-9 text-sm"
              aria-label="Search messages"
            />
          </div>
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={!counts.unread} className="rounded-lg">
            <Mail className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
          <Button size="sm" variant="outline" onClick={deleteRead} disabled={!counts.read} className="rounded-lg text-red-600">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete read
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
            {query || filter !== "all"
              ? "কোনো মেসেজ মেলেনি — search বা filter বদলে দেখুন।"
              : "এখনো কোনো মেসেজ আসেনি — কন্টাক্ট ফর্ম থেকে পাঠানো মেসেজ সরাসরি Firebase-এ জমা হবে।"}
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border transition-colors ${
                  msg.read ? "border-border/60 bg-card" : "border-primary/40 bg-accent/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openMessage(msg)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {!msg.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <span className="truncate">{msg.subject || "(no subject)"}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {msg.name} · {msg.email} · {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {msg.budget && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {budgetLabels[msg.budget] ?? msg.budget}
                    </Badge>
                  )}
                </button>
                {openId === msg.id && (
                  <div className="border-t border-border/60 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-lg bg-primary text-primary-foreground"
                        onClick={() =>
                          window.open(
                            `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`,
                            "_blank"
                          )
                        }
                      >
                        <Mail className="mr-1.5 h-3.5 w-3.5" /> Reply
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-red-600" onClick={() => removeMessage(msg.id)}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════ SETTINGS ═══════════════ */
const THEME_PRESETS = ["#06b6d4", "#14b8a6", "#10b981", "#84cc16", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#a855f7", "#6366f1"];

function SettingsPanel() {
  const { settings, data, refresh } = usePortfolioData();
  const [draft, setDraft] = useState<SiteSettings>({});
  const [logoDraft, setLogoDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dirty) return; // never clobber edits in progress when Firebase polls land
    setDraft({ ...settings });
    setLogoDraft(data.personal.siteLogo ?? "");
  }, [settings, data.personal.siteLogo, dirty]);

  const set = (key: string, value: string) => {
    setDirty(true);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const onLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (png/jpg/svg/webp)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (dataUrl.length > 400_000) {
        toast.error("ছবিটি খুব বড় (max ~250 KB) — ছোট ছবি ব্যবহার করুন বা URL দিন");
        return;
      }
      setLogoDraft(dataUrl);
      setDirty(true);
      toast.success("Logo loaded — Save to Firebase চাপুন");
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const keys = [
        "site_name", "site_description", "seo_keywords", "og_image", "footer_text",
        "theme_primary_color", "theme_accent_color",
        "chatbot_enabled", "chatbot_name", "chatbot_system_prompt",
        "chatbot_provider", "chatbot_model", "chatbot_apiKey", "chatbot_base_url",
        "chatbot_welcomeMessage", "chatbot_welcomeMessageBn",
        "chatbot_placeholder", "chatbot_placeholderBn",
        "chatbot_maxTokens", "chatbot_temperature",
        "telegram_bot_token", "telegram_chat_id",
        "custom_font_url", "custom_font_family",
      ];
      for (const key of keys) {
        // skip unchanged keys — saves only the deltas (much faster)
        if ((draft[key] ?? "") === (settings[key] ?? "")) continue;
        await saveSetting(key, draft[key] ?? "");
      }
      // Site logo lives in the personal section (same field the old site used)
      if ((data.personal.siteLogo ?? "") !== logoDraft) {
        await savePortfolioSection("personal", { ...data.personal, siteLogo: logoDraft });
      }
      await refresh();
      setDirty(false);
      toast.success("Settings saved to Firebase ✓ — title, logo, SEO ও থিম কালার সাথে সাথে প্রয়োগ হয়েছে");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const primary = draft.theme_primary_color ?? "";
  const accent = draft.theme_accent_color ?? "";

  return (
    <div>
      {/* ─── Site Identity ─── */}
      <EditorCard icon={Palette}>
        <h2 className="text-lg font-bold">
          Site Identity <span className="gradient-text">— Logo, Title &amp; SEO</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          ব্রাউজার ট্যাব টাইটেল, SEO, লোগো (upload বা URL), OG image, footer text — Save করলেই পুরো সাইটে প্রয়োগ হয়।
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Site name (browser tab title)"
            value={draft.site_name ?? ""}
            onChange={(v) => set("site_name", v)}
            placeholder="MD Mubarok Hossain — Portfolio"
            hint="ফাঁকা রাখলে ডিফল্ট টাইটেল ব্যবহৃত হবে"
          />
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Site logo</Label>
            <div className="flex gap-2">
              <Input
                value={logoDraft.startsWith("data:") ? "(uploaded image)" : logoDraft}
                onChange={(e) => {
                  setDirty(true);
                  setLogoDraft(e.target.value);
                }}
                placeholder="https://.../logo.png"
                className="h-10 flex-1 rounded-lg bg-background"
                readOnly={logoDraft.startsWith("data:")}
              />
              <Button variant="outline" className="h-10 shrink-0 rounded-lg" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1.5 h-4 w-4" /> Upload
              </Button>
              {logoDraft && (
                <Button variant="outline" className="h-10 shrink-0 rounded-lg text-red-600" onClick={() => setLogoDraft("")} aria-label="Clear logo">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onLogoFile(f);
                e.target.value = "";
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Navbar + Footer + favicon — ফাঁকা রাখলে initials দেখাবে
            </p>
          </div>
        </div>
        <AreaField label="Site description (SEO meta)" value={draft.site_description ?? ""} onChange={(v) => set("site_description", v)} rows={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO keywords (comma separated)" value={draft.seo_keywords ?? ""} onChange={(v) => set("seo_keywords", v)} hint="web developer, react, next.js, bangladesh" />
          <Field label="Social share image (og:image URL)" value={draft.og_image ?? ""} onChange={(v) => set("og_image", v)} hint="1200×630 PNG ভালো কাজ করে" />
          <Field label="Footer text" value={draft.footer_text ?? ""} onChange={(v) => set("footer_text", v)} hint="© লাইনের পাশের কাস্টম টেক্সট (ফাঁকা = ডিফল্ট)" />
        </div>

        {/* Logo preview */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
          {logoDraft ? (
            <img src={logoDraft} alt="Logo preview" className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal-500 text-xs font-bold text-primary-foreground">
              {data.personal.initials || "M"}
            </span>
          )}
          <span className="text-sm font-semibold">{draft.site_name || "Mubarok Hossain"}</span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {draft.site_description || "SEO description…"}
          </span>
        </div>

        {/* Theme colors */}
        <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Theme colors — সাইটের accent সব জায়গায় লাইভ পাল্টাবে
          </p>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Use color ${c}`}
                onClick={() => set("theme_primary_color", c)}
                className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform hover:scale-110 ${
                  primary.toLowerCase() === c ? "ring-foreground" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Primary color"
              value={primary}
              onChange={(v) => set("theme_primary_color", v)}
              fallback="#06b6d4"
              hint="Buttons, active menu, links, scrollbar, charts — সব পাল্টাবে"
            />
            <ColorField
              label="Accent color"
              value={accent}
              onChange={(v) => set("theme_accent_color", v)}
              fallback="#14b8a6"
              hint="Gradient টেক্সট, ভিডিও ফ্রেম ও Footer ব্যানারের দ্বিতীয় রঙ"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 flex-1 rounded-lg shadow-inner ring-1 ring-black/5" style={{ backgroundColor: primary || "#06b6d4" }} />
            <div className="h-10 flex-1 rounded-lg shadow-inner ring-1 ring-black/5" style={{ backgroundColor: accent || "#14b8a6" }} />
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                set("theme_primary_color", "");
                set("theme_accent_color", "");
              }}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>
      </EditorCard>

      {/* ─── Chatbot ─── */}
      <EditorCard icon={MessageSquareQuote}>
        <h2 className="text-lg font-bold">Chatbot</h2>
        <SwitchField
          label="Chatbot enabled (public site)"
          checked={(draft.chatbot_enabled ?? "true") !== "false"}
          onChange={(v) => set("chatbot_enabled", v ? "true" : "false")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chatbot name" value={draft.chatbot_name ?? ""} onChange={(v) => set("chatbot_name", v)} />
        </div>
        <AreaField label="Chatbot system prompt" value={draft.chatbot_system_prompt ?? ""} onChange={(v) => set("chatbot_system_prompt", v)} rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <AreaField label="Welcome message (EN)" value={draft.chatbot_welcomeMessage ?? ""} onChange={(v) => set("chatbot_welcomeMessage", v)} rows={2} />
          <AreaField label="Welcome message (বাংলা)" value={draft.chatbot_welcomeMessageBn ?? ""} onChange={(v) => set("chatbot_welcomeMessageBn", v)} rows={2} />
          <Field label="Input placeholder (EN)" value={draft.chatbot_placeholder ?? ""} onChange={(v) => set("chatbot_placeholder", v)} />
          <Field label="Input placeholder (বাংলা)" value={draft.chatbot_placeholderBn ?? ""} onChange={(v) => set("chatbot_placeholderBn", v)} />
        </div>
      </EditorCard>

      {/* ─── AI Provider ─── */}
      <EditorCard icon={Braces}>
        <h2 className="text-lg font-bold">AI Provider <span className="text-sm font-normal text-muted-foreground">(প্রোডাকশন চ্যাটবটের জন্য — আগের সাইটের মতো)</span></h2>
        <p className="text-xs text-muted-foreground">
          API key দিলে Cloudflare-এ ডিপলয় করার পর চ্যাটবট এই প্রোভাইডার দিয়ে উত্তর দেবে; না দিলে সাইটের বিল্ট-ইন স্মার্ট রিপ্লাই ইঞ্জিন চলবে।
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Provider</Label>
            <select
              value={draft.chatbot_provider ?? "openrouter"}
              onChange={(e) => set("chatbot_provider", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              aria-label="AI provider"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>
          </div>
          <Field label="Model" value={draft.chatbot_model ?? ""} onChange={(v) => set("chatbot_model", v)} hint="যেমন openai/gpt-4o-mini, llama-3.1-8b-instant" />
          <Field label="API key" type="password" value={draft.chatbot_apiKey ?? ""} onChange={(v) => set("chatbot_apiKey", v)} hint="Firebase-এ সংরক্ষিত — masked হিসেবে দেখানো হয়" />
          <Field label="Base URL (custom provider)" value={draft.chatbot_base_url ?? ""} onChange={(v) => set("chatbot_base_url", v)} hint="https://.../v1/chat/completions" />
          <Field label="Max tokens" type="number" value={draft.chatbot_maxTokens ?? "400"} onChange={(v) => set("chatbot_maxTokens", v)} />
          <Field label="Temperature (0–1)" type="number" value={draft.chatbot_temperature ?? "0.7"} onChange={(v) => set("chatbot_temperature", v)} />
        </div>
      </EditorCard>

      {/* ─── Telegram ─── */}
      <EditorCard icon={Send}>
        <h2 className="text-lg font-bold">Telegram Notifications <span className="text-sm font-normal text-muted-foreground">(নতুন মেসেজে পুশ)</span></h2>
        <p className="text-xs text-muted-foreground">
          কন্টাক্ট ফর্মে নতুন মেসেজ এলে এই বট আপনার Telegram chat-এ জানিয়ে দেবে। BotFather থেকে token নিন, chat id পেতে @userinfobot ব্যবহার করুন।
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bot token" type="password" value={draft.telegram_bot_token ?? ""} onChange={(v) => set("telegram_bot_token", v)} hint="123456:ABC-DEF..." />
          <Field label="Chat ID" value={draft.telegram_chat_id ?? ""} onChange={(v) => set("telegram_chat_id", v)} hint="যেমন 123456789" />
        </div>
      </EditorCard>

      {/* ─── Custom font ─── */}
      <EditorCard icon={PenLine}>
        <h2 className="text-lg font-bold">Custom Font <span className="text-sm font-normal text-muted-foreground">(আগের সাইটের মতো)</span></h2>
        <p className="text-xs text-muted-foreground">
          Google Fonts বা যেকোনো CSS font URL দিলে পুরো সাইট সেই ফন্টে দেখাবে। ফাঁকি রাখলে ডিফল্ট ফন্ট চলবে।
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Font CSS URL" value={draft.custom_font_url ?? ""} onChange={(v) => set("custom_font_url", v)} hint="https://fonts.googleapis.com/css2?family=..." />
          <Field label="Font family name" value={draft.custom_font_family ?? ""} onChange={(v) => set("custom_font_family", v)} hint="যেমন Hind Siliguri" />
        </div>
        {draft.custom_font_url && draft.custom_font_family && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Font preview</p>
            <p
              className="text-lg font-semibold"
              style={{ fontFamily: `'${draft.custom_font_family}', SolaimanLipi, sans-serif` }}
            >
              বাংলা ফন্ট প্রিভিউ — Hello World
            </p>
          </div>
        )}
      </EditorCard>

      <div className="sticky bottom-4 z-10 mt-6 flex justify-end">
        <Button onClick={save} disabled={saving} className="h-11 rounded-xl bg-gradient-to-r from-primary to-teal-500 px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save to Firebase
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════ BACKUP & SYNC — full database control center ═══════════════ */
interface SectionRow {
  key: PortfolioSectionKey;
  exists: boolean;
  bytes: number;
  updatedAt?: string;
}

function BackupPanel({ onGo }: { onGo: (t: AdminTab) => void }) {
  const { data, settings, refresh } = usePortfolioData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [report, setReport] = useState<CleanupReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [rows, setRows] = useState<SectionRow[]>([]);
  const [settingsCount, setSettingsCount] = useState(0);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statsBytes, setStatsBytes] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const [withMessages, setWithMessages] = useState(true);
  const [deleteMissing, setDeleteMissing] = useState(false);

  const loadDb = useCallback(async () => {
    try {
      const [raw, settingsRaw, msgs, stats, visitorsCount] = await Promise.all([
        dbGet<Record<string, { dataJson?: string; updatedAt?: string }>>("portfolio"),
        dbGet<Record<string, unknown>>("settings"),
        fetchContactMessages(),
        dbGet<unknown>("stats"),
        fetchVisitors(),
      ]);
      const list: SectionRow[] = SECTION_KEYS.map((key) => {
        const node = raw?.[key];
        const json = node?.dataJson ?? (node ? JSON.stringify(node) : "");
        return {
          key,
          exists: !!node,
          bytes: (json ?? "").length,
          updatedAt: node?.updatedAt,
        };
      });
      setRows(list);
      setSettingsCount(Object.keys(settingsRaw ?? {}).length);
      setMessages(msgs);
      setStatsBytes(JSON.stringify(stats ?? {}).length);
      setVisitors(visitorsCount);
    } catch {
      /* offline — charts simply show zero */
    }
  }, []);

  useEffect(() => {
    loadDb();
  }, [loadDb]);

  const runScan = async () => {
    setScanning(true);
    try {
      const r = await cleanupScan();
      setReport(r);
      toast.success(
        r.totalOrphanBytes === 0
          ? "Database is clean — no orphan keys found ✓"
          : `${r.orphanSections.length + r.unknownSettings.length} orphan key(s) found`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const removeKey = async (namespace: "portfolio" | "settings", key: string) => {
    if (!window.confirm(`Delete "${namespace}/${key}" permanently from Firebase?`)) return;
    await cleanupDeleteKey(namespace, key);
    toast.success(`Deleted ${namespace}/${key} ✓`);
    await Promise.all([runScan(), loadDb()]);
  };

  const downloadBlob = (content: string, name: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const download = async () => {
    setBusy("download");
    try {
      const bundle = await backupAll();
      downloadBlob(JSON.stringify(bundle, null, 2), `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success("Full backup downloaded ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setBusy(null);
    }
  };

  const downloadSection = async (key: PortfolioSectionKey) => {
    try {
      const node = await dbGet(`portfolio/${key}`);
      downloadBlob(JSON.stringify(node ?? {}, null, 2), `section-${key}.json`);
      toast.success(`${SECTION_LABELS[key]} downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  const restore = async (file: File) => {
    if (
      !window.confirm(
        `Restore from "${file.name}"?\n\n${deleteMissing ? "• Firebase-এ এমন সেকশনও মুছে যাবে যা backup-এ নেই\n" : ""}• বর্তমান Firebase কনটেন্ট backup-এর ডেটা দিয়ে replace হবে।`
      )
    )
      return;
    setBusy("restore");
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as BackupBundle;
      const r = await restoreBackup(bundle, { withMessages, deleteMissing });
      await Promise.all([refresh(), loadDb()]);
      toast.success(`Restore complete ✓ — ${r.sections} sections, ${r.settings} settings${r.messages ? `, ${r.messages} messages` : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusy(null);
    }
  };

  const fullSync = async () => {
    if (!window.confirm("Firebase-এর সব সেকশন এই সাইটের বর্তমান ডেটা দিয়ে overwrite হবে। নিশ্চিত?")) return;
    setBusy("sync");
    try {
      await syncAllSections(data);
      await Promise.all([refresh(), loadDb()]);
      toast.success("All sections synced to Firebase ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  };

  const pushFullContent = async () => {
    if (
      !window.confirm(
        "সম্পূর্ণ সাইট কনটেন্ট (প্রজেক্ট ভিডিও কভার, skills, services, experience, education, FAQ সহ) Firebase-এ লেখা হবে — বর্তমান Firebase কনটেন্ট প্রতিস্থাপিত হবে। নিশ্চিত?"
      )
    )
      return;
    setBusy("push");
    try {
      await syncAllSections(seedData);
      await Promise.all([refresh(), loadDb()]);
      toast.success("Full content pushed to Firebase ✓ — সাইট এখন এটি থেকেই লোড হবে");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Push failed");
    } finally {
      setBusy(null);
    }
  };

  const resetSection = async (key: PortfolioSectionKey) => {
    if (!window.confirm(`"${SECTION_LABELS[key]}" সেকশনটি ডিফল্ট কনটেন্টে রিসেট হবে। নিশ্চিত?`)) return;
    setBusy(`reset-${key}`);
    try {
      await resetSectionToSeed(key);
      await Promise.all([refresh(), loadDb()]);
      toast.success(`${SECTION_LABELS[key]} reset to default ✓`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteSection = async (key: PortfolioSectionKey) => {
    if (!window.confirm(`"${SECTION_LABELS[key]}" সেকশনটি Firebase থেকে মুছে যাবে — সাইট ডিফল্ট seed দেখাবে। নিশ্চিত?`)) return;
    setBusy(`del-${key}`);
    try {
      await dbRemove(`portfolio/${key}`);
      await Promise.all([refresh(), loadDb()]);
      toast.success(`${SECTION_LABELS[key]} deleted from Firebase`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteAllMessages = async () => {
    if (!messages.length) {
      toast.info("No messages to delete");
      return;
    }
    if (!window.confirm(`সব ${messages.length}টি মেসেজ স্থায়ীভাবে মুছে যাবে। নিশ্চিত?`)) return;
    setBusy("delmsgs");
    try {
      await Promise.all(messages.map((m) => deleteContactMessage(m.id)));
      window.dispatchEvent(new Event("mmh-messages-updated"));
      await loadDb();
      toast.success("All messages deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const doResetVisitors = async () => {
    if (!window.confirm("Visitor counter 0-এ রিসেট হবে। নিশ্চিত?")) return;
    setBusy("visitors");
    try {
      await resetVisitors();
      await loadDb();
      toast.success("Visitor counter reset to 0 ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  };

  const exportMessagesCsv = () => {
    const esc = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const rowsCsv = [
      ["name", "email", "subject", "budget", "read", "createdAt", "message"].join(","),
      ...messages.map((m) => [m.name, m.email, m.subject, m.budget ?? "", String(m.read), m.createdAt, m.message].map(esc).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rowsCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Messages exported as CSV");
  };

  const portfolioBytes = rows.reduce((a, r) => a + r.bytes, 0);
  const settingsBytes = JSON.stringify(settings ?? {}).length;
  const messagesBytes = JSON.stringify(messages).length;

  const sizeEntries = rows
    .filter((r) => r.exists)
    .map((r) => ({ label: SECTION_LABELS[r.key] ?? r.key, value: r.bytes / 1024 }))
    .sort((a, b) => b.value - a.value);

  const overviewCards = [
    { label: "Portfolio sections", value: `${rows.filter((r) => r.exists).length}/${SECTION_KEYS.length}`, icon: FolderTree, hint: fmtKB(portfolioBytes) },
    { label: "Settings keys", value: String(settingsCount), icon: Settings, hint: fmtKB(settingsBytes) },
    { label: "Messages", value: String(messages.length), icon: Inbox, hint: `${messages.filter((m) => !m.read).length} unread · ${fmtKB(messagesBytes)}` },
    { label: "Visitors", value: visitors.toLocaleString(), icon: Eye, hint: fmtKB(statsBytes) },
  ];

  return (
    <div className="space-y-4">
      {/* overview KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewCards.map((c) => (
          <Card key={c.label} className="rounded-2xl border-border/70 bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold leading-tight">{c.value}</p>
                <p className="truncate text-[10px] text-muted-foreground">{c.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* storage charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Data size per section</h2>
              <Badge variant="secondary" className="ml-auto text-[10px]">Chart.js</Badge>
            </div>
            {sizeEntries.length ? (
              <SectionSizeChart entries={sizeEntries} height={300} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">Firebase থেকে ডেটা লোড হচ্ছে…</p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70 bg-card lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Storage distribution</h2>
              <Badge variant="secondary" className="ml-auto text-[10px]">Chart.js</Badge>
            </div>
            <StorageDoughnut
              parts={[
                { label: "Portfolio", value: portfolioBytes },
                { label: "Settings", value: settingsBytes },
                { label: "Messages", value: messagesBytes },
                { label: "Stats", value: statsBytes },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* backup / restore / sync */}
      <EditorCard icon={HardDrive}>
        <h2 className="text-lg font-bold">Backup &amp; Restore</h2>
        <p className="text-sm text-muted-foreground">
          সম্পূর্ণ ডেটাবেজ (কনটেন্ট + settings + messages + stats) এক ফাইলে নামান, ফিরিয়ে আনুন, বা সাইটের বর্তমান ডেটা Firebase-এ সিঙ্ক করুন।
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <SwitchField label="Restore-এ messages-ও ফিরিয়ে আনুন" checked={withMessages} onChange={setWithMessages} hint="backup ফাইলে থাকা কন্টাক্ট মেসেজগুলো id ধরে রিস্টোর হবে" />
          <SwitchField label="Backup-এ না থাকা সেকশন মুছে দিন" checked={deleteMissing} onChange={setDeleteMissing} hint="exact mirror restore — সাবধানে ব্যবহার করুন" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={download} disabled={busy !== null} className="rounded-lg bg-primary text-primary-foreground">
            {busy === "download" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download full backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy !== null} className="rounded-lg">
            {busy === "restore" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Restore from file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) restore(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={fullSync} disabled={busy !== null} className="rounded-lg">
            {busy === "sync" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync current → Firebase
          </Button>
          <Button onClick={pushFullContent} disabled={busy !== null} className="rounded-lg bg-gradient-to-r from-primary to-teal-500 text-primary-foreground">
            {busy === "push" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Push full content → Firebase
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          &quot;Push full content&quot; দিলে রিডিজাইন করা সম্পূর্ণ ডিফল্ট কনটেন্ট Firebase-এ চলে যাবে — এরপর সব পরিবর্তন Admin Panel থেকেই করুন।
        </p>
      </EditorCard>

      {/* per-section table */}
      <EditorCard icon={FolderTree}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Section control <span className="text-sm font-normal text-muted-foreground">— প্রতিটি সেকশনের সরাসরি নিয়ন্ত্রণ</span></h2>
          <Button size="sm" variant="outline" onClick={loadDb} className="rounded-lg">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reload
          </Button>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {rows.map((r) => (
            <div key={r.key} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{SECTION_LABELS[r.key] ?? r.key}</p>
                <p className="text-[11px] text-muted-foreground">
                  <code className="rounded bg-secondary px-1">portfolio/{r.key}</code> ·{" "}
                  {r.exists ? fmtKB(r.bytes) : "not seeded"} ·{" "}
                  {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-2" onClick={() => onGo(r.key === "personal" ? "personal" : r.key === "skillCategories" || r.key === "additionalTools" ? "skills" : r.key === "projectCategories" ? "projects" : (r.key as AdminTab))} title="Edit in its tab" aria-label={`Edit ${r.key}`}>
                  <PenLine className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-2" onClick={() => downloadSection(r.key)} title="Download section JSON" aria-label={`Download ${r.key}`}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-2" onClick={() => resetSection(r.key)} disabled={busy !== null} title="Reset to default content" aria-label={`Reset ${r.key}`}>
                  {busy === `reset-${r.key}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                </Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg px-2 text-red-600" onClick={() => deleteSection(r.key)} disabled={busy !== null} title="Delete from Firebase" aria-label={`Delete ${r.key}`}>
                  {busy === `del-${r.key}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EditorCard>

      {/* messages + stats control */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EditorCard icon={Inbox}>
          <h2 className="text-lg font-bold">Messages data</h2>
          <p className="text-sm text-muted-foreground">
            {messages.length} message(s) · {messages.filter((m) => !m.read).length} unread · {fmtKB(messagesBytes)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onGo("messages")} className="rounded-lg">
              <Inbox className="mr-1.5 h-3.5 w-3.5" /> Open inbox
            </Button>
            <Button size="sm" variant="outline" onClick={() => downloadBlob(JSON.stringify(messages, null, 2), `messages-${new Date().toISOString().slice(0, 10)}.json`)} disabled={!messages.length} className="rounded-lg">
              <FileJson className="mr-1.5 h-3.5 w-3.5" /> Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={exportMessagesCsv} disabled={!messages.length} className="rounded-lg">
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" variant="outline" onClick={deleteAllMessages} disabled={busy !== null || !messages.length} className="rounded-lg text-red-600">
              {busy === "delmsgs" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
              Delete all
            </Button>
          </div>
        </EditorCard>

        <EditorCard icon={Eye}>
          <h2 className="text-lg font-bold">Visitor stats</h2>
          <p className="text-sm text-muted-foreground">
            Current counter: <strong className="text-foreground">{visitors.toLocaleString()}</strong> · node <code className="rounded bg-secondary px-1">stats/visitors</code> · {fmtKB(statsBytes)}
          </p>
          <div>
            <Button size="sm" variant="outline" onClick={doResetVisitors} disabled={busy !== null} className="rounded-lg text-red-600">
              {busy === "visitors" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
              Reset counter to 0
            </Button>
          </div>
        </EditorCard>
      </div>

      {/* cleanup */}
      <EditorCard icon={Search}>
        <h2 className="text-lg font-bold">Database Cleanup <span className="text-sm font-normal text-muted-foreground">(আগের সাইটের মতো)</span></h2>
        <p className="text-sm text-muted-foreground">
          Firebase-এ এমন সব orphan key খুঁজে বের করে যা সাইট পড়ে না (পুরনো/ভুল নামের সেকশন বা সেটিংস) — চাইলে এক ক্লিকে মুছে ফেলা যায়।
        </p>
        <div>
          <Button variant="outline" onClick={runScan} disabled={scanning} className="rounded-lg">
            {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Scan for orphan keys
          </Button>
        </div>
        {report && (
          <div className="space-y-2">
            {report.orphanSections.length === 0 && report.unknownSettings.length === 0 ? (
              <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                ✓ Database is clean — every key is known and used by the site.
              </p>
            ) : (
              <>
                {report.orphanSections.map((o) => (
                  <div key={o.key} className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">portfolio/{o.key}</p>
                      <p className="text-xs text-muted-foreground">unknown section · ~{(o.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg text-red-600" onClick={() => removeKey("portfolio", o.key)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                ))}
                {report.unknownSettings.map((o) => (
                  <div key={o.key} className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">settings/{o.key}</p>
                      <p className="text-xs text-muted-foreground">unknown setting · ~{Math.max(1, Math.round(o.size / 102.4)) / 10} KB</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg text-red-600" onClick={() => removeKey("settings", o.key)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Total orphan data: ~{(report.totalOrphanBytes / 1024).toFixed(1)} KB</p>
              </>
            )}
          </div>
        )}
      </EditorCard>

      {/* danger zone */}
      <EditorCard icon={AlertTriangle}>
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          সব সেকশন একসাথে ডিফল্ট কনটেন্টে রিসেট করুন (Firebase-এর বর্তমান কাস্টম কনটেন্ট হারাবে)।
        </p>
        <Button
          variant="outline"
          disabled={busy !== null}
          className="rounded-lg border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          onClick={async () => {
            if (!window.confirm("সব ১৬টি সেকশন ডিফল্ট কনটেন্টে রিসেট হবে — আপনার কাস্টমাইজ করা সব কনটেন্ট হারাবে। নিশ্চিত?")) return;
            if (!window.confirm("শেষ সতর্কতা — এটি ফিরিয়ে আনা যায় না। চালিয়ে যাবেন?")) return;
            setBusy("resetall");
            try {
              await syncAllSections(seedData);
              await Promise.all([refresh(), loadDb()]);
              toast.success("All sections reset to default content");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Reset failed");
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "resetall" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
          Reset ALL sections to default
        </Button>
      </EditorCard>
    </div>
  );
}

/* ═══════════════ EDITOR ROUTER ═══════════════ */
function EditorRouter({
  tab,
  onGo,
  unread,
}: {
  tab: AdminTab;
  onGo: (t: AdminTab) => void;
  unread: number;
}) {
  switch (tab) {
    case "personal": return <PersonalEditor />;
    case "stats": return <StatsEditor />;
    case "pages": return <PagesEditor />;
    case "services": return <ServicesEditor />;
    case "skills": return <SkillsEditor />;
    case "projects": return <ProjectsEditor />;
    case "experiences": return <ExperiencesEditor />;
    case "education": return <EducationEditor />;
    case "testimonials": return <TestimonialsEditor />;
    case "certificates": return <CertificatesEditor />;
    case "faq": return <FaqEditor />;
    case "contactInfo": return <ContactInfoEditor />;
    case "socialLinks": return <SocialLinksEditor />;
    case "messages": return <MessagesInbox />;
    case "settings": return <SettingsPanel />;
    case "backup": return <BackupPanel onGo={onGo} />;
    default: return <Dashboard onGo={onGo} unread={unread} />;
  }
}

/* ═══════════════ SHELL ═══════════════ */
export default function AdminPage({ onExit }: { onExit: () => void }) {
  const { user, ready, logout } = useAdmin();
  const { data, lastSync } = usePortfolioData();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // live unread badge — refetches on Firebase syncs and message mutations
  useEffect(() => {
    if (!user) return;
    const loadUnread = () =>
      fetchContactMessages()
        .then((list) => setUnread(list.filter((m) => !m.read).length))
        .catch(() => undefined);
    loadUnread();
    window.addEventListener("mmh-messages-updated", loadUnread);
    return () => window.removeEventListener("mmh-messages-updated", loadUnread);
  }, [user, lastSync]);

  const go = useMemo(
    () => (t: AdminTab) => {
      setTab(t);
      setNavOpen(false);
      window.scrollTo({ top: 0 });
    },
    []
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  const current = NAV.find((n) => n.id === tab);
  const currentGroup = current?.group ?? "Overview";

  /* Sidebar items grouped with headers (Overview / Content / Communication / System) */
  const groupedNav: { group: string; items: typeof NAV }[] = [];
  for (const item of NAV) {
    const last = groupedNav[groupedNav.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else groupedNav.push({ group: item.group, items: [item] });
  }

  const renderNavItems = () =>
    groupedNav.map(({ group, items }) => (
      <div key={group} className="space-y-1">
        <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
          {group}
        </p>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === item.id
                ? "bg-gradient-to-r from-primary to-teal-500 text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${tab === item.id ? "drop-shadow" : ""}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "messages" && unread > 0 && (
              <span className="animate-pulse rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>
    ));

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* topbar — same glass language as the public navbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu">
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            {data.personal.siteLogo ? (
              <img src={data.personal.siteLogo} alt="Site logo" className="h-10 w-10 shrink-0 rounded-xl object-contain ring-1 ring-border/60" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-sm font-black text-primary-foreground shadow-md shadow-primary/30">
                {data.personal.initials || "MMH"}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">
                Admin <span className="gradient-text">Panel</span>
              </p>
              <p className="hidden text-[11px] leading-tight text-muted-foreground sm:block">মোবারক — Portfolio CMS</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Firebase Live
            </span>
            <Button variant="outline" size="sm" onClick={onExit} className="rounded-lg px-2.5 sm:px-3" aria-label="View site">
              <Eye className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">View site</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => logout()} className="rounded-lg px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 sm:px-3 dark:hover:bg-red-950/40" aria-label="Logout">
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        {/* sidebar (desktop) — sticky and internally scrollable so every tab
            stays reachable even on short viewports */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav
            className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto rounded-2xl border border-border/60 bg-card p-3 scrollbar-thin"
            aria-label="Admin sections"
          >
            {renderNavItems()}
          </nav>
        </aside>

        {/* mobile nav */}
        {navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNavOpen(false)} />
            <nav className="absolute left-0 top-0 h-full w-72 space-y-1 overflow-y-auto rounded-r-2xl bg-card p-4 shadow-2xl scrollbar-thin">
              <div className="mb-2 flex items-center gap-2.5 px-2 pt-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-xs font-black text-primary-foreground">
                  MMH
                </div>
                <p className="text-sm font-bold">Admin Menu</p>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setNavOpen(false)} aria-label="Close menu">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {renderNavItems()}
            </nav>
          </div>
        )}

        {/* content */}
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary">
              {current ? <current.icon className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight sm:text-2xl">{current?.label ?? "Dashboard"}</h1>
              <p className="text-xs text-muted-foreground">{currentGroup} · Firebase CMS</p>
            </div>
          </div>
          <EditorRouter tab={tab} onGo={go} unread={unread} />
        </main>
      </div>
    </div>
  );
}
