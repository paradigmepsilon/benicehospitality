import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Valid date parameter required (YYYY-MM-DD)." }, { status: 400 });
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
      SELECT booking_time FROM bookings
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

  const bookedTimes = new Set(
    bookings.map((b) => String(b.booking_time).slice(0, 5))
  );

  // Build blocked time ranges (in minutes) from overrides and calendar events
  const blockedRanges: Array<{ start: number; end: number }> = [];

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

  // Generate 1-hour slots within each window (40-minute meeting + 20-minute buffer)
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

    while (currentMinutes + 60 <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      const slotStart = currentMinutes;
      const slotEnd = currentMinutes + 60;

      // Skip if already booked
      if (bookedTimes.has(timeStr)) {
        currentMinutes += 60;
        continue;
      }

      // Skip if overlaps with any blocked range
      const isBlocked = blockedRanges.some(
        (range) => slotStart < range.end && slotEnd > range.start
      );

      if (isBlocked) {
        currentMinutes += 60;
        continue;
      }

      // Skip past times if today
      if (isToday) {
        const currentETMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();
        if (slotStart <= currentETMinutes) {
          currentMinutes += 60;
          continue;
        }
      }

      slots.push(timeStr);
      currentMinutes += 60;
    }
  }

  return NextResponse.json({ slots });
}
