"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users, Sparkles, Bell } from "lucide-react";
import PushOptInButton from "@/components/PushOptInButton";
import { LANES, type LaneId } from "@/lib/lanes";

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

export interface SavedToolSummary {
  slug: string;
  name: string;
  blurb: string;
  lane: LaneId;
}

interface AccountDashboardProps {
  initialUser: Session;
  enrollments: EnrollmentSummary[];
  /** Most recently used first, already capped by the server. */
  savedTools: SavedToolSummary[];
  savedToolsTotal: number;
}

// Lane order for the grouped shelf. Fixed rather than derived so the sections
// don't reshuffle as the member saves things.
const LANE_ORDER: LaneId[] = ["coliving", "boutique", "fleet"];

const TIER_LABEL: Record<EnrollmentSummary["tier"], string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator (1:1)",
  comp: "Complimentary",
};

export default function AccountDashboard({
  initialUser,
  enrollments,
  savedTools,
  savedToolsTotal,
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

      <UserPanels
        enrollments={enrollments}
        savedTools={savedTools}
        savedToolsTotal={savedToolsTotal}
      />
    </div>
  );
}

function UserPanels({
  enrollments,
  savedTools,
  savedToolsTotal,
}: {
  enrollments: EnrollmentSummary[];
  savedTools: SavedToolSummary[];
  savedToolsTotal: number;
}) {
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
            href="/resources"
            className="font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark inline-flex items-center gap-1.5"
          >
            Browse all tools
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {savedToolsTotal === 0 ? (
          <EmptyState
            title="Nothing saved yet."
            body="Start filling in any free tool and it lands here automatically, or hit 'Add to my dashboard' on a card in the resource library."
            ctaLabel="Browse the library"
            ctaHref="/resources"
          />
        ) : (
          <>
            {LANE_ORDER.map((lane) => {
              const tools = savedTools.filter((t) => t.lane === lane);
              if (tools.length === 0) return null;
              return (
                <div key={lane} className="mb-7 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    {/* Full-strength accent is fine on a mark this small; see
                        the area/saturation rule in src/lib/lanes.ts. */}
                    <span
                      aria-hidden
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ background: LANES[lane].accent }}
                    />
                    <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/70">
                      {LANES[lane].name}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tools.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/resources/${t.slug}`}
                        className="block bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/40 transition-colors group"
                      >
                        <h3 className="font-display text-lg font-semibold text-deep-teal leading-tight mb-2 group-hover:text-warm-gold transition-colors">
                          {t.name}
                        </h3>
                        <p className="font-sans text-sm text-charcoal/75 leading-relaxed">
                          {t.blurb}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <Link
              href="/account/resources"
              className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
            >
              {savedToolsTotal > savedTools.length
                ? `View all ${savedToolsTotal}`
                : "Manage your resources"}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </>
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

      <section className="mb-10">
        <div className="bg-white border border-light-gray rounded-lg p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary-green mt-0.5 shrink-0" aria-hidden />
            <div>
              <h3 className="font-display text-lg font-semibold text-deep-teal">
                Push notifications
              </h3>
              <p className="font-sans text-sm text-charcoal/75 leading-relaxed mt-1 max-w-md">
                Get notified the moment a new lesson drops or a live session
                starts. Install the app to your home screen for the best
                experience.
              </p>
            </div>
          </div>
          <PushOptInButton className="inline-flex items-center justify-center gap-2 bg-primary-green text-white hover:bg-primary-green-dark font-sans font-semibold tracking-wide rounded-lg px-6 py-3 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" />
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
