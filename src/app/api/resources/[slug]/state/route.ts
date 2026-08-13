import { NextResponse } from "next/server";
import { after } from "next/server";
import { sql } from "@/lib/db";
import { getResourceTool } from "@/lib/resources/registry";
import { getCurrentSession } from "@/lib/community-auth";
import { resourceStateLimiter, getClientIp } from "@/lib/rate-limit";
import { isAdminPreviewing } from "@/lib/resources/preview-guard";
import { shelveResourceTool } from "@/lib/resources/saved";
import { recordResourceToolLead } from "@/lib/resources/leads";

// Server-side account-save for logged-in members. Anonymous and grandfathered
// visitors never hit this — their tools persist in localStorage. Both routes
// require a session and are scoped to that user's own row.
//
// THIS IS ALSO WHERE A TOOL EARNS ITS PLACE ON THE DASHBOARD. A PUT carrying
// `dirty: true` means the member changed something, and the tool is shelved as
// a side effect. `dirty: false` is the localStorage-to-account migration that
// runs on first sync — real data worth keeping, but not a use, so it must not
// shelve. The client decides which it is; see the touch flag in
// useResourceTool.ts.

/** Only "blob" tools have a row here. See `persistence` in registry.ts. */
function blobTool(slug: string) {
  const tool = getResourceTool(slug);
  return tool && tool.persistence === "blob" ? tool : null;
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!blobTool(slug)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    // Not logged in: nothing to load server-side. 200 with null keeps the
    // client simple (it just falls back to localStorage).
    return NextResponse.json({ state: null, loggedIn: false });
  }

  // An admin previewing a member tier is still their own user id. Returning
  // their real saved tracker here would render the admin's own data inside a
  // member's session. Same call guardAnalysisRead already makes.
  if (await isAdminPreviewing(session.user.role)) {
    return NextResponse.json({ state: null, loggedIn: true, preview: true });
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
  // Not just "is this a tool" — is it one that HAS blob state. Every registry
  // slug used to be able to PUT 256KB of arbitrary JSON here, including the
  // eight reference tools that never read it back.
  if (!blobTool(slug)) {
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

  // Fake success rather than a 403. There is no fabricated id to invalidate the
  // way there is on the analyses routes, and a red save error while an admin is
  // only looking at a member's view is noise. Matches the save route.
  if (await isAdminPreviewing(session.user.role)) {
    return NextResponse.json({ ok: true, preview: true });
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
  const dirty = Boolean((body as { dirty?: unknown })?.dirty);

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

  if (dirty) {
    const { id, email, name } = session.user;
    // Deferred: sql is neon() over HTTP, one round trip per statement, and the
    // member should not wait on bookkeeping to see their work saved.
    after(async () => {
      try {
        const { inserted } = await shelveResourceTool(id, slug, "auto-use");
        // Only if this created the row — the same one-shot guard the open path
        // uses, and the unique index makes the two mutually exclusive.
        if (inserted) {
          await recordResourceToolLead({ slug, email, name, userId: id });
        }
      } catch (err) {
        console.error("[resources/state] shelve failed:", err);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
