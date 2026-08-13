// Cache for the worksheet's web property lookup.
//
// A lookup costs roughly four cents and twenty seconds. Two members evaluating
// the same house, or one member reopening their own analysis, should not pay
// that twice. One row per address, shared across all members.
//
// DECISION ON RECORD. Gemini's Additional Terms of Service, under Grounding
// with Google Search, say "You will not... cache, frame, syndicate, resell,
// analyze, train on, or otherwise learn from Grounded Results or Search
// Suggestions", with narrow carve-outs this does not fit. Alex was shown that
// clause on 2026-08-11 and chose to accept the exposure for the cost and speed
// saving. This file exists because of that decision, not in ignorance of it.
// Anyone reconsidering it should read that clause first — the fix is a paid
// property-data provider whose terms permit storage, not a code change here.
//
// Follows src/lib/resources/planner-cost-overrides.ts conventions: a row
// interface, a rowToX mapper, explicit column lists.

import { sql } from "@/lib/db";
import {
  ALL_DETAIL_FIELDS,
  sanitizeDetails,
  type DetailSource,
  type PropertyDetailField,
  type PropertyDetails,
} from "./property-details";

/**
 * How long a cached answer stands before the address is looked up again.
 *
 * Ninety days is a compromise between the two kinds of field in one row. Bed
 * and bath counts and square footage effectively never change; the two rent
 * figures drift with the market. Rather than track a timestamp per field, the
 * whole row expires and the next lookup refreshes everything, which costs one
 * extra call per address per quarter and keeps the logic small enough to reason
 * about.
 */
export const CACHE_TTL_DAYS = 90;

export interface CachedDetails {
  address: string;
  details: PropertyDetails;
  /**
   * Fields that have actually been through a lookup for this address.
   *
   * Load-bearing. A null in `details` means "we looked and found nothing
   * published" ONLY for fields listed here; for any other field it means
   * "nobody has asked yet". Without this the two are indistinguishable and an
   * address with no listing gets re-searched on every visit forever.
   */
  searched: PropertyDetailField[];
  sources: DetailSource[];
  notes: string;
  updatedAt: string;
}

interface CacheRow {
  address: string;
  details: unknown;
  searched: unknown;
  sources: unknown;
  notes: string | null;
  updated_at: string | Date;
}

/**
 * The primary key. Collapses everything that varies between two spellings of
 * the same address — case, punctuation, "Rd." against "Rd", double spaces — so
 * that one member's "540 Hutchens Rd. SE" hits the row another member created
 * as "540 Hutchens Rd SE".
 *
 * It does NOT try to normalize abbreviations ("Road" to "Rd", "Southeast" to
 * "SE"). It could, and it would raise the hit rate slightly, but every rule
 * added is a chance to collide two genuinely different addresses, and the
 * addresses reaching this point have already been through the geocoder and come
 * back in its spelling. A missed cache hit costs four cents; a collision puts
 * the wrong house's numbers on someone's loan document.
 */
