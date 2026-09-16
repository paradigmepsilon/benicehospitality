/**
 * Import a product image from a pasted web URL.
 *
 * The marketplace admin can set image_url two ways: upload a file
 * (POST /api/admin/uploads) or paste a link. A pasted link is NOT stored as-is.
 * The server fetches it once and stores the bytes in the `uploads` table, so
 * the stored value is always /api/images/<id>.
 *
 * That indirection is the point:
 *   - ALLOWED_IMAGE_HOSTS in image-sources.ts stays a two-entry allowlist. An
 *     un-allowlisted host in image_url makes next/image throw during server
 *     render, which is a 500 on /marketplace and the supply-inventory tracker
 *     (both force-dynamic, no error boundary).
 *   - Images survive the source link rotting or blocking hotlinks.
 *
 * AMAZON: hosts are not filtered here. Alex's call (2026-09-16): import Amazon
 * product images now and move to the Product Advertising API once the account
 * has its three qualifying sales, which is what the Associates Operating
 * Agreement requires for product imagery. Revisit alongside the PA-API note in
 * image-sources.ts.
 */

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // matches /api/admin/uploads
const FETCH_TIMEOUT_MS = 10_000;

export type ImageImportResult =
  | { ok: true; filename: string; contentType: string; base64: string }
  | { ok: false; status: number; error: string };

type UrlCheck = { ok: true; url: URL } | { ok: false; error: string };

/**
 * Blocks loopback, private, and link-local targets so an admin-supplied URL
 * cannot be pointed at internal services or the cloud metadata endpoint.
 *
 * Literal-IP checks only. A hostname that RESOLVES to a private address still
 * passes, so this is not DNS-rebinding-proof; the route is admin-authenticated,
 * which is what carries that remaining risk.
 */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1" || host === "::" || host.startsWith("fe80:")) return true;
  // IPv4-mapped IPv6, e.g. ::ffff:127.0.0.1
  const mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const candidate = mapped ? mapped[1] : host;

  const m = candidate.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = m.slice(1).map(Number);
  if (a === 0 || a === 127) return true;          // this-host, loopback
  if (a === 10) return true;                       // 10/8
  if (a === 192 && b === 168) return true;         // 192.168/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 169 && b === 254) return true;         // link-local + metadata
  return false;
}

export function validateImportUrl(raw: string): UrlCheck {
  const value = raw.trim();
  if (!value) return { ok: false, error: "Enter an image URL." };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: "That is not a valid URL." };
  }
  if (url.protocol !== "https:") {
    return { ok: false, error: "Image URLs must start with https://." };
  }
  if (isBlockedHost(url.hostname)) {
    return { ok: false, error: "That host is not allowed." };
  }
  return { ok: true, url };
}

/** Last path segment, sanitized, or a timestamped fallback. */
function filenameFor(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  const cleaned = last.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100);
  return cleaned || `imported-${Date.now()}`;
}

export async function importImageFromUrl(
  raw: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ImageImportResult> {
  const check = validateImportUrl(raw);
  if (!check.ok) return { ok: false, status: 400, error: check.error };

  let response: Response;
  try {
    response = await fetchImpl(check.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      status: 502,
      error: "That image could not be fetched. Check the link and try again.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: `The image host returned ${response.status}.`,
    };
  }

  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!contentType.startsWith("image/")) {
    return {
      ok: false,
      status: 400,
      error: `That URL is not an image (server sent ${contentType || "no content type"}).`,
    };
  }

  // Cheap pre-check, then the real one: content-length is a claim, not a fact.
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_IMPORT_BYTES) {
    return { ok: false, status: 400, error: "That image is larger than 5MB." };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_IMPORT_BYTES) {
    return { ok: false, status: 400, error: "That image is larger than 5MB." };
  }
  if (buffer.byteLength === 0) {
    return { ok: false, status: 400, error: "That image was empty." };
  }

  return {
    ok: true,
    filename: filenameFor(check.url),
    contentType,
    base64: buffer.toString("base64"),
  };
}
