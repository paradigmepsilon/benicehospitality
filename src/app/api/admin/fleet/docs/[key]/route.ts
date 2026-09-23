import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth";
import { getDoc } from "@/lib/fleet/journey";
import { FLEET_DOCS_ROOT } from "@/lib/fleet/doc-files";

export const runtime = "nodejs";

// Admin-only PDF library for the fleet management documents. The URL carries
// a registry key, never a path, so the only files this can ever read are the
// ones listed in DOCS. Internal docs hold the sales playbook and the program
// gaps; the admin gate is what keeps them internal.
const DIST = path.join(FLEET_DOCS_ROOT, "dist");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const doc = getDoc((await params).key);
  if (!doc) return NextResponse.json({ error: "Unknown document" }, { status: 404 });

  let file: Buffer;
  try {
    file = await readFile(path.join(DIST, doc.pdf));
  } catch {
    return NextResponse.json(
      { error: "Not rendered yet. Run docs/fleet-management/render.sh." },
      { status: 404 },
    );
  }
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${path.basename(doc.pdf)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
