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
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = ${id}
  `;
  // Cancel all unsent targets
  await sql`
    UPDATE outreach_targets
    SET status = 'cancelled', updated_at = NOW()
    WHERE campaign_id = ${id} AND sent_at IS NULL AND status NOT IN ('cancelled', 'unsubscribed')
  `;
  return NextResponse.json({ ok: true });
}
