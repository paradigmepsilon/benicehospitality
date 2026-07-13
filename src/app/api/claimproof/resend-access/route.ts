import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getBaseUrl } from "@/lib/stripe";
import { getClientIp, claimProofResendLimiter } from "@/lib/rate-limit";
import { claimProofPurchaseForEmail } from "@/lib/claim-proof-workspace";
import { makeClaimProofToken } from "@/lib/claim-proof-download";
import {
  claimProofDeliveryEmail,
  claimProofDownloadLink,
  claimProofPortalLink,
  getClaimProofFromAddress,
} from "@/lib/claim-proof";

export const runtime = "nodejs";

/**
 * POST /api/claimproof/resend-access  { email }
 *
 * Self-serve recovery for a buyer who never got (or lost) their delivery email.
 * Re-sends the exact delivery email the webhook sends — download link plus the
 * Command Center portal magic link — so a paying customer is never stranded
 * behind a missing email or a failed verification step. The portal magic link
 * grants access WITHOUT the email-verification detour, so this is the primary
 * "I paid and got nothing" fix.
 *
 * Always returns a generic success so the endpoint can't be used to enumerate
 * which emails have purchased. Rate-limited per (ip, email) — each hit sends
 * a real email.
 */

let cachedResend: Resend | null = null;
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const GENERIC_OK =
  "If that email has a Claim Proof purchase, your access link is on its way. It usually lands within a minute or two. Check spam and promotions too.";

const Body = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const raw = await request.json().catch(() => null);
    const parsed = Body.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
        { status: 400 },
      );
    }
    const email = parsed.data.email.toLowerCase();

    const limit = claimProofResendLimiter.check(`cp-resend:${ip}:${email}`);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 },
      );
    }

    const purchase = await claimProofPurchaseForEmail(email);
    if (purchase) {
      try {
        const token = makeClaimProofToken(
          purchase.tier,
          undefined,
          purchase.stripeSessionId ?? undefined,
        );
        const baseUrl = getBaseUrl();
        const { subject, html } = claimProofDeliveryEmail({
          tier: purchase.tier,
          downloadUrl: claimProofDownloadLink(baseUrl, purchase.tier, token),
          portalUrl: claimProofPortalLink(baseUrl, token),
          videoUrl:
            purchase.tier === "fleet"
              ? process.env.CLAIM_PROOF_FLEET_VIDEO_URL || undefined
              : undefined,
        });
        const result = await getResend().emails.send({
          from: getClaimProofFromAddress(),
          to: email,
          subject,
          html,
        });
        if (result.error) {
          console.error(
            `[claimproof/resend-access] send to ${email} failed:`,
            `${result.error.name}: ${result.error.message}`,
          );
        } else {
          console.log(
            `[claimproof/resend-access] resent ${purchase.tier} access to ${email}`,
          );
        }
      } catch (err) {
        console.error(`[claimproof/resend-access] threw for ${email}:`, err);
      }
    } else {
      // No purchase on this email. Log it, but respond identically so the
      // endpoint reveals nothing about who has bought.
      console.log(
        `[claimproof/resend-access] no purchase for ${email} — generic response`,
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_OK });
  } catch (error) {
    console.error("[claimproof/resend-access] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
