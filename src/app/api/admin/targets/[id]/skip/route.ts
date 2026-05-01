import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth) return auth;
  const { id: idRaw } = await params;
  const id = parseInt(idRaw, 10);

  const result = await sql`
    UPDATE outreach_targets
    SET status = 'cancelled', failure_reason = 'admin_skip', updated_at = NOW()
    WHERE id = ${id} AND sent_at IS NULL AND status IN ('scheduled', 'approved')
    RETURNING id, status
  `;
  if (result.length === 0) {
    return NextResponse.json({ error: "Target not found or already sent" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}
