import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listCostOverrides } from "@/lib/resources/planner-cost-overrides";

// Read side of the planner cost editor. The page passes initial data in as a
// prop; this exists so the client can re-sync after a write without a full
// router.refresh() round trip.

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const overrides = await listCostOverrides();
  return NextResponse.json({ overrides });
}
