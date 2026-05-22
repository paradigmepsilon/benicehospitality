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
import { SECTION_COLORS as C } from "@/lib/section-colors";
import CarRentalRichesWaitlistTrigger from "@/components/sections/waitlist/CarRentalRichesWaitlistTrigger";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title:
    "Alex Henry | Vehicle Management & Technology at Be Nice Hospitality (Atlanta, GA)",
  description:
    "Alex Henry, co-founder of Be Nice Hospitality. Leads the vehicle management side of the company and the technology work behind everything else, including Signal services for boutique hotels.",
  keywords: [
    "Car Rental Riches",
    "Turo fleet operations",
    "small fleet management",
    "vehicle rental coaching",
    "boutique hotel technology",
    "AI services for hotels",
    "hospitality automation",
    "Alex Henry",
    "Be Nice Hospitality",
    "Signal by BNHG",
  ],
  alternates: { canonical: "https://benicehospitality.com/alex" },
  openGraph: {
    title: "Alex Henry. Vehicles, technology, and the build side of BNHG.",
    description:
      "Della runs property. Alex runs vehicles and tech. Book a working call, get on the Car Rental Riches waitlist, or see what Signal does for boutique hotels.",
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
    title: "Vehicle Fleet Operations",
    body: "Pricing, channel mix, cleaning cadence, and customer flow for operators running three to thirty economy vehicles. The same operating discipline Della brings to property, applied to the cars sitting in your driveway.",
  },
  {
    title: "Turo and Direct Channel Strategy",
    body: "When to lean into Turo, when to diversify, and how to honestly model the trade-off. Most fleet teachers online treat Turo as the whole game. It is one channel. Building the others is where small fleets quietly outgrow the side-hustle bracket.",
  },
  {
    title: "Tech Stack and Integrations",
    body: "When the off-the-shelf tools stop talking to each other, Alex builds the bridge. PMS integrations, fleet management dashboards, the small automations that let one person run what used to take three. You keep the code and the keys.",
  },
  {
    title: "AI Search and Visibility",
    body: "Getting your hotel or your fleet cited inside ChatGPT, Perplexity, and the AI overviews that are quietly replacing search. Structured content, schema, and a monitoring stack that proves the work is paying out.",
  },
  {
    title: "OTA Reconciliation and Revenue Recovery",
    body: "Most independent hotels are leaking commissions on cancellations, duplicate charges, and post-stay adjustments. Signal's revenue integrity monitor finds the leaks, files the reclaims, and turns recovered dollars into a recurring line item on your P&L.",
  },
  {
    title: "Automations and Internal Tools",
    body: "The repetitive work that eats your week. Pre-arrival messages, vendor flows, housekeeping routing, fleet inspection logs, guest comms. The boring infrastructure that gives an operator their evenings back.",
  },
];

const STATS = [
  { figure: "3-30", label: "Vehicles in the CRR sweet spot" },
  { figure: "10-50", label: "Rooms in the Signal sweet spot" },
  { figure: "100%", label: "Signal scopes written down before kickoff" },
  { figure: "30", label: "Day money-back on productized work" },
];

const FAQS = [
  {
    q: "What does Alex actually focus on at BNHG?",
    a: "Two things, mostly. He runs the vehicle management side of the company, which is where Car Rental Riches lives. And he leads the technology work that touches everything else, including Signal services for boutique hotels. Della handles the property coaching. Alex handles the cars, the tools, and the systems underneath all of it.",
  },
  {
    q: "How is Car Rental Riches different from Room Rental Riches?",
    a: "Same operating method, applied to a different asset. Della's course is for people running property. Alex's is for people running cars. Pricing logic, channel strategy, ops cadence, customer flow. If you have three vehicles on Turo and you are tired of running the whole thing from your phone, this is the one.",
  },
  {
    q: "Do I need to operate vehicles to work with Alex?",
    a: "No. Plenty of his work is on the property side too. Signal services for boutique hotels, custom automations, integrations that connect tools you already pay for. If your operation is mostly property but the tech is the thing holding you back, you are in the right room.",
  },
  {
    q: "What is Signal and who is it for?",
    a: "Signal is the services arm Alex leads. It is built for independent boutique hotels with ten to fifty rooms that want real engineering work instead of another agency proposal. Quick Wins, 30-Day Sprints, monthly retainers, and custom builds. Every engagement has a written success criterion before kickoff, and a money-back guarantee on productized work.",
  },
  {
    q: "Why work with Alex instead of an agency?",
    a: "Agencies sell decks. Alex ships software. The work ends with a system that runs, not a slide that gets emailed around. And because he came up as both a Technical Program Manager and a Software Engineering Manager, projects move on a real timeline with real status, not vibes.",
  },
  {
    q: "Can you work with my existing PMS, fleet software, or whatever I am already paying for?",
    a: "Yes. Alex builds on top of what you already have whenever it makes sense. Mews, Cloudbeds, Hostfully, Turo, your own spreadsheets. If your tool has an API and you have the keys, we can work with it. If you are mid-migration, we sequence the build so the new stack lands clean.",
  },
];

