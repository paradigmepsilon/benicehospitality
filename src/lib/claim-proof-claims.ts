import { sql } from "@/lib/db";

/**
 * Claim Proof — server-side claim data layer (Phase 2).
 *
 * Two concerns:
 *  - cp_claims: the tracking skeleton one row per claim (stage, next action,
 *    the dollar figures the dashboard shows at a glance).
 *  - cp_claim_data: the full per-tool content (worksheet rows, comms log,
 *    checklist state) as JSON, one row per (claim, tool_key), or workspace-
 *    scoped when claim_id is null (reference-page checklists not tied to a
 *    single claim).
 *
 * All functions take a workspaceId that the caller has ALREADY authorized via
 * getPortalAccess()/userInWorkspace() the API routes never pass an unchecked
 * workspace id here.
 */

export const CLAIM_STAGES = [
  "documenting",
  "filed",
  "awaiting_appraisal",
  "supplement_submitted",
  "in_repair",
  "awaiting_payment",
  "closed",
] as const;
export type ClaimStage = (typeof CLAIM_STAGES)[number];

export interface Claim {
  id: number;
  label: string;
  vehicle: string | null;
  trip: string | null;
  stage: string;
  status: "open" | "closed";
  nextAction: string | null;
  nextActionDate: string | null;
  appraisalAmount: number | null;
  shopEstimate: number | null;
  discoveredOn: string | null;
  createdByUserId: number | null;
  updatedAt: string;
}

interface ClaimRow {
  id: number;
  label: string;
  vehicle: string | null;
  trip: string | null;
  stage: string;
  status: "open" | "closed";
  next_action: string | null;
  next_action_date: string | null;
  appraisal_amount: string | null;
  shop_estimate: string | null;
  discovered_on: string | null;
  created_by_user_id: number | null;
  updated_at: string;
}

function rowToClaim(r: ClaimRow): Claim {
  return {
    id: r.id,
    label: r.label,
    vehicle: r.vehicle,
    trip: r.trip,
    stage: r.stage,
    status: r.status,
    nextAction: r.next_action,
    nextActionDate: r.next_action_date,
    appraisalAmount: r.appraisal_amount != null ? Number(r.appraisal_amount) : null,
    shopEstimate: r.shop_estimate != null ? Number(r.shop_estimate) : null,
    discoveredOn: r.discovered_on,
    createdByUserId: r.created_by_user_id,
    updatedAt: r.updated_at,
  };
}

const CLAIM_COLS = `
  id, label, vehicle, trip, stage, status, next_action, next_action_date,
  appraisal_amount, shop_estimate, discovered_on, created_by_user_id, updated_at
`;

export async function listClaims(workspaceId: number): Promise<Claim[]> {
  const rows = (await sql`
    SELECT id, label, vehicle, trip, stage, status, next_action, next_action_date,
           appraisal_amount, shop_estimate, discovered_on, created_by_user_id, updated_at
    FROM cp_claims
    WHERE workspace_id = ${workspaceId}
    ORDER BY (status = 'open') DESC, updated_at DESC
  `) as ClaimRow[];
  return rows.map(rowToClaim);
}

export async function getClaim(
  workspaceId: number,
  claimId: number,
): Promise<Claim | null> {
  const rows = (await sql`
    SELECT id, label, vehicle, trip, stage, status, next_action, next_action_date,
           appraisal_amount, shop_estimate, discovered_on, created_by_user_id, updated_at
    FROM cp_claims
    WHERE workspace_id = ${workspaceId} AND id = ${claimId}
    LIMIT 1
  `) as ClaimRow[];
  return rows[0] ? rowToClaim(rows[0]) : null;
}

export async function createClaim(args: {
  workspaceId: number;
  userId: number;
  label: string;
  vehicle?: string | null;
  trip?: string | null;
}): Promise<Claim> {
  const rows = (await sql`
    INSERT INTO cp_claims (workspace_id, created_by_user_id, label, vehicle, trip)
    VALUES (${args.workspaceId}, ${args.userId}, ${args.label},
            ${args.vehicle ?? null}, ${args.trip ?? null})
    RETURNING id, label, vehicle, trip, stage, status, next_action, next_action_date,
              appraisal_amount, shop_estimate, discovered_on, created_by_user_id, updated_at
  `) as ClaimRow[];
  return rowToClaim(rows[0]);
}

/** Whitelisted skeleton fields the client may patch. */
export interface ClaimPatch {
  label?: string;
  vehicle?: string | null;
  trip?: string | null;
  stage?: string;
  status?: "open" | "closed";
  nextAction?: string | null;
  nextActionDate?: string | null;
  appraisalAmount?: number | null;
  shopEstimate?: number | null;
  discoveredOn?: string | null;
}

