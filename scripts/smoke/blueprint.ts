/**
 * Smoke test for the Blueprint purchase flow. Read-mostly: it mints tokens,
 * exercises the gated download, and provisions + then REMOVES a throwaway
 * account so the users table is left exactly as it was found.
 *
 * Run:
 *   node --env-file=.env.local --import tsx scripts/smoke/blueprint.ts
 */

import {
  makeBlueprintToken,
  verifyBlueprintToken,
  signedUrlFor,
  provisionBuyerAccount,
  blueprintDownloadLink,
} from "../../src/lib/blueprint";
import { sql } from "../../src/lib/db";

const TEST_EMAIL = `blueprint-smoke+${Date.now()}@example.invalid`;
let failures = 0;

function check(name: string, ok: boolean, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main() {
  console.log("\nTOKENS");
  const pdfToken = makeBlueprintToken("pdf");
  check("valid pdf token verifies", verifyBlueprintToken(pdfToken, "pdf"));
  check(
    "pdf token rejected for epub (format binding)",
    !verifyBlueprintToken(pdfToken, "epub"),
  );
  check(
    "tampered signature rejected",
    !verifyBlueprintToken(pdfToken.slice(0, -4) + "dead", "pdf"),
  );
  check(
    "expired token rejected",
    !verifyBlueprintToken(makeBlueprintToken("pdf", -1000), "pdf"),
  );
  check("garbage rejected", !verifyBlueprintToken("not-a-token", "pdf"));

  console.log("\nPRIVATE BLOB");
  for (const format of ["pdf", "epub"] as const) {
    const signed = await signedUrlFor(format);
    const res = await fetch(signed, { method: "GET" });
    const bytes = Number(res.headers.get("content-length") ?? 0);
    check(
      `${format} signed URL serves the file`,
      res.ok && bytes > 100_000,
      `${res.status}, ${(bytes / 1024 / 1024).toFixed(1)} MB`,
    );
  }

  // The raw blob URL without a signature must be refused.
  const signedPdf = await signedUrlFor("pdf");
  const bare = signedPdf.split("?")[0];
  const bareRes = await fetch(bare);
  check("unsigned blob URL is denied", !bareRes.ok, `${bareRes.status}`);

  console.log("\nDOWNLOAD ENDPOINT");
  const base = process.env.SMOKE_BASE_URL || "http://localhost:3002";
  const good = blueprintDownloadLink("pdf", makeBlueprintToken("pdf")).replace(
    /^https?:\/\/[^/]+/,
    base,
  );
  const goodRes = await fetch(good, { redirect: "manual" });
  check(
    "valid token redirects to signed URL",
    goodRes.status === 302 &&
      (goodRes.headers.get("location") ?? "").includes("blob.vercel-storage.com"),
    `${goodRes.status}`,
  );

  const badRes = await fetch(`${base}/api/blueprint/download?format=pdf&t=forged`, {
    redirect: "manual",
  });
  check("forged token is refused", badRes.status === 403, `${badRes.status}`);

  const badFormat = await fetch(`${base}/api/blueprint/download?format=mobi&t=x`, {
    redirect: "manual",
  });
  check("unknown format is refused", badFormat.status === 400, `${badFormat.status}`);

  console.log("\nACCOUNT PROVISIONING");
  const first = await provisionBuyerAccount(TEST_EMAIL, "Smoke Test");
  check("new buyer gets an account", first.isNew && first.userId > 0);

  const second = await provisionBuyerAccount(TEST_EMAIL, "Smoke Test");
  check(
    "repeat purchase does NOT duplicate",
    !second.isNew && second.userId === first.userId,
    `user ${second.userId}`,
  );

  const rows = (await sql`
    SELECT password_hash, email_verified_at FROM users WHERE id = ${first.userId}
  `) as { password_hash: string | null; email_verified_at: string | null }[];
  check("password_hash is NULL until claimed", rows[0]?.password_hash === null);
  check("email marked verified", rows[0]?.email_verified_at !== null);

  // Clean up so the smoke run leaves nothing behind.
  await sql`DELETE FROM users WHERE id = ${first.userId}`;
  const gone = (await sql`SELECT id FROM users WHERE id = ${first.userId}`) as unknown[];
  check("throwaway account removed", gone.length === 0);

  console.log(
    failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) FAILED.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
