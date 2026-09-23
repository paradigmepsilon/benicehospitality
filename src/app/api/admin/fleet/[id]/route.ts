import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import {
  deleteEngagement,
  getEngagement,
  parsePatch,
  updateEngagement,
} from "@/lib/fleet/engagements";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const engagement = await getEngagement(id);
  if (!engagement) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(engagement);
}

export async function PATCH(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Omitted fields are left alone, so a notes edit in a tab that has been
  // open all afternoon never writes a stale stage back over a newer one.
  const parsed = parsePatch(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const session = await getSession();
  const confirm = (body as { confirm?: unknown }).confirm === true;
  const updated = await updateEngagement(id, parsed.patch, session?.name || session?.email || null, { confirm });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await deleteEngagement(id);
  return NextResponse.json({ success: true });
}
