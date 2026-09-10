import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyBookingManageToken } from "@/lib/booking-manage-token";
import { formatBookingDate, formatBookingTime, toDateOnlyString } from "@/lib/booking-format";
import { FOUNDER_LABELS } from "@/lib/constants/founders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!id || !email || !token || !verifyBookingManageToken(id, email, token)) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });
  }

  const rows = await sql`SELECT * FROM bookings WHERE id = ${id} AND lower(email) = ${email.toLowerCase().trim()}`;
  const booking = rows[0];
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: booking.id,
    name: booking.name,
    status: booking.status,
    date: toDateOnlyString(booking.booking_date),
    time: booking.booking_time,
    formattedDate: formatBookingDate(booking.booking_date),
    formattedTime: formatBookingTime(String(booking.booking_time)),
    callType: booking.call_type,
    requestedFounder: booking.requested_founder,
    founderLabel: booking.requested_founder ? FOUNDER_LABELS[String(booking.requested_founder)] : null,
    meetLink: booking.meet_link,
  });
}
