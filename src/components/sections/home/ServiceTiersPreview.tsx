import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { SERVICE_TIERS_PREVIEW } from "@/lib/constants";

const tierAccents = [
  "border-primary-green/40 hover:border-primary-green",
  "border-warm-gold/40 hover:border-warm-gold",
  "border-white/20 hover:border-white/40",
];

const tierBadgeColors = [
  "bg-primary-green/20 text-primary-green",
  "bg-warm-gold/20 text-warm-gold",
  "bg-white/10 text-white",
];

export default function ServiceTiersPreview() {
  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel light>How We Work</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              From Free Insight to{" "}
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

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {SERVICE_TIERS_PREVIEW.slice(1).map((tier, i) => (
            <AnimatedItem key={i}>
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
