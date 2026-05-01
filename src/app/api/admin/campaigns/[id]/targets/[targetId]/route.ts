import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { validateDraft } from "@/lib/outreach/quality";
import { sanitizeDraftText } from "@/lib/outreach/sanitize";

const patchSchema = z.object({
  draft_subject: z.string().trim().min(1).max(500).optional(),
  draft_body: z.string().trim().min(1).optional(),
  // Allow optionally toggling the target back into the queue or out of it.
  status: z.enum(["scheduled", "cancelled"]).optional(),
});

export async function PATCH(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await sql`
    SELECT id, hotel_name, draft_subject, draft_body, status, approved_at
    FROM outreach_targets
    WHERE id = ${tId} AND campaign_id = ${campaignId}
    LIMIT 1
  `;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  const current = existing[0];
  if (current.approved_at || current.status === "sent" || current.status === "approved") {
    return NextResponse.json(
      { error: "Cannot edit an approved or sent target. Cancel it first if you need to change it." },
      { status: 409 },
    );
  }

  // Sanitize any operator-supplied subject/body too. Catches em-dashes/curly
  // quotes the admin might paste in from Word, Notion, etc.
  const newSubject = data.draft_subject !== undefined ? sanitizeDraftText(data.draft_subject) : current.draft_subject;
  const newBody = data.draft_body !== undefined ? sanitizeDraftText(data.draft_body) : current.draft_body;

  // Re-run the quality gate so admins see the same constraints the daily-approval flow enforces.
  const v = validateDraft({
    hotel_name: current.hotel_name,
    draft_subject: newSubject ?? "",
    draft_body: newBody ?? "",
  });

  const updated = await sql`
    UPDATE outreach_targets
    SET
      draft_subject = ${newSubject},
      draft_body = ${newBody},
      status = ${data.status ?? current.status},
      failure_reason = ${v.valid ? null : v.reason ?? "validation_failed"},
      updated_at = NOW()
    WHERE id = ${tId}
    RETURNING *
  `;

  return NextResponse.json({ target: updated[0], quality: v });
}

export async function DELETE(
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

  const existing = await sql`
    SELECT id, status, approved_at, sent_at FROM outreach_targets
    WHERE id = ${tId} AND campaign_id = ${campaignId}
    LIMIT 1
  `;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }
  if (existing[0].sent_at) {
    return NextResponse.json({ error: "Already sent — cannot remove" }, { status: 409 });
  }

  await sql`
    UPDATE outreach_targets
    SET status = 'cancelled', updated_at = NOW(), failure_reason = 'admin_removed'
    WHERE id = ${tId}
  `;
  return NextResponse.json({ ok: true });
}
