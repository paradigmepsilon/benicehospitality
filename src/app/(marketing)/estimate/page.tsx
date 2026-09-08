import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { isEstimatorEnabled } from "@/lib/estimate/flag";
import { getResourceTool } from "@/lib/resources/registry";
import { SERVICE_AREA_LABEL } from "@/lib/management/constants";

const SITE_URL = "https://benicehospitality.com";

export const metadata: Metadata = {
  title: "Earnings Estimator",
  description:
    "A fast, honest monthly range for what your car or your spare rooms could earn in your market, before you go deeper or apply for management.",
  alternates: { canonical: `${SITE_URL}/estimate` },
  openGraph: {
    title: "Earnings Estimator | Be Nice Hospitality Group",
    description:
      "A fast, honest monthly range for what your car or your spare rooms could earn in your market.",
    url: `${SITE_URL}/estimate`,
    type: "website",
  },
};

const CARDS = [
  {
    asset: "car" as const,
    slug: "car-earnings-estimator",
    label: "Car",
    cta: "Estimate Your Car",
  },
  {
    asset: "rooms" as const,
    slug: "room-earnings-estimator",
    label: "Rooms",
    cta: "Estimate Your Rooms",
  },
];

export default function EstimatePage() {
  // The estimator tools stay unreachable until the metro rate table has real
  // data. Redirecting here, not just hiding the link, is what makes the flag
  // real: a stray bookmark or an old campaign link cannot land on an empty
  // tool. Both tool pages carry the same check.
  if (!isEstimatorEnabled()) redirect("/management");

  return (
    <>
      {/* HERO */}
      <AnimatedSection theme="green" className="pt-32 md:pt-40 pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>Free, two minutes</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
              What could your asset earn?
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg md:text-xl text-white/85 leading-snug max-w-2xl mx-auto">
              Pick the car or the rooms you already own. We will give you an
              honest monthly range for your market, then show you what
              running it yourself or handing it to BNHG actually looks like.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.deepTeal} toColor={C.white} />

      {/* CHOOSER CARDS */}
      <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>What are you estimating?</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                Choose one to get your range.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {CARDS.map((card) => {
              const tool = getResourceTool(card.slug)!;
              return (
                <AnimatedItem key={card.slug}>
                  <article className="h-full bg-cream border-t-2 border-warm-gold rounded-sm p-8 md:p-10 flex flex-col">
                    <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                      {card.label}
                    </h3>
                    <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-1">
                      {tool.blurb}
                    </p>
                    <div className="mt-auto">
                      <Button href={`/resources/${card.slug}`} variant="secondary" size="md">
                        {card.cta}
                      </Button>
                    </div>
                  </article>
                </AnimatedItem>
              );
            })}
          </AnimatedDiv>

          <AnimatedItem>
            <p className="font-sans text-sm text-charcoal/60 mt-10">
              Service area: {SERVICE_AREA_LABEL}. Already know you want
              management?{" "}
              <Link
                href="/management"
                className="text-primary-green font-medium hover:underline"
              >
                See both offers
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
