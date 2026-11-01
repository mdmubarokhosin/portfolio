"use client";

/**
 * AdminEditors — every portfolio section editor.
 *
 * Each editor is fully functional against Firebase RTDB and now ships with
 * power features: visual icon pickers, color pickers, category dropdowns,
 * live previews and Chart.js visualizations where relevant.
 */

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaField,
  BilingualField,
  ColorField,
  EditorCard,
  Field,
  IconField,
  ListEditor,
  MediaUrlField,
  NumField,
  SaveBar,
  SelectField,
  SwitchField,
} from "./admin-bits";
import { SectionItemsChart, SkillsRadarChart } from "./admin-charts";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import type { PortfolioData, Service, Skill } from "@/context/PortfolioDataContext";
import { serviceSlug } from "@/lib/service-pages";
import { Icon } from "@/components/icons";

/* Small helper: draft state per editor, re-synced when Firebase data arrives */
function useDraft<K extends keyof PortfolioData>(key: K) {
  const { data } = usePortfolioData();
  const [draft, setDraft] = useState<PortfolioData[K]>(data[key]);
  const [syncedFrom, setSyncedFrom] = useState<PortfolioData[K]>(data[key]);
  // Re-sync the draft when fresh Firebase data lands (adjust-state-on-prop-change pattern)
  if (data[key] !== syncedFrom) {
    setSyncedFrom(data[key]);
    setDraft(data[key]);
  }
  const patch = (p: Partial<PortfolioData[K]>) =>
    setDraft((d) => ({ ...(d as object), ...p }) as PortfolioData[K]);
  return { draft, setDraft, patch };
}

