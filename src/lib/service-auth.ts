import crypto from "crypto";

/** Same shape as src/app/api/audit/create/route.ts's inline check, shared so
 * every /api/uo/* service endpoint verifies its caller identically. */
export function verifyServiceApiKey(request: Request, envVar: string): boolean {
  const expected = process.env[envVar];
  if (!expected) {
    console.error(`[service-auth] ${envVar} not configured`);
    return false;
  }
  const provided = request.headers.get("x-api-key");
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
