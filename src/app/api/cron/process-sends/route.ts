import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { sendColdEmail } from "@/lib/outreach/cold-send";
import { getCampaignHealth } from "@/lib/outreach/health";
import { internalCampaignAlertEmail } from "@/lib/email-templates";
import { logAuditEvent } from "@/lib/audit/events";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ApprovedTargetRow {
  id: number;
  campaign_id: number;
  audit_id: number | null;
  contact_email: string;
  draft_subject: string;
  draft_body: string;
}

const SEND_BATCH_LIMIT = 25;

async function pauseCampaign(campaignId: number, name: string, reason: string) {
  await sql`
    UPDATE outreach_campaigns
    SET status = 'paused', paused_at = NOW(), paused_reason = ${reason}, updated_at = NOW()
    WHERE id = ${campaignId} AND status != 'paused'
  `;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com").replace(/\/$/, "");
  const resumeUrl = `${baseUrl}/admin/campaigns/${campaignId}`;
  try {
    await resend.emails.send({
      from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "admin@benicehospitality.com",
      subject: `Campaign auto-paused: ${name}`,
      html: internalCampaignAlertEmail({
        campaignName: name,
        campaignId,
        reason,
        resumeUrl,
      }),
    });
  } catch (err) {
    console.error("[cron/process-sends] alert email failed:", err);
  }
}

async function dailyCapHit(campaignId: number): Promise<boolean> {
  const cap = parseInt(process.env.COLD_DAILY_CAP || "12", 10);
  const today = new Date().toISOString().slice(0, 10);
  const rows = (await sql`
    SELECT COUNT(*)::int AS sent_today
    FROM outreach_targets
    WHERE campaign_id = ${campaignId}
      AND sent_at >= ${today}::date
      AND sent_at < (${today}::date + INTERVAL '1 day')
  `) as unknown as Array<{ sent_today: number }>;
  return rows[0].sent_today >= cap;
}

export async function POST(request: Request) {
  if (!request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Active campaigns only
  const activeCampaigns = (await sql`
    SELECT id, name, status FROM outreach_campaigns
    WHERE status IN ('scheduled', 'sending')
  `) as unknown as Array<{ id: number; name: string; status: string }>;

  let sentTotal = 0;
  let pausedCount = 0;
  let skippedUnsubscribed = 0;

  for (const c of activeCampaigns) {
    // Health check first — auto-pause if thresholds exceeded
    const health = await getCampaignHealth(c.id);
    if (health.exceeds_bounce_threshold) {
      await pauseCampaign(c.id, c.name, `bounce_rate_exceeded (${(health.bounce_rate * 100).toFixed(1)}%)`);
      pausedCount += 1;
      continue;
    }
    if (health.exceeds_complaint_threshold) {
      await pauseCampaign(c.id, c.name, `complaint_rate_exceeded (${(health.complaint_rate * 100).toFixed(2)}%)`);
      pausedCount += 1;
      continue;
    }

    if (await dailyCapHit(c.id)) {
      continue;
    }

    // Pull approved targets due to send now
    const targets = (await sql`
      SELECT id, campaign_id, audit_id, contact_email, draft_subject, draft_body
      FROM outreach_targets
      WHERE campaign_id = ${c.id}
        AND status = 'approved'
        AND scheduled_send_at <= NOW()
        AND sent_at IS NULL
      ORDER BY scheduled_send_at ASC
      LIMIT ${SEND_BATCH_LIMIT}
    `) as unknown as ApprovedTargetRow[];

    // Move campaign to 'sending' if not already
    if (c.status === "scheduled" && targets.length > 0) {
      await sql`UPDATE outreach_campaigns SET status = 'sending', updated_at = NOW() WHERE id = ${c.id}`;
    }

    for (const t of targets) {
      // Re-check unsubscribes right before send
      const unsub = await sql`SELECT 1 FROM unsubscribes WHERE email = ${t.contact_email.toLowerCase()} LIMIT 1`;
      if (unsub.length > 0) {
        await sql`
          UPDATE outreach_targets SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
          WHERE id = ${t.id}
        `;
        skippedUnsubscribed += 1;
        continue;
      }

      const result = await sendColdEmail({
        to: t.contact_email,
        subject: t.draft_subject,
        body: t.draft_body,
      });

      if (!result.ok) {
        await sql`
          UPDATE outreach_targets
          SET failure_reason = ${result.error || "send_failed"}, updated_at = NOW()
          WHERE id = ${t.id}
        `;
        continue;
      }

      await sql`
        UPDATE outreach_targets
        SET sent_at = NOW(), status = 'sent', resend_message_id = ${result.messageId}, updated_at = NOW()
        WHERE id = ${t.id}
      `;
      await sql`UPDATE outreach_campaigns SET sent_count = sent_count + 1, updated_at = NOW() WHERE id = ${c.id}`;

      if (t.audit_id) {
        await logAuditEvent({
          auditId: t.audit_id,
          eventType: "outreach_sent",
          metadata: {
            campaign_id: c.id,
            target_id: t.id,
            resend_message_id: result.messageId,
          },
        });
      }
      sentTotal += 1;
    }
  }

  return NextResponse.json({
    sent: sentTotal,
    paused_campaigns: pausedCount,
    skipped_unsubscribed: skippedUnsubscribed,
  });
}
