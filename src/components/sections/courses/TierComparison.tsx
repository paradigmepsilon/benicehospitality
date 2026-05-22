"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatedItem } from "@/components/ui/AnimatedSection";
import WaitlistModal from "@/components/sections/courses/WaitlistModal";
import type { WaitlistTier } from "@/lib/validation/waitlist";

type CompareValue = boolean | string;

interface Tier {
  name: string;
  slug: WaitlistTier;
  price: string;
  cadence: string;
  featured: boolean;
}

const TIERS: readonly Tier[] = [
  {
    name: "Self-paced",
    slug: "self_paced",
    price: "$497",
    cadence: "On your timeline",
    featured: false,
  },
  {
    name: "Cohort",
    slug: "cohort",
    price: "$2,497",
    cadence: "Eight-week guided",
    featured: true,
  },
  {
    name: "Operator",
    slug: "operator",
    price: "$7,497",
    cadence: "Ninety-day 1:1 with Della",
    featured: false,
  },
] as const;

const COMPARISON: Array<{
  label: string;
  values: [CompareValue, CompareValue, CompareValue];
}> = [
  {
    label: "Full 12-module curriculum",
    values: [true, true, true],
  },
  {
    label: "Bonus Pack: Direct Booking & AI Visibility",
    values: ["Intro (4 lessons)", "Full deep dive", "Full deep dive"],
  },
  {
    label: "Lifetime course access",
    values: [true, true, true],
  },
  {
    label: "Nice Host Network community",
    values: ["1 year", "1 year", "Lifetime"],
  },
  {
    label: "Eight-week guided cohort",
    values: [false, true, true],
  },
  {
    label: "Weekly live cohort sessions",
    values: [false, true, true],
  },
  {
    label: "Twelve 1:1 sessions with Della",
    values: [false, false, "Ninety days"],
  },
  {
    label: "Seats per cycle",
    values: ["Open", "Open", "Capped at five"],
  },
];

export default function TierComparison() {
  const [openTier, setOpenTier] = useState<number | null>(null);
  const activeTier = openTier !== null ? TIERS[openTier] : null;

  return (
    <>
      <AnimatedItem>
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <div
            role="table"
            aria-label="Compare the three tiers"
            className="min-w-[760px] bg-white border border-light-gray rounded-lg overflow-hidden shadow-sm"
          >
            {/* Header row */}
            <div
              role="row"
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-light-gray"
            >
              <div
                role="columnheader"
                className="hidden md:block p-6 md:p-8"
                aria-hidden
              />
              <div
                role="columnheader"
                className="md:hidden p-6 font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/55"
              >
                What you get
              </div>
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  role="columnheader"
                  className={[
                    "p-6 md:p-8 text-center border-l border-light-gray",
                    t.featured ? "bg-warm-gold/10 relative" : "",
                  ].join(" ")}
                >
                  {t.featured && (
                    <p className="font-sans text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
                      Most popular
                    </p>
                  )}
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight">
                    {t.name}
                  </h3>
                  <p className="font-display text-3xl md:text-4xl font-semibold text-charcoal mt-2 mb-2">
                    {t.price}
                  </p>
                  <p className="font-sans text-xs md:text-sm text-charcoal/65 italic leading-tight">
                    {t.cadence}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {COMPARISON.map((row) => (
              <div
                key={row.label}
                role="row"
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-light-gray"
              >
                <div
                  role="rowheader"
                  className="p-4 md:p-6 font-sans text-sm md:text-base font-semibold text-deep-teal flex items-center"
                >
                  {row.label}
                </div>
                {row.values.map((value, i) => {
                  const tier = TIERS[i];
                  return (
                    <div
                      key={tier.name}
                      role="cell"
                      className={[
                        "p-4 md:p-6 text-center flex items-center justify-center border-l border-light-gray",
                        tier.featured ? "bg-warm-gold/5" : "",
                      ].join(" ")}
                    >
                      {value === true ? (
                        <span
                          aria-label="included"
                          className="flex-shrink-0 w-7 h-7 rounded-full bg-deep-teal/10 flex items-center justify-center"
                        >
                          <Check
                            className="w-4 h-4 text-deep-teal"
                            strokeWidth={3}
                            aria-hidden
                          />
                        </span>
                      ) : value === false ? (
                        <span
                          aria-label="not included"
                          className="font-display text-2xl text-charcoal/25 leading-none"
                        >
                          &mdash;
                        </span>
                      ) : (
                        <span className="font-sans text-sm md:text-base text-charcoal leading-tight">
                          {value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* CTA row: Join the waitlist */}
            <div
              role="row"
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-cream/40"
            >
              <div
                role="rowheader"
                className="hidden md:flex p-4 md:p-6 font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/55 items-center"
              >
                Reserve a seat
              </div>
              <div
                role="rowheader"
                className="md:hidden p-4 font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/55 flex items-center"
              >
                Reserve a seat
              </div>
              {TIERS.map((t, i) => (
                <div
                  key={t.name}
                  role="cell"
                  className={[
                    "p-3 md:p-5 border-l border-light-gray flex items-stretch",
                    t.featured ? "bg-warm-gold/5" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setOpenTier(i)}
                    className={[
                      "w-full inline-flex items-center justify-center rounded-lg",
                      "font-sans text-xs md:text-sm font-semibold tracking-wide",
                      "px-3 py-2.5 md:px-4 md:py-3 transition-all duration-200",
                      "border-2",
                      t.featured
                        ? "bg-warm-gold text-near-black border-warm-gold hover:bg-warm-gold-dark hover:border-warm-gold-dark shadow-sm"
                        : "bg-transparent text-deep-teal border-deep-teal hover:bg-deep-teal hover:text-white",
                    ].join(" ")}
                  >
                    Join the waitlist
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedItem>

      {activeTier && (
        <WaitlistModal
          open={openTier !== null}
          onClose={() => setOpenTier(null)}
          tier={{ name: activeTier.name, slug: activeTier.slug }}
        />
      )}
    </>
  );
}
