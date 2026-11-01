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
import {
  checkSession,
  destroySession,
  loginAdmin,
  changeAdminPassword,
  type AdminUser,
} from "@/lib/firebase";

interface AdminContextValue {
  user: AdminUser | null;
  ready: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (
    current: string,
    next: string
  ) => Promise<{ ok: boolean; error?: string }>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkSession()
      .then((session) => {
        if (session) {
          setUser({
            id: session.userId,
            email: session.email,
            name: session.name,
            role: session.role,
          });
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginAdmin(email, password);
    if (!result.ok) return { ok: false, error: result.error };
    await createSessionSafe(result.user);
    setUser(result.user);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await destroySession();
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) return { ok: false, error: "nouser" };
      const result = await changeAdminPassword(user.email, current, next);
      return result;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, ready, login, logout, changePassword }),
    [user, ready, login, logout, changePassword]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

async function createSessionSafe(user: AdminUser) {
  const { createSession } = await import("@/lib/firebase");
  await createSession(user);
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
