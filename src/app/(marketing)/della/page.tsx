import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export const metadata: Metadata = {
  title:
    "Della Henry | Southeast Mid-Term Rental & Co-Living Coach (Atlanta, GA)",
  description:
    "Atlanta MTR operator running 12 mid-term rentals across Atlanta, Charlotte, Nashville, Savannah, and Birmingham. Travel nurse, corporate housing, and insurance displacement playbooks from an operator who runs the units she teaches about.",
  keywords: [
    "mid-term rental coach",
    "MTR Atlanta",
    "co-living Southeast",
    "travel nurse housing",
    "corporate housing operator",
    "insurance displacement housing",
    "Southeast Airbnb alternative",
    "Della Henry",
    "Be Nice Hospitality",
    "mid-term rental course",
  ],
  alternates: { canonical: "https://benicehospitality.com/della" },
  openGraph: {
    title: "Della Henry. Southeast Mid-Term Rental Coach.",
    description:
      "12 MTR units. 5 Southeast markets. 1 operating system. Book a working call, take the Room to Rental Riches Masterclass, or pull from the free resource library.",
    url: "https://benicehospitality.com/della",
    type: "profile",
    images: [
      {
        url: "https://benicehospitality.com/images/Dee.jpeg",
        width: 1200,
        height: 1200,
        alt: "Della Henry, Co-Founder of Be Nice Hospitality Group",
      },
    ],
  },
};

const EXPERTISE = [
  {
    title: "Mid-Term Rental Operations",
    body: "Cleaning, turns, vendor SLAs, maintenance routes. Built for 30 day plus stays, not weekend Airbnbs. The same playbook keeps a 12-unit Southeast portfolio running with 1 full-time hire.",
  },
  {
    title: "Demand Sourcing Beyond the OTAs",
    body: "Travel nurse agencies, corporate housing brokers, insurance displacement contracts, and direct relocation channels. Where the real MTR money lives in Atlanta, Charlotte, Nashville, Savannah, and Birmingham. How to turn an inbound inquiry into a 6-month contract.",
  },
  {
    title: "Southeast Regulatory Navigation",
    body: "Permit pathways, STR vs MTR carve-outs, HOA workarounds, and the city-by-city traps that quietly sink new operators. State-specific, not generic.",
  },
  {
    title: "Pricing & Length-of-Stay Math",
    body: "When to discount for 90 days. When to hold. How to model the trade-off in 5 minutes on a napkin. The math that keeps a portfolio at 92 percent occupancy without becoming a commodity.",
  },
  {
    title: "Guest Experience Systems",
    body: "Pre-arrival, mid-stay, departure. The touchpoints that turn a 6-month medical contract into a renewal plus a referral. Tech stack and SOPs included.",
  },
  {
    title: "Underwriting Southeast Properties",
    body: "What to actually look for when you are buying or leasing for MTR. The 3 numbers that matter, the 5 neighborhoods worth a hard look right now, and the deal-breakers that never show up on a pro forma.",
  },
];

const STATS = [
  { figure: "8", label: "Years running mid-term rentals" },
  { figure: "12", label: "Units in active operation" },
  { figure: "5", label: "Southeast cities" },
  { figure: "92%", label: "Trailing 12-month occupancy" },
];

const FAQS = [
  {
    q: "Is this only useful if I operate in the Southeast?",
    a: "The operating system works anywhere. Cleaning SOPs, vendor playbooks, pricing logic, guest experience tech. All of it travels. The regulatory and market modules are Southeast first because that is where Della runs her units and where her numbers are real. If you are in Phoenix or Boise you still get most of the value. You just do your own legal homework for your city.",
  },
  {
    q: "What is the difference between booking a call and buying the course?",
    a: "The course is the system. 12 modules, $500, lifetime access, fully self-paced. A call is 1 focused hour on your actual portfolio. A deal you are underwriting. A unit bleeding cash. A regulatory question you cannot get a straight answer to. Most people take the course first and book a call once they have specific questions.",
  },
  {
    q: "I am brand new. Do I need to own units already?",
    a: "No. The first 3 modules of the Room to Rental Riches Masterclass walk you through property selection and underwriting for people who do not own a single door yet. The free resource library has a starter checklist if you want to see how Della thinks before you spend a dollar.",
  },
  {
    q: "Why Della instead of any other MTR coach?",
    a: "Because she runs the units she teaches you about. 12 units. 5 Southeast cities. All mid-term. All hers or under her management. When she tells you how a corporate housing inquiry converts in Atlanta in October, it is because she just closed one.",
  },
  {
    q: "How fast can I expect to see results?",
    a: "Depends where you start. Operators with units already running see pricing and length-of-stay wins inside 30 days of applying the course. Acquisition-stage operators are working a longer clock. 3 to 6 months to a first MTR-ready unit is realistic. Faster if your capital is ready.",
  },
  {
    q: "Will Della work with me long term?",
    a: "Not as a traditional coach with a 6-month retainer. She does one-off working calls because that is honestly what most operators need. If you want ongoing eyes on a portfolio, the Be Nice Hospitality team offers that separately. Ask on the call.",
  },
];

