const PRODUCTION_SITE_URL = "https://www.benicehospitality.com";

/**
 * Public site origin for links we put in emails and redirects.
 *
 * Prefers NEXT_PUBLIC_SITE_URL, but never returns a localhost / loopback
 * origin when running on Vercel (VERCEL_ENV is set there and unset locally):
 * a stale dev value in the hosted env must not leak into guest-facing links.
 */
export function getPublicSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!raw) return process.env.VERCEL_ENV ? PRODUCTION_SITE_URL : "http://localhost:3000";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(raw);
  if (isLocal && process.env.VERCEL_ENV) return PRODUCTION_SITE_URL;
  return raw;
}
