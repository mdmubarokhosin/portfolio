import "server-only";

/**
 * Server-only Firebase RTDB relay — NO secrets stored anywhere.
 *
 * The browser sends the admin's Firebase Auth ID token with every request
 * to /api/admin. This module relays it to the Realtime Database REST API
 * as `?access_token=<idToken>`; the DATABASE RULES (firebase.rules.json)
 * are the single source of authority — they allow writes only to the
 * verified admin email and the public contact/visitor nodes.
 *
 * Nothing is configured server-side: no FIREBASE_DB_SECRET, no service
 * account, no env vars. Deploy the same code anywhere and it works.
 *
 * Error codes thrown (mapped by the API routes):
 *   auth_expired     → the ID token is invalid or expired (401)
 *   permission_denied→ the rules refuse this identity/action (403)
 *   firebase_*_failed→ transport/RTDB failure
 */

import { FIREBASE_CONFIG } from "@/lib/firebase";

const BASE = FIREBASE_CONFIG.databaseURL.replace(/\/$/, "");

export interface RelayOptions {
  /** shallow=true keeps big reads tiny (verify ping). */
  shallow?: boolean;
}

async function relayFetch<T>(
  verb: "GET" | "PUT" | "PATCH" | "DELETE",
  path: string,
  token: string | null,
  body?: unknown,
  opts?: RelayOptions
): Promise<T | null> {
  const params = new URLSearchParams();
  // RTDB REST accepts Firebase Auth ID tokens via `auth=` — NOT via
  // `access_token=` (that param is for OAuth2 access tokens and is
  // rejected with "Unauthorized request." → the infamous 401 bug).
  if (token) params.set("auth", token);
  if (opts?.shallow) params.set("shallow", "true");
  const qs = params.toString();

  const res = await fetch(`${BASE}/${path}.json${qs ? `?${qs}` : ""}`, {
    method: verb,
    cache: "no-store",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body ?? null) : undefined,
  });

  if (res.status === 401) throw new Error("auth_expired");
  if (res.status === 403) throw new Error("permission_denied");
  if (!res.ok) throw new Error(`firebase_${verb}_failed_${res.status}`);

  const text = await res.text();
  if (text === "null" || text === "") return null;
  return JSON.parse(text) as T;
}

// ── Privileged operations (token-relayed) ───────────────────────────

export async function adminGet<T>(
  path: string,
  token: string | null,
  opts?: RelayOptions
): Promise<T | null> {
  return relayFetch<T>("GET", path, token, undefined, opts);
}

export async function adminSet(
  path: string,
  value: unknown,
  token: string | null
): Promise<void> {
  await relayFetch("PUT", path, token, value);
}

export async function adminUpdate(
  path: string,
  value: Record<string, unknown>,
  token: string | null
): Promise<void> {
  await relayFetch("PATCH", path, token, value);
}

export async function adminRemove(path: string, token: string | null): Promise<void> {
  await relayFetch("DELETE", path, token);
}

/**
 * Bump the lightweight sync markers so live visitors pick up changes on
 * the next poll without a full download (see PortfolioDataContext).
 */
export async function bumpSync(
  keys: Array<"portfolio" | "settings">,
  token: string | null
): Promise<void> {
  const now = Date.now();
  const patch: Record<string, number> = {};
  for (const k of keys) patch[k] = now;
  await relayFetch("PATCH", "sync", token, patch).catch(() => undefined);
}
