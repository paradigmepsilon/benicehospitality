import type { Metadata } from "next";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BOOKING_SOURCES } from "@/lib/booking-url";
import {
  MANAGEMENT_OFFERS,
  SERVICE_AREA_LABEL,
  SERVICE_AREA_STATES,
} from "@/lib/management/constants";
import {
  ONBOARDING_STEPS,
  applyHref,
} from "@/components/sections/management/ManagementOffer";

export const metadata: Metadata = {
  title: "Management",
  description:
    "Sharing economy asset management for the Southeast. BNHG manages your car or your spare rooms while you keep ownership. Georgia, Florida, South Carolina, North Carolina, Alabama, and Tennessee.",
  keywords: [
    "sharing economy asset management",
    "fleet management company",
    "co-living management company",
    "vehicle and property management Southeast",
    "done for you rental management",
  ],
  alternates: { canonical: "https://benicehospitality.com/management" },
  openGraph: {
    title: "Management | Be Nice Hospitality Group",
    description:
      "BNHG manages your car or your spare rooms while you keep ownership. Learn to run it yourself, or let us run it.",
    url: "https://benicehospitality.com/management",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Alex%20Turo%20Shot.png",
        width: 1600,
        height: 900,
        alt: "BNHG managed assets: a rental vehicle and a co-living property",
      },
    ],
  },
};

const OFFERS = [MANAGEMENT_OFFERS.car, MANAGEMENT_OFFERS.rooms];

export default function ManagementOverviewPage() {
  return (
    <>
      {/* HERO */}
      <AnimatedSection theme="green" className="pt-32 md:pt-40 pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>{SERVICE_AREA_LABEL}</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
              Sharing economy asset management for the Southeast.
            </h1>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-10 max-w-2xl mx-auto">
              BNHG manages the car or the spare rooms you already own. Learn
              to run it yourself, or let us run it.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href="#offers" variant="primary" size="lg">
              See Both Offers
            </Button>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.deepTeal} toColor={C.white} />

      {/* OFFER CARDS */}
      <AnimatedSection theme="light" className="py-16 md:py-24 px-6" id="offers">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>Two ways in</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                What are you looking to manage?
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {OFFERS.map((offer) => (
              <AnimatedItem key={offer.asset}>
                <article className="h-full bg-cream border-t-2 border-warm-gold rounded-sm p-8 md:p-10 flex flex-col">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                    {offer.name}
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug mb-6">
                    {offer.promise}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {offer.handles.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="font-sans text-sm text-charcoal/75 flex items-start gap-3"
                      >
                        <span aria-hidden="true" className="text-warm-gold mt-0.5">
                          &rarr;
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Button href={`/management/${offer.slug}`} variant="secondary" size="md">
                      See {offer.name}
                    </Button>
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* SERVICE AREA */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel>Where we operate</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Six states across the Southeast.
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="flex flex-wrap justify-center gap-3"
          >
            {SERVICE_AREA_STATES.map((s) => (
              <AnimatedItem key={s.code}>
                <span className="inline-block font-sans text-sm font-semibold text-deep-teal bg-white border border-light-gray rounded-full px-5 py-2.5">
                  {s.name}
                </span>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* HOW IT WORKS */}
      <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>How it works</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                From apply to live.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug">
                Every application, either asset, moves through the same six
                steps. No named timeline until we&rsquo;ve seen the asset.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10"
          >
            {ONBOARDING_STEPS.map((s, i) => (
              <AnimatedItem key={s.step}>
                <article className="border-l-2 border-warm-gold pl-6 h-full">
                  <p
                    aria-hidden="true"
                    className="font-display italic text-3xl text-warm-gold leading-none mb-4"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3">
                    {s.step}
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    {s.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.deepTeal} flip />

      {/* FINAL CTA */}
      <AnimatedSection theme="green" className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Ready when you are
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Check your fit.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            Applying takes a few minutes. Nothing is signed until the call.
          </p>
          <Button
            href={applyHref(BOOKING_SOURCES.MGMT_OVERVIEW_CTA)}
            variant="primary"
            size="lg"
          >
            Check Your Fit
          </Button>
        </div>
      </AnimatedSection>
    </>
  );
}
