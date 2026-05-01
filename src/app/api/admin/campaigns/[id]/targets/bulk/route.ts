import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { logOutreachEvent } from "@/lib/outreach/events";
import { validateDraft } from "@/lib/outreach/quality";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  // If empty, "approve" applies to all currently-pending targets in the campaign.
  // For "reject" we always require an explicit list to avoid accidental mass rejects.
  target_ids: z.array(z.number().int()).optional().default([]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  const { id } = await params;
  const campaignId = parseInt(id, 10);
  if (!Number.isFinite(campaignId)) {
    return NextResponse.json({ error: "Invalid campaign id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const { action, target_ids } = parsed.data;

  if (action === "reject" && target_ids.length === 0) {
    return NextResponse.json({ error: "reject requires explicit target_ids" }, { status: 400 });
  }

  // Resolve target list. For approve+empty, take all currently-pending targets.
  let ids: number[] = target_ids;
  if (action === "approve" && ids.length === 0) {
    const rows = await sql`
      SELECT id FROM outreach_targets
      WHERE campaign_id = ${campaignId}
        AND status = 'scheduled'
        AND approved_at IS NULL
        AND sent_at IS NULL
    `;
    ids = (rows as Array<{ id: number }>).map((r) => r.id);
  }

  if (ids.length === 0) {
    return NextResponse.json({ approved: 0, rejected: 0, replaced: 0, errors: [], note: "no_eligible_targets" });
  }

  const errors: Array<{ target_id: number; reason: string }> = [];
  let approved = 0;
  let rejected = 0;
  let replaced = 0;

  if (action === "approve") {
    // Load all targets in one go for the quality + audit-html gate.
    const rows = await sql`
      SELECT ot.id, ot.status, ot.approved_at, ot.sent_at, ot.hotel_name,
             ot.draft_subject, ot.draft_body, ot.audit_id, a.custom_html
      FROM outreach_targets ot
      LEFT JOIN audits a ON a.id = ot.audit_id
      WHERE ot.campaign_id = ${campaignId} AND ot.id = ANY(${ids}::int[])
    `;
    for (const t of rows) {
      if (t.sent_at) {
        errors.push({ target_id: t.id, reason: "already_sent" });
        continue;
      }
      if (t.approved_at) {
        // Idempotent — already approved counts as approved.
        approved += 1;
        continue;
      }
      // Audit-HTML gate: refuse to approve any target that does not have
      // operator-pasted audit content yet. Same rule as the single-target
      // approve endpoint. No force override.
      if (!t.audit_id || !t.custom_html || (t.custom_html as string).trim() === "") {
        errors.push({ target_id: t.id, reason: "audit_html_required" });
        continue;
      }
      const v = validateDraft({
        hotel_name: t.hotel_name,
        draft_subject: t.draft_subject || "",
        draft_body: t.draft_body || "",
      });
      if (!v.valid) {
        errors.push({ target_id: t.id, reason: `quality_gate:${v.reason}` });
        continue;
      }
      await sql`
        UPDATE outreach_targets
        SET status = 'approved', approved_at = NOW(), approved_by_admin_id = ${adminId}, updated_at = NOW()
        WHERE id = ${t.id}
      `;
      await logOutreachEvent({
        targetId: t.id,
        eventType: "approved",
        metadata: { admin_id: adminId, bulk: true },
      });
      approved += 1;
    }
  } else {
    // For bulk reject, delegate to the single-target reject endpoint to reuse
    // the replenishment logic. We do this server-side via fetch to keep the
    // logic in one place and avoid replicating it. Build absolute URL from
    // the incoming request's origin.
    const origin = new URL(request.url).origin;
    const cookieHeader = request.headers.get("cookie") || "";
    for (const tid of ids) {
      const res = await fetch(`${origin}/api/admin/campaigns/${campaignId}/targets/${tid}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieHeader },
        body: JSON.stringify({ reason: "admin_rejected_bulk" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        errors.push({ target_id: tid, reason: j.error || `http_${res.status}` });
        continue;
      }
      const j = await res.json();
      rejected += 1;
      if (j.replacement) replaced += 1;
    }
  }

  return NextResponse.json({ approved, rejected, replaced, errors });
}
