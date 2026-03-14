import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const bookings = await sql`
    SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC
  `;

  return NextResponse.json(bookings);
}
