import Link from "next/link";
import {
  SCORECARD_MAX_SCORE,
  SCORECARD_SECTIONS,
  type ScorecardSectionId,
} from "@/lib/scorecard/questions";
import type { ScorecardBand } from "@/lib/scorecard/score";
import PrintButton from "./PrintButton";

const BAND_META: Record<
  ScorecardBand,
  {
    label: string;
    barColor: string;
    tagBg: string;
    tagText: string;
    summary: string;
    ctaHeadline: string;
    ctaBody: string;
    ctaHref: string;
    ctaLabel: string;
  }
> = {
  high: {
    label: "High Viability",
    barColor: "bg-primary-green",
    tagBg: "bg-primary-green/10",
    tagText: "text-primary-green",
    summary:
      "This is a strong co-living candidate. Your work now is sharpening what already works and locking in the few gaps below before launch.",
    ctaHeadline: "Worth a strategy call.",
    ctaBody:
      "If you want a second set of eyes on positioning, pricing, or launch sequencing, Della and team run free 30-minute calls.",
    ctaHref: "/book",
    ctaLabel: "Book a Strategy Call",
  },
  moderate: {
    label: "Moderate Viability",
    barColor: "bg-warm-gold",
    tagBg: "bg-warm-gold/15",
    tagText: "text-warm-gold",
    summary:
      "This property can work for co-living with some targeted upgrades. Below, the fix list is ordered by section weight so you can attack the highest-ROI items first.",
    ctaHeadline: "Want a deeper read?",
    ctaBody:
      "Our free Tier 0 Comprehensive Audit goes deeper on revenue, reputation, and tech stack across your whole operation.",
    ctaHref: "/audit/request",
    ctaLabel: "Request a Tier 0 Audit",
  },
  low: {
    label: "Low Viability",
    barColor: "bg-terracotta",
    tagBg: "bg-terracotta/10",
    tagText: "text-terracotta",
    summary:
      "This property needs significant work before it pencils for co-living. Read the gaps below carefully. Some are fixable for a few thousand dollars. Others (zoning, HOA) may be deal-breakers.",
    ctaHeadline: "Start with the playbook.",
    ctaBody:
      "Della's Room Rental Riches course walks through co-living setup end to end. The Module 2 lessons on legal and zoning are the most directly relevant to a low score.",
    ctaHref: "/education",
    ctaLabel: "See the Course",
  },
};

export interface ScorecardReportProps {
  propertyNickname: string;
  overallScore: number;
  band: ScorecardBand;
  sectionScores: Record<ScorecardSectionId, number>;
  answers: Record<string, boolean>;
  createdAt: string;
}

