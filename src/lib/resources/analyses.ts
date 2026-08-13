// Named, multi-instance analyses for resource tools.
//
// The data layer behind the Co-Living Property Profitability Analysis
// Worksheet's "123 Maple St /
// Duplex on 5th" switcher and the nested list on /account/resources.
//
// Every function takes a pre-authorized `userId` and folds ownership into the
// SQL WHERE rather than checking it in application code, so there is no path
// where a caller can forget. "Not yours" and "does not exist" both come back as
// null, and the routes turn both into the same 404 — never confirm a row exists
// to someone who cannot read it.
//
// Follows src/lib/claim-proof-claims.ts conventions: a row interface, a
// rowToX mapper, an explicit column list, and Number() coercion because the
// Neon driver returns NUMERIC as a string.

import { sql } from "@/lib/db";

/**
 * Worst case 25 x 256KB = 6.4MB per user per tool. Someone genuinely modelling
 * 25 properties at once is a pro who belongs on a paid tier — that is a
 * conversation, not a bug.
 */
export const MAX_ANALYSES_PER_TOOL = 25;

export interface AnalysisSummary {
  id: number;
  name: string;
  schemaVersion: number;
  revision: number;
  monthlyNet: number | null;
  breakEvenMonth: number | null;
  startupTotal: number | null;
  /** "Douglasville, GA". Lets a list row say WHICH property without reading `data`. */
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis extends AnalysisSummary {
  data: unknown;
}

export interface SummaryFields {
  monthlyNet: number | null;
  breakEvenMonth: number | null;
  startupTotal: number | null;
  location: string | null;
}

interface AnalysisRow {
  id: number;
  name: string;
  schema_version: number;
  revision: number;
  summary_monthly_net: string | number | null;
  summary_break_even_month: number | null;
  summary_startup_total: string | number | null;
  summary_location: string | null;
  created_at: string;
  updated_at: string;
  data?: unknown;
}

/** NUMERIC arrives as a string from the driver; INT does not. */
function num(v: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function rowToSummary(r: AnalysisRow): AnalysisSummary {
  return {
    id: r.id,
    name: r.name,
    schemaVersion: r.schema_version,
    revision: r.revision,
    monthlyNet: num(r.summary_monthly_net),
    breakEvenMonth: r.summary_break_even_month,
    startupTotal: num(r.summary_startup_total),
    location: r.summary_location,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToAnalysis(r: AnalysisRow): Analysis {
  return { ...rowToSummary(r), data: r.data ?? {} };
}

/** Summary columns. Deliberately excludes `data` — it is never listed. */
const SUMMARY_COLS = `id, name, schema_version, revision,
  summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
  created_at, updated_at`;

export async function listAnalyses(
  userId: number,
  toolSlug: string,
): Promise<AnalysisSummary[]> {
  const rows = (await sql`
    SELECT id, name, schema_version, revision,
           summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
           created_at, updated_at
    FROM resource_analyses
    WHERE user_id = ${userId} AND tool_slug = ${toolSlug}
    ORDER BY updated_at DESC
  `) as AnalysisRow[];
  return rows.map(rowToSummary);
}

/**
 * Every analysis a member owns across the given tools, bucketed by slug. One
 * query for the whole account shelf rather than one per card.
 */
export async function listAnalysesForUser(
  userId: number,
  toolSlugs: string[],
): Promise<Map<string, AnalysisSummary[]>> {
  const out = new Map<string, AnalysisSummary[]>();
  if (toolSlugs.length === 0) return out;

  const rows = (await sql`
    SELECT tool_slug, id, name, schema_version, revision,
           summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
           created_at, updated_at
    FROM resource_analyses
    WHERE user_id = ${userId} AND tool_slug = ANY(${toolSlugs})
    ORDER BY updated_at DESC
  `) as Array<AnalysisRow & { tool_slug: string }>;

  for (const slug of toolSlugs) out.set(slug, []);
  for (const r of rows) {
    const bucket = out.get(r.tool_slug);
    if (bucket) bucket.push(rowToSummary(r));
  }
  return out;
}

export async function getAnalysis(
  userId: number,
  toolSlug: string,
  id: number,
): Promise<Analysis | null> {
  const rows = (await sql`
    SELECT id, name, schema_version, revision, data,
           summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
           created_at, updated_at
    FROM resource_analyses
    WHERE id = ${id} AND user_id = ${userId} AND tool_slug = ${toolSlug}
    LIMIT 1
  `) as AnalysisRow[];
  return rows[0] ? rowToAnalysis(rows[0]) : null;
}

export async function countAnalyses(
  userId: number,
  toolSlug: string,
): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n FROM resource_analyses
    WHERE user_id = ${userId} AND tool_slug = ${toolSlug}
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

/**
 * Returns null when the per-tool cap is already reached.
 *
 * The cap lives in the INSERT's WHERE rather than a separate count-then-insert,
 * so there is no round trip to race against. It is not fully transactional —
 * this connection has no transactions — so a genuine concurrent double-create
 * can land 26 rows. That harms nobody and the UI disables the button at the cap
 * anyway; the 409 is a backstop, not a normal path.
 */
export async function createAnalysis(input: {
  userId: number;
  toolSlug: string;
  name: string;
  data: unknown;
  schemaVersion: number;
  summary: SummaryFields;
}): Promise<Analysis | null> {
  const json = JSON.stringify(input.data ?? {});
  const rows = (await sql`
    INSERT INTO resource_analyses (
      user_id, tool_slug, name, data, schema_version,
      summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location
    )
    SELECT ${input.userId}, ${input.toolSlug}, ${input.name}, ${json}::jsonb,
           ${input.schemaVersion}, ${input.summary.monthlyNet},
           ${input.summary.breakEvenMonth}, ${input.summary.startupTotal},
           ${input.summary.location}
    WHERE (
      SELECT COUNT(*) FROM resource_analyses
      WHERE user_id = ${input.userId} AND tool_slug = ${input.toolSlug}
    ) < ${MAX_ANALYSES_PER_TOOL}
    RETURNING id, name, schema_version, revision, data,
              summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
              created_at, updated_at
  `) as AnalysisRow[];
  return rows[0] ? rowToAnalysis(rows[0]) : null;
}

export type PatchOutcome =
  | { status: "ok"; analysis: Analysis }
  | { status: "not-found" }
  | { status: "conflict"; analysis: Analysis };

/**
 * The single write verb: rename, autosave, or both. Omitted fields keep their
 * current value, matching the cp_claims PATCH shape.
 *
 * `baseRevision` is optimistic concurrency. Zero rows updated means either the
 * row is gone or someone else wrote first, so we re-read to tell those apart —
 * a conflict returns the server's current row so the client can offer "load
 * theirs / keep mine" without a second request.
 *
 * Why bother when resource_tool_state is happily last-write-wins: that table
 * holds a checklist and losing a tick is annoying. This holds an hour of a
 * named pro-forma, and silently losing it is what makes someone stop trusting
 * the tool.
 */
export async function patchAnalysis(input: {
  userId: number;
  toolSlug: string;
  id: number;
  baseRevision: number;
  name?: string;
  data?: unknown;
  schemaVersion?: number;
  summary?: SummaryFields;
}): Promise<PatchOutcome> {
  const hasData = input.data !== undefined;
  const json = hasData ? JSON.stringify(input.data ?? {}) : null;
  const s = input.summary;

  const rows = (await sql`
    UPDATE resource_analyses SET
      name = COALESCE(${input.name ?? null}, name),
      data = COALESCE(${json}::jsonb, data),
      schema_version = COALESCE(${input.schemaVersion ?? null}, schema_version),
      summary_monthly_net =
        CASE WHEN ${hasData} THEN ${s?.monthlyNet ?? null} ELSE summary_monthly_net END,
      summary_break_even_month =
        CASE WHEN ${hasData} THEN ${s?.breakEvenMonth ?? null} ELSE summary_break_even_month END,
      summary_startup_total =
        CASE WHEN ${hasData} THEN ${s?.startupTotal ?? null} ELSE summary_startup_total END,
      summary_location =
        CASE WHEN ${hasData} THEN ${s?.location ?? null} ELSE summary_location END,
      revision = revision + 1,
      updated_at = NOW()
    WHERE id = ${input.id} AND user_id = ${input.userId}
      AND tool_slug = ${input.toolSlug} AND revision = ${input.baseRevision}
    RETURNING id, name, schema_version, revision, data,
              summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
              created_at, updated_at
  `) as AnalysisRow[];

  if (rows[0]) return { status: "ok", analysis: rowToAnalysis(rows[0]) };

  const current = await getAnalysis(input.userId, input.toolSlug, input.id);
  if (!current) return { status: "not-found" };
  return { status: "conflict", analysis: current };
}

/**
 * Server-side copy, so the client never round-trips a 200KB payload up and back
 * down just to duplicate it. Same conditional-insert cap as create.
 */
export async function duplicateAnalysis(input: {
  userId: number;
  toolSlug: string;
  id: number;
  name: string;
}): Promise<Analysis | null | "cap"> {
  const source = await getAnalysis(input.userId, input.toolSlug, input.id);
  if (!source) return null;

  const rows = (await sql`
    INSERT INTO resource_analyses (
      user_id, tool_slug, name, data, schema_version,
      summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location
    )
    SELECT user_id, tool_slug, ${input.name}, data, schema_version,
           summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location
    FROM resource_analyses
    WHERE id = ${input.id} AND user_id = ${input.userId} AND tool_slug = ${input.toolSlug}
      AND (
        SELECT COUNT(*) FROM resource_analyses
        WHERE user_id = ${input.userId} AND tool_slug = ${input.toolSlug}
      ) < ${MAX_ANALYSES_PER_TOOL}
    RETURNING id, name, schema_version, revision, data,
              summary_monthly_net, summary_break_even_month, summary_startup_total, summary_location,
              created_at, updated_at
  `) as AnalysisRow[];

  return rows[0] ? rowToAnalysis(rows[0]) : "cap";
}

/** Idempotent. Returns whether a row was actually removed. */
export async function deleteAnalysis(
  userId: number,
  toolSlug: string,
  id: number,
): Promise<boolean> {
  const rows = (await sql`
    DELETE FROM resource_analyses
    WHERE id = ${id} AND user_id = ${userId} AND tool_slug = ${toolSlug}
    RETURNING id
  `) as Array<{ id: number }>;
  return rows.length > 0;
}

/**
 * "123 Maple St" -> "123 Maple St (copy)", clamped to the column's 120-char
 * CHECK. Done in app code rather than with a UNIQUE constraint: duplicate names
 * are mildly annoying, whereas a constraint makes Duplicate fail outright.
 */
export function copyName(name: string): string {
  const suffix = " (copy)";
  const room = 120 - suffix.length;
  return `${name.length > room ? name.slice(0, room) : name}${suffix}`;
}

export { SUMMARY_COLS };
