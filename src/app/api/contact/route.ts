import "server-only";

/**
 * POST /api/contact — public contact form.
 *
 * The browser cannot write to Firebase directly (rules deny it), so
 * submissions come here. The server sanitizes input, rate-limits per IP
 * and relays the write to RTDB — the rules allow this one public write
 * (validated, cannot delete existing messages). No secret, no token.
 */

import { NextResponse } from "next/server";
import { adminSet } from "@/lib/server/fb-admin";
import { generateId } from "@/lib/firebase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
} as const;

// In-memory rate limit: 3 messages per 10 minutes per IP
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;

function limited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

const clean = (v: unknown, max: number): string =>
  String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(JSON.stringify({ ok: false, error: "bad_request" }), {
      status: 400,
      headers: CORS,
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  if (limited(ip)) {
    return new NextResponse(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
      headers: CORS,
    });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const subject = clean(body.subject, 200);
  const budget = clean(body.budget, 60);
  const message = clean(body.message, 4000);

  if (!name || !EMAIL_RE.test(email) || !subject || !message) {
    return new NextResponse(JSON.stringify({ ok: false, error: "invalid" }), {
      status: 400,
      headers: CORS,
    });
  }

  const id = generateId();
  try {
    await adminSet(`contactMessages/${id}`, {
      name,
      email,
      subject,
      budget: budget || undefined,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      ip,
    }, null);
  } catch (err) {
    const code = err instanceof Error ? err.message : "save_failed";
    return new NextResponse(
      JSON.stringify({ ok: false, error: code === "permission_denied" ? "rules_block" : "save_failed" }),
      { status: code === "permission_denied" ? 403 : 502, headers: CORS }
    );
  }

  return new NextResponse(JSON.stringify({ ok: true }), { headers: CORS });
}
