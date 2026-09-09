import { OPERATING_PROOF } from "@/lib/constants";

/**
 * Real operating figures only: units managed, vehicles managed, cities,
 * years operating. `OPERATING_PROOF` in src/lib/constants.ts ships empty on
 * purpose, since Alex has not supplied these numbers yet. Rendering nothing
 * is correct until he does; the retired consulting-era METRICS values
 * (direct-booking lift, ancillary revenue, staff hours saved) describe a
 * business BNHG no longer runs and must never substitute here.
 *
 * When figures do exist they render as the stat tiles from the nonprofit
 * reference pin: a row of quiet rounded tiles under the hero.
 */
export default function ProofBand() {
  if (OPERATING_PROOF.length === 0) return null;

  return (
    <section className="bg-cream px-3 md:px-5 pt-4 md:pt-5">
      <dl className="max-w-7xl mx-auto px-3 md:px-5 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {OPERATING_PROOF.map((stat) => (
          <div
            key={stat.label}
            className="rounded-card bg-white border border-charcoal/10 px-6 py-6"
          >
            <dd className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-none">
              {stat.value}
              {stat.suffix}
            </dd>
            <dt className="font-sans text-sm text-charcoal/65 mt-2">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
