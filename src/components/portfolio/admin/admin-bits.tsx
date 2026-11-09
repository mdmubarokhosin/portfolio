"use client";

/**
 * admin-bits — shared building blocks for every Admin Panel editor.
 *
 * Power features:
 *  • ListEditor — search, item count, duplicate, move, delete, expand/collapse all
 *  • IconField  — visual icon picker grid (same icon set the public site uses)
 *  • ColorField — native color picker + hex input
 *  • SelectField / SaveBar / EditorCard — themed to match the public site
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { savePortfolioSection, type PortfolioSectionKey } from "@/lib/portfolio-store";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { ICON_CHOICES, Icon } from "@/components/icons";

/* ── single-line field ─────────────────────────────────────────── */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg bg-background"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── multiline field ───────────────────────────────────────────── */
export function AreaField({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="resize-y rounded-lg bg-background"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── media URL field (ANY hosting, ANY domain) ─────────────────── */
/**
 * MediaUrlField — video / image URL input that accepts a direct link from
 * ANY hosting and ANY domain (https://cdn.example.com/clip.mp4 — Cloudflare
 * R2, Cloudinary, GitHub, Backblaze, যেকোনো হোস্ট) as well as local paths.
 *
 * Shows a live preview and verifies the link actually loads in the browser
 * (✓ কাজ করছে / ✗ লোড হচ্ছে না) via media element events — no CORS false
 * alarms. The preview is debounced so typing doesn't hammer the remote host.
 */
export function MediaUrlField({
  label,
  value,
  onChange,
  kind,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind: "video" | "image";
  hint?: string;
  placeholder?: string;
}) {
  const url = (value ?? "").trim();
  const [preview, setPreview] = useState("");
  const [syncedUrl, setSyncedUrl] = useState(url);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    url ? "loading" : "idle"
  );

  /* Adjust state on value change (React's render-time adjustment pattern —
     the codebase uses the same approach in the admin editors). */
  if (url !== syncedUrl) {
    setSyncedUrl(url);
    if (!url) {
      setPreview("");
      setStatus("idle");
    } else {
      setStatus("loading");
    }
  }

  /* Debounce → the remote URL is only fetched 600ms after typing stops */
  useEffect(() => {
    if (!url) return;
    const t = setTimeout(() => setPreview(url), 600);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        type="url"
        inputMode="url"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "https://…"}
        spellCheck={false}
        className="h-10 rounded-lg bg-background font-mono text-xs"
      />
      {url && (
        <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/30 p-2">
          {kind === "video" ? (
            preview ? (
              <video
                key={preview}
                src={preview}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setStatus("ok")}
                onError={() => setStatus("error")}
                className="h-16 w-28 shrink-0 rounded-md bg-black/10 object-cover"
              />
            ) : (
              <span className="h-16 w-28 shrink-0 animate-pulse rounded-md bg-muted" aria-hidden />
            )
          ) : preview ? (
            <img
              key={preview}
              src={preview}
              alt="Preview"
              onLoad={() => setStatus("ok")}
              onError={() => setStatus("error")}
              className="h-16 w-28 shrink-0 rounded-md bg-muted object-cover"
            />
          ) : (
            <span className="h-16 w-28 shrink-0 animate-pulse rounded-md bg-muted" aria-hidden />
          )}
          <div className="min-w-0 flex-1 text-[11px] leading-snug">
            {status === "loading" && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> লিংক চেক করা হচ্ছে…
              </span>
            )}
            {status === "ok" && (
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> লিংক কাজ করছে ✓ — যেকোনো হোস্টিং/ডোমেইন থেকে চলবে
              </span>
            )}
            {status === "error" && (
              <span className="flex items-start gap-1.5 font-medium text-red-600 dark:text-red-400">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> লিংক লোড হচ্ছে না — ফাইলের সরাসরি direct লিংক দিন (.mp4/.jpg), পেজের লিংক নয়
              </span>
            )}
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" title={url}>
              {url}
            </p>
          </div>
        </div>
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── bilingual pair (base + বাংলা) ─────────────────────────────── */
export function BilingualField({
  label,
  value,
  valueBn,
  onChange,
  onChangeBn,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  valueBn?: string;
  onChange: (v: string) => void;
  onChangeBn: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FieldOrArea
        label={`${label} (EN)`}
        value={value}
        onChange={onChange}
        textarea={textarea}
        rows={rows}
      />
      <FieldOrArea
        label={`${label} (বাংলা)`}
        value={valueBn ?? ""}
        onChange={onChangeBn}
        textarea={textarea}
        rows={rows}
      />
    </div>
  );
}

function FieldOrArea({
  label,
  value,
  onChange,
  textarea,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return textarea ? (
    <AreaField label={label} value={value} onChange={onChange} rows={rows} />
  ) : (
    <Field label={label} value={value} onChange={onChange} />
  );
}

/* ── numeric field ─────────────────────────────────────────────── */
export function NumField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10 rounded-lg bg-background"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── select field ──────────────────────────────────────────────── */
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── color field (picker + hex) ────────────────────────────────── */
export function ColorField({
  label,
  value,
  onChange,
  fallback = "#06b6d4",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fallback?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value) ? value : fallback}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
          aria-label={`${label} picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          className="h-10 flex-1 rounded-lg bg-background font-mono text-xs"
        />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── visual icon picker (grid popup) ───────────────────────────── */
export function IconField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = ICON_CHOICES.find((c) => c.value === (value || "").toLowerCase().trim());

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:border-primary/40"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name={value} className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 text-left font-mono text-xs">{current?.value ?? (value || "code")}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-border bg-card p-2.5 shadow-xl">
            <div className="grid max-h-52 grid-cols-6 gap-1 overflow-y-auto scrollbar-thin sm:grid-cols-8">
              {ICON_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  aria-label={`Icon ${c.label}`}
                  onClick={() => {
                    onChange(c.value);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center rounded-lg transition-colors ${
                    c.value === (value || "").toLowerCase().trim()
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon name={c.value} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── switch row ────────────────────────────────────────────────── */
export function SwitchField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ── collapsible list editor — search, duplicate, reorder, count ─ */
export function ListEditor<T>({
  items,
  onChange,
  createNew,
  title,
  renderItem,
  addLabel,
  itemKey,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  createNew: () => T;
  title: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  /** optionally show which item field is editable — used for the summary chip */
  itemKey?: (item: T) => string | undefined;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.map((item, idx) => ({ item, idx }));
    return items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => JSON.stringify(item ?? {}).toLowerCase().includes(q));
  }, [items, query]);

  const updateAt = (idx: number, patch: Partial<T>) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
    setOpen(target);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const duplicate = (idx: number) => {
    const clone = JSON.parse(JSON.stringify(items[idx])) as T;
    onChange([...items.slice(0, idx + 1), clone, ...items.slice(idx + 1)]);
    setOpen(idx + 1);
    toast.success("Item duplicated");
  };
  const add = () => {
    onChange([...items, createNew()]);
    setOpen(items.length);
    setQuery("");
  };

  const titleOf = (item: T, idx: number): string => {
    if (itemKey) return itemKey(item) || `#${idx + 1}`;
    const rec = item as { title?: string; name?: string; label?: string; question?: string; degree?: string };
    return rec.title || rec.name || rec.label || rec.question || rec.degree || `#${idx + 1}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          {title}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary">
            {items.length}
          </span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {items.length > 3 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items…"
                className="h-8 w-40 rounded-lg bg-background pl-8 text-xs sm:w-48"
                aria-label={`Search ${title}`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(open === -2 ? null : -2)}
            className="rounded-lg text-xs"
            title="Expand or collapse all"
          >
            {open === -2 ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
            {open === -2 ? "Collapse" : "Expand"}
          </Button>
          <Button size="sm" variant="outline" onClick={add} className="rounded-lg">
            <Plus className="mr-1.5 h-4 w-4" /> {addLabel}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(({ item, idx }) => (
          <Card key={idx} className="rounded-xl border-border/70">
            <button
              type="button"
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-secondary/50"
            >
              <span className="min-w-0 flex-1 truncate">
                <span className="mr-2 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {idx + 1}
                </span>
                {titleOf(item, idx)}
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Move up"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(idx, -1);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && move(idx, -1)}
                  className="rounded p-1 hover:bg-secondary"
                >
                  <ChevronUp className="h-4 w-4" />
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Move down"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(idx, 1);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && move(idx, 1)}
                  className="rounded p-1 hover:bg-secondary"
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Duplicate item"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicate(idx);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && duplicate(idx)}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(idx);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && remove(idx)}
                  className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </span>
                {open === idx ? (
                  <ChevronUp className="ml-1 h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
                )}
              </span>
            </button>
            {(open === idx || open === -2) && (
              <CardContent className="space-y-4 rounded-b-xl border-t border-border/60 pt-4">
                {renderItem(item, (patch) => updateAt(idx, patch))}
              </CardContent>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/70 py-6 text-center text-sm text-muted-foreground">
            {query ? `No items match "${query}"` : "Empty — add the first item."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── sticky save bar ───────────────────────────────────────────── */

export interface SaveTarget {
  section: PortfolioSectionKey;
  getDraft: () => unknown;
  label: string;
}

/**
 * Sticky save bar.
 *
 * Accepts either a single target (`section` + `getDraft` + `label`) or a
 * combined `sections` list. IMPORTANT: an editor that mutates more than one
 * Firebase section MUST pass one combined SaveBar (via `sections`) instead of
 * rendering multiple SaveBars — multiple sticky bars would stack at the same
 * viewport position and cover each other, making the lower ones unclickable.
 */
export function SaveBar({
  section,
  getDraft,
  label,
  sections,
}: {
  section?: PortfolioSectionKey;
  getDraft?: () => unknown;
  label?: string;
  sections?: SaveTarget[];
}) {
  const { refresh } = usePortfolioData();
  const [saving, setSaving] = useState(false);

  const targets: SaveTarget[] =
    sections ??
    (section && getDraft
      ? [{ section, getDraft: getDraft as () => unknown, label: label ?? "Content" }]
      : []);

  const save = async () => {
    setSaving(true);
    try {
      for (const t of targets) {
        await savePortfolioSection(t.section, t.getDraft());
      }
      await refresh();
      toast.success(
        targets.length > 1
          ? `${targets.map((t) => t.label).join(" + ")} saved to Firebase ✓`
          : `${targets[0]?.label ?? "Content"} saved to Firebase ✓`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (targets.length === 0) return null;

  return (
    <div className="sticky bottom-4 z-30 mt-6 flex justify-end">
      <Button
        onClick={save}
        disabled={saving}
        className="h-11 rounded-xl bg-gradient-to-r from-primary to-teal-500 px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save to Firebase
      </Button>
    </div>
  );
}

/* ── editor page wrapper ───────────────────────────────────────── */
export function EditorCard({
  children,
  icon: IconCmp,
}: {
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card transition-shadow hover:shadow-md hover:shadow-primary/5">
      <CardContent className="space-y-5 p-5 sm:p-6">
        {IconCmp && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-500/15 text-primary">
            <IconCmp className="h-4.5 w-4.5" />
          </span>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
