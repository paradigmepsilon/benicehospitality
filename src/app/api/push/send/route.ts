import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendPush, pushConfigured, type StoredSubscription } from "@/lib/push";

const sendSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  url: z.string().url().max(2048).optional(),
});

// Subscriber count + config status, for the admin compose UI.
export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM push_subscriptions
  `) as unknown as { count: number }[];

  return NextResponse.json({
    configured: pushConfigured(),
    subscribers: rows[0]?.count ?? 0,
  });
}

export async function POST(request: Request) {
  // Admin only.
  const authError = await requireAuth(request);
  if (authError) return authError;

  if (!pushConfigured()) {
    return NextResponse.json(
      { error: "Push is not configured (missing VAPID keys)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const subs = (await sql`
    SELECT endpoint, p256dh, auth FROM push_subscriptions
  `) as unknown as StoredSubscription[];

  if (subs.length === 0) {
    return NextResponse.json({ success: true, sent: 0, failed: 0, pruned: 0 });
  }

  const payload = {
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url ?? "/",
    icon: "/icon-192.png",
  };

  const results = await Promise.all(subs.map((s) => sendPush(s, payload)));

  // Prune dead endpoints (404/410) so the list stays clean.
  const dead = results.filter((r) => !r.ok && r.gone).map((r) => r.endpoint);
  if (dead.length > 0) {
    try {
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ANY(${dead})`;
    } catch (err) {
      console.error("[push/send] prune failed:", err);
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  return NextResponse.json({ success: true, sent, failed, pruned: dead.length });
}