/* ═══════════ PERSONAL / HERO ═══════════ */
export function PersonalEditor() {
  const { draft, patch } = useDraft("personal");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Hero &amp; Personal Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name (EN)" value={draft.name} onChange={(v) => patch({ name: v })} />
          <Field label="পূর্ণ নাম (বাংলা)" value={draft.nameBn ?? ""} onChange={(v) => patch({ nameBn: v })} />
          <Field label="First name (EN)" value={draft.firstName} onChange={(v) => patch({ firstName: v })} />
          <Field label="প্রথম নাম (বাংলা)" value={draft.firstNameBn ?? ""} onChange={(v) => patch({ firstNameBn: v })} />
          <Field label="Initials (logo fallback)" value={draft.initials} onChange={(v) => patch({ initials: v })} hint="লোগো না দিলে এই অক্ষর দেখাবে" />
          <Field label="Email" type="email" value={draft.email} onChange={(v) => patch({ email: v })} />
          <Field label="Location (EN)" value={draft.location} onChange={(v) => patch({ location: v })} />
          <Field label="Location (বাংলা)" value={draft.locationEn ?? ""} onChange={(v) => patch({ locationEn: v })} />
          <Field label="Availability (EN)" value={draft.availability} onChange={(v) => patch({ availability: v })} />
          <Field label="Availability (বাংলা)" value={draft.availabilityBn ?? ""} onChange={(v) => patch({ availabilityBn: v })} />
          <Field label="Working hours (EN)" value={draft.workingHours ?? ""} onChange={(v) => patch({ workingHours: v })} />
          <Field label="Working hours (বাংলা)" value={draft.workingHoursBn ?? ""} onChange={(v) => patch({ workingHoursBn: v })} />
        </div>
        <BilingualField label="Title (typewriter lines, use | to split)" value={draft.title} valueBn={draft.titleBn} onChange={(v) => patch({ title: v })} onChangeBn={(v) => patch({ titleBn: v })} textarea rows={2} />
        <BilingualField label="Tagline" value={draft.tagline} valueBn={draft.taglineBn} onChange={(v) => patch({ tagline: v })} onChangeBn={(v) => patch({ taglineBn: v })} textarea rows={2} />
        <BilingualField label="Short bio" value={draft.bio.short} valueBn={draft.bio.shortBn} onChange={(v) => patch({ bio: { ...draft.bio, short: v } })} onChangeBn={(v) => patch({ bio: { ...draft.bio, shortBn: v } })} textarea rows={2} />

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full bio paragraphs</p>
          {[0, 1].map((idx) => (
            <div key={idx} className="grid gap-3 sm:grid-cols-2">
              <AreaField
                label={`Paragraph ${idx + 1} (EN)`}
                value={draft.bio.full[idx] ?? ""}
                onChange={(v) => {
                  const full = [...draft.bio.full];
                  full[idx] = v;
                  patch({ bio: { ...draft.bio, full } });
                }}
                rows={3}
              />
              <AreaField
                label={`Paragraph ${idx + 1} (বাংলা)`}
                value={draft.bio.fullBn?.[idx] ?? ""}
                onChange={(v) => {
                  const fullBn = [...(draft.bio.fullBn ?? [])];
                  fullBn[idx] = v;
                  patch({ bio: { ...draft.bio, fullBn } });
                }}
                rows={3}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Site logo URL"
            value={draft.siteLogo ?? ""}
            onChange={(v) => patch({ siteLogo: v })}
            hint="Navbar, Footer ও browser favicon — Site Settings ট্যাবেও আছে"
          />
          <MediaUrlField kind="image" label="Profile image URL" value={draft.profileImage ?? ""} onChange={(v) => patch({ profileImage: v })} hint="ছবির পরিবর্তে ভিডিও ব্যবহৃত হয় — যেকোনো হোস্টিং থেকে সরাসরি লিংক দিন" />
          <MediaUrlField
            kind="video"
            label="Profile video URL"
            value={draft.profileVideo ?? ""}
            onChange={(v) => patch({ profileVideo: v })}
            hint="যেকোনো হোস্টিংয়ের সরাসরি ভিডিও লিংক দিন — যেমন https://cdn.example.com/avatar.mp4 — সাইট যেই ডোমেইনে থাকুক, লিংক কাজ করবে"
          />
          <Field label="Resume URL" value={draft.resumeUrl ?? ""} onChange={(v) => patch({ resumeUrl: v })} />
        </div>

        {/* Live logo preview */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Logo preview</p>
          {draft.siteLogo ? (
            <img src={draft.siteLogo} alt="Site logo preview" className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal-500 text-xs font-bold text-primary-foreground">
              {draft.initials || "M"}
            </span>
          )}
          <span className="text-xs text-muted-foreground">Save করলে Navbar, Footer ও favicon সাথে সাথে আপডেট হবে</span>
        </div>
      </EditorCard>
      <SaveBar section="personal" getDraft={() => draft} label="Personal info" />
    </div>
  );
}

/* ═══════════ STATS ═══════════ */
export function StatsEditor() {
  const { draft, setDraft } = useDraft("stats");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Stats Counters</h2>
        {/* Chart.js live preview of counter values */}
        <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart.js preview — counter values</p>
          <SectionItemsChart
            entries={draft.map((s) => ({ label: s.label || "?", value: s.value }))}
            height={200}
          />
        </div>
        {/* Live counter preview */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {draft.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-border/70 bg-card p-3 text-center">
              <span className="text-primary"><Icon name={s.icon} className="h-5 w-5" /></span>
              <span className="text-xl font-black tabular-nums">{s.value}{s.suffix}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
        <ListEditor
          title="Stat items"
          addLabel="Add stat"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ label: "New stat", labelBn: "", value: 10, suffix: "+", suffixBn: "+", icon: "code" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label (EN)" value={item.label} onChange={(v) => update({ label: v })} />
              <Field label="Label (বাংলা)" value={item.labelBn ?? ""} onChange={(v) => update({ labelBn: v })} />
              <NumField label="Value" value={item.value} onChange={(v) => update({ value: v })} />
              <Field label="Suffix" value={item.suffix} onChange={(v) => update({ suffix: v })} hint="+, %, K" />
              <Field label="Suffix (বাংলা)" value={item.suffixBn ?? ""} onChange={(v) => update({ suffixBn: v })} hint="বছর, +" />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </div>
          )}
        />
      </EditorCard>
      <SaveBar section="stats" getDraft={() => draft} label="Stats" />
    </div>
  );
}

/* ═══════════ NAV PAGES ═══════════ */
export function PagesEditor() {
  const { draft, setDraft } = useDraft("pages");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Navigation Pages</h2>
        <p className="text-xs text-muted-foreground">
          Navbar menu — প্রতিটি item-এর label, icon ও অবস্থান এখান থেকে বদলান।
        </p>
        {/* live navbar preview */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-secondary/30 p-3">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Preview:</span>
          {draft.map((p, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs shadow-sm ring-1 ring-border/60">
              <Icon name={p.icon} className="h-3 w-3 text-primary" />
              {p.label}
            </span>
          ))}
        </div>
        <ListEditor
          title="Menu items"
          addLabel="Add page"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ id: `page-${Date.now()}`, label: "New", labelBn: "", icon: "grid" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label (EN)" value={item.label} onChange={(v) => update({ label: v })} />
              <Field label="Label (বাংলা)" value={item.labelBn ?? ""} onChange={(v) => update({ labelBn: v })} />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
              <Field label="Page id" value={item.id} onChange={(v) => update({ id: v })} hint="route id — সাবধানে বদলান" />
            </div>
          )}
        />
      </EditorCard>
      <SaveBar section="pages" getDraft={() => draft} label="Navigation" />
    </div>
  );
}

