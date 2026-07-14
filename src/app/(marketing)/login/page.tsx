import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginForm from "@/components/sections/auth/LoginForm";
import { getCurrentSession } from "@/lib/community-auth";
import { getEnabledProviders } from "@/lib/oauth/providers";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";
import { safeNext } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to access your courses, the Nice Host Network, and the resources you've enrolled in.",
  alternates: { canonical: "https://benicehospitality.com/login" },
  robots: { index: false, follow: false },
};

// If a logged-in user lands on /login, send them to wherever they belong.
// Honor a safe `next` first (e.g. a Claim Proof buyer following the delivery
// link with next=/claimproof/portal), then admins to /admin, users to /account.
export default async function LoginPage({
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
            Login
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
            Welcome back.
          </h1>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Sign in to your courses, the Nice Host Network, and any resources
            you&rsquo;ve enrolled in.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white border border-light-gray rounded-lg p-7 md:p-8 h-[420px]" />
          }
        >
          <LoginForm enabledProviders={enabledProviders} />
        </Suspense>

        <div className="mt-10 pt-8 border-t border-light-gray text-center space-y-3">
          <p className="font-sans text-sm text-charcoal/70">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary-green hover:text-primary-green-dark"
            >
              Create an account
            </Link>{" "}
            or{" "}
            <Link
              href={bookingUrl({ source: BOOKING_SOURCES.LOGIN_INLINE })}
              className="font-semibold text-primary-green hover:text-primary-green-dark"
            >
              book a discovery call
            </Link>
            .
          </p>
          <p className="font-sans text-xs text-charcoal/55">
            Admin?{" "}
            <Link
              href="/admin/login"
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
            >
              Sign in to the admin panel
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
