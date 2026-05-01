import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const { id: idRaw } = await params;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { status?: string; audit_id?: number | null } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (status && !["pending", "fulfilled", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const auditId = body.audit_id ?? null;

  // Use a single update that conditionally sets fulfilled_at when status flips
  // to fulfilled.
  const fulfilledAt = status === "fulfilled" ? new Date().toISOString() : null;

  const result = await sql`
    UPDATE audit_requests SET
      status = COALESCE(${status ?? null}, status),
      audit_id = ${auditId},
      fulfilled_at = CASE
        WHEN ${status ?? null} = 'fulfilled' THEN ${fulfilledAt}::timestamptz
        ELSE fulfilled_at
      END
    WHERE id = ${id}
    RETURNING id, hotel_url, email, role, status, audit_id, created_at, fulfilled_at
  `;
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}
