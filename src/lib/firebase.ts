/**
 * Firebase Realtime Database — public READ client (browser-side)
 *
 * Uses pure fetch() → works everywhere. The Firebase web config is public
 * by design (identifies the project, does not grant access).
 *
 * SECURITY MODEL (matches firebase.rules.json):
 *   • Visitors may READ  portfolio/, settings/, stats/  — nothing else.
 *   • Admin writes carry the Firebase Auth ID token (Email/Password login
 *     in /admin); the rules allow writes only to the VERIFIED admin email.
 *   • Public writes are limited to contact form submissions and the
 *     visitor counter (both validated by the rules).
 *   • There is NO server secret — the database rules are the authority.
 */

// ── Firebase Config ─────────────────────────────────────────────────
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDuKB0w9GeyXPTr9pBlyjjLrgumqqQPePU",
  authDomain: "md-mubarok-hossain.firebaseapp.com",
  databaseURL: "https://md-mubarok-hossain-default-rtdb.firebaseio.com",
  projectId: "md-mubarok-hossain",
  storageBucket: "md-mubarok-hossain.firebasestorage.app",
  messagingSenderId: "399079788020",
  appId: "1:399079788020:web:3121a231a7b432ff6bbda1",
} as const;

const BASE = FIREBASE_CONFIG.databaseURL.replace(/\/$/, "");

// ── Public read helper ──────────────────────────────────────────────
/**
 * Fetch a public node. Throws on network failure (so callers can show a
 * retry state) and returns null when the node simply does not exist.
 */
export async function dbGet<T = unknown>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/${path}.json`, { cache: "no-store" });
  } catch (err) {
    throw new Error("network", { cause: err });
  }
  if (!res.ok) throw new Error(`firebase_read_failed_${res.status}`);
  const text = await res.text();
  if (text === "null" || text === "") return null;
  return JSON.parse(text) as T;
}

export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const ctr = Math.random().toString(36).slice(2, 6);
  return `${ts}${rand}${ctr}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
