import { sql } from "@/lib/db";

export interface CampaignHealth {
  sent_24h: number;
  bounced_24h: number;
  complained_24h: number;
  bounce_rate: number; // 0..1
  complaint_rate: number; // 0..1
  exceeds_bounce_threshold: boolean;
  exceeds_complaint_threshold: boolean;
}

const BOUNCE_THRESHOLD = 0.05; // 5%
const COMPLAINT_THRESHOLD = 0.005; // 0.5%

export async function getCampaignHealth(campaignId: number): Promise<CampaignHealth> {
  const rows = (await sql`
    SELECT
      COUNT(*) FILTER (WHERE sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
      COUNT(*) FILTER (WHERE bounced_at >= NOW() - INTERVAL '24 hours')::int AS bounced_24h,
      COUNT(*) FILTER (WHERE complained_at >= NOW() - INTERVAL '24 hours')::int AS complained_24h
    FROM outreach_targets
    WHERE campaign_id = ${campaignId}
  `) as unknown as Array<{ sent_24h: number; bounced_24h: number; complained_24h: number }>;
  const r = rows[0];
  const sent = r.sent_24h;
  const bounceRate = sent > 0 ? r.bounced_24h / sent : 0;
  const complaintRate = sent > 0 ? r.complained_24h / sent : 0;
  return {
    sent_24h: sent,
    bounced_24h: r.bounced_24h,
    complained_24h: r.complained_24h,
    bounce_rate: bounceRate,
    complaint_rate: complaintRate,
    // Only trip thresholds once we have a meaningful sample (>= 20 sends)
    exceeds_bounce_threshold: sent >= 20 && bounceRate > BOUNCE_THRESHOLD,
    exceeds_complaint_threshold: sent >= 20 && complaintRate > COMPLAINT_THRESHOLD,
  };
}
