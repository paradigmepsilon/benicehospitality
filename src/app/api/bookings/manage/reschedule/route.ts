import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyBookingManageToken } from "@/lib/booking-manage-token";
import { rescheduleBooking } from "@/lib/booking-actions";
import { contactBookingLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success: withinLimit } = contactBookingLimiter.check(ip);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const { id, email, token, date, time } = body;
  const bookingId = Number(id);

  if (!bookingId || !email || !token || !verifyBookingManageToken(bookingId, email, token)) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });
  }
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "A valid date and time are required." }, { status: 400 });
  }

  const owns = await sql`SELECT id FROM bookings WHERE id = ${bookingId} AND lower(email) = ${String(email).toLowerCase().trim()}`;
  if (owns.length === 0) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const result = await rescheduleBooking(bookingId, date, time);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}
