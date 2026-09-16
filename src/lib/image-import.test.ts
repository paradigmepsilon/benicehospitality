import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateImportUrl,
  importImageFromUrl,
  MAX_IMPORT_BYTES,
} from "./image-import";

function ok(raw: string) {
  const r = validateImportUrl(raw);
  assert.equal(r.ok, true, `expected ${raw} to be accepted, got: ${JSON.stringify(r)}`);
}
function rejected(raw: string) {
  const r = validateImportUrl(raw);
  assert.equal(r.ok, false, `expected ${raw} to be rejected`);
}

// --- URL shape ------------------------------------------------------------

test("accepts a plain https image URL", () => {
  ok("https://example.com/products/lockbox.jpg");
  ok("https://m.media-amazon.com/images/I/71abc.jpg");
});

test("rejects empty, malformed, and non-https URLs", () => {
  rejected("");
  rejected("   ");
  rejected("not a url");
  rejected("http://example.com/a.jpg");
  rejected("ftp://example.com/a.jpg");
  rejected("data:image/png;base64,AAAA");
  rejected("file:///etc/passwd");
});

// --- SSRF guard -----------------------------------------------------------

test("rejects loopback and localhost hosts", () => {
  rejected("https://localhost/a.jpg");
  rejected("https://127.0.0.1/a.jpg");
  rejected("https://127.10.0.1/a.jpg");
  rejected("https://[::1]/a.jpg");
  rejected("https://0.0.0.0/a.jpg");
});

test("rejects private and link-local ranges", () => {
  rejected("https://10.0.0.5/a.jpg");
  rejected("https://192.168.1.10/a.jpg");
  rejected("https://172.16.0.1/a.jpg");
  rejected("https://172.31.255.254/a.jpg");
  rejected("https://169.254.169.254/latest/meta-data"); // cloud metadata
});

test("does not over-reject public addresses that merely look similar", () => {
  ok("https://172.32.0.1/a.jpg"); // just outside 172.16/12
  ok("https://11.0.0.1/a.jpg");
  ok("https://169.253.0.1/a.jpg");
});

// --- fetch behavior -------------------------------------------------------

function stubFetch(body: Uint8Array, headers: Record<string, string>, status = 200) {
  return (async () =>
    new Response(status === 200 ? new Blob([body as BlobPart]) : null, {
      status,
      headers,
    })) as unknown as typeof fetch;
}
const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

test("imports an image and returns base64 + content type + filename", async () => {
  const r = await importImageFromUrl(
    "https://example.com/products/lockbox.png",
    stubFetch(PNG, { "content-type": "image/png" }),
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.contentType, "image/png");
  assert.equal(r.filename, "lockbox.png");
  assert.equal(r.base64, Buffer.from(PNG).toString("base64"));
});

test("falls back to a safe filename when the path has none", async () => {
  const r = await importImageFromUrl(
    "https://example.com/",
    stubFetch(PNG, { "content-type": "image/png" }),
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.match(r.filename, /^imported-/);
});

test("rejects a non-2xx response", async () => {
  const r = await importImageFromUrl(
    "https://example.com/missing.png",
    stubFetch(PNG, {}, 404),
  );
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /404/);
});

test("rejects a response that is not an image", async () => {
  const r = await importImageFromUrl(
    "https://example.com/page.html",
    stubFetch(PNG, { "content-type": "text/html; charset=utf-8" }),
  );
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /not an image/i);
});

test("rejects an oversize body even when content-length lies", async () => {
  const big = new Uint8Array(MAX_IMPORT_BYTES + 1);
  const r = await importImageFromUrl(
    "https://example.com/huge.png",
    stubFetch(big, { "content-type": "image/png", "content-length": "10" }),
  );
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /5MB|too large/i);
});

test("rejects early when content-length already exceeds the cap", async () => {
  const r = await importImageFromUrl(
    "https://example.com/huge.png",
    stubFetch(PNG, {
      "content-type": "image/png",
      "content-length": String(MAX_IMPORT_BYTES + 1),
    }),
  );
  assert.equal(r.ok, false);
});

test("surfaces a network failure as a clean error, not a throw", async () => {
  const r = await importImageFromUrl("https://example.com/a.png", async () => {
    throw new Error("ECONNREFUSED");
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.match(r.error, /could not be fetched/i);
});
