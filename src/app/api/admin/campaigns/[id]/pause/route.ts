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
  const body = await request.json().catch(() => ({} as { reason?: string }));
  const reason = (body as { reason?: string }).reason || "manual_pause";

  await sql`
    UPDATE outreach_campaigns
    SET status = 'paused', paused_at = NOW(), paused_reason = ${reason}, updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}
