import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { SERVICE_TIERS_PREVIEW } from "@/lib/constants";

// Tiers 1-3 below the prominent Tier 0 row.
const tierAccents = [
  "border-primary-green/40 hover:border-primary-green",
  "border-warm-gold/40 hover:border-warm-gold",
  "border-white/15 hover:border-white/30 opacity-90",
];

const tierBadgeColors = [
  "bg-primary-green/20 text-primary-green",
  "bg-warm-gold/20 text-warm-gold",
  "bg-white/10 text-white/70",
];

export default function ServiceTiersPreview() {
  const tier0 = SERVICE_TIERS_PREVIEW[0];
  const otherTiers = SERVICE_TIERS_PREVIEW.slice(1);

  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <AnimatedItem>
            <SectionLabel light>How We Work</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              From Free Audit to{" "}
              <span className="text-warm-gold italic">Full Partnership</span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/60 max-w-xl mx-auto">
              Every engagement tier is designed to pay for itself and earn
              your trust before asking for more.
            </p>
          </AnimatedItem>
        </div>

        {/* Tier 0 — prominent flagship card */}
        <AnimatedItem>
          <div className="border-2 border-primary-green/50 rounded-lg p-7 sm:p-10 mb-6 bg-gradient-to-br from-primary-green/10 to-transparent">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 font-sans bg-primary-green text-white rounded">
                    Tier {tier0.tier}
                  </span>
                  <span className="text-xs font-semibold tracking-widest uppercase font-sans text-warm-gold">
                    Start Free
                  </span>
                </div>
                <p className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">
                  {tier0.label}
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3 leading-snug">
                  {tier0.headline}
                </h3>
                <p className="font-sans text-base text-white/70 leading-relaxed">
                  {tier0.description}
                </p>
              </div>
              <div className="md:shrink-0">
                <Button href={tier0.ctaHref} variant="primary" size="lg">
                  {tier0.cta}
                </Button>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Tiers 1-3 */}
        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {otherTiers.map((tier, i) => (
            <AnimatedItem key={tier.tier}>
              <div
                className={[
                  "border rounded-lg p-5 sm:p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1",
                  tierAccents[i],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className={[
                      "text-xs font-semibold tracking-widest uppercase px-3 py-1 font-sans",
                      tierBadgeColors[i],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    Tier {tier.tier}
                  </span>
                </div>
                <p className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">
                  {tier.label}
                </p>
                <h3 className="font-display text-xl font-semibold text-white mb-3 leading-snug">
                  {tier.headline}
                </h3>
                <p className="font-sans text-sm text-white/60 leading-relaxed mb-5 flex-1">
                  {tier.description}
                </p>
                <Button
                  href={tier.ctaHref}
                  variant="ghost"
                  size="sm"
                >
                  {tier.cta}
                </Button>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <div className="text-center">
            <Button href="/services" variant="secondary" size="md">
              See Full Services →
            </Button>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
