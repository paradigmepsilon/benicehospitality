import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getResourceTool } from "@/lib/resources/registry";
import { getCurrentSession } from "@/lib/community-auth";
import { resourceStateLimiter, getClientIp } from "@/lib/rate-limit";

// Server-side account-save for logged-in users. Anonymous (email-only) users
// never hit this — their tools persist in localStorage. Both routes require a
// session and are scoped to that user's own row.

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!getResourceTool(slug)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    // Not logged in: nothing to load server-side. 200 with null keeps the
    // client simple (it just falls back to localStorage).
    return NextResponse.json({ state: null, loggedIn: false });
  }

  const rows = (await sql`
    SELECT state FROM resource_tool_state
    WHERE user_id = ${session.user.id} AND tool_slug = ${slug}
    LIMIT 1
  `) as Array<{ state: unknown }>;

  return NextResponse.json({
    state: rows[0]?.state ?? null,
    loggedIn: true,
  });
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!getResourceTool(slug)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const ip = getClientIp(request);
  if (!resourceStateLimiter.check(ip).success) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const state = (body as { state?: unknown })?.state;
  if (typeof state === "undefined") {
    return NextResponse.json({ error: "Missing state." }, { status: 400 });
  }

  // Guard against oversized payloads (a runaway tracker). ~256KB JSON cap.
  const serialized = JSON.stringify(state);
  if (serialized.length > 256_000) {
    return NextResponse.json({ error: "State too large." }, { status: 413 });
  }

  await sql`
    INSERT INTO resource_tool_state (user_id, tool_slug, state, updated_at)
    VALUES (${session.user.id}, ${slug}, ${serialized}::jsonb, NOW())
    ON CONFLICT (user_id, tool_slug)
    DO UPDATE SET state = ${serialized}::jsonb, updated_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
