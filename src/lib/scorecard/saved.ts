// A member's saved Co-living Viability Calculator scorecards.
//
// The Co-Living Property Profitability Analysis Worksheet keeps many named
// analyses per member in `resource_analyses`. The scorecard is the same idea —
// several properties, tracked side by side — but its rows already exist in
// `viability_scorecards`, written by the public lead-capture flow and addressed
// by a shareable token. So this module is the read/write layer over THAT table
// rather than a second home for the same data. Moving scorecards into
// resource_analyses would break every emailed results link for no user gain.
//
// Follows src/lib/resources/analyses.ts conventions: a row interface, a rowToX
// mapper, Number() coercion because the Neon driver returns NUMERIC as a
// string, and ownership folded into the SQL WHERE so no caller can forget it.

import { sql } from "@/lib/db";
import { SCORECARD_MAX_SCORE } from "@/lib/scorecard/questions";
import type { ScorecardBand } from "@/lib/scorecard/score";

/** Matches the property_nickname clamp on the submit + unlock body schemas. */
export const MAX_NICKNAME_LENGTH = 120;

export interface ScorecardSummary {
  id: number;
  /** Public results-page token. The only way to open the full report. */
  token: string;
  propertyNickname: string;
  overallScore: number;
  /** 0-100, precomputed so five call sites don't each divide by the max. */
  overallPct: number;
  band: ScorecardBand;
  createdAt: string;
}

interface ScorecardRow {
  id: number;
  token: string;
  property_nickname: string | null;
  overall_score: string | number;
  band: ScorecardBand;
  created_at: string;
}

function rowToSummary(r: ScorecardRow): ScorecardSummary {
  const score = Number(r.overall_score);
  const safe = Number.isFinite(score) ? score : 0;
  return {
    id: r.id,
    token: r.token,
    propertyNickname: r.property_nickname || "Untitled property",
    overallScore: safe,
    overallPct: Math.round((safe / SCORECARD_MAX_SCORE) * 100),
    band: r.band,
    createdAt: r.created_at,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Ownership rule, repeated verbatim in every query below rather than factored
// into a shared fragment — the Neon tagged-template driver does not compose
// sub-templates, and an ownership predicate is the last thing worth being
// clever about.
//
// A member owns a scorecard if it carries their user id, OR if it is unclaimed
// and was unlocked to their account email. The email arm is what makes "score a
// property, then sign up" work: the calculator is a public lead-capture tool,
// so most scorecards are created logged out and only ever carry the email the
// report was mailed to. Login requires a verified email (see community-auth),
// and the report already landed in that mailbox, so matching on it exposes
// nothing the account holder could not already read.
//
// `status = 'unlocked'` everywhere: a pending_capture row has no readable report
// (the results page 404s it) and no email to match on.
//
// `dashboard_hidden_at IS NULL` everywhere: see hideScorecardFromDashboard.

export async function listScorecardsForMember(
  userId: number,
  email: string,
): Promise<ScorecardSummary[]> {
  const rows = (await sql`
    SELECT id, token, property_nickname, overall_score, band, created_at
    FROM viability_scorecards
    WHERE status = 'unlocked'
      AND dashboard_hidden_at IS NULL
      AND (user_id = ${userId}
           OR (user_id IS NULL AND LOWER(email) = ${normalizeEmail(email)}))
    ORDER BY created_at DESC
  `) as ScorecardRow[];
  return rows.map(rowToSummary);
}

/** Does this member own the scorecard behind `token`? Drives the results-page banner. */
export async function memberOwnsScorecard(
  userId: number,
  email: string,
  token: string,
): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 AS hit
    FROM viability_scorecards
    WHERE token = ${token}
      AND status = 'unlocked'
      AND dashboard_hidden_at IS NULL
      AND (user_id = ${userId}
           OR (user_id IS NULL AND LOWER(email) = ${normalizeEmail(email)}))
    LIMIT 1
  `) as Array<{ hit: number }>;
  return rows.length > 0;
}

/**
 * Rename in place. Also claims the row — someone editing a scorecard from their
 * dashboard has declared it theirs, so stop depending on the email match.
 *
 * Returns null for "not yours" and for "does not exist" alike; the route turns
 * both into the same 404 rather than confirming a row exists to someone who
 * cannot read it.
 */
export async function renameScorecard(
  userId: number,
  email: string,
  id: number,
  nickname: string,
): Promise<ScorecardSummary | null> {
  const clean = nickname.trim().slice(0, MAX_NICKNAME_LENGTH);
  const rows = (await sql`
    UPDATE viability_scorecards
    SET property_nickname = ${clean}, user_id = ${userId}
    WHERE id = ${id}
      AND status = 'unlocked'
      AND dashboard_hidden_at IS NULL
      AND (user_id = ${userId}
           OR (user_id IS NULL AND LOWER(email) = ${normalizeEmail(email)}))
    RETURNING id, token, property_nickname, overall_score, band, created_at
  `) as ScorecardRow[];
  return rows[0] ? rowToSummary(rows[0]) : null;
}

/**
 * Take a scorecard off the member's dashboard.
 *
 * A soft hide, not a DELETE. The row is a captured lead with a pipeline_contact
 * behind it and an emailed report already in the wild; a member tidying their
 * shelf must not silently destroy sales history or 404 a link Della sent them.
 * Stamping dashboard_hidden_at drops it from every member surface and leaves
 * both the CRM record and the token results page intact.
 *
 * Idempotent — a second call for the same id is a success, not a 404.
 */
export async function hideScorecardFromDashboard(
  userId: number,
  email: string,
  id: number,
): Promise<boolean> {
  const rows = (await sql`
    UPDATE viability_scorecards
    SET dashboard_hidden_at = NOW()
    WHERE id = ${id}
      AND status = 'unlocked'
      AND dashboard_hidden_at IS NULL
      AND (user_id = ${userId}
           OR (user_id IS NULL AND LOWER(email) = ${normalizeEmail(email)}))
    RETURNING id
  `) as Array<{ id: number }>;
  return rows.length > 0;
}
