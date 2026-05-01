import type { AuditData } from "@/lib/types/audit";

export type CampaignStatus =
  | "created"
  | "scheduled"
  | "sending"
  | "paused"
  | "complete"
  | "cancelled";

export type TargetStatus =
  | "imported"
  | "quality_rejected"
  | "scheduled"
  | "approved"
  | "sent"
  | "bounced"
  | "complained"
  | "replied"
  | "unsubscribed"
  | "cancelled";

export interface SendSchedule {
  daily_window: { start: string; end: string; timezone: string };
  daily_cap: number;
  send_days: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
  start_date: string; // YYYY-MM-DD
}

export interface OutreachBatchTarget {
  hotel_url: string;
  contact_name?: string;
  contact_email: string;
  contact_role?: string;
  audit_data: AuditData;
  draft_subject: string;
  draft_body: string;
  quality_failed?: boolean;
  processed_at?: string;
}

export interface OutreachBatchPayload {
  batch_id: string;
  campaign_name: string;
  generated_at: string;
  send_schedule: SendSchedule;
  targets: OutreachBatchTarget[];
}

export interface CampaignRow {
  id: number;
  name: string;
  batch_id: string | null;
  status: CampaignStatus;
  send_schedule: SendSchedule;
  total_targets: number;
  scheduled_count: number;
  sent_count: number;
  paused_at: string | null;
  paused_reason: string | null;
  created_by_admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface TargetRow {
  id: number;
  campaign_id: number;
  hotel_url: string;
  hotel_name: string | null;
  contact_name: string | null;
  contact_email: string;
  contact_role: string | null;
  audit_id: number | null;
  draft_subject: string | null;
  draft_body: string | null;
  scheduled_send_at: string | null;
  approved_at: string | null;
  approved_by_admin_id: string | null;
  sent_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  status: TargetStatus;
  failure_reason: string | null;
  resend_message_id: string | null;
  created_at: string;
  updated_at: string;
}
