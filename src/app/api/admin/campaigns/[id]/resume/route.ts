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

  await sql`
    UPDATE outreach_campaigns
    SET status = 'sending', paused_at = NULL, paused_reason = NULL, updated_at = NOW()
    WHERE id = ${id} AND status = 'paused'
  `;
  return NextResponse.json({ ok: true });
}
