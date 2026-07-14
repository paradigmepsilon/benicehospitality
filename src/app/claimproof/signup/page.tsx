import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";
import { isProviderEnabled } from "@/lib/oauth/providers";
import { safeNext } from "@/lib/auth-redirect";
import CpAuthForm from "../portal/_components/CpAuthForm";
import CpAuthShell from "../portal/_components/CpAuthShell";

export const metadata: Metadata = {
  title: "Set up your account | Claim Command Center",
  description:
    "Create your free Claim Proof account and set up your Command Center — your claims and worksheets sync across every device.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Claim Proof's own account-setup door. If the buyer already has an account and
// is signed in, forward them straight to their `next` (the portal).
export default async function ClaimProofSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next } = await searchParams;
  const session = await getCurrentSession();
  if (session) {
    const dest = safeNext(next);
    redirect(dest === "/account" ? "/claimproof/portal" : dest);
  }

  return (
    <CpAuthShell
      eyebrow="Claim Command Center"
      title="Set up your Command Center."
      sub="Use the same email you purchased Claim Proof with (or the email your fleet owner invited). Accounts are only set up for buyers and invited teammates. Your claims and worksheets then sync across every device you sign in on."
    >
      <Suspense fallback={<div className="h-[520px]" />}>
        <CpAuthForm mode="signup" googleEnabled={isProviderEnabled("google")} />
      </Suspense>
    </CpAuthShell>
  );
}
