import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/sections/auth/OnboardingForm";
import {
  getCurrentSession,
  getUserProfile,
  isUserOnboarded,
} from "@/lib/community-auth";

export const metadata: Metadata = {
  title: "Welcome — finish your setup",
  description: "Tell us a little about why you're here.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=%2Fonboarding");
  }
  // Admins never go through intake. Send them home if they wander in.
  if (session.user.role === "admin") {
    redirect("/admin");
  }
  // Don't let someone replay the form after they've already finished.
  if (await isUserOnboarded(session.user.id)) {
    redirect("/account");
  }

  // Pre-fill phone + interests for password-signup users (who supplied them
  // at /signup). Google users will have an empty profile here.
  const profile = await getUserProfile(session.user.id);
  const { welcome } = await searchParams;
  const isFreshSignup = welcome === "signup";

  return (
    <section className="px-6 pt-12 md:pt-16 pb-20 md:pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
            One quick step
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-4">
            {isFreshSignup
              ? `Welcome, ${session.user.name.split(" ")[0]}.`
              : "Tell us about yourself."}
          </h1>
          <p className="font-sans text-base text-charcoal leading-relaxed">
            A couple of questions so we can point you to the right resources.
            All of it is optional except the area(s) you&rsquo;re interested in.
          </p>
        </div>

        <OnboardingForm
          userName={session.user.name}
          initial={{
            phone: profile?.phone ?? "",
            serviceInterests: profile?.serviceInterests ?? [],
          }}
        />
      </div>
    </section>
  );
}
