import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  CANONICAL_CALL_TYPE,
  CALL_BLOCK_MINUTES,
} from "@/lib/constants/call-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const callType = searchParams.get("call_type") ?? CANONICAL_CALL_TYPE;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Valid date parameter required (YYYY-MM-DD)." }, { status: 400 });
  }

  const slotDuration = CALL_BLOCK_MINUTES[callType];
  if (!slotDuration) {
    return NextResponse.json({ error: "Unknown call_type." }, { status: 400 });
  }

  const requestedDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestedDate < today) {
    return NextResponse.json({ slots: [] });
  }

  // Check for full-day date overrides (blocked)
  const fullDayOverrides = await sql`
    SELECT id FROM date_overrides
    WHERE override_date = ${date} AND start_time IS NULL AND end_time IS NULL AND is_available = false
  `;

  if (fullDayOverrides.length > 0) {
    return NextResponse.json({ slots: [] });
  }

  // Get day of week (0=Sunday, 6=Saturday)
  const dayOfWeek = requestedDate.getUTCDay();

  // Get active availability windows for this day
  const windows = await sql`
    SELECT start_time, end_time FROM availability_windows
    WHERE day_of_week = ${dayOfWeek} AND is_active = true
    ORDER BY start_time
  `;

  if (windows.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  // Get existing confirmed bookings, time-range overrides, and calendar events in parallel
  const [bookings, timeOverrides, calendarEvents] = await Promise.all([
    sql`
      SELECT booking_time, call_type FROM bookings
      WHERE booking_date = ${date} AND status = 'confirmed'
    `,
    sql`
      SELECT start_time, end_time FROM date_overrides
      WHERE override_date = ${date} AND start_time IS NOT NULL AND is_available = false
    `,
    sql`
      SELECT ce.start_time, ce.end_time FROM calendar_events ce
      JOIN calendar_feeds cf ON ce.feed_id = cf.id
      WHERE ce.event_date = ${date} AND cf.is_active = true
    `,
  ]);

  // Build blocked time ranges (in minutes) from existing bookings, overrides, and calendar events.
  // Bookings vary in duration by call_type, so block the actual interval. That way a 40-min
  // slot won't overlap a 60-min booking, or vice versa.
  const blockedRanges: Array<{ start: number; end: number }> = [];

  for (const b of bookings) {
    const [bh, bm] = String(b.booking_time).split(":").map(Number);
    const start = bh * 60 + bm;
    const dur = CALL_BLOCK_MINUTES[String(b.call_type)] ?? 60;
    blockedRanges.push({ start, end: start + dur });
  }

  for (const ov of timeOverrides) {
    const [sh, sm] = String(ov.start_time).split(":").map(Number);
    const [eh, em] = String(ov.end_time).split(":").map(Number);
    blockedRanges.push({ start: sh * 60 + sm, end: eh * 60 + em });
  }

  for (const ev of calendarEvents) {
    const [sh, sm] = String(ev.start_time).split(":").map(Number);
    const [eh, em] = String(ev.end_time).split(":").map(Number);
    blockedRanges.push({ start: sh * 60 + sm, end: eh * 60 + em });
  }

  // Generate slots of the requested call_type's duration within each window.
  const slots: string[] = [];
  const nowET = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const nowTime = new Date(nowET);
  const isToday = date === nowTime.toISOString().split("T")[0] ||
    date === new Date(nowET).toLocaleDateString("en-CA");

  for (const window of windows) {
    const [startH, startM] = window.start_time.split(":").map(Number);
    const [endH, endM] = window.end_time.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      const slotStart = currentMinutes;
      const slotEnd = currentMinutes + slotDuration;

      // Skip if overlaps with any blocked range (existing bookings, overrides, calendar events)
      const isBlocked = blockedRanges.some(
        (range) => slotStart < range.end && slotEnd > range.start
      );

      if (isBlocked) {
        currentMinutes += slotDuration;
        continue;
      }

      // Skip past times if today
      if (isToday) {
        const currentETMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
        if (slotStart <= currentETMinutes) {
          currentMinutes += slotDuration;
          continue;
        }
      }

      slots.push(timeStr);
      currentMinutes += slotDuration;
    }
  }

  return NextResponse.json({ slots });
}
