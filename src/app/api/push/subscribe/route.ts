import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { pushSubscribeLimiter, getClientIp } from "@/lib/rate-limit";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!pushSubscribeLimiter.check(ip).success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? null;

  try {
    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent)
      VALUES (${endpoint}, ${keys.p256dh}, ${keys.auth}, ${userAgent})
      ON CONFLICT (endpoint) DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent,
        last_seen_at = NOW()
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[push/subscribe] insert failed:", err);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  if (!pushSubscribeLimiter.check(ip).success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = z.object({ endpoint: z.string().url().max(2048) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${parsed.data.endpoint}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe] delete failed:", err);
    return NextResponse.json({ error: "Failed to unsubscribe." }, { status: 500 });
  }
}
