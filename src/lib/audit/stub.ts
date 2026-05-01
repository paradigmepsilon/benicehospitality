import { sql } from "@/lib/db";
import { generateAuditToken, getTokenTtlDays, pickPublicSlug } from "@/lib/audit/token";
import type { AuditData, LetterGrade } from "@/lib/types/audit";

interface StubInput {
  hotel_name: string;
  hotel_url: string;
  hotel_location: string | null;
  room_count: number | null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "hotel";
}

export function buildStubAuditData(input: StubInput): AuditData {
  const placeholderFinding = "Audit data not yet generated. Replace with a full Tier 0 audit before sending outreach.";
  const placeholderAction = "Run the BNHG audit pipeline against this property and replace this stub.";
  const dimension = {
    subscore: 0,
    grade: "D" as LetterGrade,
    findings: [placeholderFinding],
  };

  return {
    hotel: {
      name: input.hotel_name,
      slug: slugify(input.hotel_name),
      url: input.hotel_url,
      location: input.hotel_location,
      room_count: input.room_count,
    },
    overall: {
      score: 0,
      grade: "D",
      summary: placeholderFinding,
    },
    dimensions: {
      revenue_opportunity: dimension,
      online_reputation: dimension,
      competitive_position: dimension,
      guest_personas: dimension,
      tech_stack: dimension,
      visibility_discoverability: dimension,
    },
    quick_wins: [
      { title: "Stub audit", effort: "this_week", pillar: "commercial", finding: placeholderFinding, action: placeholderAction },
      { title: "Stub audit", effort: "this_week", pillar: "guest_experience", finding: placeholderFinding, action: placeholderAction },
      { title: "Stub audit", effort: "this_week", pillar: "tech", finding: placeholderFinding, action: placeholderAction },
    ],
    generated_at: new Date().toISOString(),
    signal_referral_eligible: false,
  };
}

export async function createStubAudit(input: StubInput): Promise<{ id: number; token: string; publicSlug: string }> {
  const auditData = buildStubAuditData(input);
  const token = generateAuditToken();
  const expiresAt = new Date(Date.now() + getTokenTtlDays() * 24 * 60 * 60 * 1000);
  const publicSlug = await pickPublicSlug(auditData.hotel.slug);

  const rows = await sql`
    INSERT INTO audits (
      token, hotel_url, hotel_slug, public_slug, hotel_name, hotel_location, room_count,
      overall_score, overall_grade, audit_data, expires_at, is_stub
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
      ${expiresAt.toISOString()},
      TRUE
    )
    RETURNING id
  `;
  return { id: rows[0].id as number, token, publicSlug };
}
