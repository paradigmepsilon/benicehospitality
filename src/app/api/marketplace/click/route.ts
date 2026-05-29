import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentSession } from "@/lib/community-auth";
import { getClientIp } from "@/lib/rate-limit";

const VALID_NETWORKS = new Set([
  "amazon",
  "lowes",
  "wayfair",
  "direct",
  "other",
]);

export async function POST(request: Request) {
  let body: { productId?: unknown; network?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const productId =
    typeof body.productId === "string" ? body.productId.trim().slice(0, 120) : "";
  const network =
    typeof body.network === "string" ? body.network.trim().toLowerCase() : "";
  const referrer =
    typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

  if (!productId || !VALID_NETWORKS.has(network)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  let userId: number | null = null;
  try {
    const session = await getCurrentSession();
    userId = session?.user.id ?? null;
  } catch {
    // Anonymous click is fine — just don't attach a user_id.
  }

  try {
    await sql`
      INSERT INTO marketplace_clicks (product_id, network, user_id, referrer, ip, user_agent)
      VALUES (${productId}, ${network}, ${userId}, ${referrer}, ${ip}, ${userAgent})
    `;
  } catch (err) {
    console.error("[marketplace/click] insert failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
