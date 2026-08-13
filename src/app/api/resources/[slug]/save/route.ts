import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { getResourceTool } from "@/lib/resources/registry";
import { getCurrentSession } from "@/lib/community-auth";
import { saveResourceTool, unsaveResourceTool } from "@/lib/resources/saved";
import { recordResourceToolLead } from "@/lib/resources/leads";
import { savedResourceLimiter, getClientIp } from "@/lib/rate-limit";
import { PREVIEW_COOKIE_NAME, parsePreviewCookie } from "@/lib/preview-cookie";

// "Add to my dashboard" / remove, for the resource index cards and tool pages.
//
// Deliberately under /api/resources/ rather than /api/account/: src/proxy.ts
// matches /account/:path*, and widening it to /api/account/:path* later would
// start edge-redirecting these JSON endpoints to the HTML login page, which
// breaks fetch clients in a confusing way. These gate themselves instead.

/** Admins previewing a member tier must not write to their own real shelf. */
async function isAdminPreviewing(role: string): Promise<boolean> {
  if (role !== "admin") return false;
  const store = await cookies();
  return parsePreviewCookie(store.get(PREVIEW_COOKIE_NAME)?.value) !== null;
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const tool = getResourceTool(slug);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  const session = await getCurrentSession();
  // A hard 401, not the 200-with-null shim the state route's GET uses: this is
  // a write, and the optimistic UI needs a failure it can revert on.
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!savedResourceLimiter.check(getClientIp(request)).success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (await isAdminPreviewing(session.user.role)) {
    return NextResponse.json({ ok: true, saved: true, preview: true });
  }

  let created = false;
  try {
    created = await saveResourceTool(session.user.id, slug, "manual");
  } catch (err) {
    console.error("[resources/save] save failed:", err);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  // First time this person has touched this tool → feed the CRM. Deferred so
  // it never sits in the response path.
  if (created) {
    const { id, email, name } = session.user;
    after(async () => {
      try {
        await recordResourceToolLead({ slug, email, name, userId: id });
      } catch (err) {
        console.error("[resources/save] lead record failed:", err);
      }
    });
  }

  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(
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

  if (!savedResourceLimiter.check(getClientIp(request)).success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (await isAdminPreviewing(session.user.role)) {
    return NextResponse.json({ ok: true, saved: false, preview: true });
  }

  try {
    await unsaveResourceTool(session.user.id, slug);
  } catch (err) {
    console.error("[resources/save] unsave failed:", err);
    return NextResponse.json({ error: "Could not remove." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: false });
}
