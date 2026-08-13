// CRM ingestion for the resource funnel.
//
// These writes used to live inside /api/resources/[slug]/unlock, which was the
// app's ONLY writer of pipeline_contacts, resource_leads, and the newsletter
// opt-in. The account-required cutover deletes that route, so they moved here
// and are now driven by two account-side events instead of an email capture:
//
//   1. the first time a member opens a given tool (auto-add), and
//   2. the first time a member explicitly saves a given tool.
//
// Both are one-shot per (person, tool) — the callers only invoke this when the
// saved_resource_tools insert actually created a row.
//
// Everything here is best-effort. A CRM failure must never break a page render
// or fail the save the member just made.

import { Resend } from "resend";
import { sql } from "@/lib/db";
import { getResourceTool } from "@/lib/resources/registry";
import { getPostHogClient } from "@/lib/posthog-server";
import { internalResourceLeadEmail } from "@/lib/email-templates";

// Same verified sender chain as the scorecard and the old unlock route.
const RESOURCE_FROM_EMAIL =
  process.env.SCORECARD_FROM_EMAIL ||
  process.env.BNHG_AUTH_FROM ||
  process.env.AUDIT_FROM_EMAIL ||
  "BNHG <onboarding@resend.dev>";

const RESOURCE_NOTIFY_TO =
  process.env.ADMIN_EMAIL || "admin@benicehospitality.com";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

/**
 * Upsert a person into the CRM. Returns the contact id, or null if the write
 * failed (callers carry on regardless).
 *
 * Not an ON CONFLICT upsert: pipeline_contacts' unique index on email was
 * dropped (scripts/migrate.ts), and the live unique is on
 * (website_url, hotel_name). SELECT-then-write is the only correct shape here.
 */
export async function upsertPipelineContact(input: {
  name: string;
  email: string;
  phone?: string | null;
  /** First-touch source. Only written on insert; never overwritten. */
  source: string;
}): Promise<number | null> {
  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;

  try {
    const existing = (await sql`
      SELECT id FROM pipeline_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `) as Array<{ id: number }>;

    if (existing.length > 0) {
      const id = existing[0].id;
      // `source` is deliberately not updated. It records first touch, so the
      // campaign that originally found this person survives every later visit.
      await sql`
        UPDATE pipeline_contacts
        SET name = COALESCE(NULLIF(${name}, ''), name),
            phone = COALESCE(${phone}, phone),
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return id;
    }

    const inserted = (await sql`
      INSERT INTO pipeline_contacts (name, email, phone, source, pipeline_stage)
      VALUES (${name}, ${email}, ${phone}, ${input.source}, 'prospect')
      RETURNING id
    `) as Array<{ id: number }>;
    return inserted[0]?.id ?? null;
  } catch (err) {
    console.error("[resources/leads] pipeline_contacts upsert failed:", err);
    return null;
  }
}

/**
 * Record a member's first engagement with a specific tool: CRM contact,
 * resource_leads row, internal notification, and the PostHog rollup.
 *
 * Call from after() so it never sits in the response path. Fire only when the
 * saved_resource_tools row was newly created, so this stays one row per
 * (person, tool) rather than one per page view.
 */
export async function recordResourceToolLead(input: {
  slug: string;
  email: string;
  name: string;
  userId: number;
  utmSource?: string | null;
}): Promise<void> {
  const tool = getResourceTool(input.slug);
  if (!tool) return;

  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  const utmSource = input.utmSource || null;

  // A UTM source means the visit is traceable to a campaign, which is more
  // useful than knowing which tool they happened to open — resource_leads
  // .tool_slug records that anyway.
  const leadSource = utmSource ?? `resource:${input.slug}`;

  const pipelineContactId = await upsertPipelineContact({
    name,
    email,
    source: leadSource,
  });

  try {
    await sql`
      INSERT INTO resource_leads
        (tool_slug, email, name, user_id, pipeline_contact_id, utm_source)
      VALUES
        (${input.slug}, ${email}, ${name}, ${input.userId}, ${pipelineContactId}, ${utmSource})
    `;
  } catch (err) {
    // Unlike the old unlock route we do NOT fail the request here. The member
    // already has the tool and the save already succeeded; a CRM miss is an
    // internal problem, not theirs.
    console.error("[resources/leads] resource_leads insert failed:", err);
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await getResend().emails.send({
        from: RESOURCE_FROM_EMAIL,
        to: RESOURCE_NOTIFY_TO,
        replyTo: email,
        subject: `New resource lead: ${tool.name}`,
        html: internalResourceLeadEmail({
          name,
          email,
          toolName: tool.name,
          slug: input.slug,
        }),
      });
    } catch (emailErr) {
      console.error("[resources/leads] admin email failed:", emailErr);
    }
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    // How many distinct tools this person has now opened. Counted from the DB
    // because it is the only place that knows the true total across devices —
    // the signal separating a warm lead from a one-and-done download.
    let toolsUnlockedCount = 1;
    try {
      const rows = (await sql`
        SELECT COUNT(DISTINCT tool_slug)::int AS n
        FROM resource_leads
        WHERE LOWER(email) = ${email}
      `) as Array<{ n: number }>;
      toolsUnlockedCount = rows[0]?.n ?? 1;
    } catch (countErr) {
      console.error("[resources/leads] tool count failed:", countErr);
    }

    try {
      getPostHogClient().capture({
        // Canonical identity key: the lowercased email, matching the
        // client-side identify() and every later purchase.
        distinctId: email,
        event: "resource_unlocked",
        properties: {
          tool_slug: input.slug,
          is_logged_in: true,
          utm_source: utmSource,
          $set: {
            email,
            last_tool_slug: input.slug,
            tools_unlocked_count: toolsUnlockedCount,
            user_id: input.userId,
          },
          $set_once: {
            first_touch_source: utmSource ?? "direct",
          },
        },
      });
    } catch (phErr) {
      console.error("[resources/leads] posthog capture failed:", phErr);
    }
  }
}
