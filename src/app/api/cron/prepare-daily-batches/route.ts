import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { dailyApprovalNotificationEmail } from "@/lib/email-templates";

interface ScheduledTargetRow {
  id: number;
  hotel_name: string | null;
  contact_email: string;
  draft_subject: string | null;
  audit_id: number | null;
  scheduled_send_at: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  if (!request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Find every active campaign that has scheduled targets falling on today
  const campaignsToday = (await sql`
    SELECT c.id, c.name, c.status,
      COUNT(t.id)::int AS target_count
    FROM outreach_campaigns c
    JOIN outreach_targets t ON t.campaign_id = c.id
    WHERE c.status IN ('scheduled', 'sending')
      AND t.scheduled_send_at >= ${today}::date
      AND t.scheduled_send_at < (${today}::date + INTERVAL '1 day')
      AND t.sent_at IS NULL
      AND t.status = 'scheduled'
    GROUP BY c.id, c.name, c.status
    HAVING COUNT(t.id) > 0
  `) as unknown as Array<{ id: number; name: string; status: string; target_count: number }>;

  let createdBatches = 0;
  let notificationsSent = 0;

  for (const c of campaignsToday) {
    // Skip if a batch row for today already exists
    const existing = await sql`
      SELECT id FROM daily_approval_batches WHERE send_date = ${today} AND campaign_id = ${c.id} LIMIT 1
    `;
    if (existing.length > 0) continue;

    const batchRows = await sql`
      INSERT INTO daily_approval_batches (send_date, campaign_id, target_count)
      VALUES (${today}, ${c.id}, ${c.target_count})
      RETURNING id
    `;
    const batchId = batchRows[0].id as number;
    createdBatches += 1;

    // Pull the actual targets for the email preview
    const targets = (await sql`
      SELECT t.id, t.hotel_name, t.contact_email, t.draft_subject, t.audit_id, t.scheduled_send_at,
             a.overall_score, a.overall_grade
      FROM outreach_targets t
      LEFT JOIN audits a ON a.id = t.audit_id
      WHERE t.campaign_id = ${c.id}
        AND t.scheduled_send_at >= ${today}::date
        AND t.scheduled_send_at < (${today}::date + INTERVAL '1 day')
        AND t.sent_at IS NULL
        AND t.status = 'scheduled'
      ORDER BY t.scheduled_send_at ASC
    `) as unknown as Array<
      ScheduledTargetRow & { overall_score: number | null; overall_grade: string | null }
    >;

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com").replace(/\/$/, "");
    const approvalUrl = `${baseUrl}/admin/daily-approval/today`;

    try {
      const result = await resend.emails.send({
        from: process.env.AUDIT_FROM_EMAIL || "BNHG <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@benicehospitality.com",
        subject: `${c.target_count} sends ready for your morning approval — ${c.name}`,
        html: dailyApprovalNotificationEmail({
          campaignName: c.name,
          targetCount: c.target_count,
          approvalUrl,
          targets: targets.map((t) => ({
            hotelName: t.hotel_name || "(no hotel name)",
            contactEmail: t.contact_email,
            overallScore: t.overall_score ?? 0,
            overallGrade: t.overall_grade ?? "?",
            subject: t.draft_subject || "(no subject)",
          })),
        }),
      });
      const messageId = result.data?.id || null;
      await sql`
        UPDATE daily_approval_batches
        SET notification_sent_at = NOW(), notification_email_id = ${messageId}
        WHERE id = ${batchId}
      `;
      notificationsSent += 1;
    } catch (err) {
      console.error(`[cron/prepare-daily-batches] notification send failed for batch ${batchId}:`, err);
    }
  }

  return NextResponse.json({
    today,
    batches_created: createdBatches,
    notifications_sent: notificationsSent,
  });
}
