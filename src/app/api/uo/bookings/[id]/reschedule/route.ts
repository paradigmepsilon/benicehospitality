import { NextResponse } from "next/server";
import { verifyServiceApiKey } from "@/lib/service-auth";
import { rescheduleBooking } from "@/lib/booking-actions";

/** Service endpoint for Unified Ops's BNHG dashboard — see cancel/route.ts's
 * header comment for the shared-logic rationale. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyServiceApiKey(request, "UO_SERVICE_API_KEY")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { date, time } = body;
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "A valid date and time are required." }, { status: 400 });
  }

  const result = await rescheduleBooking(Number(id), date, time);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error.includes("not found") ? 404 : 409 });
  }
  return NextResponse.json({ success: true, booking: result.booking });
}
