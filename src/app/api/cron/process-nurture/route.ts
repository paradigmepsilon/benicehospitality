import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { buildAuditUrl } from "@/lib/audit/token";
import { logAuditEvent } from "@/lib/audit/events";
import { sendAuditEmail, type AuditEmailSendArgs } from "@/lib/email/send";
import { DIMENSIONS } from "@/lib/constants/dimensions";
import type { AuditData, NurtureStep } from "@/lib/types/audit";

interface PendingNurtureRow {
  id: number;
  sequence_step: NurtureStep;
  audit_view_id: number;
  email: string;
  audit_id: number;
  audit_token: string;
  hotel_name: string;
  audit_data: AuditData;
}

function findLowestDimension(audit: AuditData) {
  const entries = Object.entries(audit.dimensions) as Array<
    [keyof AuditData["dimensions"], AuditData["dimensions"][keyof AuditData["dimensions"]]]
  >;
  let lowestKey = entries[0][0];
  let lowestScore = entries[0][1].subscore;
  for (const [key, value] of entries) {
    if (value.subscore < lowestScore) {
      lowestKey = key;
      lowestScore = value.subscore;
    }
  }
  const lowest = audit.dimensions[lowestKey];
  const label = DIMENSIONS.find((d) => d.key === lowestKey)?.label || String(lowestKey);
  return {
    label,
    finding: lowest.findings[0] || "No specific finding recorded.",
  };
}

function buildSendArgs(row: PendingNurtureRow): AuditEmailSendArgs | null {
  const auditUrl = buildAuditUrl(row.audit_token);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://benicehospitality.com").replace(/\/$/, "");
  const bookingUrl = `${baseUrl}/book?audit_token=${row.audit_token}&utm_source=tier-0-audit&utm_medium=nurture-${row.sequence_step}`;
  const base = {
    hotelName: row.hotel_name,
    overallScore: row.audit_data.overall.score,
    overallGrade: row.audit_data.overall.grade,
    auditUrl,
    bookingUrl,
  };

  if (row.sequence_step === "day_3") {
    return { kind: "nurture_day_3", to: row.email, payload: base };
  }
  if (row.sequence_step === "day_7") {
    const lowest = findLowestDimension(row.audit_data);
    return {
      kind: "nurture_day_7",
      to: row.email,
      payload: { ...base, lowestDimensionLabel: lowest.label, lowestFinding: lowest.finding },
    };
  }
  if (row.sequence_step === "day_14") {
    return { kind: "nurture_day_14", to: row.email, payload: base };
  }
  return null;
}

export async function POST(request: Request) {
  if (!request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = (await sql`
    SELECT
      nq.id,
      nq.sequence_step,
      nq.audit_view_id,
      av.email,
      av.audit_id,
      a.token AS audit_token,
      a.hotel_name,
      a.audit_data
    FROM nurture_queue nq
    JOIN audit_views av ON av.id = nq.audit_view_id
    JOIN audits a ON a.id = av.audit_id
    WHERE nq.scheduled_for <= NOW()
      AND nq.sent_at IS NULL
      AND nq.cancelled_at IS NULL
    ORDER BY nq.scheduled_for ASC
    LIMIT 50
  `) as unknown as PendingNurtureRow[];

  let sentCount = 0;
  let failCount = 0;

  for (const row of rows) {
    const sendArgs = buildSendArgs(row);
    if (!sendArgs) {
      console.error(`[cron/process-nurture] Unknown sequence_step: ${row.sequence_step}`);
      failCount += 1;
      continue;
    }

    const result = await sendAuditEmail(sendArgs);
    if (!result.ok) {
      failCount += 1;
      continue;
    }

    await sql`
      UPDATE nurture_queue
      SET sent_at = NOW(), resend_message_id = ${result.messageId}
      WHERE id = ${row.id}
    `;
    await logAuditEvent({
      auditId: row.audit_id,
      auditViewId: row.audit_view_id,
      eventType: "nurture_sent",
      metadata: { sequence_step: row.sequence_step, resend_message_id: result.messageId },
    });
    sentCount += 1;
  }

  return NextResponse.json({
    processed: rows.length,
    sent: sentCount,
    failed: failCount,
  });
}
