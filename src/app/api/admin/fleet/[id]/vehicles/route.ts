import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { createVehicle, parseVehiclePatch } from "@/lib/fleet/engagements";

// One vehicle per Exhibit A column. The body is year, make, model, color,
// plate state, and garaging city and state. VINs, policy numbers, and
// lienholder details are never accepted: parseVehiclePatch ignores them.
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseVehiclePatch(body, { requireIdentity: true });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const session = await getSession();
  const created = await createVehicle(id, parsed.patch, session?.name || session?.email || null);
  if (!created) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
