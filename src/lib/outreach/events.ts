import { sql } from "@/lib/db";

export type OutreachEventType =
  | "approved"
  | "rejected"
  | "replenished"
  | "sent"
  | "delivered"
  | "delivery_delayed"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "unsubscribed"
  | "replied";

export interface LogOutreachEventArgs {
  targetId: number;
  eventType: OutreachEventType | string;
  occurredAt?: string | Date | null;
  resendEventId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Insert an outreach_events row. Idempotent on `resend_event_id` so a
 * webhook replay does not double-log. Returns the inserted row, or null
 * if a duplicate `resend_event_id` already existed.
 */
export async function logOutreachEvent(args: LogOutreachEventArgs): Promise<{ id: number } | null> {
  const occurred = args.occurredAt
    ? new Date(args.occurredAt).toISOString()
    : null;
  const meta = args.metadata ? JSON.stringify(args.metadata) : null;

  const rows = await sql`
    INSERT INTO outreach_events (target_id, event_type, occurred_at, resend_event_id, metadata)
    VALUES (
      ${args.targetId},
      ${args.eventType},
      ${occurred ?? new Date().toISOString()}::timestamptz,
      ${args.resendEventId ?? null},
      ${meta}::jsonb
    )
    ON CONFLICT (resend_event_id) WHERE resend_event_id IS NOT NULL
    DO NOTHING
    RETURNING id
  `;
  return rows.length > 0 ? { id: rows[0].id as number } : null;
}
