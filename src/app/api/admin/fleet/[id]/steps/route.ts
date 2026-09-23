import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { setStepDone } from "@/lib/fleet/engagements";

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

  let body: { stepKey?: unknown; done?: unknown; vehicleId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.stepKey !== "string" || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "stepKey and done are required" }, { status: 400 });
  }

  // No vehicleId means an owner-level step: a stage checklist or the monthly
  // cycle. With one, the step belongs to that vehicle's Exhibit C checklist.
  let vehicleId: number | null = null;
  if (body.vehicleId !== undefined && body.vehicleId !== null) {
    if (typeof body.vehicleId !== "number" || !Number.isInteger(body.vehicleId) || body.vehicleId <= 0) {
      return NextResponse.json({ error: "vehicleId must be a positive integer" }, { status: 400 });
    }
    vehicleId = body.vehicleId;
  }

  const session = await getSession();
  const result = await setStepDone(id, body.stepKey, body.done, session?.name || session?.email || null, vehicleId);
  if (result === "unknown_step") {
    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  }
  if (result === "unknown_vehicle") {
    return NextResponse.json({ error: "Unknown vehicle" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