/* ═══════════ SOCIAL LINKS ═══════════ */
export function SocialLinksEditor() {
  const { draft, setDraft } = useDraft("socialLinks");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Social Links</h2>
        <ListEditor
          title="Links"
          addLabel="Add link"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ name: "New", icon: "globe", url: "https://" })}
          renderItem={(item, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
              </div>
              <div className="flex items-end gap-2">
                <Field label="URL" value={item.url} onChange={(v) => update({ url: v })} />
                {item.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-0.5 h-10 shrink-0 rounded-lg"
                    onClick={() => window.open(item.url, "_blank", "noopener")}
                    aria-label={`Open ${item.name}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="socialLinks" getDraft={() => draft} label="Social links" />
    </div>
  );
}

/* ═══════════ SERVICES ═══════════ */
export function ServicesEditor() {
  const { draft, setDraft } = useDraft("services");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Services</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Every service automatically gets a public detail page at
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">/Services/&lt;Slug&gt;</code>
          — fill in the overview &amp; features below to control its content, or leave them empty to use
          the built-in defaults.
        </p>
        <ListEditor
          title="Service cards"
          addLabel="Add service"
          items={draft}
          onChange={setDraft}
          createNew={() => ({
            title: "New service",
            titleBn: "",
            description: "",
            descriptionBn: "",
            icon: "zap",
            slug: "",
            overview: "",
            overviewBn: "",
            features: "",
            featuresBn: "",
          })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Title" value={item.title} valueBn={item.titleBn} onChange={(v) => update({ title: v })} onChangeBn={(v) => update({ titleBn: v })} />
              <Field
                label="URL slug (optional — leave empty to derive from the title)"
                value={item.slug ?? ""}
                onChange={(v) => update({ slug: v })}
                placeholder="Web-Development"
              />
              <p className="-mt-1 text-[11px] text-muted-foreground">
                Public page:{" "}
                <a
                  href={`/Services/${serviceSlug(item as Service, 0)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-primary underline underline-offset-2"
                >
                  /Services/{serviceSlug(item as Service, 0)}
                </a>
              </p>
              <BilingualField label="Short description (cards)" value={item.description} valueBn={item.descriptionBn} onChange={(v) => update({ description: v })} onChangeBn={(v) => update({ descriptionBn: v })} textarea rows={2} />
              <BilingualField label="Detail page overview" value={item.overview ?? ""} valueBn={item.overviewBn ?? ""} onChange={(v) => update({ overview: v })} onChangeBn={(v) => update({ overviewBn: v })} textarea rows={4} />
              <BilingualField
                label="What's included (one item per line)"
                value={item.features ?? ""}
                valueBn={item.featuresBn ?? ""}
                onChange={(v) => update({ features: v })}
                onChangeBn={(v) => update({ featuresBn: v })}
                textarea
                rows={5}
              />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="services" getDraft={() => draft} label="Services" />
    </div>
  );
}

/* ═══════════ SKILLS ═══════════ */
export function SkillsEditor() {
  const { data } = usePortfolioData();
  const [skills, setSkills] = useState(data.skills);
  const [categories, setCategories] = useState(data.skillCategories);
  const [tools, setTools] = useState(data.additionalTools);
  const [synced, setSynced] = useState(data);
  if (data !== synced) {
    setSynced(data);
    setSkills(data.skills);
    setCategories(data.skillCategories);
    setTools(data.additionalTools);
  }

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Skills</h2>
        {/* Chart.js radar preview */}
        <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart.js preview — top skill radar</p>
          <SkillsRadarChart skills={skills.map((s) => ({ name: s.name, level: s.level }))} height={280} />
        </div>
        <ListEditor
          title="Skill bars"
          addLabel="Add skill"
          items={skills}
          onChange={setSkills}
          createNew={(): Skill => ({ name: "New skill", icon: "code", level: 70, color: "#06b6d4", category: "frontend" })}
          renderItem={(item, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <NumField label="Level (0–100)" value={item.level} onChange={(v) => update({ level: v })} hint={`${item.level}%`} />
                <SelectField
                  label="Category"
                  value={item.category}
                  onChange={(v) => update({ category: v })}
                  options={[
                    ...categories.map((c) => ({ value: c.id, label: `${c.label} (${c.id})` })),
                    ...(categories.some((c) => c.id === item.category) ? [] : [{ value: item.category, label: `${item.category} (current)` }]),
                  ]}
                />
                <ColorField label="Brand color" value={item.color} onChange={(v) => update({ color: v })} fallback="#06b6d4" />
                <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
              </div>
              <Field label="Logo URL (optional)" value={item.logoUrl ?? ""} onChange={(v) => update({ logoUrl: v })} hint="যেকোনো হোস্টিং থেকে লোগোর সরাসরি লিংক (https://…), বা /images/skills/react.svg — ফাঁকা রাখলে ব্র্যান্ড কালার ব্যবহৃত হবে" />
              {/* level bar preview */}
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, item.level)}%`, backgroundColor: item.color }} />
                </div>
                <span className="w-10 text-right text-xs font-bold tabular-nums">{item.level}%</span>
              </div>
            </>
          )}
        />
      </EditorCard>

      <EditorCard>
        <h2 className="text-lg font-bold">Skill Categories</h2>
        <ListEditor
          title="Categories"
          addLabel="Add category"
          items={categories}
          onChange={setCategories}
          createNew={() => ({ id: `cat-${Date.now()}`, label: "New", labelBn: "", icon: "grid" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Id" value={item.id} onChange={(v) => update({ id: v })} hint="skill-এর category এই id-এর সাথে মিলবে" />
              <Field label="Label (EN)" value={item.label} onChange={(v) => update({ label: v })} />
              <Field label="Label (বাংলা)" value={item.labelBn ?? ""} onChange={(v) => update({ labelBn: v })} />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </div>
          )}
        />
      </EditorCard>

      <EditorCard>
        <h2 className="text-lg font-bold">Additional Tools</h2>
        <ListEditor
          title="Tools"
          addLabel="Add tool"
          items={tools}
          onChange={setTools}
          createNew={() => ({ name: "New tool", icon: "wrench" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={item.name} onChange={(v) => update({ name: v })} />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </div>
          )}
        />
      </EditorCard>

      {/* One combined save bar — multiple sticky bars would overlap and block clicks */}
      <SaveBar
        sections={[
          { section: "skills", getDraft: () => skills, label: "Skills" },
          { section: "skillCategories", getDraft: () => categories, label: "Skill categories" },
          { section: "additionalTools", getDraft: () => tools, label: "Tools" },
        ]}
      />
    </div>
  );
}

/* ═══════════ PROJECTS ═══════════ */
export function ProjectsEditor() {
  const { data } = usePortfolioData();
  const [projects, setProjects] = useState(data.projects);
  const [categories, setCategories] = useState(data.projectCategories);
  const [synced, setSynced] = useState(data);
  if (data !== synced) {
    setSynced(data);
    setProjects(data.projects);
    setCategories(data.projectCategories);
  }

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Projects</h2>
        <ListEditor
          title="Project cards"
          addLabel="Add project"
          items={projects}
          onChange={setProjects}
          createNew={() => ({
            id: Date.now(),
            title: "New project",
            titleBn: "",
            description: "",
            descriptionBn: "",
            tags: ["React"],
            icon: "folder",
            color: "#06b6d4",
            liveUrl: "",
            codeUrl: "",
            featured: false,
            category: "fullstack",
            coverImage: "",
            coverVideo: "",
          })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Title" value={item.title} valueBn={item.titleBn} onChange={(v) => update({ title: v })} onChangeBn={(v) => update({ titleBn: v })} />
              <BilingualField label="Description" value={item.description} valueBn={item.descriptionBn} onChange={(v) => update({ description: v })} onChangeBn={(v) => update({ descriptionBn: v })} textarea />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tags (comma separated)" value={item.tags.join(", ")} onChange={(v) => update({ tags: v.split(",").map((t) => t.trim()).filter(Boolean) })} />
                <SelectField
                  label="Category"
                  value={item.category}
                  onChange={(v) => update({ category: v })}
                  options={[
                    ...categories.map((c) => ({ value: c.id, label: `${c.label} (${c.id})` })),
                    ...(categories.some((c) => c.id === item.category) ? [] : [{ value: item.category, label: `${item.category} (current)` }]),
                  ]}
                />
                <Field label="Live URL" value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} />
                <Field label="Code URL" value={item.codeUrl} onChange={(v) => update({ codeUrl: v })} />
                <ColorField label="Accent color" value={item.color} onChange={(v) => update({ color: v })} fallback="#06b6d4" />
                <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <MediaUrlField
                  kind="video"
                  label="Cover video URL (যেকোনো হোস্টিং)"
                  value={item.coverVideo ?? ""}
                  onChange={(v) => update({ coverVideo: v })}
                  hint="যেকোনো হোস্টিং/ডোমেইনের সরাসরি ভিডিও লিংক দিন — যেমন https://cdn.example.com/my-video.mp4 (Cloudflare R2, Cloudinary, GitHub, যেকোনো হোস্ট) — সাইট যেই ডোমেইনে থাকুক লিংক কাজ করবে। খালি রাখলে বিল্ট-ইন ভিডিও চলবে।"
                />
                <MediaUrlField
                  kind="image"
                  label="Poster image URL"
                  value={item.coverImage ?? ""}
                  onChange={(v) => update({ coverImage: v })}
                  hint="যেকোনো হোস্টিং থেকে পোস্টার ছবির সরাসরি লিংক (https://…) — ভিডিও লোড হওয়ার আগে এটি দেখাবে"
                />
              </div>
              <SwitchField label="Featured on home page" checked={item.featured} onChange={(v) => update({ featured: v })} hint="Home-এর Featured Projects-এ দেখাবে" />
              {/* tag chips preview */}
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t, i) => (
                  <span key={i} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${item.color}1f`, color: item.color }}>
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
        />
      </EditorCard>

      <EditorCard>
        <h2 className="text-lg font-bold">Project Categories</h2>
        <ListEditor
          title="Categories"
          addLabel="Add category"
          items={categories}
          onChange={setCategories}
          createNew={() => ({ id: `pcat-${Date.now()}`, label: "New", labelBn: "", icon: "grid" })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Id" value={item.id} onChange={(v) => update({ id: v })} />
              <Field label="Label (EN)" value={item.label} onChange={(v) => update({ label: v })} />
              <Field label="Label (বাংলা)" value={item.labelBn ?? ""} onChange={(v) => update({ labelBn: v })} />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </div>
          )}
        />
      </EditorCard>

      {/* One combined save bar — saves cards + categories together */}
      <SaveBar
        sections={[
          { section: "projects", getDraft: () => projects, label: "Projects" },
          { section: "projectCategories", getDraft: () => categories, label: "Project categories" },
        ]}
      />
    </div>
  );
}

