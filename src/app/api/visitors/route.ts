import "server-only";

/**
 * POST /api/visitors — visitor counter.
 *
 * The client pings this route once per browser session; the server
 * relays the increment to RTDB. The rules allow this one public write
 * (numbers only on stats/visitors) — no secret, no token.
 */

import { NextResponse } from "next/server";
import { adminGet, adminSet } from "@/lib/server/fb-admin";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
} as const;

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(): Promise<NextResponse> {
  try {
    const current = await adminGet<number>("stats/visitors", null);
    await adminSet("stats/visitors", (typeof current === "number" ? current : 0) + 1, null);
    return new NextResponse(JSON.stringify({ ok: true }), { headers: CORS });
  } catch (err) {
    const code = err instanceof Error ? err.message : "failed";
    return new NextResponse(
      JSON.stringify({ ok: false, error: code === "permission_denied" ? "rules_block" : "failed" }),
      { status: code === "permission_denied" ? 403 : 502, headers: CORS }
    );
  }
}