export function addressKey(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toField(v: unknown): PropertyDetailField | null {
  return typeof v === "string" && (ALL_DETAIL_FIELDS as string[]).includes(v)
    ? (v as PropertyDetailField)
    : null;
}

function toSources(v: unknown): DetailSource[] {
  if (!Array.isArray(v)) return [];
  const out: DetailSource[] = [];
  for (const s of v) {
    if (!s || typeof s !== "object") continue;
    const { title, uri } = s as Record<string, unknown>;
    if (typeof title === "string" && typeof uri === "string" && title && uri) {
      out.push({ title, uri });
    }
  }
  return out;
}

function rowToCached(r: CacheRow): CachedDetails {
  return {
    address: r.address,
    // Re-sanitized on the way out, not trusted because it was trusted once. A
    // bounds change in property-details.ts must apply to rows already stored.
    details: sanitizeDetails(r.details),
    searched: (Array.isArray(r.searched) ? r.searched : [])
      .map(toField)
      .filter((f): f is PropertyDetailField => f !== null),
    sources: toSources(r.sources),
    notes: r.notes ?? "",
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
  };
}

/**
 * The cached row for an address, or null when there is none or it has expired.
 *
 * Bumps `hits` so it is possible to tell later whether this table is earning
 * its keep. Fire-and-forget: a failed counter update must never cost the member
 * their cache hit.
 */
export async function getCachedDetails(address: string): Promise<CachedDetails | null> {
  const key = addressKey(address);
  if (!key) return null;

  const rows = (await sql`
    SELECT address, details, searched, sources, notes, updated_at
    FROM property_detail_cache
    WHERE address_key = ${key}
      AND updated_at > NOW() - (${CACHE_TTL_DAYS} || ' days')::interval
  `) as CacheRow[];

  if (!rows[0]) return null;

  void sql`
    UPDATE property_detail_cache SET hits = hits + 1 WHERE address_key = ${key}
  `.catch(() => {});

  return rowToCached(rows[0]);
}

/**
 * The mergeable shape of a row.
 *
 * `details` is Partial, unlike CachedDetails, and that is the point: a field
 * absent from the object has never been asked about, while a field present and
 * null was asked about and came back empty. A full PropertyDetails is
 * assignable to this, so a row read from the database can be merged directly.
 */
export interface CacheMergeState {
  details: Partial<PropertyDetails>;
  searched: PropertyDetailField[];
  sources: DetailSource[];
  notes: string;
}

/**
 * Combine an existing cache row with one lookup's answers.
 *
 * MERGE, NOT REPLACE, because consecutive lookups of the same address ask for
 * different fields — whatever that member had not already typed. Member A fills
 * the bedrooms in by hand and looks up the rest; member B needs the bedrooms.
 * Replacing would throw away A's coverage, and B's lookup would leave the row
 * worse than it found it. Merging means the row accumulates until the address
 * is fully covered and later members pay nothing.
 *
 * `searched` is a union, so a field stays covered once looked up even if a
 * later call did not ask for it. `sources` is a union by URI. `notes` takes the
 * newest non-empty value: it describes the most recent call, and is only ever
 * shown when nothing was found.
 *
 * Pure and exported so it can be tested without a database.
 */
export function mergeCacheRow(
  prev: CacheMergeState | null,
  searched: PropertyDetailField[],
  details: PropertyDetails,
  sources: DetailSource[],
  notes: string,
): CacheMergeState {
  // Only the fields this call actually asked about. Carrying the whole details
  // object would write nulls for unasked fields, which is exactly the ambiguity
  // `searched` exists to remove.
  const nextDetails: Partial<PropertyDetails> = {};
  for (const f of prev?.searched ?? []) nextDetails[f] = prev!.details[f] ?? null;
  for (const f of searched) nextDetails[f] = details[f];

  const nextSearched = [...new Set([...(prev?.searched ?? []), ...searched])];

  const nextSources = [...(prev?.sources ?? [])];
  for (const s of sources) {
    if (!nextSources.some((m) => m.uri === s.uri)) nextSources.push(s);
  }

  return {
    details: nextDetails,
    searched: nextSearched,
    sources: nextSources.slice(0, 12),
    notes: notes.trim() !== "" ? notes : (prev?.notes ?? ""),
  };
}

/**
 * Write one lookup's answers into the address's row.
 *
 * Read-merge-write rather than a single upsert with the merge in SQL. Two
 * members looking up the same address in the same second would race, and the
 * loser's coverage would be dropped — but that costs one repeated lookup and
 * heals on the next call, which is a better trade than a merge expression
 * nobody can read. See mergeCacheRow for the rules.
 *
 * Reads the existing row regardless of the TTL: an expired row's values are
 * about to be replaced by this call anyway, and its `searched` set is still
 * worth carrying forward.
 */
export async function putCachedDetails(
  address: string,
  searched: PropertyDetailField[],
  details: PropertyDetails,
  sources: DetailSource[],
  notes: string,
): Promise<void> {
  const key = addressKey(address);
  if (!key) return;

  const existing = (await sql`
    SELECT address, details, searched, sources, notes, updated_at
    FROM property_detail_cache
    WHERE address_key = ${key}
  `) as CacheRow[];

  const next = mergeCacheRow(
    existing[0] ? rowToCached(existing[0]) : null,
    searched,
    details,
    sources,
    notes,
  );

  await sql`
    INSERT INTO property_detail_cache (
      address_key, address, details, searched, sources, notes, updated_at
    ) VALUES (
      ${key},
      ${address},
      ${JSON.stringify(next.details)}::jsonb,
      ${JSON.stringify(next.searched)}::jsonb,
      ${JSON.stringify(next.sources)}::jsonb,
      ${next.notes},
      NOW()
    )
    ON CONFLICT (address_key) DO UPDATE SET
      address = EXCLUDED.address,
      details = EXCLUDED.details,
      searched = EXCLUDED.searched,
      sources = EXCLUDED.sources,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `;
}
