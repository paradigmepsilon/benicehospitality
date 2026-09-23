import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { requireAuth, getSession } from "@/lib/auth";
import { getEngagement, logEvent } from "@/lib/fleet/engagements";
import { mergeSlots, parseEmailPack, unfilledSlots } from "@/lib/fleet/emails";

export const runtime = "nodejs";

const PACK = path.join(process.cwd(), "docs", "fleet-management", "templates", "sales", "email_pack.md");

// Same verified sender chain the other BNHG mail uses.
const FROM =
  process.env.FLEET_FROM_EMAIL ||
  process.env.MANAGEMENT_FROM_EMAIL ||
  process.env.BNHG_AUTH_FROM ||
  process.env.AUDIT_FROM_EMAIL ||
  "BNHG <onboarding@resend.dev>";
const REPLY_TO = process.env.CONTACT_EMAIL || "admin@benicehospitality.com";

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

// Today as YYYY-MM-DD in Eastern time, where BNHG works. The statement month
// slot is "last month", so a UTC date would name the wrong month on the
// evening of the last day.
function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

type Ctx = { params: Promise<{ id: string }> };

/** GET: the drafts for this owner, already merged. Nothing is sent. */
export async function GET(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const engagement = await getEngagement(Number((await params).id));
  if (!engagement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The email pack lives in docs/, which is kept out of the public repo. Where
  // it is absent (production, until the docs have a private home) the composer
  // simply has no drafts; the rest of the owner page is unaffected.
  const pack = await readFile(PACK, "utf8").catch(() => "");
  const today = todayEastern();
  const templates = parseEmailPack(pack).map((t) => ({
    ...t,
    subject: mergeSlots(t.subject, engagement, today),
    body: mergeSlots(t.body, engagement, today),
  }));
  return NextResponse.json({ templates, to: engagement.email });
}

/**
 * POST: send one email to the owner. This is the only code path in the
 * tracker that messages an owner, and it never runs on its own: a person
 * reviews the text in the composer, confirms in a dialog, and the request
 * must carry confirmed: true. It refuses any message that still has a
 * [[slot]] in it.
 */
export async function POST(request: Request, { params }: Ctx) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const id = Number((await params).id);
  let body: { subject?: unknown; body?: unknown; templateId?: unknown; confirmed?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body.confirmed !== true) {
    return NextResponse.json({ error: "A person has to confirm every owner email." }, { status: 400 });
  }
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 300) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 20_000) : "";
  if (!subject || !text) return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });

  const open = unfilledSlots(`${subject}\n${text}`);
  if (open.length > 0) {
    return NextResponse.json({ error: `Fill these in first: ${open.join(", ")}` }, { status: 400 });
  }

  const engagement = await getEngagement(id);
  if (!engagement) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!engagement.email) return NextResponse.json({ error: "This owner has no email address." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email isn't configured (RESEND_API_KEY)." }, { status: 503 });

  const session = await getSession();
  const actor = session?.name || session?.email || null;

  const { error } = await getResend().emails.send({
    from: FROM,
    to: engagement.email,
    replyTo: REPLY_TO,
    subject,
    text,
  });
  if (error) {
    console.error("[fleet/email] send failed:", error);
    return NextResponse.json({ error: `Not sent: ${error.message}` }, { status: 502 });
  }

  const tag = typeof body.templateId === "string" ? ` (${body.templateId.slice(0, 8)})` : "";
  await logEvent(id, "email", `Sent${tag}: ${subject}`, actor);
  return NextResponse.json({ success: true });
}
