"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users, Sparkles } from "lucide-react";

interface Session {
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface EnrollmentSummary {
  id: number;
  tier: "self-paced" | "cohort" | "operator" | "comp";
  course: {
    slug: string;
    title: string;
    summary: string;
  };
  totalLessons: number;
  completedLessons: number;
}

interface AccountDashboardProps {
  initialUser: Session;
  enrollments: EnrollmentSummary[];
}

const PLACEHOLDER_RESOURCES = [
  {
    name: "Direct Booking Snapshot",
    summary: "Your most recent run is from 12 days ago.",
    href: "/resources",
  },
];

const TIER_LABEL: Record<EnrollmentSummary["tier"], string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator (1:1)",
  comp: "Complimentary",
};

export default function AccountDashboard({
  initialUser,
  enrollments,
}: AccountDashboardProps) {
  const session = initialUser;
  const displayName = session.name || session.email.split("@")[0];

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
          Your Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight">
          Welcome back, {displayName}.
        </h1>
        <p className="font-sans text-base text-charcoal/80 leading-relaxed mt-3 max-w-2xl">
          Pick up where you left off. Your courses, resources, and the Nice
          Host Network are all 1 click in.
        </p>
      </header>

      <UserPanels enrollments={enrollments} />
    </div>
  );
}

function UserPanels({ enrollments }: { enrollments: EnrollmentSummary[] }) {
  return (
    <>
      <section className="mb-10">
        <div className="flex items-end justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-green" aria-hidden />
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight">
              Your courses
            </h2>
          </div>
          <Link
            href="/account/courses/browse"
            className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark inline-flex items-center gap-1.5"
          >
            Browse all
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            title="You're not enrolled yet."
            body="Pick a tier of Room Rental Riches to get started, or sit in on a Nice Host Network session as a guest."
            ctaLabel="See the courses"
            ctaHref="/account/courses/browse"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrollments.map((e) => {
              const pct =
                e.totalLessons > 0
                  ? Math.round((e.completedLessons / e.totalLessons) * 100)
                  : 0;
              return (
                <article
                  key={e.id}
                  className="bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/40 transition-colors"
                >
                  <p className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-warm-gold mb-2">
                    {TIER_LABEL[e.tier]}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-deep-teal leading-tight mb-3">
                    {e.course.title}
                  </h3>
                  <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-warm-gold"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="font-sans text-xs text-charcoal/60 mb-4">
                    {pct}% complete · {e.completedLessons} of{" "}
                    {e.totalLessons} lesson
                    {e.totalLessons === 1 ? "" : "s"}
                  </p>
                  <Link
                    href={`/account/courses/${e.course.slug}`}
                    className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
                  >
                    {e.completedLessons === 0 ? "Start" : "Resume"}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-end justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-green" aria-hidden />
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight">
              Your resources
            </h2>
          </div>
          <Link
            href="/account/resources"
            className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark inline-flex items-center gap-1.5"
          >
            Browse the library
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {PLACEHOLDER_RESOURCES.length === 0 ? (
          <EmptyState
            title="No saved resources yet."
            body="Run a Labs diagnostic, save a template, or unlock the Labs Pass to surface them here."
            ctaLabel="Browse the library"
            ctaHref="/account/resources"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLACEHOLDER_RESOURCES.map((r) => (
              <Link
                key={r.name}
                href={r.href}
                className="block bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/40 transition-colors group"
              >
                <h3 className="font-display text-lg font-semibold text-deep-teal leading-tight mb-2 group-hover:text-warm-gold transition-colors">
                  {r.name}
                </h3>
                <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                  {r.summary}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="bg-primary-green text-white rounded-lg p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-warm-gold" aria-hidden />
              <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold">
                The Nice Host Network
              </p>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold leading-tight mb-3">
              Tuesday workshop · Thursday hot seats.
            </h3>
            <p className="font-sans text-base text-white/85 leading-relaxed">
              2 live sessions a week, 47 weeks a year. Drop in,
              bring a real situation, leave with the next move.
            </p>
          </div>
          <Link
            href="/account/community"
            className="inline-flex items-center gap-2 bg-warm-gold text-near-black hover:bg-warm-gold-dark border-2 border-warm-gold hover:border-warm-gold-dark font-sans font-semibold tracking-wide rounded-lg px-7 py-3.5 transition-colors whitespace-nowrap"
          >
            View the schedule
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="bg-white border border-dashed border-light-gray rounded-lg p-8 text-center">
      <h3 className="font-display text-xl font-semibold text-deep-teal mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-5 max-w-md mx-auto">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  );
}
