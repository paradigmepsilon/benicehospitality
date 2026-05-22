import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { getViewerContext } from "@/lib/preview";
import {
  listEnrollmentsForUser,
  synthesizeEnrollmentsForTier,
} from "@/lib/lms";

export const metadata: Metadata = {
  title: "Your courses",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  "self-paced": "Self-paced",
  cohort: "Cohort",
  operator: "Operator (1:1)",
  comp: "Complimentary",
};

export default async function CoursesIndexPage() {
  const ctx = await getViewerContext();
  if (!ctx) redirect("/login?next=%2Faccount%2Fcourses");

  // Tier-preview shows every published course at the previewed tier.
  // God view + real members fall back to real enrollment rows.
  const enrollments =
    ctx.effectiveTier !== null
      ? await synthesizeEnrollmentsForTier(ctx.effectiveTier)
      : await listEnrollmentsForUser(ctx.userId);

  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between mb-8 gap-3">
        <div>
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-3">
            Your learning
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight">
            Your courses
          </h1>
          <p className="font-sans text-base text-charcoal/85 leading-relaxed mt-3 max-w-2xl">
            Everything you&rsquo;re enrolled in. Pick up where you left off, or
            browse the catalog for the next tier.
          </p>
        </div>
        <Link
          href="/account/courses/browse"
          className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark whitespace-nowrap"
        >
          Browse catalog
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-10 text-center">
          <BookOpen
            className="w-6 h-6 text-charcoal/40 mx-auto mb-3"
            aria-hidden
          />
          <h2 className="font-display text-xl font-semibold text-deep-teal mb-2">
            You&rsquo;re not enrolled yet.
          </h2>
          <p className="font-sans text-sm text-charcoal/70 mb-5 max-w-md mx-auto">
            Pick a tier of Room Rental Riches to get started, or sit in on a
            Nice Host Network session as a guest.
          </p>
          <Link
            href="/account/courses/browse"
            className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            See the courses
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
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
                  {TIER_LABEL[e.tier] ?? e.tier}
                </p>
                <h2 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-2">
                  {e.course.title}
                </h2>
                <p className="font-sans text-sm text-charcoal/75 leading-relaxed mb-4">
                  {e.course.summary}
                </p>
                <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-warm-gold"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="font-sans text-xs text-charcoal/60 mb-4">
                  {pct}% complete · {e.completedLessons} of {e.totalLessons}{" "}
                  lesson{e.totalLessons === 1 ? "" : "s"}
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
    </div>
  );
}
