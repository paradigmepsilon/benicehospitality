import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/sections/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <section className="bg-cream pt-32 md:pt-40 pb-20 md:pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
            Reset password
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
            Set a new password.
          </h1>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            Pick something you haven&rsquo;t used elsewhere. At least ten
            characters.
          </p>
        </div>

        <ResetPasswordForm token={token} />

        <p className="text-center font-sans text-sm text-charcoal/70 mt-8">
          Need a new link?{" "}
          <Link
            href="/login/reset"
            className="font-semibold text-primary-green hover:text-primary-green-dark"
          >
            Request another
          </Link>
        </p>
      </div>
    </section>
  );
}
