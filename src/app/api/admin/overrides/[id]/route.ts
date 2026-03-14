import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { override_date, start_time, end_time, is_available, label } = body;

  const result = await sql`
    UPDATE date_overrides SET
      override_date = COALESCE(${override_date ?? null}, override_date),
      start_time = ${start_time ?? null},
      end_time = ${end_time ?? null},
      is_available = COALESCE(${is_available ?? null}, is_available),
      label = ${label ?? null}
    WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const result = await sql`
    DELETE FROM date_overrides WHERE id = ${id} RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
