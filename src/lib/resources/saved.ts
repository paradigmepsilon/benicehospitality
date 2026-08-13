// Saved resource tools — the data layer behind "Your Resources" on the member
// dashboard and /account/resources.
//
// A ROW means "this member has opened this tool". It carries last_opened_at and
// gates the one-time CRM lead write.
//
// saved_at IS NOT NULL means "and they put it on their dashboard". Only an
// explicit "Add to my dashboard" sets it. Every read below filters on it.
//
// These used to be the same thing: opening a tool added it to the shelf, so the
// button read "Saved" before the member had touched it and clicking it removed
// the tool. Splitting the two is what lets the button be a request first and a
// confirmation second.
//
// The lane is NOT stored. It is resolved from the registry at read time via
// laneForTool(), so a category correction takes effect everywhere at once.

import { sql } from "@/lib/db";
import type { LaneId } from "@/lib/lanes";
import {
  getResourceTool,
  laneForTool,
  RESOURCE_TOOL_SLUGS,
  type ResourceToolMeta,
} from "@/lib/resources/registry";

/**
 * How the tool got onto the shelf.
 *
 *   "manual"    — they pressed the bookmark button.
 *   "auto-open" — a reference tool with nothing to fill in, shelved on open.
 *   "auto-use"  — they edited something in a tool that persists state.
 */
export type SavedSource = "manual" | "auto-open" | "auto-use";

const SAVED_SOURCES: readonly string[] = ["manual", "auto-open", "auto-use"];

export interface SavedResourceTool {
  id: number;
  toolSlug: string;
  source: SavedSource;
  createdAt: string;
  lastOpenedAt: string | null;
  /** Resolved from the registry. Rows whose slug has left it are dropped. */
  tool: ResourceToolMeta;
  lane: LaneId;
}

interface SavedResourceToolRow {
  id: number;
  tool_slug: string;
  source: string;
  created_at: string;
  last_opened_at: string | null;
}

function rowToSavedTool(row: SavedResourceToolRow): SavedResourceTool | null {
  const tool = getResourceTool(row.tool_slug);
  // Slug retired from the registry. The row is harmless (and the bookmark
  // returns if the tool does), so we filter on read rather than deleting.
  if (!tool) return null;
  return {
    id: row.id,
    toolSlug: row.tool_slug,
    source: SAVED_SOURCES.includes(row.source) ? (row.source as SavedSource) : "manual",
    createdAt: row.created_at,
    lastOpenedAt: row.last_opened_at,
    tool,
    lane: laneForTool(tool),
  };
}

/** The member's full shelf, most recently used first. Explicit saves only. */
export async function listSavedResourceTools(
  userId: number,
): Promise<SavedResourceTool[]> {
  const rows = (await sql`
    SELECT id, tool_slug, source, created_at, last_opened_at
    FROM saved_resource_tools
    WHERE user_id = ${userId} AND saved_at IS NOT NULL
    ORDER BY COALESCE(last_opened_at, created_at) DESC
  `) as SavedResourceToolRow[];

  return rows
    .map(rowToSavedTool)
    .filter((t): t is SavedResourceTool => t !== null);
}

/**
 * Same data, pre-bucketed for the /account/resources tabs. Always returns all
 * three lane keys so every tab renders (empty ones show their empty state).
 */
export async function listSavedResourceToolsByLane(
  userId: number,
): Promise<Record<LaneId, SavedResourceTool[]>> {
  const all = await listSavedResourceTools(userId);
  const byLane: Record<LaneId, SavedResourceTool[]> = {
    coliving: [],
    boutique: [],
    fleet: [],
  };
  for (const tool of all) byLane[tool.lane].push(tool);
  return byLane;
}

/**
 * Bulk "is this saved?" membership test. One index-only query resolves the
 * button state for every card on the /resources index. Deliberately does not
 * touch the registry — callers only need the slugs.
 */
export async function savedResourceSlugs(
  userId: number,
): Promise<Set<string>> {
  const rows = (await sql`
    SELECT tool_slug FROM saved_resource_tools
    WHERE user_id = ${userId} AND saved_at IS NOT NULL
  `) as Array<{ tool_slug: string }>;
  return new Set(rows.map((r) => r.tool_slug));
}

