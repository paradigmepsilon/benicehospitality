import { sql } from "@/lib/db";
import type { AuditEventType } from "@/lib/types/audit";

export async function logAuditEvent(params: {
  auditId: number;
  auditViewId?: number | null;
  eventType: AuditEventType;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { auditId, auditViewId = null, eventType, metadata = null } = params;
  await sql`
    INSERT INTO audit_events (audit_id, audit_view_id, event_type, metadata)
    VALUES (
      ${auditId},
      ${auditViewId},
      ${eventType},
      ${metadata ? JSON.stringify(metadata) : null}::jsonb
    )
  `;
}

export async function upsertAuditView(params: {
  auditId: number;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ id: number; isFirstView: boolean }> {
  const { auditId, email, ipAddress = null, userAgent = null } = params;
  const rows = await sql`
    INSERT INTO audit_views (audit_id, email, ip_address, user_agent)
    VALUES (${auditId}, ${email}, ${ipAddress}::inet, ${userAgent})
    ON CONFLICT (audit_id, email) DO UPDATE SET
      last_viewed_at = NOW(),
      view_count = audit_views.view_count + 1
    RETURNING id, view_count
  `;
  const id = rows[0].id as number;
  const viewCount = rows[0].view_count as number;
  return { id, isFirstView: viewCount === 1 };
}

export async function scheduleNurtureSequence(auditViewId: number): Promise<void> {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const steps: Array<{ step: "day_3" | "day_7" | "day_14"; offsetDays: number }> = [
    { step: "day_3", offsetDays: 3 },
    { step: "day_7", offsetDays: 7 },
    { step: "day_14", offsetDays: 14 },
  ];

  for (const { step, offsetDays } of steps) {
    const scheduledFor = new Date(now + offsetDays * day).toISOString();
    await sql`
      INSERT INTO nurture_queue (audit_view_id, sequence_step, scheduled_for)
      VALUES (${auditViewId}, ${step}, ${scheduledFor})
      ON CONFLICT (audit_view_id, sequence_step) DO NOTHING
    `;
  }
}

export async function cancelPendingNurture(params: {
  auditViewId: number;
  reason: string;
}): Promise<number> {
  const { auditViewId, reason } = params;
  const result = await sql`
    UPDATE nurture_queue
    SET cancelled_at = NOW(), cancellation_reason = ${reason}
    WHERE audit_view_id = ${auditViewId}
      AND sent_at IS NULL
      AND cancelled_at IS NULL
  `;
  // neon serverless returns the rows array; for UPDATE we read .length or rowCount
  return Array.isArray(result) ? result.length : 0;
}
