import { NextResponse } from "next/server";
import { requireWorkspace } from "../../_guard";
import {
  getClaim,
  updateClaim,
  deleteClaim,
  CLAIM_STAGES,
  type ClaimPatch,
} from "@/lib/claim-proof-claims";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** GET /api/claimproof/claims/:id */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const claim = await getClaim(guard.ctx.workspace.id, id);
  if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ claim });
}

const NUM_OR_NULL = (v: unknown): number | null | undefined =>
  v === null ? null : typeof v === "number" && Number.isFinite(v) ? v : undefined;
const STR_OR_NULL = (v: unknown, max: number): string | null | undefined =>
  v === null ? null : typeof v === "string" ? v.trim().slice(0, max) : undefined;

/** PATCH /api/claimproof/claims/:id — partial skeleton update. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: ClaimPatch = {};
  // Only copy keys the client actually sent, so omitted = keep.
  if ("label" in body) {
    const v = STR_OR_NULL(body.label, 200);
    if (v != null) patch.label = v;
  }
  if ("vehicle" in body) patch.vehicle = STR_OR_NULL(body.vehicle, 200) ?? null;
  if ("trip" in body) patch.trip = STR_OR_NULL(body.trip, 100) ?? null;
  if ("stage" in body && typeof body.stage === "string") {
    if ((CLAIM_STAGES as readonly string[]).includes(body.stage)) patch.stage = body.stage;
  }
  if ("status" in body && (body.status === "open" || body.status === "closed")) {
    patch.status = body.status;
  }
  if ("nextAction" in body) patch.nextAction = STR_OR_NULL(body.nextAction, 500) ?? null;
  if ("nextActionDate" in body) patch.nextActionDate = STR_OR_NULL(body.nextActionDate, 32) ?? null;
  if ("appraisalAmount" in body) patch.appraisalAmount = NUM_OR_NULL(body.appraisalAmount) ?? null;
  if ("shopEstimate" in body) patch.shopEstimate = NUM_OR_NULL(body.shopEstimate) ?? null;
  if ("discoveredOn" in body) patch.discoveredOn = STR_OR_NULL(body.discoveredOn, 32) ?? null;

  const claim = await updateClaim(guard.ctx.workspace.id, id, patch);
  if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ claim });
}

/** DELETE /api/claimproof/claims/:id */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await deleteClaim(guard.ctx.workspace.id, id);
  return NextResponse.json({ ok: true });
}
