import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPasswordUser,
  createEmailVerificationToken,
  SignupEmailInUseError,
  AuthBackendUnavailableError,
} from "@/lib/community-auth";
import { sendVerificationEmail } from "@/lib/auth-email";
import { signupLimiter, getClientIp } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/analytics";
import { claimProofEntitlementForEmail } from "@/lib/claim-proof-workspace";

export const runtime = "nodejs";

/**
 * Claim Proof account creation. UNLIKE the open BNHG community signup, this is
 * NOT public: an account is only created for an email that is entitled to Claim
 * Proof — someone who bought it (pending purchase / existing workspace) or was
 * invited to a fleet workspace. Everyone else is turned away with guidance to
 * use their purchase email or contact support.
 *
 * Kept separate from /api/auth/signup so the entitlement gate and the buyer-
 * friendly field set (no phone / service-interests) live only here and the
 * BNHG community signup is untouched.
 */

const Body = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(200),
});

const BLOCKED_MESSAGE =
  "Claim Proof accounts are set up from your purchase or a team invite. If you bought Claim Proof, use the same email you purchased with (check the link in your delivery email). If a fleet owner invited you, use the invite link they sent. Questions? Email hello@benicehospitality.com.";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = signupLimiter.check(`cp-signup:${ip}`);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts from this address. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const raw = await request.json().catch(() => null);
    const parsed = Body.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid signup details." },
        { status: 400 },
      );
    }
    const body = parsed.data;

    // The gate: only entitled emails may create a Claim Proof account.
    const entitlement = await claimProofEntitlementForEmail(body.email);
    if (!entitlement.entitled) {
      return NextResponse.json(
        { error: BLOCKED_MESSAGE, code: "not_entitled" },
        { status: 403 },
      );
    }

    try {
      const { userId } = await createPasswordUser({
        name: body.name,
        email: body.email,
        password: body.password,
        // CP buyers don't provide these on the branded form; the BNHG onboarding
        // fields aren't relevant to a Claim Proof account. Claim Proof serves
        // auto (Turo) hosts, so tag the interest accordingly.
        phone: "",
        serviceInterests: ["autos"],
      });
      const { rawToken } = await createEmailVerificationToken(userId);
      let emailFailed = false;
      try {
        await sendVerificationEmail({ to: body.email, name: body.name, rawToken });
      } catch (err) {
        emailFailed = true;
        // Don't swallow: log with detail AND tell the buyer (below) so a failed
        // send never leaves a paying customer stranded with no path in.
        console.error(
          `[claimproof/signup] verification email to ${body.email} failed:`,
          err,
        );
      }
      void recordEvent({
        userId,
        eventType: "auth.signup",
        metadata: { method: "password", source: "claimproof", reason: entitlement.reason },
      });

      return NextResponse.json({
        success: true,
        emailFailed,
        message: emailFailed
          ? "Account created, but the verification email didn't send. Your access link is also in your Claim Proof delivery email — open your Command Center from there now, and you can resend the email from your order confirmation page. Verify later to sign in with your password."
          : "Account created. Check your email to verify it, then sign in with this same email to open your Command Center.",
      });
    } catch (err) {
      if (err instanceof SignupEmailInUseError) {
        // Account already exists for this (entitled) email. Generic success so
        // we don't confirm which emails are registered — they should just sign
        // in. The CP form nudges them to the sign-in link.
        return NextResponse.json({
          success: true,
          message:
            "An account already exists for this email. Head to sign in and use your password (or reset it if you forgot).",
          existed: true,
        });
      }
      if (err instanceof AuthBackendUnavailableError) {
        return NextResponse.json(
          { error: "Signup is not configured on this server." },
          { status: 503 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("[claimproof/signup] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
