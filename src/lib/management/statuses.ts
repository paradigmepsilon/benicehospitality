/**
 * Application status vocabulary. Pure (no db import) so client components can
 * use it; applications.ts re-exports it for server code.
 *
 * Mirrors the CHECK constraint on management_applications.status exactly;
 * applications.test.ts fails if scripts/migrate.ts drifts from this list.
 *
 *   new          just submitted
 *   contacted    an admin reached out by hand
 *   call_booked  set automatically when a booking lands for the same email
 *   qualified    set automatically when a tracker card is started from it
 *   declined     not a fit
 *   signed       agreement signed (set by hand from the tracker)
 */
export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "call_booked",
  "qualified",
  "declined",
  "signed",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  call_booked: "Call Booked",
  qualified: "Qualified",
  declined: "Declined",
  signed: "Signed",
};

/** Labels for the two pill groups on the public form, reused by the admin list. */
export const CURRENT_STATUS_LABELS: Record<string, string> = {
  idle: "Sitting idle",
  self_managed: "Self-managed today",
  on_platform: "Listed on a platform today",
};

export const TIMELINE_LABELS: Record<string, string> = {
  now: "Ready now",
  "30_days": "Within 30 days",
  "90_days": "Within 90 days",
  exploring: "Just exploring",
};
