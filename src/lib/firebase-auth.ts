"use client";

/**
 * Firebase Authentication — pure REST client (NO SDK, NO database secret).
 *
 * The admin logs in with Email/Password against the project's Firebase
 * Auth. The resulting short-lived ID token (1 h) is what authorises every
 * privileged call:
 *
 *   • browser → /api/admin {action, token} → server relays to RTDB with
 *     `?access_token=<idToken>` → the DATABASE RULES (not a secret) decide
 *     what the identity may do (see firebase.rules.json).
 *
 * Setup the owner must do ONCE (no secrets, README → Firebase Security):
 *   1. Firebase Console → Authentication → Sign-in method → Email/Password
 *      enabled (already on for this project).
 *   2. In the Admin Panel login screen choose "নতুন অ্যাকাউন্ট" and register
 *      the admin email (the one hardcoded in firebase.rules.json), then
 *      click the verification link Firebase emails you.
 *
 * Tokens are persisted in localStorage (the same place the official
 * Firebase web SDK keeps refresh tokens) and refreshed automatically.
 */

import { FIREBASE_CONFIG } from "./firebase";

const API_KEY = FIREBASE_CONFIG.apiKey;
const SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
const SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
const OOBCODE_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;
const TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

const STORAGE_KEY = "mmh_firebase_admin_auth";
/** Refresh when the token has less than 2 minutes of life left. */
const EXPIRY_MARGIN_MS = 2 * 60_000;

export interface FirebaseAuthState {
  idToken: string;
  refreshToken: string;
  /** epoch ms when the idToken stops being valid */
  expiresAt: number;
  email: string;
}

// ── Local persistence ───────────────────────────────────────────────

export function getStoredAuth(): FirebaseAuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirebaseAuthState;
    return parsed?.idToken && parsed?.refreshToken ? parsed : null;
  } catch {
    return null;
  }
}

function storeAuth(state: FirebaseAuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ── Core REST calls ─────────────────────────────────────────────────

interface IdentityKitResponse {
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  email?: string;
  error?: { message?: string };
}

async function callIdentityKit(
  url: string,
  body: Record<string, unknown>
): Promise<IdentityKitResponse> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error("network_request_failed");
  }
  const data = (await res.json().catch(() => ({}))) as IdentityKitResponse;
  if (!res.ok) throw new Error(data.error?.message ?? `http_${res.status}`);
  return data;
}

function toState(data: IdentityKitResponse): FirebaseAuthState {
  if (!data.idToken || !data.refreshToken) throw new Error("auth_failed");
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (Number(data.expiresIn ?? 3600) || 3600) * 1000,
    email: data.email ?? "",
  };
}

/** Email + password login. Throws Firebase error codes on failure. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<FirebaseAuthState> {
  const data = await callIdentityKit(SIGNIN_URL, {
    email,
    password,
    returnSecureToken: true,
  });
  const state = toState(data);
  storeAuth(state);
  return state;
}

/**
 * Register a new admin account and immediately request the verification
 * email. The account only gains write power once the owner clicks the
 * link (rules require email_verified).
 */
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ verificationSent: boolean }> {
  const data = await callIdentityKit(SIGNUP_URL, {
    email,
    password,
    returnSecureToken: true,
  });
  const state = toState(data);
  storeAuth(state);
  let verificationSent = false;
  if (state.idToken) {
    verificationSent = await sendVerificationEmail(state.idToken).catch(() => false);
  }
  return { verificationSent };
}

/** Send (or re-send) the email verification link. */
export async function sendVerificationEmail(idToken: string): Promise<boolean> {
  await callIdentityKit(OOBCODE_URL, {
    requestType: "VERIFY_EMAIL",
    idToken,
  });
  return true;
}

/** Send the password-reset email to the given address. */
export async function sendPasswordReset(email: string): Promise<boolean> {
  await callIdentityKit(OOBCODE_URL, { requestType: "PASSWORD_RESET", email });
  return true;
}

/** Exchange the refresh token for a fresh ID token (updates storage). */
export async function refreshAuth(): Promise<FirebaseAuthState | null> {
  const current = getStoredAuth();
  if (!current?.refreshToken) return null;
  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: current.refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return current; // transient network issue — keep the old token
  }
  if (!res.ok) {
    // refresh token revoked / expired / password changed → force re-login
    clearStoredAuth();
    return null;
  }
  const data = (await res.json().catch(() => ({}))) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: string;
  };
  if (!data.id_token || !data.refresh_token) {
    clearStoredAuth();
    return null;
  }
  const fresh: FirebaseAuthState = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in ?? 3600) || 3600) * 1000,
    email: current.email,
  };
  storeAuth(fresh);
  return fresh;
}

/**
 * Return a valid ID token — refreshing it first when close to expiry.
 * Returns null when the visitor is not logged in.
 */
export async function ensureFreshToken(): Promise<string | null> {
  const current = getStoredAuth();
  if (!current) return null;
  if (current.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return current.idToken;
  const fresh = await refreshAuth();
  return fresh?.idToken ?? null;
}

/**
 * Force a refresh right now (used after an auth_expired API response) —
 * returns the new ID token or null when the session must be re-established.
 */
export async function forceRefreshToken(): Promise<string | null> {
  const fresh = await refreshAuth();
  return fresh?.idToken ?? null;
}

// ── Error translation ───────────────────────────────────────────────

/**
 * Map raw Firebase error codes to stable codes the UI understands.
 * Unmapped codes pass through unchanged.
 */
export function normalizeAuthError(raw: string): string {
  if (raw === "network_request_failed" || raw.startsWith("http_")) return "network";
  if (
    raw === "EMAIL_NOT_FOUND" ||
    raw === "INVALID_PASSWORD" ||
    raw === "INVALID_LOGIN_CREDENTIALS"
  )
    return "invalid_credentials";
  if (raw === "INVALID_EMAIL") return "invalid_email";
  if (raw === "EMAIL_EXISTS") return "email_exists";
  if (raw === "WEAK_PASSWORD") return "weak_password";
  if (raw === "TOO_MANY_ATTEMPTS_TRY_LATER") return "rate_limited";
  if (raw === "USER_DISABLED") return "user_disabled";
  if (raw === "ADMIN_ONLY_OPERATION" || raw === "OPERATION_NOT_ALLOWED")
    return "provider_disabled";
  return raw;
}
