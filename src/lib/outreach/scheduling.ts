import type { SendSchedule } from "@/lib/types/outreach";

function isSendDay(date: Date, schedule: SendSchedule, tz: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
  const short = fmt.format(date).toLowerCase().slice(0, 3); // mon, tue...
  return schedule.send_days.includes(short as SendSchedule["send_days"][number]);
}

function makeWindowStart(date: Date, schedule: SendSchedule): Date {
  // Build a Date that represents "the day from `date`, at HH:MM in `timezone`".
  // We do this by formatting `date` in the timezone, taking the YYYY-MM-DD,
  // and constructing a new Date in UTC — relying on Intl to give us a numeric
  // offset by formatting an ISO string. Simpler approach: assume the dev/host
  // is in ET (matches deployment) and construct local-time directly. Vercel
  // Cron runs in UTC so we cannot use server local time; instead we let the
  // operator confirm the timezone manually and we compute UTC via offset
  // lookup once per invocation.
  const tz = schedule.daily_window.timezone;
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date); // YYYY-MM-DD
  const [year, month, day] = ymd.split("-").map((s) => parseInt(s, 10));
  const [h, m] = schedule.daily_window.start.split(":").map((s) => parseInt(s, 10));

  // Compute offset for that local time by trying UTC and adjusting.
  // Using a known-good helper: build the date as if it were UTC, then read
  // Intl's interpretation of it back in tz to find the offset.
  const guessUtc = new Date(Date.UTC(year, month - 1, day, h, m, 0));
  const offsetMinutes = getTimezoneOffsetMinutes(guessUtc, tz);
  return new Date(guessUtc.getTime() - offsetMinutes * 60 * 1000);
}

function makeWindowEnd(date: Date, schedule: SendSchedule): Date {
  const tz = schedule.daily_window.timezone;
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
  const [year, month, day] = ymd.split("-").map((s) => parseInt(s, 10));
  const [h, m] = schedule.daily_window.end.split(":").map((s) => parseInt(s, 10));
  const guessUtc = new Date(Date.UTC(year, month - 1, day, h, m, 0));
  const offsetMinutes = getTimezoneOffsetMinutes(guessUtc, tz);
  return new Date(guessUtc.getTime() - offsetMinutes * 60 * 1000);
}

/**
 * Returns timezone offset in MINUTES for the given date in the given IANA tz.
 * Positive when the zone is east of UTC (e.g. CET = +60). Negative for west
 * (e.g. America/New_York EDT = -240). Used to map local-time HH:MM into UTC.
 */
export function getTimezoneOffsetMinutes(at: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(at);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const asUtc = Date.UTC(
    parseInt(m.year, 10),
    parseInt(m.month, 10) - 1,
    parseInt(m.day, 10),
    parseInt(m.hour, 10),
    parseInt(m.minute, 10),
    parseInt(m.second, 10)
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

export interface ScheduleSlot {
  iso: string;
  date: Date;
}

/**
 * Compute scheduled_send_at timestamps for an entire batch.
 * - `n` total targets are distributed across `send_days` starting `start_date`.
 * - `daily_cap` enforces max sends per day.
 * - Within a day, sends are evenly spaced across the window with 5-15 min jitter.
 * - Minimum 8 minutes between consecutive sends in the same day.
 *
 * Returns one ISO timestamp per target index.
 */
export function distributeSendTimes(n: number, schedule: SendSchedule): string[] {
  const tz = schedule.daily_window.timezone;
  const out: string[] = [];

  let cursor = new Date(`${schedule.start_date}T12:00:00Z`);
  // Walk forward from start_date, respecting send_days
  for (let i = 0; i < 365 && out.length < n; i++) {
    if (i > 0) cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    if (!isSendDay(cursor, schedule, tz)) continue;

    const dayStart = makeWindowStart(cursor, schedule);
    const dayEnd = makeWindowEnd(cursor, schedule);
    const windowMs = dayEnd.getTime() - dayStart.getTime();
    if (windowMs <= 0) continue;

    const slotsToday = Math.min(schedule.daily_cap, n - out.length);
    if (slotsToday <= 0) break;

    const spacingMs = windowMs / slotsToday;
    const minSpacingMs = 8 * 60 * 1000;
    let lastSlot = dayStart.getTime() - minSpacingMs;

    for (let j = 0; j < slotsToday; j++) {
      // Base time: evenly distributed
      const base = dayStart.getTime() + Math.floor(j * spacingMs);
      // Add jitter ±5-15 minutes
      const jitter = (Math.random() * 20 - 10) * 60 * 1000; // -10..+10 min
      let candidate = base + jitter;
      // Enforce min spacing from previous slot
      if (candidate - lastSlot < minSpacingMs) {
        candidate = lastSlot + minSpacingMs;
      }
      // Clamp to window
      if (candidate > dayEnd.getTime()) candidate = dayEnd.getTime();
      lastSlot = candidate;
      out.push(new Date(candidate).toISOString());
    }
  }

  return out;
}
