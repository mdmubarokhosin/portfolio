import "server-only";

/**
 * POST /api/admin — the single privileged gateway to Firebase RTDB.
 *
 * AUTH MODEL (no server secret!): the client attaches the admin's Firebase
 * Auth ID token; this route relays it to RTDB as `?access_token=…` and the
 * DATABASE RULES decide everything. The server is a thin, stateless proxy —
 * deploy it anywhere with zero configuration.
 *
 * Public writes that never need a token live in their own routes
 * (/api/contact, /api/visitors) and are protected by rules + rate limits.
 */

import { NextResponse } from "next/server";
import {
  adminGet,
  adminSet,
  adminUpdate,
  adminRemove,
  bumpSync,
} from "@/lib/server/fb-admin";
import { SECTION_KEYS, type PortfolioSectionKey } from "@/lib/section-keys";
import { KNOWN_SETTINGS_KEYS, type SiteSettings } from "@/lib/site-settings";
import type { BackupBundle, ContactMessage } from "@/lib/portfolio-store";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
} as const;

const json = (body: Record<string, unknown>, status = 200) =>
  new NextResponse(JSON.stringify(body), { status, headers: CORS });

function parseSection(raw: unknown): unknown {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const node = raw as { dataJson?: string };
  if (typeof node.dataJson === "string") {
    try {
      return JSON.parse(node.dataJson);
    } catch {
      return null;
    }
  }
  return raw;
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const action = String(body.action ?? "");
  const token = typeof body.token === "string" && body.token ? body.token : null;

  // Every admin action is identity-checked by the RTDB rules — but a
  // missing token can never succeed, so short-circuit with a clear code.
  if (!token) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  try {
    switch (action) {
      // ── Session check (validates token + rules in one cheap read) ──
      case "verify": {
        // contactMessages is readable ONLY by the verified admin email —
        // a shallow read proves both token validity and rules setup.
        await adminGet("contactMessages", token, { shallow: true });
        return json({ ok: true, verified: true });
      }

      // ── Portfolio CRUD ────────────────────────────────────────────
      case "saveSection": {
        const section = String(body.section ?? "") as PortfolioSectionKey;
        if (!SECTION_KEYS.includes(section)) {
          return json({ ok: false, error: "bad_section" }, 400);
        }
        let value: unknown;
        try {
          value = JSON.parse(String(body.value ?? "null"));
        } catch {
          return json({ ok: false, error: "bad_json" }, 400);
        }
        await adminSet(
          `portfolio/${section}`,
          {
            dataJson: JSON.stringify(value ?? null),
            id: section,
            updatedAt: new Date().toISOString(),
          },
          token
        );
        await bumpSync(["portfolio"], token);
        return json({ ok: true });
      }

      case "syncAll": {
        const data = body.data as Record<string, string> | undefined;
        if (!data) return json({ ok: false, error: "bad_request" }, 400);
        let count = 0;
        for (const key of SECTION_KEYS) {
          if (!(key in data)) continue;
          let value: unknown;
          try {
            value = JSON.parse(String(data[key] ?? "null"));
          } catch {
            continue;
          }
          await adminSet(
            `portfolio/${key}`,
            {
              dataJson: JSON.stringify(value ?? null),
              id: key,
              updatedAt: new Date().toISOString(),
            },
            token
          );
          count++;
        }
        await bumpSync(["portfolio"], token);
        return json({ ok: true, count });
      }

      case "section.get": {
        const raw = await adminGet<Record<string, unknown>>("portfolio", token);
        return json({ ok: true, sections: raw ?? {} });
      }

      // ── Settings ──────────────────────────────────────────────────
      case "settings.save": {
        const key = String(body.key ?? "");
        if (!key) return json({ ok: false, error: "bad_request" }, 400);
        await adminSet(
          `settings/${key}`,
          {
            value: String(body.value ?? ""),
            updatedAt: new Date().toISOString(),
            id: key,
          },
          token
        );
        await bumpSync(["settings"], token);
        return json({ ok: true });
      }

      case "settings.saveMany": {
        const settings = (body.settings as Record<string, string> | undefined) ?? {};
        for (const [key, value] of Object.entries(settings)) {
          await adminSet(
            `settings/${key}`,
            {
              value: String(value ?? ""),
              updatedAt: new Date().toISOString(),
              id: key,
            },
            token
          );
        }
        await bumpSync(["settings"], token);
        return json({ ok: true, count: Object.keys(settings).length });
      }

      // ── Contact messages ──────────────────────────────────────────
      case "messages.list": {
        const raw = await adminGet<Record<string, Record<string, unknown>>>(
          "contactMessages",
          token
        );
        const messages: ContactMessage[] = Object.entries(raw ?? {})
          .map(([id, value]) => ({ id, ...(value ?? {}) }) as unknown as ContactMessage)
          .sort(
            (a, b) =>
              new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime()
          );
        return json({ ok: true, messages });
      }

      case "messages.markRead": {
        const id = String(body.id ?? "");
        if (!id) return json({ ok: false, error: "bad_request" }, 400);
        await adminUpdate(`contactMessages/${id}`, { read: body.read !== false }, token);
        return json({ ok: true });
      }

      case "messages.delete": {
        const id = String(body.id ?? "");
        if (!id) return json({ ok: false, error: "bad_request" }, 400);
        await adminRemove(`contactMessages/${id}`, token);
        return json({ ok: true });
      }

      // ── Stats ─────────────────────────────────────────────────────
      case "stats.resetVisitors": {
        await adminSet("stats/visitors", 0, token);
        return json({ ok: true });
      }

      case "stats.all": {
        const stats = await adminGet("stats", token);
        return json({ ok: true, stats });
      }

      // ── Backup / restore ──────────────────────────────────────────
      case "backup": {
        const [portfolio, settings, stats, messagesRaw] = await Promise.all([
          adminGet<Record<string, unknown>>("portfolio", token),
          adminGet<Record<string, { value?: string } | string>>("settings", token),
          adminGet("stats", token),
          adminGet<Record<string, Record<string, unknown>>>("contactMessages", token),
        ]);
        const settingsOut: Record<string, string> = {};
        for (const [k, v] of Object.entries(settings ?? {})) {
          settingsOut[k] = typeof v === "string" ? v : (v?.value ?? "");
        }
        const messages = Object.entries(messagesRaw ?? {}).map(([id, value]) => (
          { id, ...(value ?? {}) } as unknown as ContactMessage
        ));
        const bundle: BackupBundle = {
          exportedAt: new Date().toISOString(),
          version: 2,
          portfolio: portfolio ?? {},
          settings: settingsOut as SiteSettings,
          stats,
          contactMessages: messages,
        };
        return json({ ok: true, bundle });
      }

      case "restore": {
        const bundle = body.bundle as BackupBundle | undefined;
        if (!bundle || typeof bundle !== "object") {
          return json({ ok: false, error: "bad_request" }, 400);
        }
        let sections = 0;
        let settingsCount = 0;
        let messages = 0;
        if (bundle.portfolio) {
          for (const [key, value] of Object.entries(bundle.portfolio)) {
            if (!SECTION_KEYS.includes(key as PortfolioSectionKey)) continue;
            await adminSet(
              `portfolio/${key}`,
              {
                dataJson: JSON.stringify(parseSection(value) ?? null),
                id: key,
                updatedAt: new Date().toISOString(),
              },
              token
            );
            sections++;
          }
          if (body.deleteMissing) {
            const raw = await adminGet<Record<string, unknown>>("portfolio", token);
            for (const key of Object.keys(raw ?? {})) {
              if (
                SECTION_KEYS.includes(key as PortfolioSectionKey) &&
                !(key in bundle.portfolio)
              ) {
                await adminRemove(`portfolio/${key}`, token);
              }
            }
          }
        }
        if (bundle.settings) {
          for (const [key, value] of Object.entries(bundle.settings)) {
            if (typeof value !== "string") continue;
            await adminSet(
              `settings/${key}`,
              {
                value,
                updatedAt: new Date().toISOString(),
                id: key,
              },
              token
            );
            settingsCount++;
          }
        }
        if (body.withMessages && Array.isArray(bundle.contactMessages)) {
          for (const msg of bundle.contactMessages) {
            const { id, ...rest } = msg as unknown as { id?: string } & Record<string, unknown>;
            if (!id) continue;
            await adminSet(`contactMessages/${id}`, rest, token);
            messages++;
          }
        }
        await bumpSync(["portfolio", "settings"], token);
        return json({ ok: true, sections, settings: settingsCount, messages });
      }

      // ── Cleanup ───────────────────────────────────────────────────
      case "cleanup.scan": {
        const [raw, settings] = await Promise.all([
          adminGet<Record<string, unknown>>("portfolio", token),
          adminGet<Record<string, unknown>>("settings", token),
        ]);
        const roughBytes = (v: unknown): number => {
          try {
            return JSON.stringify(v)?.length ?? 0;
          } catch {
            return 0;
          }
        };
        const orphanSections = Object.entries(raw ?? {})
          .filter(([key]) => !SECTION_KEYS.includes(key as PortfolioSectionKey))
          .map(([key, value]) => ({ key, size: roughBytes(value) }));
        const unknownSettings = Object.entries(settings ?? {})
          .filter(([key]) => !KNOWN_SETTINGS_KEYS.includes(key))
          .map(([key, value]) => ({ key, size: roughBytes(value) }));
        return json({
          ok: true,
          report: {
            orphanSections,
            unknownSettings,
            totalOrphanBytes:
              orphanSections.reduce((a, b) => a + b.size, 0) +
              unknownSettings.reduce((a, b) => a + b.size, 0),
          },
        });
      }

      case "cleanup.delete": {
        const ns = body.namespace === "settings" ? "settings" : "portfolio";
        const key = String(body.key ?? "");
        if (!key || key === "personal") return json({ ok: false, error: "bad_request" }, 400);
        await adminRemove(`${ns}/${key}`, token);
        await bumpSync([ns === "portfolio" ? "portfolio" : "settings"], token);
        return json({ ok: true });
      }

      default:
        return json({ ok: false, error: "unknown_action" }, 400);
    }
  } catch (err) {
    const code = err instanceof Error ? err.message : "server_error";
    if (code === "auth_expired") {
      return json({ ok: false, error: "auth_expired" }, 401);
    }
    if (code === "permission_denied") {
      return json(
        {
          ok: false,
          error: "permission_denied",
          hint: "RTDB rules refused this action — publish firebase.rules.json and make sure the logged-in email is the admin email.",
        },
        403
      );
    }
    return json({ ok: false, error: "server_error" }, 500);
  }
}
