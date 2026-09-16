/**
 * Sort key for a listing's free-text price. price_range is typed by hand in the
 * admin ("$18–$28", "$20/mo", "$32"), so this reads the first number and treats
 * it as the floor. Returns null when there is no number, and callers sort those
 * last in both directions rather than guessing.
 */
export function priceFloor(priceRange: string): number | null {
  const match = priceRange.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Ascending or descending by priceFloor, unpriced items always last. */
export function compareByPrice(
  a: string,
  b: string,
  direction: "asc" | "desc",
): number {
  const pa = priceFloor(a);
  const pb = priceFloor(b);
  if (pa === null && pb === null) return 0;
  if (pa === null) return 1;
  if (pb === null) return -1;
  return direction === "asc" ? pa - pb : pb - pa;
}
