// URL slug helpers. Used wherever user-supplied titles need to round-trip
// through a route param (forum threads, member resources, courses, audits).
// Pattern is the same one already inlined in scripts/migrate.ts for
// audits.public_slug — extracted here so callers don't reinvent it.

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const LEADING_TRAILING_DASH = /^-+|-+$/g;

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(NON_ALPHANUMERIC, "-")
    .replace(LEADING_TRAILING_DASH, "")
    .slice(0, 80);
  return base || "untitled";
}

/**
 * Suffix-based collision resolver. Pass the candidate slug and a function that
 * checks whether a given slug already exists. Returns the candidate when it's
 * free, or `<candidate>-2`, `-3`, … the next time it isn't.
 *
 * Caller owns the existence check so this works for any table (forum_threads,
 * member_resources, courses, etc.) without coupling the helper to a schema.
 */
export async function uniqueSlug(
  candidate: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(candidate);
  if (!(await exists(base))) return base;
  for (let i = 2; i < 1000; i++) {
    const next = `${base}-${i}`;
    if (!(await exists(next))) return next;
  }
  // Fallback: append a timestamp if the namespace is somehow saturated.
  return `${base}-${Date.now()}`;
}
