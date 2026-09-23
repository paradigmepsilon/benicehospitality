import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { approveAllDocs, listDocReviews, setDocReviewed } from "@/lib/fleet/doc-reviews";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  return NextResponse.json(await listDocReviews());
}

// { docKey, reviewed } ticks or unticks one document. { approveAll: true } is
// the submit button, and only succeeds once every document has been ticked.
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let body: { docKey?: unknown; reviewed?: unknown; approveAll?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const session = await getSession();
  const actor = session?.name || session?.email || null;

  if (body.approveAll === true) {
    const result = await approveAllDocs(actor);
    if (!result.ok) {
      return NextResponse.json({ error: `${result.missing.length} documents still unchecked`, missing: result.missing }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  }
  if (typeof body.docKey !== "string" || typeof body.reviewed !== "boolean") {
    return NextResponse.json({ error: "docKey and reviewed are required" }, { status: 400 });
  }
  if (!(await setDocReviewed(body.docKey, body.reviewed, actor))) {
    return NextResponse.json({ error: "Unknown document" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
