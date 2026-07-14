import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { getResourceTool } from "@/lib/resources/registry";
import {
  RESOURCE_UNLOCK_COOKIE,
  makeUnlockCookieValue,
  unlockCookieOptions,
} from "@/lib/resources/unlock-cookie";
import { resourceUnlockBodySchema } from "@/lib/validation/resources";
import { resourceUnlockLimiter, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { upsertAudienceContact } from "@/lib/resend-audience";
import { getCurrentSession } from "@/lib/community-auth";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  resourceUnlockedEmail,
  internalResourceLeadEmail,
} from "@/lib/email-templates";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.benicehospitality.com";

// Reuse the same verified sender chain as the scorecard flow.
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

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  const tool = getResourceTool(slug);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  const ip = getClientIp(request);
  const { success } = resourceUnlockLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resourceUnlockBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const turnstileValid = await verifyTurnstileToken(parsed.data.turnstile_token);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name.trim();
  const phone = parsed.data.phone?.trim() || null;
  const role = parsed.data.role ?? null;
  const optedIn = parsed.data.opted_in_newsletter === true;

  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;

  // CRM upsert — best-effort, never blocks the unlock.
  let pipelineContactId: number | null = null;
  try {
    const existing = (await sql`
      SELECT id FROM pipeline_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `) as Array<{ id: number }>;
    if (existing.length > 0) {
      pipelineContactId = existing[0].id;
      await sql`
        UPDATE pipeline_contacts
        SET name = COALESCE(NULLIF(${name}, ''), name),
            phone = COALESCE(${phone}, phone),
            updated_at = NOW()
        WHERE id = ${pipelineContactId}
      `;
    } else {
      const inserted = (await sql`
        INSERT INTO pipeline_contacts (name, email, phone, source, pipeline_stage)
        VALUES (${name}, ${email}, ${phone}, ${"resource:" + slug}, 'prospect')
        RETURNING id
      `) as Array<{ id: number }>;
      pipelineContactId = inserted[0].id;
    }
  } catch (crmErr) {
    console.error("[resources/unlock] pipeline_contacts upsert failed:", crmErr);
  }

  try {
    await sql`
      INSERT INTO resource_leads
        (tool_slug, email, name, role, phone, opted_in_newsletter, user_id, pipeline_contact_id)
      VALUES
        (${slug}, ${email}, ${name}, ${role}, ${phone}, ${optedIn}, ${userId}, ${pipelineContactId})
    `;
  } catch (err) {
    console.error("[resources/unlock] lead insert failed:", err);
    return NextResponse.json(
      { error: "Failed to record your access. Please try again." },
      { status: 500 },
    );
  }

  if (optedIn) {
    try {
      await sql`
        INSERT INTO newsletter_subscribers (email, source)
        VALUES (${email}, ${"resource:" + slug})
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (subErr) {
      console.error("[resources/unlock] newsletter subscribe failed:", subErr);
    }
    const added = await upsertAudienceContact({
      email,
      firstName: name.split(" ")[0],
    });
    if (!added) {
      console.error("[resources/unlock] resend audience upsert skipped/failed for", email);
    }
  }

  const toolUrl = `${SITE_URL}/resources/${slug}`;

  if (process.env.RESEND_API_KEY) {
    try {
      await getResend().emails.send({
        from: RESOURCE_FROM_EMAIL,
        to: email,
        subject: `Your ${tool.name} is unlocked`,
        html: resourceUnlockedEmail({ name, toolName: tool.name, toolUrl }),
      });
    } catch (emailErr) {
      console.error("[resources/unlock] user email failed:", emailErr);
    }

    try {
      await getResend().emails.send({
        from: RESOURCE_FROM_EMAIL,
        to: RESOURCE_NOTIFY_TO,
        replyTo: email,
        subject: `New resource lead: ${tool.name}`,
        html: internalResourceLeadEmail({
          name,
          email,
          role: role ?? undefined,
          toolName: tool.name,
          slug,
        }),
      });
    } catch (emailErr) {
      console.error("[resources/unlock] admin email failed:", emailErr);
    }
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    try {
      getPostHogClient().capture({
        distinctId: userId ? String(userId) : email,
        event: "resource_unlocked",
        properties: { tool_slug: slug, is_logged_in: Boolean(session) },
      });
    } catch (phErr) {
      console.error("[resources/unlock] posthog capture failed:", phErr);
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    RESOURCE_UNLOCK_COOKIE,
    makeUnlockCookieValue(email),
    unlockCookieOptions,
  );
  return res;
}
