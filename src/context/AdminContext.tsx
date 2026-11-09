"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiAdmin } from "@/lib/admin-api";
import {
  clearStoredAuth,
  ensureFreshToken,
  getStoredAuth,
  normalizeAuthError,
  sendPasswordReset,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/firebase-auth";

/**
 * Admin authentication — Firebase Auth (Email/Password), zero secrets.
 *
 * The ID token lives in localStorage (managed by src/lib/firebase-auth.ts)
 * and is attached automatically to every /api/admin call by admin-api.ts.
 * The server merely relays it to RTDB, where the rules authorise the
 * verified admin email.
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminContextValue {
  user: AdminUser | null;
  ready: boolean;
  /** true when the token passed the rules check (rules published & email matches) */
  rulesOk: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; warning?: string }>;
  signup: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const toUser = (email: string): AdminUser => ({
  id: email,
  email,
  name: email.split("@")[0] || "Admin",
  role: "admin",
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [rulesOk, setRulesOk] = useState(false);

  /** Verify the current token against the rules; returns error code or null. */
  const verify = useCallback(async (): Promise<string | null> => {
    try {
      await apiAdmin("verify");
      setRulesOk(true);
      return null;
    } catch (err) {
      setRulesOk(false);
      return err instanceof Error ? err.message : "error";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = getStoredAuth();
      if (!stored) {
        if (!cancelled) setReady(true);
        return;
      }
      const token = await ensureFreshToken();
      if (cancelled) return;
      if (!token) {
        // refresh token revoked / password changed → clean re-login
        clearStoredAuth();
        setReady(true);
        return;
      }
      setUser(toUser(stored.email || "admin"));
      await verify();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [verify]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const state = await signInWithPassword(email.trim(), password);
        setUser(toUser(state.email || email.trim()));
        const problem = await verify();
        if (problem === "permission_denied") {
          return {
            ok: true,
            warning:
              "লগইন সফল, কিন্তু Firebase rules এখনো আপডেট হয়নি — README ধাপ ২ দেখুন / Logged in, but the database rules need updating (README step 2)",
          };
        }
        if (problem === "auth_expired") {
          return { ok: false, error: "auth_expired" };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: normalizeAuthError(err instanceof Error ? err.message : "error") };
      }
    },
    [verify]
  );

  const signup = useCallback(async (email: string, password: string) => {
    try {
      const { verificationSent } = await signUpWithPassword(email.trim(), password);
      setUser(toUser(email.trim()));
      return {
        ok: true,
        message: verificationSent
          ? "অ্যাকাউন্ট তৈরি হয়েছে — ইমেইলে পাঠানো verification লিঙ্কে ক্লিক করুন, তারপর লগইন করুন / Account created — click the verification link we emailed, then log in"
          : "অ্যাকাউন্ট তৈরি হয়েছে — ইমেইল verify করে লগইন করুন / Account created — verify the email, then log in",
      };
    } catch (err) {
      const code = normalizeAuthError(err instanceof Error ? err.message : "error");
      if (code === "email_exists") {
        return {
          ok: false,
          error: code,
          message: "এই ইমেইলে অ্যাকাউন্ট আছে — লগইন করুন বা পাসওয়ার্ড রিসেট করুন / Account exists — log in or reset the password",
        };
      }
      return { ok: false, error: code };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordReset(email.trim());
      return {
        ok: true,
        message:
          "পাসওয়ার্ড রিসেট লিঙ্ক ইমেইলে পাঠানো হয়েছে / Password reset link sent — check the inbox",
      };
    } catch (err) {
      return { ok: false, error: normalizeAuthError(err instanceof Error ? err.message : "error") };
    }
  }, []);

  const logout = useCallback(async () => {
    clearStoredAuth();
    setUser(null);
    setRulesOk(false);
  }, []);

  const value = useMemo(
    () => ({ user, ready, rulesOk, login, signup, resetPassword, logout }),
    [user, ready, rulesOk, login, signup, resetPassword, logout]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
