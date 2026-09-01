/**
 * Firebase Realtime Database – REST API Wrapper
 *
 * Uses pure HTTP fetch() instead of firebase-admin, so it works
 * on Cloudflare Pages edge runtime (no Node.js native modules).
 *
 * Firebase config is hardcoded below — no env vars required.
 */

// ── Firebase Config (Hardcoded) ──────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDuKB0w9GeyXPTr9pBlyjjLrgumqqQPePU',
  authDomain: 'md-mubarok-hossain.firebaseapp.com',
  databaseURL: 'https://md-mubarok-hossain-default-rtdb.firebaseio.com',
  projectId: 'md-mubarok-hossain',
  storageBucket: 'md-mubarok-hossain.firebasestorage.app',
  messagingSenderId: '399079788020',
  appId: '1:399079788020:web:3121a231a7b432ff6bbda1',
  measurementId: 'G-6WZRLRZ89Y',
} as const;

// ── State ──────────────────────────────────────────────────────────────

let _ready = false;
let _error: string | null = null;

function getBaseUrl(): string {
  return FIREBASE_CONFIG.databaseURL.replace(/\/$/, '');
}


// Warm-up: one lightweight GET to confirm the DB is reachable
async function warmup() {
  if (_ready || _error) return;
  const base = getBaseUrl();
  if (!base) return;
  try {
    const res = await fetch(`${base}/.json`, { method: 'GET' });
    if (res.ok) {
      _ready = true;
    } else {
      _error = `Firebase warmup failed (${res.status})`;
    }
  } catch (err) {
    _error = `Firebase warmup error: ${err instanceof Error ? err.message : String(err)}`;
  }
}
// Fire-and-forget warmup on first import
warmup();

// ── Low-level helpers ──────────────────────────────────────────────────

export async function dbGet<T = any>(path: string): Promise<T | null> {
  const base = getBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/${path}.json`);
    if (!res.ok) return null;
    const text = await res.text();
    if (text === 'null') return null; // Firebase returns literal "null"
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function dbSet(path: string, value: unknown): Promise<boolean> {
  const base = getBaseUrl();
  if (!base) throw new Error('Firebase not configured');
  const res = await fetch(`${base}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`Firebase write failed (${res.status})`);
  return true;
}

async function dbUpdate(path: string, value: Record<string, unknown>): Promise<boolean> {
  const base = getBaseUrl();
  if (!base) throw new Error('Firebase not configured');
  const res = await fetch(`${base}/${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`Firebase update failed (${res.status})`);
  return true;
}

export async function dbRemove(path: string): Promise<boolean> {
  const base = getBaseUrl();
  if (!base) return false;
  const res = await fetch(`${base}/${path}.json`, { method: 'DELETE' });
  return res.ok;
}

// ── Utility helpers ─────────────────────────────────────────────────────

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  const ctr = Math.random().toString(36).substring(2, 6);
  return `${ts}${rand}${ctr}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ── USER Operations ────────────────────────────────────────────────────

export const dbUser = {
  /** Find a user by their email (dots → commas for Firebase key) */
  async findByEmail(email: string) {
    const key = email.replace(/\./g, ',');
    return dbGet<any>(`users/${key}`);
  },

  /** Find a user by their unique ID (scans all users) */
  async findById(id: string) {
    const users = await dbGet<Record<string, any>>('users');
    if (!users) return null;
    for (const u of Object.values(users)) {
      if ((u as any).id === id) return u as any;
    }
    return null;
  },

  /** Return ALL valid users as an array (scans /users node) */
  async findAll(): Promise<any[]> {
    const users = await dbGet<Record<string, any>>('users');
    if (!users) return [];
    return Object.values(users).filter((u) => {
      const user = u as any;
      // Only return valid user objects (must have id, email, password, role)
      return user && typeof user === 'object' && user.id && user.email && user.password && user.role;
    });
  },

  /** Create a new user */
  async create(data: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }) {
    const id = generateId();
    const timestamp = nowISO();
    const emailKey = data.email.replace(/\./g, ',');
    const user = {
      id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role || 'admin',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await dbSet(`users/${emailKey}`, user);
    return user;
  },

  /** Update a user by email — merges with existing data to preserve all fields */
  async update(email: string, data: Record<string, unknown>) {
    const emailKey = email.replace(/\./g, ',');
    // First get existing user to merge fields properly
    const existing = await this.findByEmail(email);
    const payload: Record<string, unknown> = {
      ...(existing || {}),
      ...data,
      updatedAt: nowISO(),
    };
    await dbSet(`users/${emailKey}`, payload);
  },

  /** Check if an email is already used by another user */
  async findUniqueEmail(excludeId: string, email: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    return user.id !== excludeId ? user : null;
  },

  /** Delete a user by email key */
  async deleteUser(emailKey: string) {
    await dbRemove(`users/${emailKey}`);
  },

  /** Set a full user object by email key */
  async setUser(emailKey: string, user: Record<string, unknown>) {
    await dbSet(`users/${emailKey}`, user);
  },

  /** Clean up corrupted/incomplete user entries (missing required fields) */
  async cleanupInvalid(): Promise<number> {
    const users = await dbGet<Record<string, any>>('users');
    if (!users) return 0;
    let cleaned = 0;
    for (const [key, val] of Object.entries(users)) {
      const u = val as any;
      // Remove entries that don't have ALL required fields
      if (!u || typeof u !== 'object' || !u.id || !u.email || !u.password || !u.role || !u.name) {
        await dbRemove(`users/${key}`);
        cleaned++;
      }
    }
    return cleaned;
  },
};

// ── SITE SETTINGS Operations ──────────────────────────────────────────

export const dbSettings = {
  async findMany(): Promise<
    Array<{ id: string; key: string; value: string; updatedAt: string }>
  > {
    const data = await dbGet<Record<string, any>>('settings');
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({
      id: value?.id || key,
      key,
      value: value?.value ?? (typeof value === 'string' ? value : ''),
      updatedAt: value?.updatedAt || nowISO(),
    }));
  },

  async findUnique(
    key: string
  ): Promise<{ key: string; value: string } | null> {
    const data = await dbGet<any>(`settings/${key}`);
    if (data === null) return null;
    return {
      key,
      value: typeof data === 'string' ? data : (data?.value ?? ''),
    };
  },

  async upsert(key: string, value: string) {
    const existing = await this.findUnique(key);
    const data = {
      value,
      updatedAt: nowISO(),
      id: (existing as any)?.id || generateId(),
    };
    await dbSet(`settings/${key}`, data);
    return data;
  },

  async getAllAsMap(): Promise<Record<string, string>> {
    const data = await dbGet<Record<string, any>>('settings');
    if (!data) return {};
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(data)) {
      result[key] =
        typeof val === 'string' ? val : (val?.value ?? '');
    }
    return result;
  },
};

