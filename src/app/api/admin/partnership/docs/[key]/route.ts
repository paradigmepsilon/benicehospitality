import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth";
import { getDoc } from "@/lib/partnership/journey";

export const runtime = "nodejs";

// Admin-only PDF library for the partnership documents. The URL carries a
// registry key, never a path, so the only files this can ever read are the
// ones listed in DOCS. Internal workplans hold margins and labor hours; the
// admin gate is what keeps them internal.
const DIST = path.join(process.cwd(), "docs", "co-living-launch-partnership", "dist");

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
      { error: "Not rendered yet. Run docs/co-living-launch-partnership/render.sh." },
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
