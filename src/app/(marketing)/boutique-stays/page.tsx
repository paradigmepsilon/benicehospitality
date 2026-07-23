import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import OfferingHero from "@/components/sections/shared/OfferingHero";
import OfferingOverview from "@/components/sections/offerings/OfferingOverview";
import OfferingResources from "@/components/sections/offerings/OfferingResources";
import OfferingGear from "@/components/sections/offerings/OfferingGear";
import OfferingInsights from "@/components/sections/offerings/OfferingInsights";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import LaneSection from "@/components/ui/LaneSection";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { LANES } from "@/lib/lanes";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title:
    "Boutique Stays | Independent Hotels, Inns & Design-Forward Rentals | Be Nice Hospitality",
  description:
    "For independent boutique hotels, inns, and the design-forward short-term and vacation stays guests book on purpose. Direct booking lift, AI search visibility, OTA commission recovery, and ops automation.",
  keywords: [
    "boutique hotel operations",
    "independent inn management",
    "direct booking for boutique stays",
    "OTA commission recovery",
    "AI search visibility for hotels",
    "boutique hotel technology",
    "design-forward short-term rental",
  ],
  alternates: { canonical: "https://benicehospitality.com/boutique-stays" },
  openGraph: {
    title: "Boutique Stays | Be Nice Hospitality",
    description:
      "Direct booking lift, AI search visibility, OTA recovery, and ops automation for independent boutique hotels, inns, and design-forward stays.",
    url: "https://benicehospitality.com/boutique-stays",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/image3.png",
        width: 1600,
        height: 900,
        alt: "An independent boutique stay at dusk",
      },
    ],
  },
};

const STATS = [
  { figure: "10-50", label: "Rooms or units in the sweet spot" },
  { figure: "15-25%", label: "Typical OTA commission bleed" },
  { figure: "100%", label: "Scopes written down before kickoff" },
  { figure: "0", label: "Annual contracts. Cancel any month." },
];

const MECHANICS = [
  {
    numeral: "i",
    heading: "The OTAs own your guest, not you",
    body: "A booking through an OTA costs fifteen to twenty-five percent and hands over the guest relationship with it. You get a reservation. They get the email address, the repeat stay, and the referral. Direct is not about saving the commission. It is about owning the list you build the next decade on.",
  },
  {
    numeral: "ii",
    heading: "Guests now ask a model, not a search bar",
    body: "When someone asks ChatGPT or Perplexity for a boutique stay in your market, the answer gets assembled from sources the model can find, parse, and trust. If your property is not structured for that, you are invisible in the fastest-growing discovery channel, and no amount of ad spend fixes it.",
  },
  {
    numeral: "iii",
    heading: "Your stack is held together by somebody who left",
    body: "PMS, channel manager, lock system, messaging tool, payment processor. Five vendors, four integrations, and one person who understood how it fit together and is no longer answering emails. Independent operators do not need more software. They need the pieces they already pay for to actually talk.",
  },
];

const OFFERS = [
  {
    name: "Quick Wins",
    body: "One problem solved fast. AEO foundations, AI search readiness, OTA reconciliation audits. Finishes inside two weeks.",
  },
  {
    name: "30-Day Sprints",
    body: "One measurable outcome inside a month. Direct booking accelerators, voice agent rollouts, ops automation passes.",
  },
  {
    name: "Monthly Retainers",
    body: "Compounding work month over month. AI visibility monitoring, revenue integrity, or embedded ops support.",
  },
  {
    name: "Custom Builds",
    body: "Bespoke software for your property. PMS and channel integrations, private dashboards, AI-assisted workflows.",
  },
];

