import type { ReactNode } from "react";
import { ONBOARDING_STEPS } from "@/components/sections/management/ManagementOffer";

interface OnboardingTimelineProps {
  label?: string;
  heading?: ReactNode;
  lede?: ReactNode;
}

/**
 * The six onboarding steps as one timeline inside a dark rounded panel. On
 * wide screens the steps run left to right along a gold line, each with a
 * numbered disc; on narrow screens the same line runs top to bottom. Order
 * only, never duration: no named timeline exists until BNHG has seen the
 * asset, and the copy says so.
 */
export default function OnboardingTimeline({
  label = "How it works",
  heading = "From apply to live.",
  lede = (
    <>
      Every application, either asset, moves through the same six steps. No
      named timeline until we&rsquo;ve seen the asset.
    </>
  ),
}: OnboardingTimelineProps) {
  return (
    <section className="bg-white px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden rounded-panel bg-near-black text-white p-7 sm:p-10 md:p-12 lg:p-14">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end mb-10 md:mb-14">
            <div>
              <p className="font-sans text-base md:text-lg font-semibold text-warm-gold-dark mb-4">
                {label}
              </p>
              <h2 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-semibold leading-[1.02] tracking-tight text-balance">
                {heading}
              </h2>
            </div>
            <p className="font-sans text-lg text-white/75 leading-snug lg:max-w-md lg:justify-self-end">
              {lede}
            </p>
          </div>

          <ol className="relative grid gap-8 lg:grid-cols-6 lg:gap-6">
            {/* The line the discs sit on: vertical on narrow screens, horizontal on wide. */}
            <span
              aria-hidden
              className="absolute left-5 top-2 bottom-2 w-px bg-warm-gold/50 lg:left-0 lg:right-0 lg:top-5 lg:bottom-auto lg:h-px lg:w-auto"
            />
            {ONBOARDING_STEPS.map((s, i) => (
              <li key={s.step} className="relative pl-16 lg:pl-0 lg:pt-16">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 lg:left-0 lg:top-0 w-10 h-10 rounded-full bg-warm-gold text-near-black font-display text-lg font-semibold flex items-center justify-center ring-4 ring-near-black"
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-xl md:text-2xl font-semibold leading-tight">
                  {s.step}
                </h3>
                <p className="font-sans text-[15px] text-white/75 leading-snug mt-2">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
