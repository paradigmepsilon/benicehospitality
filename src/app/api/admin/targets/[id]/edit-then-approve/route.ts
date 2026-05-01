import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { targetEditSchema } from "@/lib/validation/outreach";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const session = await getSession();
  const adminId = session?.sub || "unknown";

  const { id: idRaw } = await params;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = targetEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await sql`
    UPDATE outreach_targets
    SET
      draft_subject = COALESCE(${parsed.data.draft_subject ?? null}, draft_subject),
      draft_body = COALESCE(${parsed.data.draft_body ?? null}, draft_body),
      approved_at = NOW(),
      approved_by_admin_id = ${adminId},
      status = 'approved',
      updated_at = NOW()
    WHERE id = ${id} AND sent_at IS NULL AND status = 'scheduled'
    RETURNING id, status, approved_at
  `;
  if (result.length === 0) {
    return NextResponse.json({ error: "Target not found or already sent" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}
