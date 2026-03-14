import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { type, title, description } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  // Verify contact exists
  const contact = await sql`SELECT id FROM pipeline_contacts WHERE id = ${id}`;
  if (contact.length === 0) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const result = await sql`
    INSERT INTO pipeline_activities (contact_id, type, title, description)
    VALUES (${id}, ${type || "manual"}, ${title}, ${description || null})
    RETURNING *
  `;

  // Update contact's updated_at
  await sql`UPDATE pipeline_contacts SET updated_at = NOW() WHERE id = ${id}`;

  return NextResponse.json(result[0], { status: 201 });
}
