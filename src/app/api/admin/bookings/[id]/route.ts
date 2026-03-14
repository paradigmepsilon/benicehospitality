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
  const { status } = body;

  const valid = ["confirmed", "cancelled"];
  if (!valid.includes(status)) {
    return NextResponse.json(
      { error: "Status must be one of: confirmed, cancelled" },
      { status: 400 }
    );
  }

  const result = await sql`
    UPDATE bookings SET status = ${status}
    WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
