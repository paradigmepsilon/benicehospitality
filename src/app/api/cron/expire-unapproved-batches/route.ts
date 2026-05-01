import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

function nextValidSendDay(from: Date, sendDays: string[]): Date {
  const d = new Date(from);
  for (let i = 1; i <= 14; i++) {
    d.setDate(d.getDate() + 1);
    const short = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()];
    if (sendDays.includes(short)) return d;
  }
  return d;
}

export async function POST(request: Request) {
  if (!request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Mark batches as expired if not approved by EOD
  const expiringBatches = (await sql`
    SELECT b.id, b.campaign_id, b.send_date,
           c.send_schedule
    FROM daily_approval_batches b
    JOIN outreach_campaigns c ON c.id = b.campaign_id
    WHERE b.send_date = ${today}
      AND b.approved_at IS NULL
      AND b.expired_at IS NULL
  `) as unknown as Array<{
    id: number;
    campaign_id: number;
    send_date: string;
    send_schedule: { send_days: string[] };
  }>;

  let rolledOver = 0;
  for (const b of expiringBatches) {
    const sendDays = b.send_schedule?.send_days || ["mon", "tue", "wed", "thu", "fri"];
    const nextDay = nextValidSendDay(new Date(`${b.send_date}T12:00:00Z`), sendDays);
    const nextDayIso = nextDay.toISOString().slice(0, 10);
    const offsetMs = (nextDay.getTime() - new Date(`${b.send_date}T12:00:00Z`).getTime());

    // Push every still-scheduled target for this batch's date forward by the
    // computed offset, preserving its time-of-day.
    await sql`
      UPDATE outreach_targets
      SET scheduled_send_at = scheduled_send_at + (${offsetMs} || ' milliseconds')::interval,
          updated_at = NOW()
      WHERE campaign_id = ${b.campaign_id}
        AND scheduled_send_at >= ${b.send_date}::date
        AND scheduled_send_at < (${b.send_date}::date + INTERVAL '1 day')
        AND sent_at IS NULL
        AND status = 'scheduled'
    `;

    await sql`
      UPDATE daily_approval_batches SET expired_at = NOW() WHERE id = ${b.id}
    `;
    rolledOver += 1;
    console.log(`[cron/expire-unapproved-batches] batch ${b.id} rolled from ${b.send_date} to ${nextDayIso}`);
  }

  return NextResponse.json({ rolled_over: rolledOver });
}
