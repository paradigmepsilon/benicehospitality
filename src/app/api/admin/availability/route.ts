import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const windows = await sql`
    SELECT * FROM availability_windows ORDER BY day_of_week, start_time
  `;

  return NextResponse.json(windows);
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { day_of_week, start_time, end_time } = body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json({ error: "Day of week must be 0-6." }, { status: 400 });
  }

  if (start_time >= end_time) {
    return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO availability_windows (day_of_week, start_time, end_time)
    VALUES (${day_of_week}, ${start_time}, ${end_time})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}