/* ═══════════ EXPERIENCE ═══════════ */
export function ExperiencesEditor() {
  const { draft, setDraft } = useDraft("experiences");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Experience Timeline</h2>
        <ListEditor
          title="Entries"
          addLabel="Add experience"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ title: "New role", titleBn: "", company: "", companyBn: "", period: "", description: "", descriptionBn: "", icon: "briefcase", type: "work", typeBn: "" })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Job title" value={item.title} valueBn={item.titleBn} onChange={(v) => update({ title: v })} onChangeBn={(v) => update({ titleBn: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company" value={item.company} onChange={(v) => update({ company: v })} />
                <Field label="Company (বাংলা)" value={item.companyBn ?? ""} onChange={(v) => update({ companyBn: v })} />
                <Field label="Period" value={item.period} onChange={(v) => update({ period: v })} hint="2023 — Present" />
                <SelectField
                  label="Type"
                  value={item.type}
                  onChange={(v) => update({ type: v })}
                  options={[
                    { value: "work", label: "Work" },
                    { value: "education", label: "Education" },
                    { value: "freelance", label: "Freelance" },
                  ]}
                />
                <Field label="Type (বাংলা)" value={item.typeBn ?? ""} onChange={(v) => update({ typeBn: v })} />
                <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
              </div>
              <BilingualField label="Description" value={item.description} valueBn={item.descriptionBn} onChange={(v) => update({ description: v })} onChangeBn={(v) => update({ descriptionBn: v })} textarea />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="experiences" getDraft={() => draft} label="Experience" />
    </div>
  );
}

