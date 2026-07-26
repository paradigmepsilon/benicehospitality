import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import SectionDivider from "@/components/ui/SectionDivider";
import LaneSection from "@/components/ui/LaneSection";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title:
    "Alex Henry | AI Strategy, Enablement & Systems at Be Nice Hospitality (Atlanta, GA)",
  description:
    "Alex Henry, co-founder of Be Nice Hospitality. Leads the AI and technology work: getting an operation fluent in AI, then building the systems to prove it. Deepest in boutique stays through Signal, and the same method runs the vehicle fleet.",
  keywords: [
    "AI strategy consultant",
    "AI enablement",
    "AI adoption",
    "boutique stay AI consultant",
    "AI services for boutique stays",
    "AI search visibility hotels",
    "hospitality automation",
    "Signal by BNHG",
    "Car Rental Riches",
    "small fleet management",
    "Alex Henry",
    "Be Nice Hospitality",
  ],
  alternates: { canonical: "https://benicehospitality.com/alex" },
  openGraph: {
    title: "Alex Henry. AI that gets understood, adopted, and used.",
    description:
      "Della runs co-living properties. Alex leads the AI and technology work: fluency first, then the systems to prove it. Deepest in boutique stays through Signal, and the same method runs the BNHG vehicle fleet.",
    url: "https://benicehospitality.com/alex",
    type: "profile",
    images: [
      {
        url: "https://benicehospitality.com/images/Lex.jpeg",
        width: 1200,
        height: 1200,
        alt: "Alex Henry, Co-Founder of Be Nice Hospitality Group",
      },
    ],
  },
};

const EXPERTISE = [
  {
    title: "AI Search and Visibility",
    body: "Getting your boutique stay or your fleet cited inside ChatGPT, Perplexity, and the AI overviews that are quietly replacing search. Structured content, schema, and a monitoring stack that proves the work is paying out.",
  },
  {
    title: "OTA Reconciliation and Revenue Recovery",
    body: "Most independent boutique stays are leaking commissions on cancellations, duplicate charges, and post-stay adjustments. Signal's revenue integrity monitor finds the leaks, files the reclaims, and turns recovered dollars into a recurring line item on your P&L.",
  },
  {
    title: "Automations and Internal Tools",
    body: "The repetitive work that eats your week. Pre-arrival messages, vendor flows, housekeeping routing, fleet inspection logs, guest comms. The boring infrastructure that gives an operator their evenings back.",
  },
  {
    title: "Tech Stack and Integrations",
    body: "When the off-the-shelf tools stop talking to each other, Alex builds the bridge. PMS integrations, fleet management dashboards, the small automations that let 1 person run what used to take 3. You keep the code and the keys.",
  },
  {
    title: "Vehicle Fleet Operations",
    body: "Pricing, channel mix, cleaning cadence, and customer flow for operators running 3 to 30 economy vehicles. The same operating discipline Della brings to co-living properties, applied to the cars sitting in your driveway.",
  },
  {
    title: "Turo and Direct Channel Strategy",
    body: "When to lean into Turo, when to diversify, and how to honestly model the trade-off. Most fleet teachers online treat Turo as the whole game. It is 1 channel. Building the others is where small fleets quietly outgrow the side-hustle bracket.",
  },
];

const STATS = [
  { figure: "10-50", label: "Rooms in the Signal sweet spot" },
  { figure: "100%", label: "Signal scopes written down before kickoff" },
  { figure: "30", label: "Day money-back on productized work" },
  { figure: "3-30", label: "Vehicles in the CRR sweet spot" },
];

