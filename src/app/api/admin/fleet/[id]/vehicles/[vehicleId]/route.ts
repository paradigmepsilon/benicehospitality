import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { deleteVehicle, parseVehiclePatch, updateVehicle } from "@/lib/fleet/engagements";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string; vehicleId: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const p = await params;
  const id = parseId(p.id);
  const vehicleId = parseId(p.vehicleId);
  if (!id || !vehicleId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Omitted fields are left alone, same rule as the owner PATCH. A status
  // change is logged by updateVehicle; field edits write nothing.
  const parsed = parseVehiclePatch(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const session = await getSession();
  const updated = await updateVehicle(id, vehicleId, parsed.patch, session?.name || session?.email || null);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const p = await params;
  const id = parseId(p.id);
  const vehicleId = parseId(p.vehicleId);
  if (!id || !vehicleId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const session = await getSession();
  const removed = await deleteVehicle(id, vehicleId, session?.name || session?.email || null);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
