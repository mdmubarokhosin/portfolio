/**
 * Firebase Realtime Database — REST API client (browser-side)
 *
 * Uses pure fetch() → works everywhere: Next.js dev, static export,
 * Cloudflare Pages (no server required). The Firebase web config is
 * public by design (identifies the project, does not grant access).
 *
 * Auth model (compatible with the original portfolio database):
 *   users/{email-with-commas} = { id, email, name, password, role, ... }
 *   - password may be plaintext (legacy) or "salt:sha256hex" (new)
 *   - sessions/{token} = { userId, email, name, role, expiresAt }
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

// ── Low-level REST helpers ──────────────────────────────────────────
export async function dbGet<T = unknown>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${path}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    if (text === "null" || text === "") return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function dbSet(path: string, value: unknown): Promise<boolean> {
  const res = await fetch(`${BASE}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value ?? null),
  });
  if (!res.ok) throw new Error(`Firebase write failed (${res.status})`);
  return true;
}

export async function dbUpdate(path: string, value: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(`${BASE}/${path}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`Firebase update failed (${res.status})`);
  return true;
}

export async function dbRemove(path: string): Promise<boolean> {
  const res = await fetch(`${BASE}/${path}.json`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Firebase delete failed (${res.status})`);
  return true;
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

// ── Password hashing (Web Crypto — browser only) ────────────────────
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a salted hash in "salt:hash" format (upgrades legacy plaintext). */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateId() + generateId();
  const hash = await sha256Hex(salt + password);
  return `${salt}:${hash}`;
}

/**
 * Verify a password against what is stored in the database.
 * Supports: plaintext (legacy), "salt:sha256(salt+pw)", "salt:sha256(pw+salt)",
 * and a bare sha256 hex digest.
 */
export async function verifyPassword(stored: string, input: string): Promise<boolean> {
  if (typeof stored !== "string" || !stored) return false;

  // legacy plaintext (original site stored plain passwords)
  if (stored === input) return true;

  // salted format "salt:hash"
  if (stored.includes(":")) {
    const [salt, hash] = stored.split(":");
    if (salt && hash) {
      const a = await sha256Hex(salt + input);
      const b = await sha256Hex(input + salt);
      if (a === hash.toLowerCase() || b === hash.toLowerCase()) return true;
    }
    return false;
  }

  // bare sha256
  const plain = await sha256Hex(input);
  return plain === stored.toLowerCase();
}

// ── Session management ──────────────────────────────────────────────
const SESSION_KEY = "mmh_admin_session";
const SESSION_HOURS = 12;

export interface AdminSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
}

function readLocalSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function writeLocalSession(s: AdminSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

function clearLocalSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

/** Validate the stored session against the database (expiry + existence). */
export async function checkSession(): Promise<AdminSession | null> {
  const local = readLocalSession();
  if (!local) return null;
  const remote = await dbGet<AdminSession | null>(`sessions/${local.token}`);
  if (!remote) {
    clearLocalSession();
    return null;
  }
  if (new Date(remote.expiresAt).getTime() < Date.now()) {
    await dbRemove(`sessions/${local.token}`).catch(() => undefined);
    clearLocalSession();
    return null;
  }
  return remote;
}

/** Create a server-side (RTDB) session record for an authenticated user. */
export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<AdminSession> {
  const token = `${generateId()}${generateId()}`;
  const session: AdminSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString(),
  };
  await dbSet(`sessions/${token}`, session);
  writeLocalSession(session);
  return session;
}

export async function destroySession(): Promise<void> {
  const local = readLocalSession();
  if (local) await dbRemove(`sessions/${local.token}`).catch(() => undefined);
  clearLocalSession();
}

// ── User / auth operations ──────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const emailKey = (email: string) => email.replace(/\./g, ",");

export async function findUserByEmail(email: string): Promise<(AdminUser & { password: string; createdAt?: string; updatedAt?: string }) | null> {
  return dbGet(`users/${emailKey(email)}`);
}

/** Authenticate → verifies password (plaintext legacy, salted or bare sha256) and role. */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  const user = await findUserByEmail(email.trim());
  if (!user || !user.password) return { ok: false, error: "invalid" };
  const good = await verifyPassword(user.password, password);
  if (!good) return { ok: false, error: "invalid" };
  if (user.role !== "admin") return { ok: false, error: "role" };

  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name || "Admin", role: user.role },
  };
}

/** Change password (writes salted hash). */
export async function changeAdminPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 6) return { ok: false, error: "short" };
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, error: "nouser" };
  const good = await verifyPassword(user.password, currentPassword);
  if (!good) return { ok: false, error: "wrong" };
  const hashed = await hashPassword(newPassword);
  await dbUpdate(`users/${emailKey(email)}`, { password: hashed, updatedAt: nowISO() });
  return { ok: true };
}

/**
 * Change the admin email (mirrors the original site's PUT /api/admin/email):
 * verifies the current password, then moves the user record to the new key.
 */
export async function changeAdminEmail(
  email: string,
  currentPassword: string,
  newEmail: string
): Promise<{ ok: boolean; error?: string }> {
  const clean = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, error: "format" };
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, error: "nouser" };
  const good = await verifyPassword(user.password, currentPassword);
  if (!good) return { ok: false, error: "wrong" };
  if (clean !== email.toLowerCase()) {
    const exists = await findUserByEmail(clean);
    if (exists) return { ok: false, error: "taken" };
    await dbSet(`users/${emailKey(clean)}`, { ...user, email: clean, updatedAt: nowISO() });
    await dbRemove(`users/${emailKey(email)}`);
  }
  return { ok: true };
}
