import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { contactBookingLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const ALLOWED_ASSET_CLASSES = ["property", "auto", "co_living", "multi_asset"] as const;
const ALLOWED_UNIT_COUNTS = ["1-4", "5-9", "10-14", "15-24", "25+"] as const;
const ALLOWED_REVENUE_RANGES = [
  "under_400k",
  "400k_750k",
  "750k_1_5m",
  "1_5m_3m",
  "over_3m",
] as const;
const ALLOWED_TIMING = ["next_30", "next_60_90", "later_2026"] as const;

type Allowed<T extends readonly string[]> = T[number];

interface AdvisoryApplicationBody {
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  assetClass?: Allowed<typeof ALLOWED_ASSET_CLASSES>;
  unitCount?: Allowed<typeof ALLOWED_UNIT_COUNTS>;
  revenueRange?: Allowed<typeof ALLOWED_REVENUE_RANGES>;
  topConstraint?: string;
  timing?: Allowed<typeof ALLOWED_TIMING>;
  website?: string; // honeypot
  turnstileToken?: string;
}

const ASSET_CLASS_LABEL: Record<string, string> = {
  property: "Property (STR / LTR / Co-living)",
  auto: "Auto (Turo / fleet)",
  co_living: "Co-living buildings only",
  multi_asset: "Multi-asset (property + auto + experiences)",
};

const REVENUE_LABEL: Record<string, string> = {
  under_400k: "Under $400K",
  "400k_750k": "$400K to $750K",
  "750k_1_5m": "$750K to $1.5M",
  "1_5m_3m": "$1.5M to $3M",
  over_3m: "Over $3M",
};

const TIMING_LABEL: Record<string, string> = {
  next_30: "Within the next 30 days",
  next_60_90: "Next 60 to 90 days",
  later_2026: "Sometime later in 2026",
};

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const { success: withinLimit } = contactBookingLimiter.check(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as AdvisoryApplicationBody;

    // Honeypot. Silently accept and discard.
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const turnstileValid = await verifyTurnstileToken(body.turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Required fields.
    if (
      !body.name ||
      !body.email ||
      !body.businessName ||
      !body.assetClass ||
      !body.unitCount ||
      !body.revenueRange ||
      !body.topConstraint
    ) {
      return NextResponse.json({ error: "Please fill every required field." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!ALLOWED_ASSET_CLASSES.includes(body.assetClass)) {
      return NextResponse.json({ error: "Invalid asset class." }, { status: 400 });
    }
    if (!ALLOWED_UNIT_COUNTS.includes(body.unitCount)) {
      return NextResponse.json({ error: "Invalid unit count." }, { status: 400 });
    }
    if (!ALLOWED_REVENUE_RANGES.includes(body.revenueRange)) {
      return NextResponse.json({ error: "Invalid revenue range." }, { status: 400 });
    }
    if (body.timing && !ALLOWED_TIMING.includes(body.timing)) {
      return NextResponse.json({ error: "Invalid timing." }, { status: 400 });
    }
    if (body.topConstraint.length > 1000) {
      return NextResponse.json({ error: "Constraint description is too long." }, { status: 400 });
    }

    const summary = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      businessName: body.businessName.trim(),
      assetClass: body.assetClass,
      unitCount: body.unitCount,
      revenueRange: body.revenueRange,
      topConstraint: body.topConstraint.trim(),
      timing: body.timing ?? null,
    };

    // Notification email to admin. Always attempted; user-facing success does not
    // depend on this so admin email outages cannot block submissions.
    try {
      await getResend().emails.send({
        from: "BNHG Website <onboarding@resend.dev>",
        to: process.env.CONTACT_EMAIL || "admin@benicehospitality.com",
        replyTo: summary.email,
        subject: `Advisory Application: ${summary.businessName}, ${summary.name}`,
        html: `
          <h2>New Advisory Application</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${summary.name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${summary.email}</td></tr>
            ${summary.phone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${summary.phone}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Business</td><td style="padding:8px;border-bottom:1px solid #eee;">${summary.businessName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Asset class</td><td style="padding:8px;border-bottom:1px solid #eee;">${ASSET_CLASS_LABEL[summary.assetClass]}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Units / vehicles</td><td style="padding:8px;border-bottom:1px solid #eee;">${summary.unitCount}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Annual revenue</td><td style="padding:8px;border-bottom:1px solid #eee;">${REVENUE_LABEL[summary.revenueRange]}</td></tr>
            ${summary.timing ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Timing</td><td style="padding:8px;border-bottom:1px solid #eee;">${TIMING_LABEL[summary.timing]}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;vertical-align:top;">Top constraint</td><td style="padding:8px;border-bottom:1px solid #eee;white-space:pre-wrap;">${summary.topConstraint}</td></tr>
          </table>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send advisory application notification:", emailError);
    }

    // Best-effort CRM record. If the pipeline_contacts table is in a state we
    // cannot upsert into, log and move on. The Resend email is the system of
    // record for the application either way.
    try {
      const existing = await sql`
        SELECT id FROM pipeline_contacts WHERE LOWER(email) = ${summary.email} LIMIT 1
      `;
      let contactId: number | null = null;

      if (existing.length > 0) {
        contactId = existing[0].id as number;
        await sql`
          UPDATE pipeline_contacts
          SET name = ${summary.name},
              phone = COALESCE(${summary.phone}, phone),
              hotel_name = COALESCE(hotel_name, ${summary.businessName}),
              updated_at = NOW()
          WHERE id = ${contactId}
        `;
      } else {
        const inserted = await sql`
          INSERT INTO pipeline_contacts (name, email, phone, hotel_name, source)
          VALUES (${summary.name}, ${summary.email}, ${summary.phone}, ${summary.businessName}, 'advisory_application')
          RETURNING id
        `;
        contactId = (inserted[0]?.id as number) ?? null;
      }

      if (contactId !== null) {
        const meta = {
          asset_class: summary.assetClass,
          unit_count: summary.unitCount,
          revenue_range: summary.revenueRange,
          timing: summary.timing,
          top_constraint: summary.topConstraint,
        };
        await sql`
          INSERT INTO pipeline_activities (contact_id, type, title, description, metadata)
          VALUES (
            ${contactId},
            'advisory_application',
            'Advisory application submitted',
            ${summary.topConstraint},
            ${JSON.stringify(meta)}
          )
        `;
      }
    } catch (crmErr) {
      console.error("Advisory CRM upsert failed:", crmErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Advisory application error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
