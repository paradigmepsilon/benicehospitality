import { sql } from "@/lib/db";
import { CALL_BLOCK_MINUTES } from "@/lib/constants/call-types";

/**
 * Range-aware conflict check shared by booking creation and rescheduling.
 * A founder's own bookings never conflict with the other founder's calendar;
 * a founder-less (general/management) booking is conservative and still
 * blocks both. `excludeBookingId` lets a reschedule check against every
 * *other* booking without tripping over its own current row.
 */
export async function hasBookingConflict(params: {
  date: string;
  time: string;
  callType: string;
  founder: string | null;
  excludeBookingId?: number;
}): Promise<boolean> {
  const slotDuration = CALL_BLOCK_MINUTES[params.callType] ?? 60;
  const [reqH, reqM] = params.time.split(":").map(Number);
  const requestedStart = reqH * 60 + reqM;
  const requestedEnd = requestedStart + slotDuration;

  const rows = params.founder
    ? await sql`
        SELECT id, booking_time, call_type FROM bookings
        WHERE booking_date = ${params.date} AND status = 'confirmed'
          AND (requested_founder = ${params.founder} OR requested_founder IS NULL)
      `
    : await sql`
        SELECT id, booking_time, call_type FROM bookings
        WHERE booking_date = ${params.date} AND status = 'confirmed'
      `;

  return rows.some((b) => {
    if (params.excludeBookingId && Number(b.id) === params.excludeBookingId) return false;
    const [bh, bm] = String(b.booking_time).split(":").map(Number);
    const start = bh * 60 + bm;
    const end = start + (CALL_BLOCK_MINUTES[String(b.call_type)] ?? 60);
    return requestedStart < end && requestedEnd > start;
  });
}