export default function DellaPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-cream pt-24 md:pt-32 lg:pt-36 pb-14 md:pb-16 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-6">
              Della Henry · Co-Founder, Be Nice Hospitality
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-7">
              Run profitable mid-term rentals in the Southeast.
            </h1>
            <p className="font-sans text-lg md:text-xl text-charcoal leading-snug mb-8 max-w-xl">
              12 MTR units. 5 cities. 8 years of doing this every
              single day. If you are trying to build a mid-term rental
              portfolio in Atlanta, Charlotte, Nashville, Savannah, or
              Birmingham, you are in the right place.
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-10 max-w-xl">
              You have 3 doors. Book a working call with Della. Take the
              full course. Or pull what you need from the free resource
              library. Pick the one that fits where you actually are right
              now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                href={bookingUrl({
                  founder: "della",
                  source: BOOKING_SOURCES.DELLA_HERO,
                })}
                variant="primary"
                size="lg"
              >
                Book a Discovery Call
              </Button>
              <Button
                href="/courses/room-rental-riches"
                variant="secondary"
                size="lg"
              >
                See the Course
              </Button>
            </div>

            <p className="font-sans text-sm text-charcoal/60 mt-6 italic">
              No discovery-call sales theater. Calls are working sessions.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-md ml-auto mr-auto lg:w-[26rem] lg:mr-0">
            <div className="absolute inset-0 bg-warm-gold/30 rounded-sm translate-x-4 translate-y-4" />
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              <Image
                src="/images/Website%20Images/Della%20Casual.png"
                alt="Della Henry, Southeast mid-term rental operator and co-founder of Be Nice Hospitality Group"
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

      {/* THE SOUTHEAST PLAY (problem framing) */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedItem>
            <SectionLabel>The Southeast play</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Most MTR coaches do not run units in the Southeast.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-5 font-sans text-lg text-charcoal leading-snug">
              <p>
                Here is the truth. The loudest mid-term rental teachers online
                operate in Phoenix, Dallas, or Boise. Their playbooks work
                there. Imported to Atlanta or Charlotte without adjustment,
                they leak money every month.
              </p>
              <p>
                The Southeast plays different. Permitting is fractured city by
                city. HOA boards move fast on STR restrictions. And the
                dominant MTR demand here is travel nurses, corporate
                relocations, and insurance displacement contracts. Not digital
                nomads chasing wifi and a hot tub.
              </p>
              <p>
                If you are buying a generic course or taking advice from
                someone who has never closed a deal in Georgia, you are
                guessing with your money.
              </p>
              <p className="font-medium text-deep-teal">
                Della built her portfolio in this region. The system she
                teaches is the same one she runs every Monday morning. Not a
                framework. The actual playbook.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* IMAGE BAND: Atlanta exterior / market shot */}
      <section className="bg-off-white pb-14 md:pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src="/images/Website%20Images/hf_20260528_162140_0ee925d0-fbc6-4a93-af15-0c4174b02574.png"
              alt="Southeast neighborhood scene where Della operates mid-term rentals"
              fill
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          </div>
        </div>
      </section>

      {/* THREE WAYS IN (moved between Southeast Play and Journey) */}
      <AnimatedSection theme="light" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedItem>
              <SectionLabel>3 doors</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                Pick the door that fits you today.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                Most people start with the course or the free library. They
                book a call later, once they have a specific deal, a unit
                that is underperforming, or a regulatory question they cannot
                get a straight answer to. Start where you are.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {/* Primary card: book a call */}
            <AnimatedItem className="md:col-span-1">
              <div className="bg-deep-teal text-white p-10 h-full flex flex-col rounded-sm relative overflow-hidden">
                <span className="absolute top-5 right-5 font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gold font-semibold">
                  Recommended
                </span>
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  Work directly with Della
                </p>
                <h3 className="font-display text-3xl font-semibold leading-tight mb-4">
                  Book a 1:1 Call
                </h3>
                <p className="font-sans text-base text-white/85 leading-snug mb-8 flex-grow">
                  30 focused minutes on your portfolio, your underwriting,
                  or your operating question. No upsell theater. If she
                  cannot help, she tells you on the call.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">→</span>
                    Bring a specific deal, unit, or question
                  </p>
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">→</span>
                    Walk away with next-step clarity
                  </p>
                  <p className="font-sans text-sm text-white/75 flex items-start gap-2">
                    <span className="text-warm-gold mt-1">→</span>
                    Limited slots each week
                  </p>
                </div>
                <Button
                  href={bookingUrl({
                    founder: "della",
                    source: BOOKING_SOURCES.DELLA_DOORS_CARD,
                  })}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Book a Discovery Call
                </Button>
              </div>
            </AnimatedItem>

            {/* Secondary card: course */}
            <AnimatedItem>
              <div className="bg-white border border-charcoal/10 p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  Learn the full system
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Room to Rental Riches Masterclass
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-grow">
                  The full operating manual. 12 modules, video led, fully
                  self-paced. 500 dollars, lifetime access, no
                  cohort schedule pressuring you. Watch on your couch in
                  pajamas.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    Property selection through scaling
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    Southeast regulatory deep-dives
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    SOPs, templates, vendor lists
                  </p>
                </div>
                <Button
                  href="/courses/room-rental-riches"
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  See the Course
                </Button>
              </div>
            </AnimatedItem>

            {/* Tertiary card: resources */}
            <AnimatedItem>
              <div className="bg-white border border-charcoal/10 p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                  Start free
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Browse the Resource Library
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-grow">
                  Checklists, market briefs, vendor templates, and articles
                  Della has written from real operating reps. Free. No email
                  wall on most of it. Use what you need.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    First-unit underwriting checklist
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    City-by-city regulatory primers
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">→</span>
                    Travel nurse listing teardowns
                  </p>
                </div>
                <Button href="/resources" variant="secondary" size="md" fullWidth>
                  Open the Library
                </Button>
              </div>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* DELLA'S JOURNEY */}
      <AnimatedSection theme="off-white" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
            <div>
              <AnimatedItem>
                <SectionLabel>How she got here</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                  From 1 Atlanta unit to a Southeast operating system.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  Della did not start out planning to teach. She started
                  trying to make a single rental house pay for itself. The
                  short version is below. The long version lives inside the
                  course.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <div className="relative aspect-[4/5] w-full overflow-hidden mt-10">
                  <Image
                    src="/images/Website%20Images/Della%20Behind%20Desk.png"
                    alt="Della Henry working at her desk on Southeast mid-term rental operations"
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
                    Before the portfolio
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    U.S. Army. Then private-sector operations.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    Della spent her early career inside systems that did not
                    forgive sloppy execution. That training shows up in how
                    she runs a portfolio today. Checklists. Vendor SLAs.
                    Standing Monday meetings. And a refusal to confuse hustle
                    with operating leverage.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    The first unit
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    A craftsman in southwest Atlanta. And a hard lesson on STR.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    She started where most people start. Weekend short-term
                    rentals on the big OTAs. The numbers worked on paper. The
                    operations broke them. Inside 18 months she pivoted hard
                    to 30 day plus stays, leaning into travel-nurse demand at
                    the hospital corridors south of I-20. The cash flow
                    stabilized. Her weekends came back.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    The portfolio today
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    12 units. 5 Southeast cities. 1 playbook.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    The portfolio is mixed. A handful of owned units. A
                    couple of rental arbitrage agreements with seasoned
                    landlords. Co-living arrangements that serve corporate
                    housing contracts. What ties it together is the
                    operating system. The same SOPs run every door,
                    regardless of city.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-warm-gold pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Why she teaches now
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Because bad MTR advice is costing operators real money.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    Della built the Room to Rental Riches Masterclass and the resource library
                    because she got tired of watching new Southeast operators
                    pay tuition to people who have not run a real portfolio
                    in years. The course is the manual she wishes she had
                    in year one. Nothing more, nothing fancier than that.
                  </p>
                </div>
              </AnimatedItem>
            </AnimatedDiv>
          </div>
        </div>
      </AnimatedSection>

      {/* EXPERTISE GRID */}
      <AnimatedSection theme="light" className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <AnimatedItem>
              <SectionLabel>What Della brings</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                6 skills. All earned in the field.
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

      {/* TESTIMONIAL / PULL QUOTE */}
      <AnimatedSection theme="green" className="py-9 md:py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedItem>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[1.25] italic mb-5">
              &ldquo;Della is the only MTR coach I have worked with whose
              answer to a hard question was not a slide deck. It was a
              spreadsheet from last Tuesday with her own numbers on it.&rdquo;
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-sm text-warm-gold tracking-[0.2em] uppercase font-semibold">
              1:1 client · Charlotte, NC
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

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

      {/* IMAGE BAND: warm closing image before final CTA */}
      <section className="bg-cream py-12 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src="/images/Website%20Images/Della%20At%20Hutchens.png"
              alt="Della Henry at a Southeast property at golden hour"
              fill
              className="object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
          </div>
        </div>
      </section>

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
            The next 30 minutes with Della will save you months of
            guessing on Southeast MTR. Bring the question, the deal, or the
            unit that is keeping you up. Walk away with a plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href={bookingUrl({
                founder: "della",
                source: BOOKING_SOURCES.DELLA_FINAL_CTA,
              })}
              variant="primary"
              size="lg"
            >
              Book a Discovery Call
            </Button>
            <Link
              href="/courses/room-rental-riches"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Or start with the course
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
