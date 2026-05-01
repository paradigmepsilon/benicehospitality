import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/outreach/unsubscribe";
import { unsubscribeLimiter } from "@/lib/rate-limit";

function htmlPage({ ok, email }: { ok: boolean; email: string }) {
  const heading = ok ? "You've been unsubscribed" : "Unsubscribe link invalid";
  const body = ok
    ? `<p>${email} has been removed from our outreach list. You will no longer receive cold emails from Be Nice Hospitality Group.</p>
       <p>If you change your mind, just reply to one of our emails and we'll re-add you.</p>`
    : `<p>This unsubscribe link is invalid or has expired. If you'd like to be removed from our list, please reply to one of our emails or email <a href="mailto:admin@benicehospitality.com">admin@benicehospitality.com</a>.</p>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading} | Be Nice Hospitality Group</title>
  <style>
    body { margin:0; padding:0; background:#f8f6f1; font-family: 'Helvetica Neue', Arial, sans-serif; color:#1a1a1a; }
    .wrap { max-width:520px; margin:80px auto; padding:32px; background:#fff; border:1px solid #e8e4dd; border-radius:8px; text-align:center; }
    h1 { font-size:24px; margin:0 0 16px; font-weight:600; }
    p { font-size:15px; line-height:1.6; color:#3d3d3d; margin:0 0 16px; }
    a { color:#5b9a2f; }
    .badge { display:inline-block; background:#5b9a2f15; color:#5b9a2f; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:16px; }
  </style>
</head>
<body>
  <div class="wrap">
    ${ok ? `<div class="badge">Confirmed</div>` : ""}
    <h1>${heading}</h1>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#888;">Be Nice Hospitality Group · Hapeville, GA</p>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success } = unsubscribeLimiter.check(ip);
  if (!success) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || "").toLowerCase().trim();
  const token = url.searchParams.get("token") || "";
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return new NextResponse(htmlPage({ ok: false, email }), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  await sql`
    INSERT INTO unsubscribes (email, source, reason)
    VALUES (${email}, 'link_click', 'one_click_unsubscribe')
    ON CONFLICT (email) DO NOTHING
  `;

  // Cancel any pending sends to this email
  await sql`
    UPDATE outreach_targets
    SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
    WHERE contact_email = ${email} AND sent_at IS NULL AND status IN ('scheduled', 'approved')
  `;

  return new NextResponse(htmlPage({ ok: true, email }), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// Handle one-click unsubscribe POST (RFC 8058)
export async function POST(request: Request) {
  return GET(request);
}
