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
    cadence: "8-week guided",
    featured: true,
  },
  {
    name: "Operator",
    slug: "operator",
    price: "$7,497",
    cadence: "90-day 1:1 with Della",
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
    label: "8-week guided cohort",
    values: [false, true, true],
  },
  {
    label: "Weekly live cohort sessions",
    values: [false, true, true],
  },
  {
    label: "12 1:1 sessions with Della",
    values: [false, false, "90 days"],
  },
  {
    label: "Seats per cycle",
    values: ["Open", "Open", "Capped at 5"],
  },
];

export default function TierComparison() {
  const [openTier, setOpenTier] = useState<number | null>(null);
  const activeTier = openTier !== null ? TIERS[openTier] : null;

  return (
    <>
      {/* Mobile: stacked tier cards. The 4-column comparison grid does not
          fit on phones at any usable column width, so each tier becomes its
          own card showing the full feature list as a definition list. */}
      <AnimatedItem>
        <div className="md:hidden space-y-5">
          {TIERS.map((t, i) => (
            <div
              key={t.name}
              className={[
                "bg-white border rounded-lg overflow-hidden shadow-sm",
                t.featured ? "border-warm-gold" : "border-light-gray",
              ].join(" ")}
            >
              <div
                className={[
                  "px-5 py-5 text-center",
                  t.featured ? "bg-warm-gold/10" : "",
                ].join(" ")}
              >
                {t.featured && (
                  <p className="font-sans text-[10px] font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
                    Most popular
                  </p>
                )}
                <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight">
                  {t.name}
                </h3>
                <p className="font-display text-4xl font-semibold text-charcoal mt-2 mb-1">
                  {t.price}
                </p>
                <p className="font-sans text-sm text-charcoal/65 italic leading-tight">
                  {t.cadence}
                </p>
              </div>

              <dl className="divide-y divide-light-gray">
                {COMPARISON.map((row) => {
                  const value = row.values[i];
                  return (
                    <div
                      key={row.label}
                      className="px-5 py-3 flex items-center justify-between gap-4"
                    >
                      <dt className="font-sans text-sm font-semibold text-deep-teal flex-1">
                        {row.label}
                      </dt>
                      <dd className="text-right">
                        {value === true ? (
                          <span
                            aria-label="included"
                            className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-teal/10 inline-flex items-center justify-center"
                          >
                            <Check
                              className="w-3.5 h-3.5 text-deep-teal"
                              strokeWidth={3}
                              aria-hidden
                            />
                          </span>
                        ) : value === false ? (
                          <span
                            aria-label="not included"
                            className="font-display text-xl text-charcoal/25 leading-none"
                          >
                            &ndash;
                          </span>
                        ) : (
                          <span className="font-sans text-sm text-charcoal leading-tight">
                            {value}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <div
                className={[
                  "px-5 py-4 border-t border-light-gray",
                  t.featured ? "bg-warm-gold/5" : "bg-cream/40",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setOpenTier(i)}
                  className={[
                    "w-full inline-flex items-center justify-center rounded-lg",
                    "font-sans text-sm font-semibold tracking-wide",
                    "px-4 py-3 min-h-[48px] transition-all duration-200",
                    "border-2",
                    t.featured
                      ? "bg-warm-gold text-near-black border-warm-gold hover:bg-warm-gold-dark hover:border-warm-gold-dark shadow-sm"
                      : "bg-transparent text-deep-teal border-deep-teal hover:bg-deep-teal hover:text-white",
                  ].join(" ")}
                >
                  Join the waitlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </AnimatedItem>

      {/* Desktop ≥ md: the existing 4-column comparison grid. */}
      <AnimatedItem>
        <div className="hidden md:block">
          <div
            role="table"
            aria-label="Compare the 3 tiers"
            className="bg-white border border-light-gray rounded-lg overflow-hidden shadow-sm"
          >
            {/* Header row */}
            <div
              role="row"
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-light-gray"
            >
              <div
                role="columnheader"
                className="p-8"
                aria-hidden
              />
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  role="columnheader"
                  className={[
                    "p-8 text-center border-l border-light-gray",
                    t.featured ? "bg-warm-gold/10 relative" : "",
                  ].join(" ")}
                >
                  {t.featured && (
                    <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
                      Most popular
                    </p>
                  )}
                  <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight">
                    {t.name}
                  </h3>
                  <p className="font-display text-4xl font-semibold text-charcoal mt-2 mb-2">
                    {t.price}
                  </p>
                  <p className="font-sans text-sm text-charcoal/65 italic leading-tight">
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
                  className="p-6 font-sans text-base font-semibold text-deep-teal flex items-center"
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
                        "p-6 text-center flex items-center justify-center border-l border-light-gray",
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
                          &ndash;
                        </span>
                      ) : (
                        <span className="font-sans text-base text-charcoal leading-tight">
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
                className="p-6 font-sans text-xs font-semibold tracking-[0.3em] uppercase text-charcoal/55 flex items-center"
              >
                Reserve a seat
              </div>
              {TIERS.map((t, i) => (
                <div
                  key={t.name}
                  role="cell"
                  className={[
                    "p-5 border-l border-light-gray flex items-stretch",
                    t.featured ? "bg-warm-gold/5" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setOpenTier(i)}
                    className={[
                      "w-full inline-flex items-center justify-center rounded-lg",
                      "font-sans text-sm font-semibold tracking-wide",
                      "px-4 py-3 transition-all duration-200",
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
