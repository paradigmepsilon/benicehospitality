import crypto from "crypto";
import { sql } from "@/lib/db";
import type { AuditData, AuditRow } from "@/lib/types/audit";

export function generateAuditToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function getTokenTtlDays(): number {
  const raw = process.env.AUDIT_TOKEN_TTL_DAYS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
}

/**
 * The public audit URL. We prefer the human-readable public_slug, with the raw
 * token as a fallback for legacy rows. Pass an audit row (or just the slug
 * string) and we'll do the right thing.
 */
export function buildAuditUrl(slugOrToken: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com";
  return `${base.replace(/\/$/, "")}/audit/${slugOrToken}`;
}

const AUDIT_COLUMNS = sql`
  id, token, hotel_url, hotel_slug, public_slug, hotel_name, hotel_location, room_count,
  overall_score, overall_grade, audit_data, custom_html, status, is_stub, created_at, expires_at
`;

export async function getAuditByToken(token: string): Promise<AuditRow | null> {
  const rows = await sql`
    SELECT ${AUDIT_COLUMNS}
    FROM audits
    WHERE token = ${token}
    LIMIT 1
  `;
  return firstActive(rows);
}

/**
 * Resolve an audit by its public_slug. Used by the new /audit/[slug] route.
 * Falls back to token-based lookup so any pre-slug URL still works.
 */
export async function getAuditBySlugOrToken(input: string): Promise<AuditRow | null> {
  // Try public_slug first (the new canonical key).
  const slugRows = await sql`
    SELECT ${AUDIT_COLUMNS}
    FROM audits
    WHERE public_slug = ${input}
    LIMIT 1
  `;
  const slugHit = firstActive(slugRows);
  if (slugHit) return slugHit;

  // Then fall back to token (legacy URLs, audits created before public_slug).
  const tokenRows = await sql`
    SELECT ${AUDIT_COLUMNS}
    FROM audits
    WHERE token = ${input}
    LIMIT 1
  `;
  return firstActive(tokenRows);
}

function firstActive(rows: Record<string, unknown>[]): AuditRow | null {
  if (rows.length === 0) return null;
  const row = rows[0] as unknown as AuditRow;
  if (row.status !== "active") return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
  return row;
}

/**
 * Choose a public_slug for a new audit. Uses the slugified hotel name as the
 * base. If another audit already owns that slug, append "-2", "-3", etc.
 * until we find an unused one. Bounded loop, falls back to "-<random>" if
 * we somehow run out of patience.
 */
export async function pickPublicSlug(baseSlug: string): Promise<string> {
  const candidate = baseSlug || "audit";

  // Pull every public_slug that starts with the base, so we can decide a
  // single new one in one round trip.
  const taken = (await sql`
    SELECT public_slug FROM audits
    WHERE public_slug = ${candidate} OR public_slug LIKE ${candidate + "-%"}
  `) as Array<{ public_slug: string | null }>;
  const set = new Set(taken.map((r) => r.public_slug).filter(Boolean) as string[]);

  if (!set.has(candidate)) return candidate;

  for (let i = 2; i < 1000; i++) {
    const next = `${candidate}-${i}`;
    if (!set.has(next)) return next;
  }
  // Pathological fallback.
  return `${candidate}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function createAudit(auditData: AuditData): Promise<{
  id: number;
  token: string;
  publicSlug: string;
  expiresAt: Date;
}> {
  const token = generateAuditToken();
  const ttlDays = getTokenTtlDays();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const publicSlug = await pickPublicSlug(auditData.hotel.slug);

  const rows = await sql`
    INSERT INTO audits (
      token, hotel_url, hotel_slug, public_slug, hotel_name, hotel_location, room_count,
      overall_score, overall_grade, audit_data, expires_at
    )
    VALUES (
      ${token},
      ${auditData.hotel.url},
      ${auditData.hotel.slug},
      ${publicSlug},
      ${auditData.hotel.name},
      ${auditData.hotel.location},
      ${auditData.hotel.room_count},
      ${auditData.overall.score},
      ${auditData.overall.grade},
      ${JSON.stringify(auditData)}::jsonb,
      ${expiresAt.toISOString()}
    )
    RETURNING id
  `;
  const id = rows[0].id as number;
  return { id, token, publicSlug, expiresAt };
}
