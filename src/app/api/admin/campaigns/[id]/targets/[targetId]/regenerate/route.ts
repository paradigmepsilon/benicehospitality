import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateDraft } from "@/lib/outreach/draft";
import type { SelectedProspect } from "@/lib/outreach/prospect-selection";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> },
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { id, targetId } = await params;
  const campaignId = parseInt(id, 10);
  const tId = parseInt(targetId, 10);
  if (!Number.isFinite(campaignId) || !Number.isFinite(tId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rows = await sql`
    SELECT
      ot.id, ot.campaign_id, ot.pipeline_contact_id, ot.status, ot.approved_at,
      pc.id AS pid, pc.name, pc.email, pc.hotel_name, pc.hotel_location,
      pc.website_url, pc.linkedin_url, pc.fit_quality, pc.region, pc.state, pc.city,
      pc.owner_role, pc.company, pc.notes, pc.room_count, pc.pipeline_stage
    FROM outreach_targets ot
    LEFT JOIN pipeline_contacts pc ON pc.id = ot.pipeline_contact_id
    WHERE ot.id = ${tId} AND ot.campaign_id = ${campaignId}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  const t = rows[0];
  if (t.approved_at || t.status === "approved" || t.status === "sent") {
    return NextResponse.json({ error: "Cannot regenerate an approved or sent target" }, { status: 409 });
  }
  if (!t.pipeline_contact_id) {
    return NextResponse.json({ error: "Target has no linked prospect; manual edit only" }, { status: 400 });
  }

  const prospect: SelectedProspect = {
    id: t.pid,
    name: t.name,
    email: t.email,
    hotel_name: t.hotel_name,
    hotel_location: t.hotel_location,
    website_url: t.website_url,
    linkedin_url: t.linkedin_url,
    fit_quality: t.fit_quality,
    region: t.region,
    state: t.state,
    city: t.city,
    owner_role: t.owner_role,
    company: t.company,
    notes: t.notes,
    room_count: t.room_count,
    pipeline_stage: t.pipeline_stage,
  };

  let draft;
  try {
    draft = await generateDraft(prospect);
  } catch (err) {
    return NextResponse.json(
      { error: "AI generation failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  const updated = await sql`
    UPDATE outreach_targets
    SET draft_subject = ${draft.subject}, draft_body = ${draft.body}, updated_at = NOW()
    WHERE id = ${tId}
    RETURNING *
  `;

  return NextResponse.json({ target: updated[0], draft });
}
