import { test } from "node:test";
import assert from "node:assert/strict";
import { getPublicSiteUrl } from "./site-url";

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) { prev[k] = process.env[k]; if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  try { fn(); } finally { for (const k of Object.keys(prev)) { if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k]; } }
}

test("uses NEXT_PUBLIC_SITE_URL when set to a real origin", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://www.benicehospitality.com/", VERCEL_ENV: "production" }, () => {
    assert.equal(getPublicSiteUrl(), "https://www.benicehospitality.com");
  });
});

test("refuses a localhost value on Vercel", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000", VERCEL_ENV: "production" }, () => {
    assert.equal(getPublicSiteUrl(), "https://www.benicehospitality.com");
  });
});

test("keeps localhost for local dev", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000", VERCEL_ENV: undefined }, () => {
    assert.equal(getPublicSiteUrl(), "http://localhost:3000");
  });
});

test("falls back to production origin when unset on Vercel", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: undefined, VERCEL_ENV: "preview" }, () => {
    assert.equal(getPublicSiteUrl(), "https://www.benicehospitality.com");
  });
});
