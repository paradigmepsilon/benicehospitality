import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireWorkspace } from "../_guard";
import { getTool, getPack, PACKS } from "@/app/claimproof/portal/_content";
import type { Pack, Tool, ToolSection } from "@/app/claimproof/portal/_content/types";
import { PRODUCT_VERSION, LAST_REVIEWED } from "@/app/claimproof/portal/_content/types";
import { tierUnlocks } from "@/app/claimproof/portal/_lib/access";
import { CLAIM_PROOF_TIERS } from "@/lib/claim-proof";
import { getClaim, loadToolData } from "@/lib/claim-proof-claims";
import {
  ClaimDocument,
  ClaimPackageDocument,
  type ClaimIdentity,
  type DataMap,
  type PackageEntry,
} from "@/app/claimproof/portal/_pdf/ClaimDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/claimproof/pdf
 *
 * Three modes, all account-gated (same guard as the sync API) and tier-gated
 * (a buyer can only export tools their purchased tier unlocks):
 *   - ?pack=&tool=&claim=   → a single tool (with the host's saved state)
 *   - ?pack=&claim=         → every tool in that one pack, one document
 *   - ?scope=all&claim=     → every tool the tier unlocks (the whole package)
 *
 * The claim id, when present, scopes the synced data and stamps the document's
 * claim-identity header. Fleet-tracker data is always workspace-scoped.
 */

/** Sync keys a section reads, so we load exactly the data the PDF needs. */
function keysForSection(toolSlug: string, section: ToolSection): string[] {
  switch (section.kind) {
    case "steps":
      return section.id ? [`steps:${toolSlug}:${section.id}`] : [];
    case "checklist":
      return [`check:${toolSlug}:${section.id}`];
    case "template":
      return [`${toolSlug}:${section.id}`];
    case "interactive":
      switch (section.component) {
        case "valuation-worksheet":
          return ["valuation-rows"];
        case "comms-log":
          return ["comms-log"];
        case "downtime-tracker":
          return ["downtime-summary", "downtime-log"];
        case "economics":
          return ["economics"];
        case "fleet-tracker":
          return ["fleet-claims"];
        case "fleet-kpi":
          return ["fleet-kpi"];
      }
      return [];
    default:
      return [];
  }
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  return d;
}

/**
 * Load exactly the synced payloads a tool's sections reference, into a DataMap
 * scoped to this tool. Each tool gets its OWN map, so global interactive keys
 * (valuation-rows, comms-log, ...) never collide across tools in a package.
 */
async function loadToolDataMap(
  workspaceId: number,
  claimId: number | null,
  tool: Tool,
): Promise<DataMap> {
  const keys = Array.from(
    new Set(tool.sections.flatMap((sec) => keysForSection(tool.slug, sec))),
  );
  const data: DataMap = {};
  await Promise.all(
    keys.map(async (key) => {
      // Fleet tracker + KPI dashboard are workspace-scoped; rest are claim-scoped.
      const scopedClaim = key === "fleet-claims" || key === "fleet-kpi" ? null : claimId;
      data[key] = await loadToolData(workspaceId, scopedClaim, key);
    }),
  );
  return data;
}

function pdfResponse(
  buffer: Buffer,
  base: string,
  claim: ClaimIdentity | null,
): NextResponse {
  const safeName =
    `${base}${claim?.vehicle ? "-" + claim.vehicle.replace(/[^a-z0-9]+/gi, "-") : ""}`
      .toLowerCase()
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const guard = await requireWorkspace();
  if ("error" in guard) return guard.error;
  const { workspace } = guard.ctx;

  const url = new URL(request.url);
  const packSlug = url.searchParams.get("pack") ?? "";
  const toolSlug = url.searchParams.get("tool") ?? "";
  const scope = url.searchParams.get("scope") ?? "";
  const claimRaw = url.searchParams.get("claim");
  const claimId = claimRaw && /^\d+$/.test(claimRaw) ? Number(claimRaw) : null;

  // Claim identity, shared by all modes (also enforces the claim belongs to
  // this workspace).
  let claim: ClaimIdentity | null = null;
  if (claimId != null) {
    const c = await getClaim(workspace.id, claimId);
    if (!c) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }
    claim = {
      label: c.label,
      vehicle: c.vehicle,
      trip: c.trip,
      stage: c.stage,
      discoveredOn: fmtDate(c.discoveredOn),
    };
  }

  const generatedOn = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const baseMeta = {
    generatedOn,
    workspaceName: workspace.name,
    version: PRODUCT_VERSION,
    lastReviewed: LAST_REVIEWED,
  };

  // ---- Single tool -------------------------------------------------------
  if (toolSlug) {
    const hit = getTool(packSlug, toolSlug);
    if (!hit) {
      return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
    }
    const { pack, tool } = hit;
    if (!tierUnlocks(workspace.tier, pack.access)) {
      return NextResponse.json(
        { error: "This tool is not in your plan." },
        { status: 403 },
      );
    }
    const data = await loadToolDataMap(workspace.id, claimId, tool);
    const buffer = await renderToBuffer(
      ClaimDocument({
        tool,
        claim,
        data,
        meta: { ...baseMeta, packName: pack.name },
      }),
    );
    return pdfResponse(buffer, `claim-proof-${tool.slug}`, claim);
  }

  // ---- Whole package (scope=all) or a single pack (pack= only) -----------
  let packs: Pack[];
  if (scope === "all") {
    packs = PACKS.filter((p) => tierUnlocks(workspace.tier, p.access));
  } else if (packSlug) {
    const pack = getPack(packSlug);
    if (!pack) {
      return NextResponse.json({ error: "Unknown pack." }, { status: 404 });
    }
    if (!tierUnlocks(workspace.tier, pack.access)) {
      return NextResponse.json(
        { error: "This pack is not in your plan." },
        { status: 403 },
      );
    }
    packs = [pack];
  } else {
    return NextResponse.json(
      { error: "Specify a tool, a pack, or scope=all." },
      { status: 400 },
    );
  }

  const entries: PackageEntry[] = [];
  for (const pack of packs) {
    for (const tool of pack.tools) {
      const data = await loadToolDataMap(workspace.id, claimId, tool);
      entries.push({ tool, packName: pack.name, data });
    }
  }

  const packageName = CLAIM_PROOF_TIERS[workspace.tier].label;
  const buffer = await renderToBuffer(
    ClaimPackageDocument({ packageName, entries, claim, meta: baseMeta }),
  );
  const baseName =
    scope === "all"
      ? packageName.replace(/[^a-z0-9]+/gi, "-")
      : `claim-proof-${packs[0].slug}`;
  return pdfResponse(buffer, baseName, claim);
}
