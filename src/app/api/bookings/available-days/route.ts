import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Valid month parameter required (YYYY-MM)." }, { status: 400 });
  }

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr);
  const monthNum = parseInt(monthStr);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstDate = `${month}-01`;
  const lastDate = `${month}-${String(daysInMonth).padStart(2, "0")}`;

  // Get today in ET
  const nowET = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const todayStr = new Date(nowET).toLocaleDateString("en-CA");

  // Fetch availability windows, full-day blocks, and fully-booked dates in parallel
  const [windows, fullDayBlocks] = await Promise.all([
    sql`
      SELECT DISTINCT day_of_week FROM availability_windows
      WHERE is_active = true
    `,
    sql`
      SELECT override_date FROM date_overrides
      WHERE override_date >= ${firstDate} AND override_date <= ${lastDate}
      AND start_time IS NULL AND end_time IS NULL AND is_available = false
    `,
  ]);

  // Which days of the week have availability
  const activeDaysOfWeek = new Set(windows.map((w) => Number(w.day_of_week)));

  // Which specific dates are fully blocked
  const blockedDates = new Set(
    fullDayBlocks.map((b) => String(b.override_date).split("T")[0])
  );

  // Compute available day numbers
  const availableDays: number[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month}-${String(day).padStart(2, "0")}`;

    // Skip past dates
    if (dateStr < todayStr) continue;

    // Skip fully blocked dates
    if (blockedDates.has(dateStr)) continue;

    // Check if this day of week has availability
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayOfWeek = dateObj.getUTCDay();
    if (activeDaysOfWeek.has(dayOfWeek)) {
      availableDays.push(day);
    }
  }

  return NextResponse.json({ availableDays });
}
