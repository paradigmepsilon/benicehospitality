import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuditByToken } from "@/lib/audit/token";
import { logAuditEvent, cancelPendingNurture } from "@/lib/audit/events";
import { auditTrackBodySchema } from "@/lib/validation/audit";
import { auditTrackLimiter } from "@/lib/rate-limit";
import { cookies } from "next/headers";

const VIEW_COOKIE = "audit_view_id";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success } = auditTrackLimiter.check(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cookieStore = await cookies();
  const auditViewIdRaw = cookieStore.get(VIEW_COOKIE)?.value;
  const auditViewId = auditViewIdRaw ? parseInt(auditViewIdRaw, 10) : NaN;
  if (!Number.isFinite(auditViewId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const audit = await getAuditByToken(token);
  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify the cookie's audit_view_id actually belongs to this audit
  const viewRows = await sql`
    SELECT id FROM audit_views WHERE id = ${auditViewId} AND audit_id = ${audit.id} LIMIT 1
  `;
  if (viewRows.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = auditTrackBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await logAuditEvent({
    auditId: audit.id,
    auditViewId,
    eventType: parsed.data.event_type,
    metadata: parsed.data.metadata,
  });

  if (parsed.data.event_type === "cta_clicked") {
    await cancelPendingNurture({ auditViewId, reason: "cta_clicked" });
  }

  return new NextResponse(null, { status: 204 });
}