/* ═══════════ EDUCATION ═══════════ */
export function EducationEditor() {
  const { draft, setDraft } = useDraft("education");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Education</h2>
        <ListEditor
          title="Entries"
          addLabel="Add education"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ degree: "New degree", degreeBn: "", institution: "", institutionBn: "", period: "", periodBn: "", icon: "graduationcap" })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Degree" value={item.degree} valueBn={item.degreeBn} onChange={(v) => update({ degree: v })} onChangeBn={(v) => update({ degreeBn: v })} />
              <BilingualField label="Institution" value={item.institution} valueBn={item.institutionBn} onChange={(v) => update({ institution: v })} onChangeBn={(v) => update({ institutionBn: v })} />
              <BilingualField label="Period" value={item.period} valueBn={item.periodBn} onChange={(v) => update({ period: v })} onChangeBn={(v) => update({ periodBn: v })} />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="education" getDraft={() => draft} label="Education" />
    </div>
  );
}

/* ═══════════ TESTIMONIALS ═══════════ */
export function TestimonialsEditor() {
  const { draft, setDraft } = useDraft("testimonials");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Testimonials</h2>
        <ListEditor
          title="Quotes"
          addLabel="Add testimonial"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ name: "Client", nameBn: "", role: "", roleBn: "", quote: "", quoteBn: "" })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Name" value={item.name} valueBn={item.nameBn} onChange={(v) => update({ name: v })} onChangeBn={(v) => update({ nameBn: v })} />
              <BilingualField label="Role" value={item.role} valueBn={item.roleBn} onChange={(v) => update({ role: v })} onChangeBn={(v) => update({ roleBn: v })} />
              <BilingualField label="Quote" value={item.quote} valueBn={item.quoteBn} onChange={(v) => update({ quote: v })} onChangeBn={(v) => update({ quoteBn: v })} textarea />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="testimonials" getDraft={() => draft} label="Testimonials" />
    </div>
  );
}

