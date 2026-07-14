import { NextResponse } from "next/server";
import { requireWorkspace } from "../_guard";
import { listClaims, createClaim } from "@/lib/claim-proof-claims";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/claimproof/claims — all claims in the caller's workspace. */
export async function GET() {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const claims = await listClaims(guard.ctx.workspace.id);
  return NextResponse.json({ claims });
}

/** POST /api/claimproof/claims — create a claim. { label, vehicle?, trip? } */
export async function POST(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;

  const body = (await request.json().catch(() => ({}))) as {
    label?: unknown;
    vehicle?: unknown;
    trip?: unknown;
  };
  const label =
    typeof body.label === "string" && body.label.trim()
      ? body.label.trim().slice(0, 200)
      : "Untitled claim";
  const vehicle =
    typeof body.vehicle === "string" ? body.vehicle.trim().slice(0, 200) : null;
  const trip = typeof body.trip === "string" ? body.trip.trim().slice(0, 100) : null;

  const claim = await createClaim({
    workspaceId: guard.ctx.workspace.id,
    userId: guard.ctx.userId,
    label,
    vehicle,
    trip,
  });
  return NextResponse.json({ claim }, { status: 201 });
}