export async function updateClaim(
  workspaceId: number,
  claimId: number,
  patch: ClaimPatch,
): Promise<Claim | null> {
  // COALESCE keeps unspecified fields; a key present with null explicitly
  // clears the column (client sends null to clear, omits to keep). We pass a
  // sentinel-free approach by reading current then writing merged values.
  const current = await getClaim(workspaceId, claimId);
  if (!current) return null;
  const merged = {
    label: patch.label ?? current.label,
    vehicle: "vehicle" in patch ? patch.vehicle ?? null : current.vehicle,
    trip: "trip" in patch ? patch.trip ?? null : current.trip,
    stage: patch.stage ?? current.stage,
    status: patch.status ?? current.status,
    nextAction: "nextAction" in patch ? patch.nextAction ?? null : current.nextAction,
    nextActionDate:
      "nextActionDate" in patch ? patch.nextActionDate ?? null : current.nextActionDate,
    appraisalAmount:
      "appraisalAmount" in patch ? patch.appraisalAmount ?? null : current.appraisalAmount,
    shopEstimate:
      "shopEstimate" in patch ? patch.shopEstimate ?? null : current.shopEstimate,
    discoveredOn:
      "discoveredOn" in patch ? patch.discoveredOn ?? null : current.discoveredOn,
  };
  const rows = (await sql`
    UPDATE cp_claims SET
      label = ${merged.label},
      vehicle = ${merged.vehicle},
      trip = ${merged.trip},
      stage = ${merged.stage},
      status = ${merged.status},
      next_action = ${merged.nextAction},
      next_action_date = ${merged.nextActionDate},
      appraisal_amount = ${merged.appraisalAmount},
      shop_estimate = ${merged.shopEstimate},
      discovered_on = ${merged.discoveredOn},
      updated_at = NOW()
    WHERE workspace_id = ${workspaceId} AND id = ${claimId}
    RETURNING id, label, vehicle, trip, stage, status, next_action, next_action_date,
              appraisal_amount, shop_estimate, discovered_on, created_by_user_id, updated_at
  `) as ClaimRow[];
  return rows[0] ? rowToClaim(rows[0]) : null;
}

export async function deleteClaim(
  workspaceId: number,
  claimId: number,
): Promise<void> {
  await sql`DELETE FROM cp_claims WHERE workspace_id = ${workspaceId} AND id = ${claimId}`;
}

// ---------------------------------------------------------------------------
// Per-tool content (the synced worksheet/log/checklist payloads)
// ---------------------------------------------------------------------------

/**
 * Load a tool's payload. claimId null = workspace-scoped (reference-page
 * checklists not tied to one claim). Returns {} when nothing saved yet.
 */
export async function loadToolData(
  workspaceId: number,
  claimId: number | null,
  toolKey: string,
): Promise<unknown> {
  const rows =
    claimId == null
      ? ((await sql`
          SELECT data FROM cp_claim_data
          WHERE workspace_id = ${workspaceId} AND claim_id IS NULL AND tool_key = ${toolKey}
          LIMIT 1
        `) as Array<{ data: unknown }>)
      : ((await sql`
          SELECT data FROM cp_claim_data
          WHERE workspace_id = ${workspaceId} AND claim_id = ${claimId} AND tool_key = ${toolKey}
          LIMIT 1
        `) as Array<{ data: unknown }>);
  return rows[0]?.data ?? {};
}

/** Save (upsert) a tool's payload. Last-write-wins per (claim, tool). */
export async function saveToolData(args: {
  workspaceId: number;
  claimId: number | null;
  toolKey: string;
  data: unknown;
  userId: number;
}): Promise<void> {
  const json = JSON.stringify(args.data ?? {});
  if (args.claimId == null) {
    await sql`
      INSERT INTO cp_claim_data (workspace_id, claim_id, tool_key, data, updated_by_user_id, updated_at)
      VALUES (${args.workspaceId}, NULL, ${args.toolKey}, ${json}::jsonb, ${args.userId}, NOW())
      ON CONFLICT (workspace_id, tool_key) WHERE claim_id IS NULL
      DO UPDATE SET data = EXCLUDED.data, updated_by_user_id = EXCLUDED.updated_by_user_id, updated_at = NOW()
    `;
  } else {
    await sql`
      INSERT INTO cp_claim_data (workspace_id, claim_id, tool_key, data, updated_by_user_id, updated_at)
      VALUES (${args.workspaceId}, ${args.claimId}, ${args.toolKey}, ${json}::jsonb, ${args.userId}, NOW())
      ON CONFLICT (workspace_id, claim_id, tool_key)
      DO UPDATE SET data = EXCLUDED.data, updated_by_user_id = EXCLUDED.updated_by_user_id, updated_at = NOW()
    `;
  }
}
