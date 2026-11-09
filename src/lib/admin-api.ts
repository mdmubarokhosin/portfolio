"use client";

/**
 * Typed client bridge to this app's server API routes.
 *
 * Privileged Firebase operations are proxied through POST /api/admin. The
 * admin's Firebase Auth ID token is attached AUTOMATICALLY to every call
 * (set once at login / page load — callers never pass it by hand), and the
 * server relays it to RTDB as `?access_token=…` where the database RULES
 * decide what the identity may do. No secret ever lives on the server.
 *
 * When RTDB answers "token expired" the token is refreshed transparently
 * and the request is retried exactly once. When there is NO session at
 * all, a friendly "session_expired" error is thrown BEFORE hitting the
 * server — so the admin panel never shows a raw "unauthorized" toast.
 */

import { clearStoredAuth, ensureFreshToken, forceRefreshToken } from "./firebase-auth";

/** Bilingual, human-readable text for every known error code. */
const FRIENDLY_MESSAGES: Record<string, string> = {
  unauthorized: "সেশন শেষ — আবার লগইন করুন / Session expired — please log in again",
  session_expired: "সেশন শেষ — আবার লগইন করুন / Session expired — please log in again",
  auth_expired: "সেশন শেষ — আবার লগইন করুন / Session expired — please log in again",
  permission_denied:
    "Firebase rules অনুমতি দেয়নি — ভেরিফায়েড অ্যাডমিন ইমেইল (contact.mdmubarok@gmail.com) দিয়ে লগইন করুন, আর firebase.rules.json পাবলিশ করা আছে কি না দেখুন / Not allowed by database rules — log in with the verified admin email and make sure firebase.rules.json is published",
  rules_block:
    "Firebase rules অনুমতি দেয়নি — firebase.rules.json পাবলিশ করা আছে কি না দেখুন / Blocked by database rules — make sure firebase.rules.json is published",
  network: "নেটওয়ার্ক সমস্যা — ইন্টারনেট সংযোগ দেখুন / Network problem — check your connection",
  bad_request: "রিকোয়েস্টটি সঠিক নয় — আবার চেষ্টা করুন / Invalid request — please try again",
  unknown_action: "অজানা অ্যাকশন — অ্যাপ আপডেট করুন / Unknown action — update the app",
  server_error: "সার্ভার সমস্যা — কিছুক্ষণ পরে আবার চেষ্টা করুন / Server error — please try again shortly",
};

export class ApiError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    // Toasts render err.message — keep it bilingual & actionable, keep the
    // stable machine code in .code for programmatic handling.
    super(message ?? FRIENDLY_MESSAGES[code] ?? code);
    this.code = code;
  }
}

async function postJsonRaw<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError("network", String(err));
  }
  let data: { ok?: boolean; error?: string; [k: string]: unknown } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || data.ok === false) {
    throw new ApiError(String(data.error ?? `http_${res.status}`));
  }
  return data as T;
}

/** Call a privileged admin action: POST /api/admin {action, token, …payload} */
export async function apiAdmin<T = { ok: true } & Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  // Attach the Firebase Auth ID token automatically. Without a session we
  // fail fast with a clear message instead of a raw "unauthorized" reply.
  const token = await ensureFreshToken();
  if (!token) throw new ApiError("session_expired");

  const base = { action, token, ...payload };
  try {
    return await postJsonRaw<T>("/api/admin", base);
  } catch (err) {
    // ID token expired between check and call → refresh once and retry.
    if (err instanceof ApiError && (err.code === "auth_expired" || err.code === "unauthorized")) {
      const fresh = await forceRefreshToken();
      if (fresh) {
        return postJsonRaw<T>("/api/admin", { ...base, token: fresh });
      }
      clearStoredAuth();
      throw new ApiError("session_expired");
    }
    throw err;
  }
}

/** Public contact form → POST /api/contact (public write, no token needed) */
export function apiContact(msg: {
  name: string;
  email: string;
  subject: string;
  budget?: string;
  message: string;
}): Promise<{ ok: true }> {
  return postJsonRaw<{ ok: true }>("/api/contact", msg);
}

/** Fire-and-forget visitor counter → POST /api/visitors (public write) */
export function apiVisit(): Promise<{ ok: true } | { ok: false }> {
  return postJsonRaw<{ ok: true }>("/api/visitors", {}).catch(() => ({ ok: false }) as { ok: false });
}
