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

export function buildAuditUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com";
  return `${base.replace(/\/$/, "")}/audit/${token}`;
}

export async function getAuditByToken(token: string): Promise<AuditRow | null> {
  const rows = await sql`
    SELECT id, token, hotel_url, hotel_slug, hotel_name, hotel_location, room_count,
           overall_score, overall_grade, audit_data, status, created_at, expires_at
    FROM audits
    WHERE token = ${token}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const row = rows[0] as AuditRow;
  if (row.status !== "active") return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
  return row;
}

export async function createAudit(auditData: AuditData): Promise<{
  id: number;
  token: string;
  expiresAt: Date;
}> {
  const token = generateAuditToken();
  const ttlDays = getTokenTtlDays();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  const rows = await sql`
    INSERT INTO audits (
      token, hotel_url, hotel_slug, hotel_name, hotel_location, room_count,
      overall_score, overall_grade, audit_data, expires_at
    )
    VALUES (
      ${token},
      ${auditData.hotel.url},
      ${auditData.hotel.slug},
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
  return { id, token, expiresAt };
}
