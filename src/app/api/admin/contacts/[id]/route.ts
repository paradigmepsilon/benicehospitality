import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { status, notes } = body;

  if (status !== undefined) {
    const valid = ["new", "contacted", "closed"];
    if (!valid.includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: new, contacted, closed" },
        { status: 400 }
      );
    }
  }

  const result = await sql`
    UPDATE contact_submissions SET
      status = COALESCE(${status ?? null}, status),
      notes = COALESCE(${notes ?? null}, notes)
    WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result[0]);
}
