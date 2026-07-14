import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/community-auth";
import { isProviderEnabled } from "@/lib/oauth/providers";
import { safeNext } from "@/lib/auth-redirect";
import CpAuthForm from "../portal/_components/CpAuthForm";
import CpAuthShell from "../portal/_components/CpAuthShell";

export const metadata: Metadata = {
  title: "Sign in | Claim Command Center",
  description:
    "Sign in to your Claim Proof Command Center — your claims, checklists, and worksheets, synced across your devices.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Claim Proof's own sign-in door. If the visitor is already signed in, forward
// them to their `next` (the portal), NOT the BNHG member dashboard.
export default async function ClaimProofLoginPage({
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
      title="Welcome back."
      sub="Sign in to pick up your claims, checklists, and worksheets right where you left off."
    >
      <Suspense fallback={<div className="h-[420px]" />}>
        <CpAuthForm mode="login" googleEnabled={isProviderEnabled("google")} />
      </Suspense>
    </CpAuthShell>
  );
}
