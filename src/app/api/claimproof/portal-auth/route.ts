import { NextRequest, NextResponse } from "next/server";
import { readClaimProofTokenDetails } from "@/lib/claim-proof-download";
import { PORTAL_COOKIE } from "@/app/claimproof/portal/_lib/access";
import { sql } from "@/lib/db";

/**
 * Claim Command Center login. The buyer's delivery email carries the same
 * HMAC token used for downloads; this endpoint validates it, sets an HttpOnly
 * cookie, and drops them on the portal dashboard. No accounts, no passwords,
 * no DB lookup for auth — the token IS the credential (see
 * claim-proof-download.ts).
 *
 * Tokens minted since the purchase mirror shipped carry the Stripe session
 * id; those logins stamp portal_first_login/portal_last_login on the
 * claimproof_purchases row so Unified Ops can report activation. Stamping is
 * best-effort — a DB hiccup never blocks login. Older emailed links log in
 * fine but can't be attributed to a purchase.
 *
 * "guide" tokens (free lead magnet) do not grant portal access; the free
 * checklist lives at the public /claimproof/rescue page instead.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") || "";
  const details = token ? readClaimProofTokenDetails(token) : null;

  const base = req.nextUrl.origin;
  if (!details || details.item === "guide") {
    return NextResponse.redirect(`${base}/claimproof/portal?denied=1`);
  }

  if (details.sessionId) {
    try {
      await sql`
        UPDATE claimproof_purchases
        SET portal_first_login = COALESCE(portal_first_login, NOW()),
            portal_last_login = NOW()
        WHERE stripe_session_id = ${details.sessionId}
      `;
    } catch (err) {
      console.error("[claimproof/portal-auth] login stamp failed:", err);
    }
  }

  const res = NextResponse.redirect(`${base}/claimproof/portal`);
  res.cookies.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/claimproof",
    maxAge: 365 * 24 * 60 * 60, // matches the token's own 1-year expiry
  });
  return res;
}