export default function BoutiqueStaysPage() {
  return (
    // Boutique lane: resolves to gold rather than its carousel charcoal, so this
    // reads as the house palette deepened a notch. See src/lib/lanes.ts.
    <LaneSection lane="boutique">
      <OfferingHero
        eyebrow="Boutique Stays · Independent and design-forward"
        headline="Boutique stays, run like"
        accentWord="a business."
        message="For independent hotels, inns, and the design-forward short-term and vacation stays guests book on purpose. Direct booking lift, AI search visibility, OTA commission recovery, and ops automation."
        primaryCta={{
          label: "Book a Discovery Call",
          href: bookingUrl({
            callType: "discovery_call_45",
            source: BOOKING_SOURCES.BOUTIQUE_HERO,
          }),
        }}
        secondaryCta={{ label: "See Signal Engagements", href: "/signal" }}
        image={{
          src: "/images/Website%20Images/hf_20260315_000021_73470446-13d6-459a-bc1a-6007156b8c4d.png",
          alt: "A modern independent boutique hotel at dusk, warm-lit through floor-to-ceiling glass",
        }}
        note="45 minutes. No discovery-call sales theater."
      />

      {/* Trust bar. Same treatment as the other doors. */}
      <section className="bg-deep-teal py-7 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <p className="font-display text-4xl md:text-5xl font-semibold text-warm-gold leading-none mb-2">
                {s.figure}
              </p>
              <p className="font-sans text-sm text-white/80 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <OfferingOverview
        label="Start here"
        headline="What independent operators are actually up against."
        intro="Boutique stays compete on experience and lose on distribution. The property is the easy part. Three structural problems eat the margin, and none of them are fixed by working harder."
        mechanics={MECHANICS}
        take={{
          label: "Our take",
          body: "If you are at ten rooms and the OTAs are filling you at a rate you are happy with, do not let anybody talk you into a rebuild. Fix the commission bleed first, then the direct channel, then the tech. In that order. Anyone selling you the whole thing at once is selling you a retainer.",
        }}
      />

      <SectionDivider fromColor={C.white} toColor={LANES.boutique.wash} />
      <OfferingResources
        category="boutique"
        label="Free, no catch"
        headline="The tools, built for boutique operators."
        intro="The same free, gated tools the property side runs on, rebuilt around rooms, rate, and distribution. One email unlocks the whole library."
        emptyState={{
          headline: "Boutique tools are being built now.",
          body: "OTA commission calculators, direct-booking diagnostics, and AI search readiness checks are in production. Until they land, the free audit is the fastest way to see where your property stands, and the existing library is open.",
        }}
      />
      <SectionDivider fromColor={LANES.boutique.wash} toColor={C.white} flip />

      {/* SIGNAL ENGAGEMENTS — this lane's equivalent of the course band. */}
      <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>The work</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                Signal does the build.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal leading-snug">
                Signal is the services arm that does this work. Agencies sell
                decks. Signal ships software, writes the success criterion into
                the contract before kickoff, and refunds the engagement if it
                misses. Four ways in, depending on how much you want moved.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {OFFERS.map((o) => (
              <AnimatedItem key={o.name}>
                <article className="h-full bg-(--lane-wash,var(--color-cream)) border-t-2 border-(--lane-accent,var(--color-warm-gold)) rounded-sm p-7">
                  <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight mb-3">
                    {o.name}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/85 leading-snug">
                    {o.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <AnimatedItem>
            <div className="mt-12 text-center">
              <Button href="/signal" variant="secondary" size="lg">
                See Signal Engagements
              </Button>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <OfferingGear
        tab="hotel"
        label="The gear"
        headline="What goes in every room."
        body="Linens, locks, amenity kits, in-room tech, and the back-of-house tools that keep a small property running without a full engineering team. Operator-tested, not catalog-picked."
        ctaLabel="Open the Boutique Toolkit"
        image={{
          src: "/images/Website%20Images/pexels-katie-cerami-110690626-12284843.jpg",
          alt: "A well-appointed boutique guest room",
        }}
      />

      <OfferingInsights
        category="Hotel Technology"
        headline="Written from inside the properties."
        body="Distribution math, AI search notes, and the operational details that decide whether a boutique property clears its number. Longer thinking than a newsletter allows."
      />

      {/* Closing image band, then the CTA. */}
      <section className="bg-cream py-12 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/alex%20in%20hotel%20lobby.png"
              alt="The lobby of an independent boutique hotel"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
            />
          </div>
        </div>
      </section>

      <section className="bg-deep-teal py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Still have a question
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Bring it to a call.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            A direct channel that will not convert. An OTA bill you cannot
            reconcile. A stack that breaks every time someone touches it. Forty
            five minutes and you will leave knowing what to fix first, whether
            or not you hire us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href={bookingUrl({
                callType: "discovery_call_45",
                source: BOOKING_SOURCES.BOUTIQUE_FINAL_CTA,
              })}
              variant="primary"
              size="lg"
            >
              Book a Discovery Call
            </Button>
            <Link
              href="/signal"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Or see the engagements first
            </Link>
          </div>
        </div>
      </section>
    </LaneSection>
  );
}