/* ═══════════ CERTIFICATES ═══════════ */
export function CertificatesEditor() {
  const { draft, setDraft } = useDraft("certificates");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Certificates</h2>
        <ListEditor
          title="Certificates"
          addLabel="Add certificate"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ title: "Certificate", titleBn: "", issuer: "", issuerBn: "", date: "", dateBn: "", color: "#06b6d4" })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Title" value={item.title} valueBn={item.titleBn} onChange={(v) => update({ title: v })} onChangeBn={(v) => update({ titleBn: v })} />
              <BilingualField label="Issuer" value={item.issuer} valueBn={item.issuerBn} onChange={(v) => update({ issuer: v })} onChangeBn={(v) => update({ issuerBn: v })} />
              <BilingualField label="Date" value={item.date} valueBn={item.dateBn} onChange={(v) => update({ date: v })} onChangeBn={(v) => update({ dateBn: v })} />
              <ColorField label="Accent color" value={item.color ?? "#06b6d4"} onChange={(v) => update({ color: v })} fallback="#06b6d4" hint="Certificate card-এর গ্রেডিয়েন্ট রঙ" />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="certificates" getDraft={() => draft} label="Certificates" />
    </div>
  );
}

/* ═══════════ FAQ ═══════════ */
export function FaqEditor() {
  const { draft, setDraft } = useDraft("faq");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">FAQ</h2>
        <ListEditor
          title="Questions"
          addLabel="Add question"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ question: "New question?", questionBn: "", answer: "", answerBn: "" })}
          renderItem={(item, update) => (
            <>
              <BilingualField label="Question" value={item.question} valueBn={item.questionBn} onChange={(v) => update({ question: v })} onChangeBn={(v) => update({ questionBn: v })} />
              <BilingualField label="Answer" value={item.answer} valueBn={item.answerBn} onChange={(v) => update({ answer: v })} onChangeBn={(v) => update({ answerBn: v })} textarea />
            </>
          )}
        />
      </EditorCard>
      <SaveBar section="faq" getDraft={() => draft} label="FAQ" />
    </div>
  );
}

