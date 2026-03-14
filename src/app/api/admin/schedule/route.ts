import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to date parameters required." }, { status: 400 });
  }

  const [bookings, overrides, calendarEvents] = await Promise.all([
    sql`
      SELECT * FROM bookings
      WHERE booking_date >= ${from} AND booking_date <= ${to}
      ORDER BY booking_date, booking_time
    `,
    sql`
      SELECT * FROM date_overrides
      WHERE override_date >= ${from} AND override_date <= ${to}
      ORDER BY override_date, start_time
    `,
    sql`
      SELECT ce.*, cf.name as feed_name FROM calendar_events ce
      JOIN calendar_feeds cf ON ce.feed_id = cf.id
      WHERE ce.event_date >= ${from} AND ce.event_date <= ${to}
      AND cf.is_active = true
      ORDER BY ce.event_date, ce.start_time
    `,
  ]);

  return NextResponse.json({ bookings, overrides, calendarEvents });
}
