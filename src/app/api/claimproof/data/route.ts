import { NextResponse } from "next/server";
import { requireWorkspace } from "../_guard";
import { getClaim, loadToolData, saveToolData } from "@/lib/claim-proof-claims";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-tool synced data. A tool payload is scoped either to a specific claim
 * (claimId set) or to the workspace (claimId omitted, for reference-page
 * checklists not tied to one claim).
 *
 * GET  /api/claimproof/data?tool=KEY[&claim=ID]      -> { data }
 * PUT  /api/claimproof/data   { tool, claimId?, data } -> { ok }
 */

function parseClaimId(raw: string | null): number | null | "bad" {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : "bad";
}

async function claimBelongs(
  workspaceId: number,
  claimId: number | null,
): Promise<boolean> {
  if (claimId == null) return true;
  return (await getClaim(workspaceId, claimId)) != null;
}

export async function GET(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const tool = url.searchParams.get("tool");
  if (!tool) return NextResponse.json({ error: "Missing tool" }, { status: 400 });
  const claimId = parseClaimId(url.searchParams.get("claim"));
  if (claimId === "bad")
    return NextResponse.json({ error: "Bad claim id" }, { status: 400 });

  if (!(await claimBelongs(guard.ctx.workspace.id, claimId))) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const data = await loadToolData(guard.ctx.workspace.id, claimId, tool);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;

  const body = (await request.json().catch(() => ({}))) as {
    tool?: unknown;
    claimId?: unknown;
    data?: unknown;
  };
  const tool =
    typeof body.tool === "string" && body.tool.trim() ? body.tool.trim().slice(0, 120) : null;
  if (!tool) return NextResponse.json({ error: "Missing tool" }, { status: 400 });

  let claimId: number | null = null;
  if (body.claimId != null) {
    const n = Number(body.claimId);
    if (!Number.isInteger(n) || n <= 0)
      return NextResponse.json({ error: "Bad claim id" }, { status: 400 });
    claimId = n;
  }
  if (!(await claimBelongs(guard.ctx.workspace.id, claimId))) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  // Cap payload size defensively (JSONB, but no reason for a tool blob to be
  // huge; the biggest is a fleet tracker with a few dozen rows).
  const json = JSON.stringify(body.data ?? {});
  if (json.length > 512_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  await saveToolData({
    workspaceId: guard.ctx.workspace.id,
    claimId,
    toolKey: tool,
    data: body.data ?? {},
    userId: guard.ctx.userId,
  });
  return NextResponse.json({ ok: true });
}
