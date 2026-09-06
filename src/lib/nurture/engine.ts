/**
 * Course nurture engine: enroll, stop, and process due sends.
 *
 * Tables: course_nurture_enrollments (who is in which sequence, which step is
 * next, when) and course_nurture_sends (one row per step actually attempted;
 * UNIQUE (enrollment_id, step) is what makes a racing or retried cron tick
 * safe). Sequences themselves are code: see registry.ts and sequences/.
 *
 * Every public function here is best-effort from the caller's point of view.
 * A signup, a download, or a purchase must never fail because nurture did.
 */

import { Resend } from "resend";
import { sql } from "@/lib/db";
import { buildUnsubscribeUrl } from "@/lib/outreach/unsubscribe";
import { getBaseUrl } from "@/lib/stripe";
import { getPostHogClient } from "@/lib/posthog-server";
import { advance, nextSendAt, normalizeEmail } from "./schedule";
import { getSequence } from "./registry";
import type {
  NurtureContext,
  NurtureSequenceKey,
  StoredNurtureContext,
} from "./types";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

function capture(email: string, event: string, properties: Record<string, unknown>) {
  try {
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
    getPostHogClient().capture({ distinctId: email, event, properties });
  } catch (err) {
    console.error("[nurture] posthog capture failed:", err);
  }
}

export async function enrollInNurture(args: {
  email: string;
  sequenceKey: NurtureSequenceKey;
  context?: StoredNurtureContext;
}): Promise<{ enrolled: boolean }> {
  try {
    const email = normalizeEmail(args.email);
    if (!email.includes("@")) return { enrolled: false };
    const seq = getSequence(args.sequenceKey);
    const first = seq.steps[0];
    const due = nextSendAt(new Date(), first.delayHours).toISOString();
    const ctx = JSON.stringify(stripUndefined(args.context ?? {}));
    const rows = await sql`
      INSERT INTO course_nurture_enrollments
        (email, sequence_key, next_step, next_send_at, context)
      VALUES (${email}, ${args.sequenceKey}, 0, ${due}, ${ctx}::jsonb)
      ON CONFLICT (email, sequence_key) DO NOTHING
      RETURNING id
    `;
    const enrolled = rows.length > 0;
    if (enrolled) {
      capture(email, "nurture_enrolled", { sequence_key: args.sequenceKey });
    }
    return { enrolled };
  } catch (err) {
    console.error(`[nurture] enroll ${args.sequenceKey} failed:`, err);
    return { enrolled: false };
  }
}

/**
 * Stop active enrollments for an address. Used on unsubscribe, bounce,
 * complaint, and purchase. Returns how many rows changed.
 */
export async function stopNurture(
  emailRaw: string,
  reason: string,
  sequenceKeys?: readonly NurtureSequenceKey[],
): Promise<number> {
  try {
    const email = normalizeEmail(emailRaw);
    const rows =
      sequenceKeys && sequenceKeys.length > 0
        ? await sql`
            UPDATE course_nurture_enrollments
            SET status = 'stopped', stop_reason = ${reason}, updated_at = NOW()
            WHERE email = ${email} AND status = 'active'
              AND sequence_key = ANY(${[...sequenceKeys]}::text[])
            RETURNING sequence_key
          `
        : await sql`
            UPDATE course_nurture_enrollments
            SET status = 'stopped', stop_reason = ${reason}, updated_at = NOW()
            WHERE email = ${email} AND status = 'active'
            RETURNING sequence_key
          `;
    for (const r of rows) {
      capture(email, "nurture_stopped", {
        sequence_key: r.sequence_key,
        reason,
      });
    }
    return rows.length;
  } catch (err) {
    console.error("[nurture] stop failed:", err);
    return 0;
  }
}

interface DueRow {
  id: number;
  email: string;
  sequence_key: NurtureSequenceKey;
  next_step: number;
  context: StoredNurtureContext;
}

export interface ProcessResult {
  sent: number;
  failed: number;
  skipped: number;
}

/**
 * Send every due step once. Called by the cron route every 15 minutes.
 *
 * Suppression is checked here, at send time, against the unsubscribes table,
 * so an address that opted out between enrollment and the send never gets
 * the email.
 */
