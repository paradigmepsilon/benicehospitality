import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  const contactResult = await sql`SELECT * FROM pipeline_contacts WHERE id = ${id}`;
  if (contactResult.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const [activities, submissions, bookings, outreachEvents, outreachTargets] = await Promise.all([
    sql`SELECT * FROM pipeline_activities WHERE contact_id = ${id} ORDER BY created_at DESC`,
    sql`SELECT * FROM contact_submissions WHERE pipeline_contact_id = ${id} ORDER BY submitted_at DESC`,
    sql`SELECT * FROM bookings WHERE pipeline_contact_id = ${id} ORDER BY booking_date DESC`,
    sql`
      SELECT e.id, e.target_id, e.event_type, e.occurred_at, e.metadata,
             ot.campaign_id, ot.draft_subject, ot.contact_email
      FROM outreach_events e
      JOIN outreach_targets ot ON ot.id = e.target_id
      WHERE ot.pipeline_contact_id = ${id}
      ORDER BY e.occurred_at DESC
    `,
    sql`
      SELECT id, campaign_id, status, scheduled_send_at, sent_at, approved_at,
             bounced_at, replied_at, draft_subject
      FROM outreach_targets
      WHERE pipeline_contact_id = ${id}
      ORDER BY scheduled_send_at DESC NULLS LAST, id DESC
    `,
  ]);

  return NextResponse.json({
    contact: contactResult[0],
    activities,
    submissions,
    bookings,
    outreach_events: outreachEvents,
    outreach_targets: outreachTargets,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, hotel_name, hotel_location, room_count, company, pipeline_stage, notes } = body;

  if (pipeline_stage !== undefined) {
    const valid = [
      "prospect",
      "email_sent",
      "linkedin_sent",
      "replied",
      "meeting_booked",
      "qualified",
      "proposal",
      "client",
      "closed_lost",
    ];
    if (!valid.includes(pipeline_stage)) {
      return NextResponse.json(
        { error: "Invalid pipeline stage" },
        { status: 400 }
      );
    }
  }

  // Get current contact to check for stage change
  const current = await sql`SELECT * FROM pipeline_contacts WHERE id = ${id}`;
  if (current.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const result = await sql`
    UPDATE pipeline_contacts SET
      name = COALESCE(${name ?? null}, name),
      email = COALESCE(${email ?? null}, email),
      phone = COALESCE(${phone ?? null}, phone),
      hotel_name = COALESCE(${hotel_name ?? null}, hotel_name),
      hotel_location = COALESCE(${hotel_location ?? null}, hotel_location),
      room_count = COALESCE(${room_count ?? null}, room_count),
      company = COALESCE(${company ?? null}, company),
      pipeline_stage = COALESCE(${pipeline_stage ?? null}, pipeline_stage),
      notes = COALESCE(${notes ?? null}, notes),
      updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;

  // Log stage change as activity
  if (pipeline_stage && pipeline_stage !== current[0].pipeline_stage) {
    await sql`
      INSERT INTO pipeline_activities (contact_id, type, title, metadata)
      VALUES (
        ${id}, 'stage_changed',
        ${"Stage changed from " + current[0].pipeline_stage + " to " + pipeline_stage},
        ${JSON.stringify({ from: current[0].pipeline_stage, to: pipeline_stage })}
      )
    `;
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  // Unlink related records before deleting
  await sql`UPDATE contact_submissions SET pipeline_contact_id = NULL WHERE pipeline_contact_id = ${id}`;
  await sql`UPDATE bookings SET pipeline_contact_id = NULL WHERE pipeline_contact_id = ${id}`;

  const result = await sql`DELETE FROM pipeline_contacts WHERE id = ${id} RETURNING id`;

  if (result.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
