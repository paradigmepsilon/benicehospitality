"use client";

import { Check } from "lucide-react";
import { AnimatedItem } from "@/components/ui/AnimatedSection";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import CrrFoundingBuyButton from "@/components/sections/courses/CrrFoundingBuyButton";
import { CRR } from "@/lib/car-rental-riches";

type CompareValue = boolean | string;

interface Tier {
  name: string;
  cadence: string;
  featured: boolean;
  priceLabel: string;
  priceNote?: string;
  /** Founding presale is buyable today; the other tiers stay waitlist. */
  buyable: boolean;
}

const TIERS: readonly Tier[] = [
  {
    name: "Self-paced",
    cadence: "On your timeline",
    featured: true,
    priceLabel: `$${CRR.foundingPriceUsd} founding`,
    priceNote: `$${CRR.retailPriceUsd} at doors-open`,
    buyable: true,
  },
  {
    name: "Cohort",
    cadence: "8-week guided",
    featured: false,
    priceLabel: "Pricing TBA",
    buyable: false,
  },
  {
    name: "Operator",
    cadence: "90-day 1:1 with Alex",
    featured: false,
    priceLabel: "Pricing TBA",
    buyable: false,
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
    label: "Bonus Pack: Direct Booking & AI Visibility for Fleet",
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
    label: "12 1:1 sessions with Alex",
    values: [false, false, "90 days"],
  },
  {
    label: "Seats per cycle",
    values: ["Open", "Open", "Capped at 5"],
  },
];

export default function CarRentalRichesTierPreview() {
  return (
    <>
      {/* Mobile: stacked tier cards. */}
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
                    Founding open now
                  </p>
                )}
                <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight">
                  {t.name}
                </h3>
                <p className="font-display text-3xl font-semibold text-charcoal mt-2 mb-1">
                  {t.priceLabel}
                </p>
                {t.priceNote && (
                  <p className="font-sans text-xs text-charcoal/55 mb-1">
                    {t.priceNote}
                  </p>
                )}
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
                {t.buyable ? (
                  <CrrFoundingBuyButton
                    source="tiers-mobile"
                    fullWidth
                    label={`Join founding — $${CRR.foundingPriceUsd}`}
                  />
                ) : (
                  <CarRentalRichesWaitlistTrigger
                    variant="secondary"
                    size="md"
                    fullWidth
                  >
                    Join the waitlist
                  </CarRentalRichesWaitlistTrigger>
                )}
              </div>
            </div>
          ))}
        </div>
      </AnimatedItem>

      {/* Desktop ≥ md: 4-column comparison grid. */}
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
              <div role="columnheader" className="p-8" aria-hidden />
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
                      Founding open now
                    </p>
                  )}
                  <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight">
                    {t.name}
                  </h3>
                  <p className="font-display text-3xl font-semibold text-charcoal mt-2 mb-2">
                    {t.priceLabel}
                  </p>
                  {t.priceNote && (
                    <p className="font-sans text-xs text-charcoal/55 mb-2">
                      {t.priceNote}
                    </p>
                  )}
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
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  role="cell"
                  className={[
                    "p-5 border-l border-light-gray flex items-stretch",
                    t.featured ? "bg-warm-gold/5" : "",
                  ].join(" ")}
                >
                  {t.buyable ? (
                    <CrrFoundingBuyButton
                      source="tiers-desktop"
                      fullWidth
                      label={`Join founding — $${CRR.foundingPriceUsd}`}
                    />
                  ) : (
                    <CarRentalRichesWaitlistTrigger
                      variant="secondary"
                      size="md"
                      fullWidth
                    >
                      Join the waitlist
                    </CarRentalRichesWaitlistTrigger>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedItem>
    </>
  );
}