export default function AlexPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-cream pt-24 md:pt-32 lg:pt-36 pb-14 md:pb-16 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
              Alex Henry &middot; Co-Founder, Be Nice Hospitality
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-7">
              Vehicles, technology, and the build side of BNHG.
            </h1>
            <p className="font-sans text-lg md:text-xl text-charcoal leading-snug mb-8 max-w-xl">
              Della runs the property side of the house. Alex runs vehicles
              and tech. If you operate cars, run a boutique hotel that needs
              real systems, or you are tired of paying for software that does
              not quite fit, you are in the right place.
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-10 max-w-xl">
              You have three doors. Book a working call. Get on the Car Rental
              Riches waitlist. Or see what Signal can do for your property.
              Pick the one that fits where you actually are right now.
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
              <CarRentalRichesWaitlistTrigger variant="secondary" size="lg">
                Car Rental Riches Waitlist
              </CarRentalRichesWaitlistTrigger>
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
            <SectionLabel>The build problem</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Most small operators are running on phones and group chats.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-5 font-sans text-lg text-charcoal leading-snug">
              <p>
                A five-vehicle Turo fleet runs on the same patchwork as a
                twenty-room boutique hotel. A notes app. Two spreadsheets.
                Three messaging threads. Prayer.
              </p>
              <p>
                It works until it does not. A booking gets missed. A vendor
                does not show. A guest message sits unanswered overnight.
                The bigger companies solved this with software a decade ago.
                Smaller operators got priced out of the same solutions, or
                sold versions that do not quite fit.
              </p>
              <p>
                Most agencies show up with a brand refresh. That is not the
                problem. The problem is the systems underneath, and how few
                people are willing to actually build them.
              </p>
              <p className="font-medium text-deep-teal">
                Alex builds those systems. For fleet operators. For boutique
                hotels. For the people running real businesses at a scale
                where they still know everybody by name.
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
              src="/images/Website%20Images/Alex%20Turo%20Shot.png"
              alt="Alex Henry with one of the fleet vehicles behind the Car Rental Riches playbook"
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedItem>
              <SectionLabel>Three doors</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                Pick the door that fits you today.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                Most people start with a call or the waitlist. Signal comes
                in when a boutique hotel is ready for real engineering work
                instead of another deck. Start where you actually are.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {/* Primary card: call */}
            <AnimatedItem className="md:col-span-1">
              <div className="bg-deep-teal text-white p-10 h-full flex flex-col rounded-sm relative overflow-hidden">
                <span className="absolute top-5 right-5 font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gold font-semibold">
                  Recommended
                </span>
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  Work directly with Alex
                </p>
                <h3 className="font-display text-3xl font-semibold leading-tight mb-4">
                  Book a 1:1 Call
                </h3>
                <p className="font-sans text-base text-white/85 leading-snug mb-8 flex-grow">
                  Thirty focused minutes on your fleet, your property, or the
                  one piece of the stack that is driving you crazy. If Alex is
                  not the right fit, he tells you on the call.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">&rarr;</span>
                    Bring a real question, deal, or problem
                  </p>
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">&rarr;</span>
                    Walk away with a next step that fits you
                  </p>
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">&rarr;</span>
                    Limited slots each week
                  </p>
                </div>
                <Button
                  href={bookingUrl({
                    founder: "alex",
                    source: BOOKING_SOURCES.ALEX_DOORS_CARD,
                  })}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Book a Discovery Call
                </Button>
              </div>
            </AnimatedItem>

            {/* Secondary card: Car Rental Riches */}
            <AnimatedItem>
              <div className="bg-white border border-charcoal/10 p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  For fleet operators
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Car Rental Riches Waitlist
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-grow">
                  The vehicle version of Della&rsquo;s course. Pricing logic,
                  channel mix, ops cadence, and customer flow for operators
                  running three to thirty economy vehicles. In production
                  now, opens later this year.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Turo first, then everything beyond it
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Real numbers from a small fleet
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Early-bird pricing for the waitlist
                  </p>
                </div>
                <CarRentalRichesWaitlistTrigger
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  Join the Waitlist
                </CarRentalRichesWaitlistTrigger>
              </div>
            </AnimatedItem>

            {/* Tertiary card: Signal */}
            <AnimatedItem>
              <div className="bg-white border border-charcoal/10 p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  For boutique hotels
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Signal Engagements
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-grow">
                  Productized engagements and custom builds for independent
                  hotels with ten to fifty rooms. Quick Wins, Sprints,
                  retainers, and bespoke work. Every scope written down
                  before kickoff and backed by a money-back guarantee on
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
                <Button href="/signal" variant="secondary" size="md" fullWidth>
                  See Engagements
                </Button>
              </div>
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
                  Program management to building two arms of one company.
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
                <div className="border-l-2 border-warm-gold pl-6">
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
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Building the vehicle arm
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Car Rental Riches and the small-fleet playbook.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    While Della was teaching property operators, Alex started
                    quietly building the equivalent for cars. Pricing
                    methods, channel strategy, ops cadence, and the customer
                    flow that turns a Turo side hustle into a fleet you can
                    actually run. Car Rental Riches is the result. Ships
                    later this year.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Building Signal
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Tech services for boutique hotels that were tired of
                    decks.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    Signal came out of a pattern Alex kept seeing. Boutique
                    hotels paying agencies for slides and PDFs while their
                    booking engine was slow on mobile and their PMS was not
                    talking to their channel manager. So he built a services
                    arm that ships working software instead, with the scope
                    written down before kickoff.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Why he builds here
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Because the operators in the middle deserve real tools.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    The properties and fleets Alex works with are too big for
                    a notes app and too small for enterprise software. The
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
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                Six skills. All earned doing the work.
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start"
          >
            {EXPERTISE.map((item) => (
              <AnimatedItem key={item.title}>
                <details className="group bg-off-white p-8 border-t-2 border-warm-gold">
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
              &ldquo;Alex spent the first thirty minutes asking about my
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

      {/* IMAGE BAND */}
      <section className="bg-cream py-12 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src="/images/Website%20Images/alex%20in%20hotel%20lobby.png"
              alt="Alex in a boutique hotel lobby, the type of property Signal builds services for"
              fill
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          </div>
        </div>
      </section>

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
            Thirty minutes with Alex will save you weeks of guessing. Bring
            the fleet, the property, or the integration that has been driving
            you crazy. Walk away with a plan you can actually run.
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
    </>
  );
}
