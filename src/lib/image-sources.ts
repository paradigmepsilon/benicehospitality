/**
 * The allowlist of image sources next/image will actually render.
 *
 * Read by BOTH next.config.ts (to build `images.remotePatterns` /
 * `images.localPatterns`) and the admin API validators, so the two cannot
 * drift. That drift is a live outage path, not a theoretical one:
 * marketplace_products.image_url is free text with no validation, and both
 * /marketplace and /resources/supply-inventory-tracker are force-dynamic
 * server components with no error boundary. Pasting an un-allowlisted host
 * into the admin form makes next/image throw during server render, which is a
 * 500 on two public pages.
 *
 * Deliberately dependency-free — next.config.ts imports it at config-load time.
 *
 * NOTE ON AMAZON: m.media-amazon.com is intentionally absent. The Associates
 * Operating Agreement requires product images be retrieved through the Product
 * Advertising API, which activates only after three qualifying sales. Adding
 * the hostname here would make the images render but would not make them
 * licensed. Revisit once PA-API access is granted.
 */

export const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "plus.unsplash.com",
] as const;

export const ALLOWED_IMAGE_PATH_PREFIXES = [
  // Everything under public/images/.
  "/images/",
  // DB-backed image route, e.g. /api/images/5 for blog covers.
  "/api/images/",
] as const;

/**
 * True when next/image can render this src without throwing.
 *
 * Empty is NOT renderable. It is still an allowed *stored* value — 80 rows
 * carry it today and the product card falls back to a designed plate — but
 * callers must not hand it to next/image.
 */
export function isRenderableImageUrl(raw: string): boolean {
  const value = raw.trim();
  if (value === "") return false;

  if (value.startsWith("/")) {
    return ALLOWED_IMAGE_PATH_PREFIXES.some((p) => value.startsWith(p));
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
}

/** Human-readable list for a 400 response body. */
export function describeAllowedImageSources(): string {
  return [
    `relative paths starting with ${ALLOWED_IMAGE_PATH_PREFIXES.join(" or ")}`,
    `or https URLs on ${ALLOWED_IMAGE_HOSTS.join(", ")}`,
  ].join(", ");
}
