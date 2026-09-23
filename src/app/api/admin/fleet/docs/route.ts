import { NextResponse } from "next/server";
import { access } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth";
import { DOCS } from "@/lib/fleet/journey";
import { FLEET_DOCS_ROOT, editableSourceFor } from "@/lib/fleet/doc-files";

export const runtime = "nodejs";

const DIST = path.join(FLEET_DOCS_ROOT, "dist");

// The registry plus whether each PDF has actually been rendered, so the
// library can grey out a doc instead of linking to a 404.
export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const docs = await Promise.all(
    DOCS.map(async (d) => ({
      ...d,
      // The fill-in-and-print version, when this document has one.
      editable: editableSourceFor(d),
      rendered: await access(path.join(DIST, d.pdf)).then(
        () => true,
        () => false,
      ),
    })),
  );
  return NextResponse.json(docs);
}