/** Is one specific tool on the member's dashboard? Opened-but-not-saved is false. */
export async function isResourceToolSaved(
  userId: number,
  slug: string,
): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM saved_resource_tools
    WHERE user_id = ${userId} AND tool_slug = ${slug} AND saved_at IS NOT NULL
    LIMIT 1
  `) as Array<{ [key: string]: unknown }>;
  return rows.length > 0;
}

/**
 * Put the tool on the member's dashboard.
 *
 * Upserts rather than DO NOTHING because by the time someone clicks Add, an
 * auto-open row almost always exists already — DO NOTHING would leave saved_at
 * null and the click would appear to do nothing at all.
 *
 * Returns true only when this INSERT created the row, which is the "first time
 * this person touched this tool" signal the CRM lead write hangs off. `xmax = 0`
 * is the standard Postgres upsert discriminator: true on INSERT, false on
 * UPDATE. Someone who opened the tool first was already recorded as a lead by
 * touchResourceToolOpen, so returning false here is correct — it stops a second
 * lead firing for the same person and tool.
 */
export async function saveResourceTool(
  userId: number,
  slug: string,
  source: SavedSource,
): Promise<boolean> {
  // Never let an unknown slug reach the DB; there is no FK to catch it.
  if (!getResourceTool(slug)) return false;

  const rows = (await sql`
    INSERT INTO saved_resource_tools (user_id, tool_slug, source, last_opened_at, saved_at)
    VALUES (${userId}, ${slug}, ${source}, NOW(), NOW())
    ON CONFLICT (user_id, tool_slug)
    DO UPDATE SET
      saved_at = COALESCE(saved_resource_tools.saved_at, NOW()),
      source = ${source}
    RETURNING (xmax = 0) AS inserted
  `) as Array<{ inserted: boolean }>;

  return rows[0]?.inserted === true;
}

/**
 * Take it off the dashboard. Clears saved_at rather than deleting the row: the
 * row is also the open record, and dropping it would let the one-time CRM lead
 * fire again the next time they opened the tool.
 */
export async function unsaveResourceTool(
  userId: number,
  slug: string,
): Promise<void> {
  await sql`
    UPDATE saved_resource_tools
    SET saved_at = NULL
    WHERE user_id = ${userId} AND tool_slug = ${slug}
  `;
}

/**
 * Record an open. Creates the row if absent, otherwise just bumps the recency
 * stamp so the shelf orders by what the member actually uses.
 *
 * Deliberately does NOT set saved_at — opening a tool is not asking for it on
 * your dashboard. That conflation is what made the save button announce a state
 * the member never chose.
 *
 * Returns true when this open created the row (their first open ever), which
 * is what gates the one-time CRM lead write. `xmax = 0` is the standard
 * Postgres upsert discriminator: true on INSERT, false on UPDATE.
 *
 * Note `source` is intentionally not touched on conflict — a tool explicitly
 * saved and later opened stays 'manual', which is the truthful reading.
 */
export async function touchResourceToolOpen(
  userId: number,
  slug: string,
): Promise<boolean> {
  if (!getResourceTool(slug)) return false;

  const rows = (await sql`
    INSERT INTO saved_resource_tools (user_id, tool_slug, source, last_opened_at)
    VALUES (${userId}, ${slug}, 'auto-open', NOW())
    ON CONFLICT (user_id, tool_slug)
    DO UPDATE SET last_opened_at = NOW()
    RETURNING (xmax = 0) AS inserted
  `) as Array<{ inserted: boolean }>;

  return rows[0]?.inserted === true;
}

/**
 * Put the tool on the dashboard as a SIDE EFFECT of using it — opening a
 * reference tool, or writing state in one that persists. The member never
 * asked; this is the tool showing up because they worked in it.
 *
 * Not `saveResourceTool`, which is the bookmark button. That one sets
 * `source = ${source}` on conflict, so routing an auto-shelve through it would
 * relabel a tool the member had explicitly bookmarked. Here `source` is written
 * on insert only, same reasoning as touchResourceToolOpen.
 *
 * The COALESCE is what makes a removal temporary: a tool taken off the shelf
 * has `saved_at = NULL`, so the next edit sets a fresh timestamp and it returns.
 *
 * Two different booleans come back, and they answer different questions:
 *
 *   inserted     — this call created the row. Gates the ONE-TIME CRM lead, and
 *                  is why the write cannot fire twice: the unique index
 *                  serialises concurrent upserts, so the loser takes the UPDATE
 *                  branch and sees false.
 *   newlyShelved — saved_at went NULL → NOW(). True on a first-ever use AND on
 *                  a re-shelve after removal, which `inserted` cannot express.
 *
 * `newlyShelved` needs the CTE. It is snapshotted with the statement, so it
 * reads the PRE-update row; RETURNING on its own hands back the post-update row
 * where saved_at is always set and the answer is always false.
 */
export async function shelveResourceTool(
  userId: number,
  slug: string,
  source: SavedSource,
): Promise<{ inserted: boolean; newlyShelved: boolean }> {
  if (!getResourceTool(slug)) return { inserted: false, newlyShelved: false };

  const rows = (await sql`
    WITH prev AS (
      SELECT saved_at
      FROM saved_resource_tools
      WHERE user_id = ${userId} AND tool_slug = ${slug}
    )
    INSERT INTO saved_resource_tools (user_id, tool_slug, source, last_opened_at, saved_at)
    VALUES (${userId}, ${slug}, ${source}, NOW(), NOW())
    ON CONFLICT (user_id, tool_slug)
    DO UPDATE SET
      saved_at = COALESCE(saved_resource_tools.saved_at, NOW()),
      last_opened_at = NOW()
    RETURNING (xmax = 0) AS inserted,
              (SELECT saved_at FROM prev) IS NULL AS newly_shelved
  `) as Array<{ inserted: boolean; newly_shelved: boolean }>;

  return {
    inserted: rows[0]?.inserted === true,
    newlyShelved: rows[0]?.newly_shelved === true,
  };
}

/**
 * Housekeeping: drop rows whose slug no longer exists in the registry. Reads
 * filter these out already, so this is optional cleanup rather than a
 * correctness requirement. Not wired into any request path.
 */
export async function pruneOrphanSavedTools(userId: number): Promise<number> {
  const rows = (await sql`
    SELECT DISTINCT tool_slug FROM saved_resource_tools WHERE user_id = ${userId}
  `) as Array<{ tool_slug: string }>;

  const orphans = rows
    .map((r) => r.tool_slug)
    .filter((slug) => !RESOURCE_TOOL_SLUGS.has(slug));
  if (orphans.length === 0) return 0;

  await sql`
    DELETE FROM saved_resource_tools
    WHERE user_id = ${userId} AND tool_slug = ANY(${orphans})
  `;
  return orphans.length;
}
