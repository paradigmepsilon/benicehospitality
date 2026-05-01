import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { token } = await params;

  const auditRows = await sql`
    SELECT id, token, hotel_url, hotel_slug, public_slug, hotel_name, hotel_location, room_count,
           overall_score, overall_grade, audit_data, custom_html, status, is_stub, created_at, expires_at
    FROM audits
    WHERE token = ${token}
    LIMIT 1
  `;
  if (auditRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const audit = auditRows[0];

  const views = await sql`
    SELECT id, email, first_viewed_at, last_viewed_at, view_count, ip_address::text, user_agent
    FROM audit_views
    WHERE audit_id = ${audit.id}
    ORDER BY first_viewed_at DESC
  `;

  const events = await sql`
    SELECT id, audit_view_id, event_type, metadata, occurred_at
    FROM audit_events
    WHERE audit_id = ${audit.id}
    ORDER BY occurred_at DESC
    LIMIT 200
  `;

  const nurture = await sql`
    SELECT nq.id, nq.audit_view_id, av.email, nq.sequence_step,
           nq.scheduled_for, nq.sent_at, nq.cancelled_at, nq.cancellation_reason,
           nq.resend_message_id
    FROM nurture_queue nq
    JOIN audit_views av ON av.id = nq.audit_view_id
    WHERE av.audit_id = ${audit.id}
    ORDER BY nq.scheduled_for ASC
  `;

  // Funnel summary derived from events
  const funnelRows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM audit_views av WHERE av.audit_id = ${audit.id}) AS unique_emails,
      (SELECT COUNT(*)::int FROM audit_events e WHERE e.audit_id = ${audit.id} AND e.event_type = 'audit_created') AS created_count,
      (SELECT COUNT(*)::int FROM audit_events e WHERE e.audit_id = ${audit.id} AND e.event_type = 'email_submitted') AS email_submissions,
      (SELECT COUNT(*)::int FROM audit_events e WHERE e.audit_id = ${audit.id} AND e.event_type = 'report_viewed') AS report_views,
      (SELECT COUNT(*)::int FROM audit_events e WHERE e.audit_id = ${audit.id} AND e.event_type = 'cta_clicked') AS cta_clicks,
      (SELECT COUNT(*)::int FROM audit_events e WHERE e.audit_id = ${audit.id} AND e.event_type = 'booked_call') AS bookings
  `;
  const funnel = funnelRows[0];

  return NextResponse.json({ audit, views, events, nurture, funnel });
}

const patchSchema = z.object({
  // Operator-pasted HTML for the public audit landing page. Pass null to clear
  // (revert to the structured AuditReport renderer).
  custom_html: z.string().nullable().optional(),
  // When the operator replaces stub content with real audit data, they should
  // also flip is_stub off so the daily-approval gate stops blocking sends.
  is_stub: z.boolean().optional(),
  status: z.enum(["active", "expired", "archived"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { token } = await params;
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

  const existing = await sql`SELECT id, custom_html, is_stub, status FROM audits WHERE token = ${token} LIMIT 1`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const cur = existing[0];

  const nextCustomHtml = data.custom_html === undefined ? cur.custom_html : data.custom_html;
  // If the operator pasted real HTML, treat the audit as no-longer-stub by
  // default. They can override explicitly via is_stub in the same patch.
  const inferredIsStub =
    data.is_stub !== undefined ? data.is_stub : (data.custom_html ? false : cur.is_stub);
  const nextStatus = data.status ?? cur.status;

  const updated = await sql`
    UPDATE audits
    SET
      custom_html = ${nextCustomHtml},
      is_stub = ${inferredIsStub},
      status = ${nextStatus}
    WHERE token = ${token}
    RETURNING id, token, public_slug, custom_html, is_stub, status
  `;
  return NextResponse.json({ audit: updated[0] });
}