/* ═══════════ CONTACT INFO ═══════════ */
export function ContactInfoEditor() {
  const { draft, setDraft } = useDraft("contactInfo");

  return (
    <div>
      <EditorCard>
        <h2 className="text-lg font-bold">Contact Info Cards</h2>
        <ListEditor
          title="Info cards"
          addLabel="Add card"
          items={draft}
          onChange={setDraft}
          createNew={() => ({ icon: "mail", title: "Email", titleBn: "", value: "", valueEn: "", link: null })}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title (EN)" value={item.title} onChange={(v) => update({ title: v })} hint="Email / Location / Availability / Working Hours" />
              <Field label="Title (বাংলা)" value={item.titleBn ?? ""} onChange={(v) => update({ titleBn: v })} />
              <Field label="Value (বাংলা প্রদর্শন)" value={item.value} onChange={(v) => update({ value: v })} />
              <Field label="Value (EN display)" value={item.valueEn ?? ""} onChange={(v) => update({ valueEn: v })} />
              <Field label="Link (optional)" value={item.link ?? ""} onChange={(v) => update({ link: v || null })} hint="mailto:... বা যেকোনো URL" />
              <IconField label="Icon" value={item.icon} onChange={(v) => update({ icon: v })} hint="mail, map-pin, checkcircle, clock" />
            </div>
          )}
        />
      </EditorCard>
      <SaveBar section="contactInfo" getDraft={() => draft} label="Contact info" />
    </div>
  );
}
