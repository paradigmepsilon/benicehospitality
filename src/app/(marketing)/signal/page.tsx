import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import PageCTA from "@/components/sections/shared/PageCTA";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title:
    "Signal | AI Services for Boutique Stays | Be Nice Hospitality",
  description:
    "Signal is the AI services arm of Be Nice Hospitality, built for boutique stays: independent hotels, inns, and design-forward short-term and vacation rentals. Direct booking lift, AI search visibility, OTA commission recovery, and ops automation. Scope written down before kickoff. Money-back if we miss.",
  keywords: [
    "AI services for boutique stays",
    "boutique luxury stay marketing",
    "AI search visibility for boutique stays",
    "AEO for hospitality",
    "OTA commission recovery",
    "direct booking optimization",
    "boutique hotel technology partner",
    "short-term rental and inn AI services",
    "Signal by BNHG",
    "Be Nice Hospitality",
  ],
  alternates: { canonical: "https://benicehospitality.com/signal" },
  openGraph: {
    title: "Signal | AI Services for Boutique Stays",
    description:
      "Direct booking lift, AI search visibility, OTA recovery, and ops automation for boutique stays: independent hotels, inns, and design-forward short-term and vacation rentals. Built by operators.",
    url: "https://benicehospitality.com/signal",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/signal%20header.png",
        width: 1600,
        height: 900,
        alt: "Signal by Be Nice Hospitality. AI services for boutique stays.",
      },
    ],
  },
};

const ENGAGEMENTS = [
  {
    name: "Quick Wins",
    priceFrom: "$1,500",
    priceTo: "$4,500",
    timeline: "1 to 2 weeks",
    tagline: "1 problem solved fast.",
    body: "AEO foundations. AI search readiness checks. OTA reconciliation audits. Focused work that finishes inside 2 weeks and ships with a 30-day money-back guarantee.",
    highlights: [
      "AEO and schema foundations",
      "OTA reconciliation audit",
      "Direct booking diagnostics",
    ],
  },
  {
    name: "30-Day Sprints",
    priceFrom: "$5,000",
    priceTo: "$10,000",
    timeline: "30 days",
    tagline: "1 outcome inside a month.",
    body: "A focused engagement against 1 measurable goal. Direct booking accelerators. Voice agent rollouts. Ops automation passes. The success criterion is written into the contract before we kick off.",
    highlights: [
      "Direct booking accelerator",
      "Voice agent rollout",
      "Ops automation pass",
    ],
  },
  {
    name: "Monthly Retainers",
    priceFrom: "$2,000",
    priceTo: "$10,000",
    priceSuffix: "/mo",
    timeline: "Ongoing",
    tagline: "Compounding work, month over month.",
    body: "AI visibility monitoring, OTA revenue integrity, or full ops support. Cancel any month with no rolling contract and no claw-back clause. The retainer is yours to walk away from whenever you want.",
    highlights: [
      "AI search visibility retainer",
      "Revenue integrity monitoring",
      "Embedded ops support",
    ],
  },
  {
    name: "Custom Builds",
    priceFrom: "$5,000",
    priceTo: "$20,000+",
    timeline: "Scoped to project",
    tagline: "Bespoke software for your property.",
    body: "Integrations between your PMS, channel manager, lock system, and messaging stack. AI-assisted workflows that match how your team actually runs the property. Scope is fixed. You own everything we ship.",
    highlights: [
      "PMS and channel integrations",
      "Custom AI workflows",
      "Private dashboards and tools",
    ],
  },
];

const STATS = [
  { figure: "10-50", label: "Rooms or units in the sweet spot" },
  { figure: "100%", label: "Scopes written down before kickoff" },
  { figure: "30", label: "Day money-back guarantee" },
  { figure: "0", label: "Annual contracts. Cancel any month." },
];

const PROCESS = [
  {
    step: "01",
    title: "Discovery call",
    body: "40 minutes on your property, your stack, and the number you actually want to move. If Signal is not the right fit, we tell you on the call.",
  },
  {
    step: "02",
    title: "Written scope",
    body: "We send a scope, a success criterion, and a price before any work begins. If you sign, we kick off. If not, no follow-up, no drip.",
  },
  {
    step: "03",
    title: "Ship and hand over",
    body: "We build, we measure, we hand over the code, the schemas, and the documentation. You leave with a working system, not a slide deck.",
  },
];

