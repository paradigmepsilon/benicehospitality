import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { cancelBooking, rescheduleBooking } from "@/lib/booking-actions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const bookingId = Number(id);
  const body = await request.json();
  const { status, booking_date: newDate, booking_time: newTime } = body;

  // A date/time change reschedules (and re-notifies + updates the Calendar
  // event) regardless of status; a bare status change only applies when no
  // reschedule was requested.
  if (newDate && newTime) {
    const result = await rescheduleBooking(bookingId, newDate, newTime);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.error.includes("not found") ? 404 : 409 });
    }
    return NextResponse.json(result.booking);
  }

  const valid = ["confirmed", "cancelled"];
  if (!valid.includes(status)) {
    return NextResponse.json(
      { error: "Status must be one of: confirmed, cancelled" },
      { status: 400 }
    );
  }

  if (status === "cancelled") {
    const result = await cancelBooking(bookingId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result.booking);
  }

  // Re-confirming (undoing an accidental cancel) is a plain status flip —
  // there's no guest-facing "change" to notify about in that direction.
  const result = await sql`
    UPDATE bookings SET status = ${status}
    WHERE id = ${bookingId} RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
