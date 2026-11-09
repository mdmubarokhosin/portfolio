"use client";

/**
 * AdminYouTubeSettings — admin settings card for the /youtube page.
 *
 * Manages three settings keys (same storage format as every other setting):
 *   • youtube_channel_id    — required, UC… channel ID from YouTube Studio
 *   • youtube_api_key       — optional; when missing/expired the site falls
 *                             back to the keyless channel scrape + RSS
 *   • youtube_videos_limit  — how many videos to show (default 12, max 50)
 *
 * "Test connection" (POST /api/youtube/test) verifies the saved channel ID
 * and API key live — the key itself never leaves the server.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  PlugZap,
  Save,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { EditorCard, Field } from "./admin-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { saveSetting } from "@/lib/portfolio-store";

const SETTING_KEYS = [
  "youtube_channel_id",
  "youtube_api_key",
  "youtube_videos_limit",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

const DEFAULTS: Record<SettingKey, string> = {
  youtube_channel_id: "",
  youtube_api_key: "",
  youtube_videos_limit: "12",
};

type TestResult = {
  ok: boolean;
  error?: string;
  channel?: {
    found: boolean;
    title?: string;
    subscribers?: number | null;
    videos?: number | null;
    views?: number | null;
  };
  apiKey?: "none" | "valid" | "expired" | "invalid" | "quota" | "error";
};

const KEY_LABELS: Record<NonNullable<TestResult["apiKey"]>, string> = {
  none: "Key নেই (অপশনাল)",
  valid: "Key ঠিক আছে ✓",
  expired: "Key-এর মেয়াদ শেষ ✗",
  invalid: "Key ভুল ✗",
  quota: "Key quota শেষ ✗",
  error: "Key পরীক্ষা ব্যর্থ ✗",
};

function clampLimitInput(raw: string): string {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULTS.youtube_videos_limit;
  return String(Math.min(50, Math.max(1, Math.round(n))));
}

function AdminYouTubeSettings() {
  const { settings, refresh } = usePortfolioData();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [draft, setDraft] = useState<Record<SettingKey, string>>(() => ({
    youtube_channel_id: settings.youtube_channel_id ?? "",
    youtube_api_key: settings.youtube_api_key ?? "",
    youtube_videos_limit: settings.youtube_videos_limit || DEFAULTS.youtube_videos_limit,
  }));

  // Keep the draft in sync when settings change upstream (refresh/restore).
  // React-approved pattern: adjust state during render when a tracked
  // upstream value changes (avoids set-state-in-effect cascades).
  const upstream = useMemo(
    () => [
      settings.youtube_channel_id ?? "",
      settings.youtube_api_key ?? "",
      settings.youtube_videos_limit || DEFAULTS.youtube_videos_limit,
    ].join("\u0000"),
    [
      settings.youtube_channel_id,
      settings.youtube_api_key,
      settings.youtube_videos_limit,
    ]
  );
  const [syncedUpstream, setSyncedUpstream] = useState(upstream);
  if (upstream !== syncedUpstream) {
    setSyncedUpstream(upstream);
    setDraft({
      youtube_channel_id: settings.youtube_channel_id ?? "",
      youtube_api_key: settings.youtube_api_key ?? "",
      youtube_videos_limit: settings.youtube_videos_limit || DEFAULTS.youtube_videos_limit,
    });
  }

  const set = (key: SettingKey, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const configured = Boolean((settings.youtube_channel_id ?? "").trim());

  const dirty = SETTING_KEYS.some(
    (k) => (draft[k] ?? "").trim() !== (settings[k] ?? DEFAULTS[k])
  );

  const runTest = async (announce = true) => {
    setTesting(true);
    try {
      const res = await fetch("/api/youtube/test", { method: "POST" });
      const json = (await res.json()) as TestResult;
      setTestResult(json);
      if (announce) {
        if (json.ok && json.channel?.found) {
          toast.success(
            `চ্যানেল পাওয়া গেছে ✓ ${json.channel.title ?? ""}${
              json.apiKey && json.apiKey !== "none" && json.apiKey !== "valid"
                ? " — তবে API key-এ সমস্যা আছে"
                : ""
            }`
          );
        } else if (json.ok) {
          toast.error("চ্যানেল খুঁজে পাওয়া যায়নি — Channel ID দেখে নিন");
        } else {
          toast.error(json.error === "not_configured"
            ? "আগে Channel ID সেভ করুন"
            : "টেস্ট ব্যর্থ হয়েছে");
        }
      }
    } catch {
      if (announce) toast.error("টেস্ট সার্ভারে পৌঁছায়নি");
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const next: Record<SettingKey, string> = {
        youtube_channel_id: draft.youtube_channel_id.trim(),
        youtube_api_key: draft.youtube_api_key.trim(),
        youtube_videos_limit: clampLimitInput(draft.youtube_videos_limit),
      };
      // only the deltas — much faster, same pattern as the main settings card
      await Promise.all(
        SETTING_KEYS.filter((k) => next[k] !== (settings[k] ?? "")).map((k) =>
          saveSetting(k, next[k])
        )
      );
      await refresh();
      toast.success(
        "YouTube settings saved to Firebase ✓ — /youtube পেজে চ্যানেল ও ভিডিও আপডেট হয়ে যাবে"
      );
      // auto-verify right after saving
      void runTest(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const preview = () => {
    window.open("/youtube", "_blank", "noopener,noreferrer");
  };

  const channelOk = testResult?.channel?.found;

  return (
    <EditorCard icon={Youtube}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold">
            YouTube Channel{" "}
            <span className="text-sm font-normal text-muted-foreground">
              (ভিডিও পেজ অটো-ফিড)
            </span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Channel ID দিলে /youtube পেজে চ্যানেলের সর্বশেষ ভিডিও, লোগো, ব্যানার, সাবস্ক্রাইবার,
            ভিডিও সংখ্যা ও মোট ভিউ অটোমেটিক লোড হবে — API key ছাড়াও সব কাজ করে (স্মার্ট ফলব্যাক)।
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            configured
              ? "shrink-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }
        >
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              configured ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {configured ? "Configured" : "Not configured"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Channel ID"
          value={draft.youtube_channel_id}
          onChange={(v) => set("youtube_channel_id", v)}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
          hint="YouTube Studio → Settings → Channel → Advanced, অথবা channel URL-এর /channel/UC... অংশ"
        />
        <Field
          label="Videos limit"
          type="number"
          value={draft.youtube_videos_limit}
          onChange={(v) => set("youtube_videos_limit", v)}
          placeholder="12"
          hint="1–50 — /youtube পেজে কতগুলো ভিডিও দেখানো হবে (ডিফল্ট ১২)"
        />
        <div className="sm:col-span-2">
          <Field
            label="API key (optional)"
            type="password"
            value={draft.youtube_api_key}
            onChange={(v) => set("youtube_api_key", v)}
            placeholder="AIza…"
            hint="অপশনাল — key না দিলেও লোগো/সাবস্ক্রাইবার/মোট ভিউ আসবে (চ্যানেল পেজ ফলব্যাক)। Google Cloud Console → YouTube Data API v3 → API key"
          />
        </div>
      </div>

      {/* live test result */}
      {testResult && (
        <div
          role="status"
          className={`mt-1 rounded-xl border p-3 text-xs ${
            testResult.ok && channelOk
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              {channelOk ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              )}
              {testResult.ok && channelOk
                ? `চ্যানেল OK — ${testResult.channel?.title ?? ""}`
                : "চ্যানেল পাওয়া যায়নি"}
            </span>
            {testResult.ok && channelOk && (
              <span>
                সাবস্ক্রাইবার: {testResult.channel?.subscribers ?? "—"} · ভিডিও:{" "}
                {testResult.channel?.videos ?? "—"} · মোট ভিউ:{" "}
                {testResult.channel?.views ?? "—"}
              </span>
            )}
            {testResult.apiKey && (
              <span
                className={
                  testResult.apiKey === "none" || testResult.apiKey === "valid"
                    ? ""
                    : "font-semibold text-red-600 dark:text-red-400"
                }
              >
                {KEY_LABELS[testResult.apiKey]}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          {dirty
            ? "অসংরক্ষিত পরিবর্তন আছে — Save to Firebase চাপুন।"
            : "সব পরিবর্তন সংরক্ষিত আছে ✓"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void runTest()}
            disabled={testing || !configured}
            className="h-10 rounded-lg"
            aria-label="Test the saved YouTube channel ID and API key"
          >
            {testing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PlugZap className="mr-1.5 h-4 w-4" aria-hidden="true" />
            )}
            Test connection
          </Button>
          <Button
            variant="outline"
            onClick={preview}
            className="h-10 rounded-lg"
            aria-label="Preview the /youtube page in a new tab"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Preview /youtube
          </Button>
          <Button
            onClick={save}
            disabled={saving || !dirty}
            className="h-10 rounded-lg bg-gradient-to-r from-primary to-teal-500 font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-shadow hover:shadow-lg hover:shadow-primary/35"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Save to Firebase
          </Button>
        </div>
      </div>
    </EditorCard>
  );
}

export default AdminYouTubeSettings;
export { AdminYouTubeSettings };