// ── CONTACT MESSAGE Operations ────────────────────────────────────────

export const dbContact = {
  async findMany(options?: { skip?: number; take?: number }) {
    const data = await dbGet<Record<string, any>>('contactMessages');
    if (!data) return [];

    let messages = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...(value as Record<string, any>),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt as string).getTime() -
          new Date(a.createdAt as string).getTime()
      );

    const skip = options?.skip || 0;
    const take = options?.take || 100;
    return messages.slice(skip, skip + take);
  },

  async count(): Promise<number> {
    const data = await dbGet<Record<string, any>>('contactMessages');
    if (!data) return 0;
    return Object.keys(data).length;
  },

  async countUnread(): Promise<number> {
    const data = await dbGet<Record<string, any>>('contactMessages');
    if (!data) return 0;
    let count = 0;
    for (const val of Object.values(data)) {
      if ((val as any).read === false) count++;
    }
    return count;
  },

  async findById(id: string) {
    const data = await dbGet<any>(`contactMessages/${id}`);
    if (data === null) return null;
    return { id, ...data };
  },

  async create(data: {
    name: string;
    email: string;
    subject: string;
    budget?: string;
    message: string;
  }) {
    const id = generateId();
    const message = { ...data, read: false, createdAt: nowISO() };
    await dbSet(`contactMessages/${id}`, message);
    return { id, ...message };
  },

  async update(id: string, data: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      payload[k] = v;
    }
    await dbUpdate(`contactMessages/${id}`, payload);
    return this.findById(id);
  },

  async delete(id: string) {
    await dbRemove(`contactMessages/${id}`);
    return { message: 'Message deleted' };
  },
};

// ── PORTFOLIO DATA Operations ──────────────────────────────────────────

export const dbPortfolio = {
  async findMany(): Promise<
    Array<{ id: string; section: string; dataJson: string; updatedAt: string }>
  > {
    const data = await dbGet<Record<string, any>>('portfolio');
    if (!data) return [];
    return Object.entries(data).map(([section, value]) => ({
      id: value?.id || section,
      section,
      dataJson: value?.dataJson ?? '{}',
      updatedAt: value?.updatedAt || nowISO(),
    }));
  },

  async findUnique(
    section: string
  ): Promise<{ id: string; section: string; dataJson: string } | null> {
    const data = await dbGet<any>(`portfolio/${section}`);
    if (data === null) return null;
    return {
      id: data.id || section,
      section,
      dataJson: data.dataJson ?? '{}',
    };
  },

  async upsert(section: string, dataJson: string) {
    const existing = await this.findUnique(section);
    const data = {
      dataJson,
      updatedAt: nowISO(),
      id: existing?.id || generateId(),
    };
    await dbSet(`portfolio/${section}`, data);
    return data;
  },

  async getAllAsObject(): Promise<Record<string, unknown>> {
    const data = await dbGet<Record<string, any>>('portfolio');
    if (!data) return {};
    const result: Record<string, unknown> = {};
    for (const [section, value] of Object.entries(data)) {
      try {
        result[section] = JSON.parse((value as any).dataJson);
      } catch {
        result[section] = (value as any).dataJson;
      }
    }
    return result;
  },
};
