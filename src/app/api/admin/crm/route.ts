import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

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

  const result = await sql`
    INSERT INTO pipeline_contacts (name, email, phone, hotel_name, hotel_location, room_count, company, pipeline_stage, source, notes)
    VALUES (
      ${name}, ${email}, ${phone || null}, ${hotel_name || null},
      ${hotel_location || null}, ${room_count || null}, ${company || null},
      ${pipeline_stage || "prospect"}, 'manual', ${notes || null}
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      phone = COALESCE(EXCLUDED.phone, pipeline_contacts.phone),
      hotel_name = COALESCE(EXCLUDED.hotel_name, pipeline_contacts.hotel_name),
      hotel_location = COALESCE(EXCLUDED.hotel_location, pipeline_contacts.hotel_location),
      room_count = COALESCE(EXCLUDED.room_count, pipeline_contacts.room_count),
      company = COALESCE(EXCLUDED.company, pipeline_contacts.company),
      updated_at = NOW()
    RETURNING *
  `;

  const contact = result[0];

  await sql`
    INSERT INTO pipeline_activities (contact_id, type, title)
    VALUES (${contact.id}, 'manual', 'Contact created manually')
  `;

  return NextResponse.json(contact, { status: 201 });
}