const FAQS = [
  {
    q: "What does Alex actually focus on at BNHG?",
    a: "The AI and technology work. That means getting an operation fluent in what AI is genuinely good for, then building the systems to prove it out. Most of that lands in boutique stays, through Signal. He also runs the fleet side of the company, home of Car Rental Riches, on the same method. Della handles the co-living property coaching.",
  },
  {
    q: "How is Car Rental Riches different from Room Rental Riches?",
    a: "Same operating method, applied to a different asset. Della's course is for people running co-living properties. Alex's is for people running cars. Pricing logic, channel strategy, ops cadence, customer flow. If you have 3 vehicles on Turo and you are tired of running the whole thing from your phone, this is the one.",
  },
  {
    q: "Do I need to operate vehicles to work with Alex?",
    a: "No. Most of his work is on the boutique stay side. Signal services, custom automations, AI search visibility, integrations that connect tools you already pay for. Vehicles are the second lane. If the tech is the thing holding your property back, you are in the right room.",
  },
  {
    q: "What is Signal and who is it for?",
    a: "Signal is the services arm Alex leads. It is built for independent boutique stays, from 10 to 50 room hotels and inns to the design-forward short-term and vacation-stay operators that want real engineering work instead of another agency proposal. Quick Wins, 30-Day Sprints, monthly retainers, and custom builds. Every engagement has a written success criterion before kickoff, and a money-back guarantee on productized work.",
  },
  {
    q: "Why work with Alex instead of an agency?",
    a: "Agencies sell decks. AI vendors sell licenses. Alex ships systems your team actually understands, which is the part that determines whether any of it survives past the pilot. The work ends with something that runs and a team that knows how to run it, not a slide that gets emailed around. And because he came up as both a Technical Program Manager and a Software Engineering Manager, projects move on a real timeline with real status, not vibes.",
  },
  {
    q: "Can you work with my existing PMS, fleet software, or whatever I am already paying for?",
    a: "Yes. Alex builds on top of what you already have whenever it makes sense. Mews, Cloudbeds, Hostfully, Turo, your own spreadsheets. If your tool has an API and you have the keys, we can work with it. If you are mid-migration, we sequence the build so the new stack lands clean.",
  },
];

