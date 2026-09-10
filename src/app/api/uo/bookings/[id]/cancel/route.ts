import { NextResponse } from "next/server";
import { verifyServiceApiKey } from "@/lib/service-auth";
import { cancelBooking } from "@/lib/booking-actions";

/**
 * Service endpoint for Unified Ops's BNHG dashboard — the only path it has to
 * cancel a booking (see Unified-Ops/src/lib/bnhg/api-client.ts). Shares the
 * same cancelBooking() logic as this app's own admin panel and the guest
 * self-service manage page, so the Calendar cleanup and guest/founder emails
 * are identical no matter where the cancellation was triggered.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyServiceApiKey(request, "UO_SERVICE_API_KEY")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await cancelBooking(Number(id));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ success: true, booking: result.booking });
}