const GUARANTEES = [
  {
    title: "Outcome written in the contract",
    body: "Before kickoff, we define success in plain English. If we do not hit it, we keep working or refund the engagement.",
  },
  {
    title: "30-day money-back",
    body: "Every productized engagement under 5,000 dollars comes with a 30-day money-back guarantee. No questions.",
  },
  {
    title: "Cancel any month",
    body: "Retainers are month to month. No annual lock-in. No rolling-month clauses. Walk away whenever you need to.",
  },
  {
    title: "You own everything",
    body: "Code, schemas, content, automations. Signal builds and hands over. The keys stay with you, not with a vendor you cannot fire.",
  },
];

const FAQS = [
  {
    q: "What makes Signal different from a regular hospitality marketing agency?",
    a: "Agencies sell decks and dashboards. Signal ships software. Every engagement ends with a working system, a measurable result, and a hand-off document. And every productized engagement carries a 30-day money-back guarantee in writing.",
  },
  {
    q: "Why are you focused on independent boutique stays?",
    a: "That is the sweet spot where the work is technical enough to need real engineering and small enough that you still talk to the operator. Larger portfolios usually need a custom build. Smaller operators are better served by the free resource library or the Room Rental Riches Masterclass.",
  },
  {
    q: "What does AI search visibility actually mean for my property?",
    a: "When a traveler asks ChatGPT, Perplexity, or Google AI Overviews for a boutique stay in your market, the answer is built from sources the model can find, parse, and trust. Signal makes sure your property is in that answer. Schema, citation paths, content structure, and a monitoring stack that proves the work is showing up.",
  },
  {
    q: "Can Signal work with my existing PMS and channel manager?",
    a: "Yes. Signal is integration-first. We work with Mews, Cloudbeds, RoomRaccoon, Little Hotelier, and the long tail. If your tool has an API and you have the keys, we can build on top of it. If you are mid-migration, we sequence the work so the new stack lands clean.",
  },
  {
    q: "How does the money-back guarantee actually work?",
    a: "Every Quick Win and every productized engagement under 5,000 dollars comes with a 30-day money-back guarantee. If the outcome we wrote into the contract is not delivered, you ask, we refund. No claw-back clauses, no fine print.",
  },
];

const HERO_IMAGE = "/images/Website%20Images/signal%20header.png";

