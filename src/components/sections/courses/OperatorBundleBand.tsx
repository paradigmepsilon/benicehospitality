import { OPERATOR_BUNDLE } from "@/lib/operator-bundle";
import { RRR_PRICES } from "@/lib/room-rental-riches";
import { CRR } from "@/lib/car-rental-riches";
import OperatorBundleBuyButton from "@/components/sections/courses/OperatorBundleBuyButton";

/**
 * "Both courses, one price" band. Server component; the page renders it only
 * when isOperatorBundleOpen() is true, so an unset Stripe Price means the
 * band never appears.
 */
export default function OperatorBundleBand({ source }: { source: string }) {
  return (
    <section className="bg-cream px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl rounded-lg border-2 border-warm-gold bg-white p-8 md:p-10">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3">
          {OPERATOR_BUNDLE.name}
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-4">
          Both courses. One price.
        </h2>
        <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed mb-6">
          Room Rental Riches with Della and Car Rental Riches with Alex, both
          self-paced, both with lifetime access and every future module. Bought
          separately they are ${RRR_PRICES.selfPacedUsd} and ${CRR.retailPriceUsd}.
        </p>
        <p className="font-display text-4xl font-semibold text-charcoal mb-6">
          <span className="text-charcoal/40 line-through text-2xl mr-3">
            ${OPERATOR_BUNDLE.separateUsd}
          </span>
          ${OPERATOR_BUNDLE.priceUsd}
        </p>
        <OperatorBundleBuyButton source={source} />
        <p className="font-sans text-xs text-charcoal/50 mt-6">
          30-day unconditional money-back guarantee. Educational content only,
          not financial, legal, tax, or insurance advice. Earnings figures are
          illustrative, not a promise of results.
        </p>
      </div>
    </section>
  );
}
