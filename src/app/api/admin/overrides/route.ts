import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let overrides;
  if (from && to) {
    overrides = await sql`
      SELECT * FROM date_overrides
      WHERE override_date >= ${from} AND override_date <= ${to}
      ORDER BY override_date, start_time
    `;
  } else {
    overrides = await sql`
      SELECT * FROM date_overrides ORDER BY override_date, start_time
    `;
  }

  return NextResponse.json(overrides);
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { override_date, start_time, end_time, is_available, label } = body;

  if (!override_date) {
    return NextResponse.json({ error: "Date is required." }, { status: 400 });
  }

  if (start_time && end_time && start_time >= end_time) {
    return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO date_overrides (override_date, start_time, end_time, is_available, label)
    VALUES (${override_date}, ${start_time || null}, ${end_time || null}, ${is_available ?? false}, ${label || null})
    RETURNING *
  `;

  return NextResponse.json(result[0], { status: 201 });
}
