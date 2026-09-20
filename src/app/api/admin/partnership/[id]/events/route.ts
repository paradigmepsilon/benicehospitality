import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { logEvent } from "@/lib/partnership/engagements";

// The kinds an admin can log by hand. Stage, verdict, path, section, and
// money entries are written by updateEngagement so they always match a real
// change to the row.
const MANUAL_KINDS = ["note", "call", "email", "doc"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { kind?: unknown; body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const kind = MANUAL_KINDS.find((k) => k === body.kind);
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 2000) : "";
  if (!kind || !text) {
    return NextResponse.json({ error: "kind and body are required" }, { status: 400 });
  }

  const session = await getSession();
  await logEvent(id, kind, text, session?.name || session?.email || null);
  return NextResponse.json({ success: true }, { status: 201 });
}
