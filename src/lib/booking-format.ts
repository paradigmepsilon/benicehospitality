/** Shared date/time formatting for booking emails and Calendar events. */

/**
 * The `@neondatabase/serverless` driver returns a `DATE` column as a JS
 * `Date` (UTC midnight), not the "YYYY-MM-DD" string route.ts's INSERT was
 * given — but a booking read back from the DB (reschedule/cancel/manage) only
 * ever has the Date form. Normalize either input to "YYYY-MM-DD" so every
 * caller can pass a fresh request value or a DB row interchangeably.
 */
export function toDateOnlyString(date: string | Date): string {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function formatBookingDate(date: string | Date): string {
  return new Date(toDateOnlyString(date) + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookingTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm} ET`;
}

/** "09:00" + 45 -> "09:45". Used to derive a Calendar event's end time. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * A floating local datetime string (no offset) for the Calendar API's
 * `dateTime` field, paired with an explicit `timeZone` on the same event.
 */
export function toLocalDateTimeString(date: string, time: string): string {
  return `${date}T${time}:00`;
}
