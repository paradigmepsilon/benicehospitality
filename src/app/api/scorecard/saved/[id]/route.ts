import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  hideScorecardFromDashboard,
  renameScorecard,
} from "@/lib/scorecard/saved";
import { scorecardRenameBodySchema } from "@/lib/validation/scorecard";

// One saved Co-living Viability Calculator scorecard on a member's dashboard:
// rename it, or take it off the shelf.
//
// There is no GET — the full report lives at the public token URL, which is
// where the dashboard links. And there is no POST: scorecards are created by
// the public calculator flow, never from here.
//
// Ownership is folded into every SQL WHERE in @/lib/scorecard/saved, so "not
// yours" and "does not exist" come back identically and both become a 404.

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = scorecardRenameBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const scorecard = await renameScorecard(
      session.user.id,
      session.user.email,
      id,
      parsed.data.property_nickname,
    );
    if (!scorecard) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ scorecard });
  } catch (err) {
    console.error("[scorecard/saved] rename failed:", err);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    // Idempotent: hiding an already-hidden scorecard is a success, not a 404.
    // The client fires this behind an undo window and should never see an error
    // for having already won.
    await hideScorecardFromDashboard(session.user.id, session.user.email, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[scorecard/saved] hide failed:", err);
    return NextResponse.json({ error: "Could not remove." }, { status: 500 });
  }
}
