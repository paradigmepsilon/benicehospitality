/**
 * Form options for the free Car Rental Riches ebook opt-in, kept free of any
 * server import so the client form can use them. Everything else about the
 * ebook (tokens, blob signing, the delivery email) lives in
 * src/lib/crr-free-ebook.ts, which is server-only.
 */

/** Segmentation signal captured on the opt-in form (lead-magnet plan). */
export const CARS_TODAY_OPTIONS = [
  { value: "0", label: "None yet" },
  { value: "1", label: "One car" },
  { value: "2-4", label: "Two to four cars" },
  { value: "5+", label: "Five or more" },
] as const;
export type CarsToday = (typeof CARS_TODAY_OPTIONS)[number]["value"];

export function isCarsToday(v: unknown): v is CarsToday {
  return CARS_TODAY_OPTIONS.some((o) => o.value === v);
}
