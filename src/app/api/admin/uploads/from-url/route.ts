import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { importImageFromUrl } from "@/lib/image-import";

// Outbound fetch + Buffer; pin the runtime rather than inherit a default.
export const runtime = "nodejs";

/**
 * Import an image from a pasted URL into the `uploads` table.
 *
 * Sibling of POST /api/admin/uploads (multipart file upload) rather than a
 * branch inside it, so the endpoint PostEditor depends on stays untouched.
 * Both return the same shape, and both hand back a /api/images/<id> URL that
 * is already allowlisted by ALLOWED_IMAGE_PATH_PREFIXES.
 */
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw =
    typeof (body as { url?: unknown })?.url === "string"
      ? (body as { url: string }).url
      : "";

  const result = await importImageFromUrl(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const rows = await sql`
      INSERT INTO uploads (filename, content_type, data)
      VALUES (${result.filename}, ${result.contentType}, ${result.base64})
      RETURNING id, filename
    `;
    const upload = rows[0];
    return NextResponse.json(
      { id: upload.id, filename: upload.filename, url: `/api/images/${upload.id}` },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
