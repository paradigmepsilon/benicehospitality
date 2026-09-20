import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { setStepDone } from "@/lib/partnership/engagements";

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

  let body: { stepKey?: unknown; done?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.stepKey !== "string" || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "stepKey and done are required" }, { status: 400 });
  }

  const session = await getSession();
  const result = await setStepDone(id, body.stepKey, body.done, session?.name || session?.email || null);
  if (result === "unknown_step") {
    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
