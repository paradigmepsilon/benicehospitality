import type { Metadata } from "next";
import Link from "next/link";
import RequestResetForm from "@/components/sections/auth/RequestResetForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Get a password-reset link for your BNHG community account.",
  robots: { index: false, follow: false },
};

export default function RequestResetPage() {
  return (
    <section className="bg-cream pt-32 md:pt-40 pb-20 md:pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
            Reset password
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
            Forgot your password?
          </h1>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Enter your email and we&rsquo;ll send a reset link. The link expires
            in 30 minutes.
          </p>
        </div>

        <RequestResetForm />

        <p className="text-center font-sans text-sm text-charcoal/70 mt-8">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