export default function ScorecardReport({
  propertyNickname,
  overallScore,
  band,
  sectionScores,
  answers,
  createdAt,
}: ScorecardReportProps) {
  const meta = BAND_META[band];
  const overallPct = (overallScore / SCORECARD_MAX_SCORE) * 100;
  const createdLabel = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="scorecard-report bg-off-white">
      {/* Hero */}
      <section className="bg-near-black text-white py-16 sm:py-20 px-6 print:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
            <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold">
              Co-living Property Calculator
            </p>
            <p className="font-sans text-xs text-white/50 tabular-nums">
              Scored {createdLabel}
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-white leading-tight mb-3">
            {propertyNickname}
          </h1>
          <div className="flex flex-wrap items-end gap-6 mt-8">
            <div>
              <p className="font-display text-6xl sm:text-7xl font-semibold text-white leading-none tabular-nums">
                {Math.round(overallPct)}
                <span className="font-sans text-xl text-white/50 font-medium ml-1">
                  %
                </span>
              </p>
            </div>
            <span
              className={`inline-block ${meta.tagBg} ${meta.tagText} font-sans text-sm font-semibold px-3.5 py-1.5 rounded-md`}
            >
              {meta.label}
            </span>
          </div>
          <p className="font-sans text-base sm:text-lg text-white/80 leading-relaxed mt-6 max-w-2xl">
            {meta.summary}
          </p>
          <div className="mt-8 max-w-md print:hidden">
            <div className="flex items-center gap-3">
              <PrintButton />
              <Link
                href="/resources/co-living-property-calculator"
                className="font-sans text-sm font-semibold text-white/70 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Score another property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section bars */}
      <section className="py-16 sm:py-20 px-6 bg-off-white print:py-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black leading-tight mb-2">
            Section breakdown
          </h2>
          <p className="font-sans text-sm text-charcoal/70 mb-8 max-w-2xl">
            Each percentage is how much of that section your property covers.
            Your overall percentage weighs Operations and Location more than
            Community and Legal, so the overall is not a simple average of the
            7.
          </p>
          <div className="space-y-5">
            {SCORECARD_SECTIONS.map((section) => {
              const score = sectionScores[section.id] ?? 0;
              const pct = (score / section.weight) * 100;
              return (
                <div key={section.id}>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="font-display text-lg font-semibold text-near-black">
                      {section.label}
                    </h3>
                    <p className="font-sans text-sm font-semibold text-near-black tabular-nums">
                      {Math.round(pct)}%
                    </p>
                  </div>
                  <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.barColor} rounded-full`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Overall bar */}
            <div className="pt-4 mt-4 border-t border-light-gray">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="font-display text-lg font-semibold text-near-black">
                  Overall
                </h3>
                <p className="font-sans text-sm font-semibold text-near-black tabular-nums">
                  {Math.round(overallPct)}%
                </p>
              </div>
              <div className="h-3 bg-light-gray rounded-full overflow-hidden">
                <div
                  className={`h-full ${meta.barColor} rounded-full`}
                  style={{ width: `${Math.max(2, overallPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-16 sm:py-20 px-6 bg-white print:py-8 print:break-before-page">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black leading-tight mb-2">
            What to fix, by section
          </h2>
          <p className="font-sans text-sm text-charcoal/70 mb-8 max-w-2xl">
            Every item you left unchecked, with a specific recommendation.
            Sections that move the overall percentage most are first.
          </p>

          <div className="space-y-10">
            {SCORECARD_SECTIONS.map((section) => {
              const gaps = section.questions.filter((q) => !answers[q.id]);
              if (gaps.length === 0) {
                return (
                  <div
                    key={section.id}
                    className="border-l-2 border-primary-green pl-5 py-1"
                  >
                    <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-primary-green mb-1">
                      {section.label}
                    </p>
                    <p className="font-display text-lg font-semibold text-near-black leading-snug">
                      No gaps. This section is fully checked.
                    </p>
                  </div>
                );
              }
              return (
                <div
                  key={section.id}
                  className="print:break-inside-avoid"
                >
                  <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-warm-gold mb-2">
                    {section.label} · {gaps.length} gap
                    {gaps.length === 1 ? "" : "s"}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-near-black leading-tight mb-4">
                    {section.blurb}
                  </h3>
                  <ul className="space-y-4">
                    {gaps.map((q) => (
                      <li
                        key={q.id}
                        className="border-l-2 border-terracotta/60 pl-5 py-1"
                      >
                        <p className="font-sans text-sm font-semibold text-near-black mb-1">
                          {q.text}
                        </p>
                        <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
                          {q.recommendation}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-6 bg-near-black text-white print:hidden">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
            Recommended next move
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight mb-5">
            {meta.ctaHeadline}
          </h2>
          <p className="font-sans text-base text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
            {meta.ctaBody}
          </p>
          <Link
            href={meta.ctaHref}
            className="inline-flex items-center justify-center bg-warm-gold hover:bg-warm-gold/90 text-near-black font-semibold px-7 py-3.5 rounded-md transition-colors"
          >
            {meta.ctaLabel}
          </Link>
        </div>
      </section>

      <style>{`
        @media print {
          @page { margin: 12mm; }
          .scorecard-report { background: white !important; }
          body { background: white !important; }
        }
      `}</style>
    </article>
  );
}
