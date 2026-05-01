import { NextResponse } from "next/server";
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
    SELECT id, token, hotel_url, hotel_slug, hotel_name, hotel_location, room_count,
           overall_score, overall_grade, audit_data, status, created_at, expires_at
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
