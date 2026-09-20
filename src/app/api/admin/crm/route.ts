import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { upsertContactByEmail } from "@/lib/pipeline-contacts";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";

  let contacts;

  if (search) {
    const pattern = `%${search}%`;
    if (stage && stage !== "all") {
      contacts = await sql`
        SELECT pc.*,
          (SELECT COUNT(*)::int FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS activity_count,
          (SELECT MAX(pa.created_at) FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS last_activity_at
        FROM pipeline_contacts pc
        WHERE pc.pipeline_stage = ${stage}
          AND (pc.name ILIKE ${pattern} OR pc.email ILIKE ${pattern} OR pc.hotel_name ILIKE ${pattern})
        ORDER BY
          CASE WHEN ${sort} = 'oldest' THEN pc.created_at END ASC,
          CASE WHEN ${sort} = 'name' THEN pc.name END ASC,
          CASE WHEN ${sort} = 'newest' THEN pc.updated_at END DESC
      `;
    } else {
      contacts = await sql`
        SELECT pc.*,
          (SELECT COUNT(*)::int FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS activity_count,
          (SELECT MAX(pa.created_at) FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS last_activity_at
        FROM pipeline_contacts pc
        WHERE pc.name ILIKE ${pattern} OR pc.email ILIKE ${pattern} OR pc.hotel_name ILIKE ${pattern}
        ORDER BY
          CASE WHEN ${sort} = 'oldest' THEN pc.created_at END ASC,
          CASE WHEN ${sort} = 'name' THEN pc.name END ASC,
          CASE WHEN ${sort} = 'newest' THEN pc.updated_at END DESC
      `;
    }
  } else if (stage && stage !== "all") {
    contacts = await sql`
      SELECT pc.*,
        (SELECT COUNT(*)::int FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS activity_count,
        (SELECT MAX(pa.created_at) FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS last_activity_at
      FROM pipeline_contacts pc
      WHERE pc.pipeline_stage = ${stage}
      ORDER BY
        CASE WHEN ${sort} = 'oldest' THEN pc.created_at END ASC,
        CASE WHEN ${sort} = 'name' THEN pc.name END ASC,
        CASE WHEN ${sort} = 'newest' THEN pc.updated_at END DESC
    `;
  } else if (source) {
    contacts = await sql`
      SELECT pc.*,
        (SELECT COUNT(*)::int FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS activity_count,
        (SELECT MAX(pa.created_at) FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS last_activity_at
      FROM pipeline_contacts pc
      WHERE pc.source = ${source}
      ORDER BY
        CASE WHEN ${sort} = 'oldest' THEN pc.created_at END ASC,
        CASE WHEN ${sort} = 'name' THEN pc.name END ASC,
        CASE WHEN ${sort} = 'newest' THEN pc.updated_at END DESC
    `;
  } else {
    contacts = await sql`
      SELECT pc.*,
        (SELECT COUNT(*)::int FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS activity_count,
        (SELECT MAX(pa.created_at) FROM pipeline_activities pa WHERE pa.contact_id = pc.id) AS last_activity_at
      FROM pipeline_contacts pc
      ORDER BY
        CASE WHEN ${sort} = 'oldest' THEN pc.created_at END ASC,
        CASE WHEN ${sort} = 'name' THEN pc.name END ASC,
        CASE WHEN ${sort} = 'newest' THEN pc.updated_at END DESC
    `;
  }

  // Get stage counts
  const counts = await sql`
    SELECT pipeline_stage, COUNT(*)::int AS count
    FROM pipeline_contacts
    GROUP BY pipeline_stage
  `;

  return NextResponse.json({ contacts, counts });
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, email, phone, hotel_name, hotel_location, room_count, company, pipeline_stage, notes } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // No try/catch used to mean any DB error surfaced as a bare 500 with a
  // stack. "+ Add Contact" now gets a JSON error it can show.
  try {
    const { id, outcome } = await upsertContactByEmail({
      name,
      email,
      phone,
      hotelName: hotel_name,
      hotelLocation: hotel_location,
      roomCount: room_count,
      company,
      pipelineStage: pipeline_stage,
      notes,
      source: "manual",
    });

    // The row returned is another contact's: this hotel is already in the CRM
    // under a different email. Say so rather than report a create that did
    // not happen.
    if (outcome === "property_match") {
      return NextResponse.json(
        { error: "A contact for this hotel already exists.", existing_id: id },
        { status: 409 },
      );
    }

    const rows = await sql`SELECT * FROM pipeline_contacts WHERE id = ${id}`;
    const contact = rows[0];

    await sql`
      INSERT INTO pipeline_activities (contact_id, type, title)
      VALUES (${id}, 'manual', 'Contact created manually')
    `;

    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    console.error("[admin/crm] contact upsert failed:", err);
    return NextResponse.json({ error: "Could not save the contact." }, { status: 500 });
  }
}