export default function SignalPage() {
  return (
    <>
      {/* HERO with full-bleed image + overlay */}
      <section className="relative bg-near-black pt-32 md:pt-40 lg:pt-44 pb-24 md:pb-28 px-6 md:px-12 lg:px-20 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Boutique stay interior. The kind of property Signal builds AI services for."
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
          style={{ filter: "saturate(0.9) contrast(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-near-black via-near-black/85 to-deep-teal/70"
        />

        <div className="relative z-10 max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-warm-gold mb-7">
            Signal by Be Nice Hospitality
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white leading-[1.02] tracking-tight mb-8 max-w-4xl">
            AI services built for{" "}
            <span className="italic text-warm-gold">boutique luxury</span>{" "}
            stays.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-6 max-w-2xl">
            Direct booking lift. AI search visibility. OTA commission recovery.
            Ops automation. Built for independent boutique stays. Hotels, inns,
            and the design-forward short-term and vacation rentals guests book
            on purpose.
          </p>
          <p className="font-sans text-base md:text-lg text-white/70 leading-snug mb-10 max-w-2xl">
            We write the success criterion into the contract before kickoff.
            We refund the engagement if we miss. No annual lock-in. No agency
            theater.
          </p>

          <div className="flex">
            <Button
              href={bookingUrl({
                callType: "discovery_call_45",
                source: BOOKING_SOURCES.SIGNAL_HERO,
              })}
              variant="primary"
              size="lg"
            >
              Book a Discovery Call
            </Button>
          </div>

          <p className="font-sans text-sm text-white/55 mt-6 italic">
            45 minutes. No discovery-call sales theater.
          </p>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-deep-teal py-10 md:py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <p className="font-display text-4xl md:text-5xl font-semibold text-warm-gold leading-none mb-2">
                {s.figure}
              </p>
              <p className="font-sans text-sm text-white/85 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.offWhite} />

      {/* WHO IT'S FOR */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedItem>
            <SectionLabel>Who Signal is for</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              For boutique stay owners who are done paying for slides.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-5 font-sans text-lg text-charcoal leading-snug">
              <p>
                You have been operating an independent property for years. The
                hospitality is the easy part. The rest of it has slowly turned
                into a second full-time job.
              </p>
              <p>
                Your ADR is slipping. Your direct booking percentage has not
                moved in 2 years. The last agency you hired walked away
                with a 5-figure invoice and a dashboard nobody opens. The
                vendor who set up your tech stack stopped returning emails
                6 months ago.
              </p>
              <p>
                And now travelers are asking ChatGPT and Perplexity where to
                stay in your market, and your property is not in
                the answer.
              </p>
              <p className="font-semibold text-deep-teal text-xl">
                Signal is the partner you wish you had hired the first time.
                We do the work. We hand it over. We stay accountable for the
                outcome.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.white} />

      {/* ENGAGEMENTS with bold pricing */}
      <AnimatedSection theme="light" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 md:mb-16 max-w-3xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The engagements</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                4 ways to work together. All priced in plain English.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/80 leading-relaxed">
                Pick the shape that fits the work. Pricing below is the
                starting range. Every engagement gets a fixed scope and a
                written success criterion before we kick off.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {ENGAGEMENTS.map((e) => (
              <AnimatedItem key={e.name}>
                <article className="bg-cream border-t-4 border-warm-gold rounded-sm p-8 md:p-10 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold">
                      {e.timeline}
                    </p>
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl font-semibold text-deep-teal leading-tight mb-5">
                    {e.name}
                  </h3>

                  {/* BOLD PRICING */}
                  <div className="mb-6 pb-6 border-b border-charcoal/15">
                    <p className="font-sans text-[10px] font-semibold tracking-[0.3em] uppercase text-charcoal/55 mb-1">
                      Starting from
                    </p>
                    <p className="font-display text-5xl md:text-6xl font-semibold text-near-black leading-none">
                      {e.priceFrom}
                      {e.priceSuffix && (
                        <span className="text-xl md:text-2xl font-normal text-charcoal/55 ml-1">
                          {e.priceSuffix}
                        </span>
                      )}
                    </p>
                    <p className="font-sans text-sm text-charcoal/65 mt-2">
                      Range: {e.priceFrom} to {e.priceTo}
                      {e.priceSuffix || ""}
                    </p>
                  </div>

                  <p className="font-sans text-base italic text-deep-teal mb-3">
                    {e.tagline}
                  </p>
                  <p className="font-sans text-base text-charcoal/85 leading-snug mb-6 flex-grow">
                    {e.body}
                  </p>

                  <ul className="space-y-2">
                    {e.highlights.map((h) => (
                      <li
                        key={h}
                        className="font-sans text-sm text-charcoal/75 flex items-start gap-2"
                      >
                        <span
                          aria-hidden="true"
                          className="text-warm-gold mt-[2px]"
                        >
                          &#10003;
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <div className="text-center mt-12">
            <Button
              href={bookingUrl({
                callType: "discovery_call_45",
                source: BOOKING_SOURCES.SIGNAL_ENGAGEMENTS_GRID,
              })}
              variant="primary"
              size="lg"
            >
              Book a Discovery Call
            </Button>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.offWhite} flip />

      {/* HOW IT WORKS */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <AnimatedItem>
              <SectionLabel>How it works</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                3 steps. Then a working system.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {PROCESS.map((p) => (
              <AnimatedItem key={p.step}>
                <div className="bg-white rounded-sm p-8 h-full border border-light-gray">
                  <p className="font-display text-5xl font-semibold text-warm-gold leading-none mb-4">
                    {p.step}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight mb-3">
                    {p.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    {p.body}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.primaryGreen} />

      {/* GUARANTEES */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-20 md:py-24 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel light>The guarantees</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.1] tracking-tight mt-4 mb-6">
                4 promises. All in writing.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-white/85 leading-relaxed">
                Boutique operators have been burned by enough agencies. Signal
                puts the risk on us, not on you.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {GUARANTEES.map((g, i) => (
              <AnimatedItem key={g.title}>
                <div className="border-l-2 border-warm-gold pl-6 md:pl-7 py-1">
                  <p
                    aria-hidden
                    className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-tight mb-2">
                    {g.title}
                  </h3>
                  <p className="font-sans text-base text-white/85 leading-snug">
                    {g.body}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.offWhite} flip />

      {/* FAQ */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <AnimatedItem>
              <SectionLabel>Common questions</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                Before you book.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="space-y-4">
            {FAQS.map((item) => (
              <AnimatedItem key={item.q}>
                <details className="group bg-white border border-charcoal/10 rounded-sm p-6 md:p-7">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight">
                      {item.q}
                    </h3>
                    <span
                      className="font-sans text-2xl text-warm-gold flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="font-sans text-base text-charcoal/85 leading-snug mt-5">
                    {item.a}
                  </p>
                </details>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.nearBlack} />

      <PageCTA audience="owner" />
    </>
  );
}