export default function AlexPage() {
  return (
    // Alex leads with boutique-stay AI consulting, so the page carries the
    // boutique lane. The Car Rental Riches card inside is scoped to the fleet
    // lane, since that block belongs to a different vertical.
    <LaneSection lane="boutique">
      {/* HERO */}
      <section className="bg-(--lane-wash,var(--color-cream)) pt-24 md:pt-32 lg:pt-36 pb-14 md:pb-16 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-6">
              Alex Henry &middot; Co-Founder, Be Nice Hospitality
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-7">
              AI that gets understood, adopted, and used.
            </h1>
            <p className="font-sans text-lg md:text-xl text-charcoal leading-snug mb-8 max-w-xl">
              Della runs the co-living side of the house. Alex leads the AI and
              technology work: getting an operation fluent in what AI is
              genuinely good for, then building the systems that prove it out.
              Understanding first, because tools nobody trusts do not get used.
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-10 max-w-xl">
              He has taken that furthest in boutique stays, which is what Signal
              exists to serve. He runs BNHG&rsquo;s vehicle fleet on the same
              method. Start with a working call and we will find out which piece
              you actually need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                href={bookingUrl({
                  founder: "alex",
                  source: BOOKING_SOURCES.ALEX_HERO,
                })}
                variant="primary"
                size="lg"
              >
                Book a Discovery Call
              </Button>
              <Button href="/signal" variant="secondary" size="lg">
                Explore Signal Engagements
              </Button>
            </div>

            <p className="font-sans text-sm text-charcoal/60 mt-6 italic">
              Calls are working sessions. No discovery-call sales theater.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-md ml-auto mr-auto lg:w-[26rem] lg:mr-0">
            <div className="absolute inset-0 bg-warm-gold/30 rounded-sm translate-x-4 translate-y-4" />
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              <Image
                src="/images/Website%20Images/Lex.png"
                alt="Alex Henry, co-founder of Be Nice Hospitality Group"
                fill
                priority
                className="object-cover"
                style={{ filter: "saturate(0.9) contrast(1.05)" }}
                sizes="(min-width: 1024px) 45vw, (min-width: 640px) 80vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} />

      {/* TRUST BAR */}
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

      <SectionDivider fromColor={C.primaryGreen} toColor={C.offWhite} flip />

      {/* THE PROBLEM */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedItem>
            <SectionLabel>The adoption problem</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Most AI projects do not fail on technology. They fail on trust.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-5 font-sans text-lg text-charcoal leading-snug">
              <p>
                The pattern is always the same. Somebody buys the tool. There is
                a pilot, a demo, a flurry of excitement. 6 weeks later the team
                has quietly gone back to the notes app, the 2 spreadsheets, and
                the 3 messaging threads.
              </p>
              <p>
                It is not that the software did not work. It is that nobody
                could tell you what it was actually for, which parts to trust,
                or what to do when it got something wrong. So they stopped
                using it, and the operation went on running on memory and
                prayer.
              </p>
              <p>
                Most agencies show up with a brand refresh. Most AI vendors show
                up with a license. Neither one solves the thing underneath: your
                team has to understand the tool before it will ever earn a place
                in their day.
              </p>
              <p className="font-medium text-deep-teal">
                So Alex starts there. Get everybody honest about what AI can and
                cannot do in your specific operation, then build the handful of
                systems that earn their trust. For boutique stays. For the
                fleet. For the people running real businesses at a scale where
                they still know everybody by name.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* IMAGE BAND */}
      <section className="bg-off-white pb-14 md:pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src="/images/Website%20Images/alex%20in%20hotel%20lobby.png"
              alt="Alex in a boutique hotel lobby, the kind of independent stay Signal builds AI systems for"
              fill
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.offWhite} toColor={C.white} />

      {/* THREE WAYS IN */}
      <AnimatedSection theme="light" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-14">
            <AnimatedItem>
              <SectionLabel>What Alex does</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                One skillset. Proven where it counts.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                The work is bringing AI into an operation so it is understood,
                adopted, and actually running. Boutique stays are where that has
                gone furthest. The fleet is where it got tested against a
                completely different asset.
              </p>
            </AnimatedItem>
          </div>

          {/* Tier 1: the work itself, full width. */}
          <AnimatedItem>
            <div className="bg-deep-teal text-white p-8 md:p-12 rounded-sm relative overflow-hidden mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
                <div>
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                    01 &middot; The work
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-5">
                    AI Strategy, Enablement &amp; Systems
                  </h3>
                  <p className="font-sans text-base md:text-lg text-white/85 leading-snug">
                    Getting your team fluent in what AI is genuinely good for,
                    finding the places it earns its keep, and building the
                    systems to prove it. Then handing you the keys.
                  </p>
                </div>

                <div className="flex flex-col">
                  <div className="space-y-3.5 mb-8">
                    {[
                      "Where AI genuinely pays off in your operation, and where it does not",
                      "Team enablement, so adoption outlives the pilot",
                      "Custom assistants, automations, and integrations across your stack",
                      "A payback estimate before a line of code gets written",
                    ].map((point) => (
                      <p
                        key={point}
                        className="font-sans text-sm md:text-base text-white/80 flex items-start gap-2.5 leading-snug"
                      >
                        <span className="text-warm-gold mt-1">&rarr;</span>
                        {point}
                      </p>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Button
                      href={bookingUrl({
                        founder: "alex",
                        source: BOOKING_SOURCES.ALEX_DOORS_CARD,
                      })}
                      variant="primary"
                      size="md"
                    >
                      Book a Discovery Call
                    </Button>
                    <p className="font-sans text-sm text-white/60 mt-4 italic">
                      30 focused minutes. If Alex is not the right fit, he tells
                      you on the call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedItem>

          {/* Tiers 2 and 3: the specialty gets two thirds, the fleet one. */}
          <AnimatedDiv stagger className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 2: Signal, the deepest specialty. */}
            <AnimatedItem className="lg:col-span-2">
              <div className="bg-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) border-x border-b border-x-charcoal/10 border-b-charcoal/10 p-8 md:p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-4">
                  02 &middot; Deepest specialty
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Boutique Stays &middot; Signal
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-6 flex-grow">
                  Productized engagements and custom builds for independent
                  boutique stays: hotels, inns, and the design-forward
                  short-term rentals guests book on purpose. Quick Wins,
                  Sprints, retainers, and bespoke work. Every scope written
                  down before kickoff and backed by a money-back guarantee on
                  productized work.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    AI search visibility and AEO
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    OTA reconciliation and revenue recovery
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Voice agents and ops automation
                  </p>
                </div>
                <Button href="/signal" variant="secondary" size="md">
                  See Engagements
                </Button>
              </div>
            </AnimatedItem>

            {/* Tier 3: Car Rental Riches. Different vertical, so it carries the
                fleet lane rather than the page's boutique lane. Deliberately
                quieter than tier 2: no top keyline, muted heading. */}
            <AnimatedItem className="lg:col-span-1">
              <LaneSection lane="fleet" className="h-full">
                <div className="bg-off-white border border-charcoal/10 p-8 h-full flex flex-col rounded-sm">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/50 mb-4">
                    03 &middot; Also applied
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-charcoal leading-tight mb-4">
                    Vehicle Fleets
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-snug mb-6 flex-grow">
                    The same method, applied to BNHG&rsquo;s own vehicles.
                    Car Rental Riches packages it up for operators running 3 to
                    30 economy cars. In production now, opens later this year.
                  </p>
                  <CarRentalRichesWaitlistTrigger
                    variant="secondary"
                    size="md"
                    fullWidth
                  >
                    Join the Waitlist
                  </CarRentalRichesWaitlistTrigger>
                </div>
              </LaneSection>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.offWhite} flip />

      {/* ALEX'S JOURNEY */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
            <div>
              <AnimatedItem>
                <SectionLabel>How he got here</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                  Program management to building 2 arms of one company.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  Alex did not plan on running a hospitality services
                  company. He planned on building things that worked. The
                  short version is below.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <div className="relative aspect-[4/5] w-full overflow-hidden mt-10">
                  <Image
                    src="/images/Website%20Images/alex%20at%20his%20computer.png"
                    alt="Alex Henry at his desk building hospitality services and operator tooling"
                    fill
                    className="object-cover"
                    style={{ filter: "saturate(0.9) contrast(1.05)" }}
                    sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
                  />
                </div>
              </AnimatedItem>
            </div>

            <AnimatedDiv stagger className="space-y-10">
              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Before BNHG
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Technical Program Manager. Software Engineering Manager.
                    Both at once.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    Alex spent years running both sides of a technical org.
                    As a Technical Program Manager, he kept large programs
                    moving across engineering, product, and operations teams
                    that did not all report to the same person. As a Software
                    Engineering Manager, he ran the teams writing the code.
                    Most people pick one. He did both. That mix is what shows
                    up when he is scoping a Signal build, sequencing a
                    fleet rollout, or untangling the integration that has
                    been sitting on your roadmap for a year.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Building Signal
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    AI services for boutique stays that were tired of
                    decks.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    Signal came out of a pattern Alex kept seeing. Boutique
                    stays paying agencies for slides and PDFs while their
                    booking engine was slow on mobile and their PMS was not
                    talking to their channel manager. So he built a services
                    arm that ships working AI systems instead, with the
                    scope written down before kickoff.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Building the vehicle arm
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Car Rental Riches and the small-fleet playbook.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    While Della was teaching co-living operators, Alex started
                    quietly building the equivalent for cars. Pricing
                    methods, channel strategy, ops cadence, and the customer
                    flow that turns a Turo side hustle into a fleet you can
                    actually run. Car Rental Riches is the result. Ships
                    later this year.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Why he builds here
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Because the operators in the middle deserve real tools.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    The co-living properties, boutique stays, and fleets Alex
                    works with are too big for a notes app and too small for
                    enterprise software. The
                    space in between is where most operators actually live,
                    and most software companies ignore them. BNHG exists to
                    fix that.
                  </p>
                </div>
              </AnimatedItem>
            </AnimatedDiv>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.white} />

      {/* EXPERTISE GRID */}
      <AnimatedSection theme="light" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <AnimatedItem>
              <SectionLabel>What Alex brings</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                6 skills. All earned doing the work.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                The first 4 apply to any operation. The last 2 come from running
                the vehicles, and they are the reason the method holds up
                outside a single industry.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start"
          >
            {EXPERTISE.map((item) => (
              <AnimatedItem key={item.title}>
                <details className="group bg-off-white p-8 border-t-2 border-(--lane-accent,var(--color-warm-gold))">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight">
                      {item.title}
                    </h3>
                    <span
                      className="font-sans text-2xl text-warm-gold flex-shrink-0 leading-none transition-transform duration-200 group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="font-sans text-base text-charcoal/85 leading-snug mt-5">
                    {item.body}
                  </p>
                </details>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.primaryGreen} flip />

      {/* TESTIMONIAL */}
      <AnimatedSection theme="green" className="py-9 md:py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedItem>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[1.25] italic mb-5">
              &ldquo;Alex spent the first 30 minutes asking about my
              actual day. Not my goals. Not my brand. My day. That is when I
              knew this was different.&rdquo;
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-warm-gold tracking-[0.2em] uppercase font-semibold">
              Fleet operator &middot; 14 vehicles, Atlanta GA
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.offWhite} />

      {/* FAQ */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <AnimatedItem>
              <SectionLabel>Common questions</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                Before you book.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="space-y-5">
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

      {/* FLEET BAND. Deliberately compact: a boutique operator reading this
          page should never wonder whether they are hiring a car-rental guy.
          Its job is to prove the method travels, then get out of the way. */}
      <LaneSection lane="fleet">
        <section className="bg-cream py-12 md:py-14 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-8 lg:gap-12 items-center">
            <div className="relative aspect-[16/9] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-sm">
              <Image
                src="/images/Website%20Images/Alex%20Turo%20Shot.png"
                alt="Alex Henry with one of the fleet vehicles behind the Car Rental Riches playbook"
                fill
                className="object-cover"
                style={{ filter: "saturate(0.85) contrast(1.05)" }}
                sizes="(min-width: 1024px) 28rem, 90vw"
              />
            </div>

            <div>
              <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/50 mb-4">
                03 &middot; Also applied
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                The same method runs the vehicle fleet.
              </h2>
              <p className="font-sans text-base text-charcoal/80 leading-snug max-w-xl">
                Pricing logic, channel strategy past a single app, inspection
                logs, and the dashboards that let 1 person run what used to take
                3. It is worth mentioning for exactly 1 reason: it is proof this
                is a method rather than an industry trick. What Alex builds for
                a boutique stay is not borrowed from a hotel playbook. It comes
                from knowing how to read any operation and find the work a
                machine should be doing.
              </p>
            </div>
          </div>
        </section>
      </LaneSection>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      {/* FINAL CTA */}
      <section className="bg-deep-teal py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
            Your move
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
            Stop reading. Get on the calendar.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            30 minutes with Alex will save you weeks of guessing. Bring the
            thing AI was supposed to fix and did not, the boutique stay, or the
            integration that has been driving you crazy. Walk away with a plan
            you can actually run.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href={bookingUrl({
                founder: "alex",
                source: BOOKING_SOURCES.ALEX_FINAL_CTA,
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
              Or browse Signal engagements
            </Link>
          </div>
        </div>
      </section>
    </LaneSection>
  );
}
