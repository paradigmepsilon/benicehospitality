/**
 * PriceAnchor — the "cost of one lost claim vs. the price of the kit" contrast.
 * Makes $97 feel free by putting it next to the real number it protects.
 *
 * The claim-cost figures are realistic Turo damage ranges, not invented proof,
 * so they don't need swapping — but confirm they still match Turo's deductible
 * tiers when you re-verify policy. Marked PLACEHOLDER only where a real number
 * would sharpen it further.
 */
export default function PriceAnchor() {
  return (
    <section className="bg-deep-teal px-6 md:px-12 lg:px-20 py-14 md:py-18">
      <div className="max-w-4xl mx-auto">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-gold-light mb-4 text-center">
          The math nobody does before it happens
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight mb-10 md:mb-14 text-center">
          One claim you lose costs more than the whole system. Every time.
        </h2>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-4 items-stretch">
          {/* The loss */}
          <div className="bg-near-black/40 border border-white/10 rounded-2xl p-8 text-center flex flex-col justify-center">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-3">
              One bad claim, undocumented
            </p>
            <p className="font-display text-5xl md:text-6xl font-semibold text-white mb-2 tracking-tight">
              <span className="align-[0.15em] text-3xl md:text-4xl">$</span>500
              <span className="text-white/50">&ndash;</span>
              <span className="align-[0.15em] text-3xl md:text-4xl">$</span>3,000
            </p>
            <p className="font-sans text-sm text-white/60 leading-relaxed">
              A curbed wheel, a phantom scratch, a lowball estimate you cannot
              contest. It comes straight out of your payout.
            </p>
          </div>

          {/* vs */}
          <div className="flex items-center justify-center">
            <span className="font-display text-2xl md:text-3xl italic text-gold-light">
              vs.
            </span>
          </div>

          {/* The kit */}
          <div className="bg-warm-gold rounded-2xl p-8 text-center flex flex-col justify-center shadow-xl">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-near-black/60 mb-3">
              The Pro kit, once
            </p>
            <p className="font-display text-5xl md:text-6xl font-semibold text-near-black mb-2">
              <span className="align-[0.15em] text-3xl md:text-4xl">$</span>97
            </p>
            <p className="font-sans text-sm text-near-black/70 leading-relaxed">
              Run the routine on every trip after. The first claim it saves
              pays for it many times over.
            </p>
          </div>
        </div>

        <p className="mt-10 text-center font-sans text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
          You are not buying a PDF. You are buying the difference between a claim
          you win in a day and one that quietly drains your month.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-full bg-warm-gold px-8 py-4 font-sans text-base font-semibold text-near-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
          >
            Pick your kit, from $47
          </a>
        </div>
      </div>
    </section>
  );
}
