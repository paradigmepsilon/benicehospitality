import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Guard against reintroducing the bare apex host.
 *
 * www.benicehospitality.com is the primary domain on Vercel; the apex
 * 307-redirects to it on every path. Stripe (and any other webhook sender)
 * does not follow redirects, so an integration registered against the apex
 * silently fails every delivery — which is exactly what disabled the Stripe
 * webhook endpoint. Canonical tags and sitemap entries pointing at the apex
 * are the same defect wearing an SEO hat.
 *
 * Built by concatenation so this file does not match its own assertion.
 */
const APEX = "https://" + "benicehospitality.com";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

test("no source file hardcodes the bare apex host", () => {
  const root = path.join(process.cwd(), "src");
  const offenders = walk(root).filter((f) => readFileSync(f, "utf8").includes(APEX));
  assert.deepEqual(
    offenders.map((f) => path.relative(process.cwd(), f)),
    [],
    `Use https://www.benicehospitality.com (or getPublicSiteUrl()) instead of ${APEX}.`,
  );
});