export async function processDueNurture(args?: {
  now?: Date;
  limit?: number;
}): Promise<ProcessResult> {
  const now = (args?.now ?? new Date()).toISOString();
  const limit = args?.limit ?? 100;
  const result: ProcessResult = { sent: 0, failed: 0, skipped: 0 };

  const due = (await sql`
    SELECT id, email, sequence_key, next_step, context
    FROM course_nurture_enrollments
    WHERE status = 'active' AND next_send_at <= ${now}
    ORDER BY next_send_at ASC
    LIMIT ${limit}
  `) as DueRow[];
  if (due.length === 0) return result;

  const emails = [...new Set(due.map((r) => r.email))];
  const unsubRows = (await sql`
    SELECT email FROM unsubscribes WHERE email = ANY(${emails}::text[])
  `) as Array<{ email: string }>;
  const unsubscribed = new Set(unsubRows.map((r) => normalizeEmail(r.email)));

  const baseUrl = getBaseUrl();

  for (const row of due) {
    try {
      if (unsubscribed.has(row.email)) {
        await stopNurture(row.email, "unsubscribed");
        result.skipped += 1;
        continue;
      }

      const seq = getSequence(row.sequence_key);
      const step = seq.steps[row.next_step];
      if (!step) {
        await sql`
          UPDATE course_nurture_enrollments
          SET status = 'completed', updated_at = NOW() WHERE id = ${row.id}
        `;
        result.skipped += 1;
        continue;
      }

      // Claim the step first. If another tick already claimed it, advance
      // this enrollment and move on rather than sending twice.
      const claim = await sql`
        INSERT INTO course_nurture_sends (enrollment_id, step, email, subject)
        VALUES (${row.id}, ${row.next_step}, ${row.email}, ${step.subject})
        ON CONFLICT (enrollment_id, step) DO NOTHING
        RETURNING id
      `;
      if (claim.length === 0) {
        const already = (await sql`
          SELECT resend_message_id FROM course_nurture_sends
          WHERE enrollment_id = ${row.id} AND step = ${row.next_step}
        `) as Array<{ resend_message_id: string | null }>;
        if (already[0]?.resend_message_id) {
          await advanceEnrollment(row.id, row.next_step, seq.steps.length, seq.steps[row.next_step + 1]?.delayHours);
        }
        result.skipped += 1;
        continue;
      }
      const sendId = claim[0].id as number;

      const ctx: NurtureContext = {
        email: row.email,
        ...row.context,
        baseUrl,
        unsubscribeUrl: buildUnsubscribeUrl(row.email),
      };
      const html = step.html(ctx);

      const sent = await getResend().emails.send({
        from: seq.from(),
        to: row.email,
        subject: step.subject,
        html,
      });

      if (sent.error || !sent.data?.id) {
        const msg = sent.error
          ? `${sent.error.name}: ${sent.error.message}`
          : "no message id";
        // Release the claim so the next tick retries this step.
        await sql`DELETE FROM course_nurture_sends WHERE id = ${sendId}`;
        await sql`
          UPDATE course_nurture_enrollments
          SET updated_at = NOW(), stop_reason = ${`last_error: ${msg}`.slice(0, 500)}
          WHERE id = ${row.id}
        `;
        console.error(`[nurture] send failed (${row.sequence_key} step ${row.next_step}) to ${row.email}: ${msg}`);
        result.failed += 1;
        continue;
      }

      await sql`
        UPDATE course_nurture_sends
        SET resend_message_id = ${sent.data.id}, sent_at = NOW()
        WHERE id = ${sendId}
      `;
      await advanceEnrollment(row.id, row.next_step, seq.steps.length, seq.steps[row.next_step + 1]?.delayHours);
      capture(row.email, "nurture_sent", {
        sequence_key: row.sequence_key,
        step: row.next_step,
        subject: step.subject,
      });
      result.sent += 1;
    } catch (err) {
      console.error(`[nurture] processing enrollment ${row.id} threw:`, err);
      result.failed += 1;
    }
  }

  try {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) await getPostHogClient().flush();
  } catch {
    // flush is best-effort
  }

  return result;
}

/**
 * Move an enrollment to the step after `step`. `nextDelayHours` is the delay
 * of the step that will send next (undefined when this was the last step).
 */
async function advanceEnrollment(
  enrollmentId: number,
  step: number,
  total: number,
  nextDelayHours?: number,
): Promise<void> {
  const { nextStep, completed } = advance(step, total);
  if (completed) {
    await sql`
      UPDATE course_nurture_enrollments
      SET status = 'completed', next_step = ${nextStep}, stop_reason = NULL, updated_at = NOW()
      WHERE id = ${enrollmentId}
    `;
    return;
  }
  const due = nextSendAt(new Date(), nextDelayHours ?? 0).toISOString();
  await sql`
    UPDATE course_nurture_enrollments
    SET next_step = ${nextStep}, next_send_at = ${due}, stop_reason = NULL, updated_at = NOW()
    WHERE id = ${enrollmentId}
  `;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "") (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
