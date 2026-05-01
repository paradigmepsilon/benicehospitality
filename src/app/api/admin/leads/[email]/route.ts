import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { email: emailRaw } = await params;
  const email = decodeURIComponent(emailRaw).toLowerCase().trim();

  // All audits this email has viewed, with per-audit metadata
  const audits = await sql`
    SELECT
      a.token, a.hotel_name, a.hotel_url, a.overall_score, a.overall_grade, a.created_at,
      av.id AS audit_view_id, av.first_viewed_at, av.last_viewed_at, av.view_count
    FROM audit_views av
    JOIN audits a ON a.id = av.audit_id
    WHERE av.email = ${email}
    ORDER BY av.first_viewed_at DESC
  `;

  if (audits.length === 0) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // All events for this email, joined to audit + view
  const events = await sql`
    SELECT
      ae.id, ae.event_type, ae.metadata, ae.occurred_at,
      a.hotel_name, a.token AS audit_token
    FROM audit_events ae
    JOIN audit_views av ON av.id = ae.audit_view_id
    JOIN audits a ON a.id = ae.audit_id
    WHERE av.email = ${email}
    ORDER BY ae.occurred_at DESC
    LIMIT 200
  `;

  // Bookings tied to this email
  const bookings = await sql`
    SELECT id, hotel_name, booking_date, booking_time, focus_dimension, audit_id, status, created_at
    FROM bookings
    WHERE email = ${email}
    ORDER BY booking_date DESC
  `;

  // Manual notes
  const notes = await sql`
    SELECT id, note, author_admin_id, created_at
    FROM lead_notes
    WHERE email = ${email}
    ORDER BY created_at DESC
  `;

  // Derive stage same way the list endpoint does
  const ctaCount = events.filter((e) => e.event_type === "cta_clicked").length;
  const bookCount = events.filter((e) => e.event_type === "booked_call").length;
  const stage = bookCount > 0 ? "booked" : ctaCount > 0 ? "engaged" : "cold";

  return NextResponse.json({
    email,
    stage,
    audits,
    events,
    bookings,
    notes,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const session = await getSession();
  const author = session?.sub || "unknown";

  const { email: emailRaw } = await params;
  const email = decodeURIComponent(emailRaw).toLowerCase().trim();

  const body = await request.json();
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (!note) {
    return NextResponse.json({ error: "Note text required." }, { status: 400 });
  }
  if (note.length > 5000) {
    return NextResponse.json({ error: "Note is too long (5000 char max)." }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO lead_notes (email, note, author_admin_id)
    VALUES (${email}, ${note}, ${author})
    RETURNING id, note, author_admin_id, created_at
  `;

  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const noteId = url.searchParams.get("note_id");
  if (!noteId) {
    return NextResponse.json({ error: "note_id required." }, { status: 400 });
  }

  const { email: emailRaw } = await params;
  const email = decodeURIComponent(emailRaw).toLowerCase().trim();

  await sql`DELETE FROM lead_notes WHERE id = ${parseInt(noteId, 10)} AND email = ${email}`;
  return new NextResponse(null, { status: 204 });
}
