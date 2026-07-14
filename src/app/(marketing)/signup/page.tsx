import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignupForm from "@/components/sections/auth/SignupForm";
import { getCurrentSession } from "@/lib/community-auth";
import { getEnabledProviders } from "@/lib/oauth/providers";
import { safeNext } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join the Nice Host Network, a free community for co-living property, boutique stay, and Autos fleet operators.",
  alternates: { canonical: "https://benicehospitality.com/signup" },
  robots: { index: false, follow: false },
};

// If a logged-in user lands on /signup, send them where they belong. Honor a
// safe `next` first (a Claim Proof buyer who already has an account clicks the
// delivery link with next=/claimproof/portal and must land there, not on the
// generic member dashboard). Otherwise admins go to /admin, members to /account.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getCurrentSession();
  const { next } = await searchParams;
  if (session) {
    const dest = safeNext(next);
    if (dest !== "/account") redirect(dest);
    redirect(session.user.role === "admin" ? "/admin" : "/account");
  }
  const enabledProviders = getEnabledProviders();

  return (
    <section className="bg-cream pt-32 md:pt-40 pb-20 md:pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
            Join us
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
            Create your account.
          </h1>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Free to join. Get into the Nice Host Network community, see what
            we&rsquo;re working on, and unlock paid courses when you&rsquo;re
            ready.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white border border-light-gray rounded-lg p-7 md:p-8 h-[640px]" />
          }
        >
          <SignupForm enabledProviders={enabledProviders} />
        </Suspense>

        <div className="mt-10 pt-8 border-t border-light-gray text-center">
          <p className="font-sans text-sm text-charcoal/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-green hover:text-primary-green-dark"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
