import Image from "next/image";
import TestimonialMarquee from "./TestimonialMarquee";

/**
 * ProofBand — social-proof section for the Claim Proof page.
 *
 * ⚠️ PLACEHOLDER CONTENT (2026-07-10): every number, quote, and win example
 * below is a realistic-but-invented baseline seeded so the section has real
 * design weight. Alex to replace with actual figures + real (redacted) claim
 * screenshots when back at base. Search this file for `PLACEHOLDER` to find
 * every value that must be swapped. The fleet photo is AI-generated stand-in
 * art (public/images/claimproof/fleet-lineup.png) — replace with a real photo
 * of the BNA fleet. Do NOT ship customer testimonials as real until they are.
 */

// PLACEHOLDER stats — swap for real BNA fleet numbers.
const STATS: Array<{ value: string; label: string }> = [
  { value: "24", label: "cars in the fleet" },
  { value: "4,500+", label: "trips run" },
  { value: "200+", label: "damage claims handled" },
  { value: "8 yrs", label: "operating on Turo" },
];

// PLACEHOLDER win examples — replace with real (redacted) claim outcomes.
const WINS: Array<{ amount: string; headline: string; detail: string }> = [
  {
    amount: "$1,840",
    headline: "Recovered on a curbed-wheel claim the guest denied",
    detail:
      "Pre-trip 12-shot sequence proved the wheel was clean at handoff. Turo sided with the documentation in under a day.",
  },
  {
    amount: "$0 out of pocket",
    headline: "A “it was already like that” bumper dispute, closed clean",
    detail:
      "Date-stamped baseline plus Script 04 killed the back-and-forth before it reached arbitration.",
  },
  {
    amount: "Denial reversed",
    headline: "Won a documents-only arbitration on a $3,100 claim",
    detail:
      "The structured 10-page statement did the work. Same facts, better paper.",
  },
];

export default function ProofBand() {
  return (
    <section className="bg-white px-6 md:px-12 lg:px-20 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-4">
          Where this comes from
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-deep-teal leading-tight mb-8 md:mb-12 max-w-3xl">
          Not a course. A system pulled from a real fleet and a lot of real
          claims.
        </h2>

        {/* Fleet photo + stat rail */}
        <div className="grid lg:grid-cols-5 gap-4 md:gap-8 items-stretch mb-10 md:mb-16">
          <div className="lg:col-span-3 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/claimproof/fleet-lineup-v2.png"
              alt="A working car-rental fleet staged in a hotel lot near the Atlanta airport"
              fill
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-near-black/80 via-near-black/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 md:left-6 md:right-6 font-sans text-sm font-medium text-white">
              {/* PLACEHOLDER caption — confirm real fleet detail. */}
              The fleet the system was built on. Metro Atlanta, run every day.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                data-placeholder="stat"
                className="flex flex-col justify-center bg-cream rounded-2xl p-6"
              >
                <p className="font-display text-4xl md:text-5xl font-semibold text-warm-gold leading-none mb-2">
                  {s.value}
                </p>
                <p className="font-sans text-sm text-charcoal leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Win examples */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 md:mb-16">
          {WINS.map((w) => (
            <div
              key={w.headline}
              data-placeholder="win"
              className="bg-near-black text-white rounded-2xl p-6 md:p-7 flex flex-col"
            >
              <p className="font-display text-3xl font-semibold text-warm-gold mb-4">
                {w.amount}
              </p>
              <p className="font-sans font-bold text-white mb-2 leading-snug">
                {w.headline}
              </p>
              <p className="font-sans text-sm text-white/70 leading-relaxed">
                {w.detail}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 font-sans text-xs text-warm-gray leading-relaxed max-w-2xl">
          Fleet size, trip counts, and claim outcomes reflect Be Nice Autos
          operations. Individual results depend on your documentation and your
          claims. Nothing here is a guarantee of a specific outcome.
        </p>
      </div>

      {/* Testimonials — full-bleed auto-scroll marquee */}
      <div className="mt-14 md:mt-16">
        <p className="mx-auto mb-8 max-w-6xl px-6 md:px-12 lg:px-20 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
          What hosts say
        </p>
        <TestimonialMarquee />
      </div>
    </section>
  );
}
