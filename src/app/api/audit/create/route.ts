import { NextResponse } from "next/server";
import crypto from "crypto";
import { auditCreatePayloadSchema } from "@/lib/validation/audit";
import { createAudit, buildAuditUrl } from "@/lib/audit/token";
import { logAuditEvent } from "@/lib/audit/events";

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: Request) {
  const expected = process.env.AUDIT_INGEST_API_KEY;
  if (!expected) {
    console.error("[audit/create] AUDIT_INGEST_API_KEY not configured");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const provided = request.headers.get("x-api-key");
  if (!provided || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = auditCreatePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { id, token, expiresAt } = await createAudit(parsed.data.audit_data);
    await logAuditEvent({
      auditId: id,
      eventType: "audit_created",
      metadata: {
        hotel_slug: parsed.data.audit_data.hotel.slug,
        overall_score: parsed.data.audit_data.overall.score,
      },
    });

    return NextResponse.json(
      {
        token,
        url: buildAuditUrl(token),
        expires_at: expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[audit/create] Insert failed:", err);
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
