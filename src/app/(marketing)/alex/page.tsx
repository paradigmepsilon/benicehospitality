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
    "Alex Henry | Fleet Management, Systems & AI at Be Nice Hospitality (Atlanta, GA)",
  description:
    "Alex Henry, co-founder of Be Nice Hospitality. He runs the vehicle side of the company and the technology behind it: fleet operations for 3 to 30 vehicles, custom systems and integrations, and AI applied where it actually pays. Boutique stays served through Signal.",
  keywords: [
    "fleet management consultant",
    "small rental fleet operations",
    "Turo host pricing strategy",
    "fleet operations Atlanta",
    "Car Rental Riches",
    "systems integration consultant",
    "AI enablement",
    "AI adoption",
    "hospitality automation",
    "Signal by BNHG",
    "Alex Henry",
    "Be Nice Hospitality",
  ],
  alternates: { canonical: "https://benicehospitality.com/alex" },
  openGraph: {
    title: "Alex Henry. Fleet operations, real systems, and AI without the hype.",
    description:
      "Della runs the co-living properties. Alex runs the vehicles and the technology: fleet operations for 3 to 30 cars, custom tools and integrations, and AI his clients can actually explain. Boutique stays served through Signal.",
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
    title: "Fleet Operations and Pricing",
    body: "Occupancy, rate, and cost per turn. Those 3 numbers decide whether a fleet makes money, and most hosts are guessing at all 3. I will show you how to read them, what to change first, and when to leave a price alone.",
  },
  {
    title: "Channel Strategy Beyond Turo",
    body: "Turo is discovery. It is not a business. The hosts who survive a policy change or an account review are the ones already running direct bookings, corporate accounts, or a second platform alongside it. I help you build that second channel before the day you need it.",
  },
  {
    title: "Claims, Damage and Revenue Protection",
    body: "Approved is not paid. The difference between a claim that pays and one that quietly dies is a date-stamped baseline taken before the guest drives off, plus knowing the reporting clock starts at trip end. Most hosts learn that the expensive way.",
  },
  {
    title: "Automations and Internal Tools",
    body: "The repetitive work that eats your week. Pre-arrival messages, inspection logs, cleaning routing, vendor follow-ups. Boring infrastructure, built once, that gives you your evenings back.",
  },
  {
    title: "Tech Stack and Integrations",
    body: "When your tools stop talking to each other, I go build the bridge instead of selling you another subscription. Turo, your PMS, your accounting, your own spreadsheets. If it has an API and you have the keys, we can work with it. You keep the code and the keys when we are done.",
  },
  {
    title: "AI, Applied Without the Hype",
    body: "Where AI genuinely pays off in your operation and where it does not. Custom assistants, document and photo handling, and getting your business cited inside ChatGPT and the AI overviews that are quietly replacing search. Plus the part everyone skips: teaching your team enough about it to trust it.",
  },
];

const STATS = [
  { figure: "3-30", label: "Vehicles in my sweet spot" },
  { figure: "24hr", label: "Claim window most hosts miss" },
  { figure: "100%", label: "Scopes written down before kickoff" },
  { figure: "30", label: "Day money-back on productized work" },
];

const FAQS = [
  {
    q: "What do you actually do at BNHG?",
    a: "I run the vehicle side of the company, and I handle the technology. That means fleet operations day to day, plus the systems and AI work underneath it. Della handles the co-living property coaching. So if you have cars, or you have software that is not doing what it promised, you are talking to the right one of us.",
  },
  {
    q: "Who is the fleet work for?",
    a: "Operators running 3 to 30 vehicles who have outgrown running the whole thing from their phone. If you have 1 car and it is covering its note, you do not need a system yet. You need a second car. That is the honest answer, and it is the one I would want somebody to give me.",
  },
  {
    q: "How is Car Rental Riches different from Room Rental Riches?",
    a: "Same operating method, different asset. Della's course is for people running co-living properties. Mine is for people running cars. Pricing logic, channel strategy, ops cadence, customer flow. It is in production now and opens later this year.",
  },
  {
    q: "What does a tech background have to do with renting cars?",
    a: "More than you would think. A fleet is an inventory system with a maintenance schedule and a claims process bolted onto it. I spent years as a Technical Program Manager and a Software Engineering Manager building exactly that kind of thing. It is why I can tell you what to fix and then go build it, instead of handing you a list and wishing you luck.",
  },
  {
    q: "When you say AI, what do you actually mean?",
    a: "Specific things, not a slogan. Assistants that draft your guest messages in your voice. Systems that read documents and inspection photos so you are not doing it at 11 at night. Getting your business cited inside ChatGPT and Perplexity. And the enablement work that teaches your team what the tool is doing, because a tool nobody understands gets abandoned by week 6.",
  },
  {
    q: "Can you work with the software I already pay for?",
    a: "Yes, and I would rather. Turo, Mews, Cloudbeds, Hostfully, your accounting, your own spreadsheets. If it has an API and you have the keys, we can work with it. If you are mid-migration, we sequence the build so the new stack lands clean.",
  },
  {
    q: "Do you still work with boutique stays?",
    a: "I do. Signal is the services arm I lead for independent boutique stays, from 10 to 50 room hotels and inns to the design-forward short-term rentals guests book on purpose. Quick Wins, 30-Day Sprints, retainers, and custom builds. Every engagement has a written success criterion before kickoff and a money-back guarantee on the productized work.",
  },
];

export default function AlexPage() {
  return (
    // The page carries the boutique lane because that is BNHG's house gold, and
    // this is a founder page rather than a vertical page. The fleet work leads
    // the *content*; the Car Rental Riches card inside is the one block scoped
    // to the fleet lane, since it belongs to a different vertical.
    <LaneSection lane="boutique">
      {/* HERO */}
      <section className="bg-(--lane-wash,var(--color-cream)) pt-24 md:pt-32 lg:pt-36 pb-14 md:pb-16 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-6">
              Alex Henry &middot; Co-Founder, Be Nice Hospitality
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.05] tracking-tight mb-7">
              I run rental fleets, and I build the systems that run them.
            </h1>
            <p className="font-sans text-lg md:text-xl text-charcoal leading-snug mb-8 max-w-xl">
              Della runs the co-living side of the house. I run the vehicles and
              the technology. Before any of this I spent years in tech as a
              Technical Program Manager and a Software Engineering Manager,
              which is a long way of saying I know how to make a complicated
              operation behave.
            </p>
            <p className="font-sans text-base text-charcoal/85 leading-snug mb-10 max-w-xl">
              Most of my work is with people running 3 to 30 cars who have
              outgrown the spreadsheet. The rest is the systems and AI work
              underneath it, which travels to any operation, boutique stays
              included. Book a working call and we will find the piece you
              actually need.
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
              <Button href="/fleet" variant="secondary" size="lg">
                See the Fleet Work
              </Button>
            </div>

            <p className="font-sans text-sm text-charcoal/60 mt-6 italic">
              Calls are working sessions. I will not run sales theater at you.
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
            <SectionLabel>The real problem</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-8">
              Fleets do not stall on cars. They stall on everything around the
              cars.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-5 font-sans text-lg text-charcoal leading-snug">
              <p>
                The story usually goes the same way. You buy the second car,
                then the third, and for a while it feels great. Then the
                calendar gets messy. A claim gets denied because nobody
                photographed the bumper. Pricing drifts because you have not
                looked at it in a month. Cleaning gets scheduled in a group
                chat at 10 at night.
              </p>
              <p>
                None of that is a car problem. It is an operations problem, and
                underneath that it is a systems problem. Systems are what I did
                for a living before I ever bought a vehicle.
              </p>
              <p>
                It is also why I am careful with AI. A lot of operators have
                been sold a tool nobody could explain. 6 weeks later the team is
                back to the notes app and 2 spreadsheets, and the software is
                still billing every month. The technology usually worked fine.
                Nobody trusted it, so nobody used it.
              </p>
              <p className="font-medium text-deep-teal">
                So I start with the unglamorous version. Get honest about what
                your operation costs you in hours, fix the handful of things
                that are leaking money, then automate only what has earned it.
                Fleets first. And any operator still small enough to know
                everybody by name.
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
              alt="Alex Henry with a vehicle from the rental fleet he operates outside Atlanta"
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
              <SectionLabel>What I do</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                One skillset. Pointed at vehicles first.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                The day job is fleet operations. What makes me useful at it is
                the years I spent building software and running technical
                programs before this. Boutique stays get the same treatment
                through Signal, and that is where the method got tested against
                a completely different kind of asset.
              </p>
            </AnimatedItem>
          </div>

          {/* Tier 1: the fleet work itself, full width. */}
          <AnimatedItem>
            <div className="bg-deep-teal text-white p-8 md:p-12 rounded-sm relative overflow-hidden mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
                <div>
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
                    01 &middot; The work
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-5">
                    Fleet Operations &amp; Management
                  </h3>
                  <p className="font-sans text-base md:text-lg text-white/85 leading-snug">
                    Pricing, channel mix, claims, cleaning cadence, and customer
                    flow for operators running 3 to 30 vehicles. I run my own
                    fleet on this, so what you get is what I actually do on
                    Monday morning.
                  </p>
                </div>

                <div className="flex flex-col">
                  <div className="space-y-3.5 mb-8">
                    {[
                      "Pricing and utilization read off real numbers instead of gut feel",
                      "Channel strategy past a single app, so 1 policy change cannot end you",
                      "Claim documentation that holds up, captured before the guest drives off",
                      "Ops cadence and dashboards that let 1 person run what used to take 3",
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
                      30 focused minutes. If I am not the right fit, I will tell
                      you on the call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedItem>

          {/* Tiers 2 and 3: the technical edge gets two thirds, the course one. */}
          <AnimatedDiv stagger className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 2: the IT and AI background, which is the differentiator. */}
            <AnimatedItem className="lg:col-span-2">
              <div className="bg-white border-t-2 border-(--lane-accent,var(--color-warm-gold)) border-x border-b border-x-charcoal/10 border-b-charcoal/10 p-8 md:p-10 h-full flex flex-col rounded-sm">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-(--lane-accent,var(--color-warm-gold)) mb-4">
                  02 &middot; The edge
                </p>
                <h3 className="font-display text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  Systems, Integrations &amp; AI
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-6 flex-grow">
                  This is the part most fleet advice skips. I came up as a
                  Technical Program Manager and a Software Engineering Manager,
                  so when your tools stop talking to each other I can go build
                  the bridge instead of recommending another subscription. AI
                  goes in last, and only where it earns its keep. Everything I
                  build for you is yours to keep.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Custom tools, dashboards, and automations across your stack
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    Integrations for the software you already pay for
                  </p>
                  <p className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                    <span className="text-deep-teal mt-1">&rarr;</span>
                    AI your team can explain, which is what makes it stick
                  </p>
                </div>
                <Button href="/signal" variant="secondary" size="md">
                  See Packaged Engagements
                </Button>
              </div>
            </AnimatedItem>

            {/* Tier 3: Car Rental Riches. Fleet vertical, so it carries the
                fleet lane rather than the page's boutique lane. Deliberately
                quieter than tier 2: no top keyline, muted heading. */}
            <AnimatedItem className="lg:col-span-1">
              <LaneSection lane="fleet" className="h-full">
                <div className="bg-off-white border border-charcoal/10 p-8 h-full flex flex-col rounded-sm">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/50 mb-4">
                    03 &middot; Written down
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-charcoal leading-tight mb-4">
                    Car Rental Riches
                  </h3>
                  <p className="font-sans text-sm text-charcoal/75 leading-snug mb-6 flex-grow">
                    Everything above, written down for operators running 3 to 30
                    economy cars. Pricing, channels, ops cadence, customer flow.
                    In production now, opens later this year.
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
                <SectionLabel>How I got here</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                  From running technical programs to running a fleet.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  I did not set out to run a hospitality company. I set out to
                  build things that worked, and this is where that landed. The
                  short version is below.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <div className="relative aspect-[4/5] w-full overflow-hidden mt-10">
                  <Image
                    src="/images/Website%20Images/alex%20at%20his%20computer.png"
                    alt="Alex Henry at his desk building fleet dashboards and operator tooling"
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
                    I spent years running both sides of a technical
                    organization. As a program manager I kept large programs
                    moving across engineering, product, and operations teams
                    that did not all report to the same person. As an
                    engineering manager I ran the teams writing the code. Most
                    people pick 1 lane. I ran both, and it is the reason a fleet
                    rollout or a stubborn integration does not rattle me.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Running the fleet
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    Cars taught me the same lesson software did.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    I started operating vehicles the way I would have run a
                    product. Measure the thing, find where it leaks, fix that
                    first. Pricing, channel mix, claim documentation, cleaning
                    cadence. A car sitting in a driveway is a note with wheels.
                    A car on the right channel at the right price is inventory
                    that pays for itself, and the operators who make money treat
                    it that way. Car Rental Riches is that whole playbook,
                    written down.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Where AI fits
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    I like AI. I just refuse to oversell it.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    I use it every day and I build with it. I also watch
                    operators get sold assistants that nobody on the team can
                    explain, which is how a tool gets abandoned a month after
                    the demo. So I put it where it does real work. Drafting
                    guest messages in your voice. Reading documents and
                    inspection photos. Catching the thing you would have missed
                    at 11 at night. Then I teach your team why it is doing what
                    it is doing.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <div className="border-l-2 border-(--lane-accent,var(--color-warm-gold)) pl-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-2">
                    Why I build here
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-deep-teal mb-3">
                    The operators in the middle deserve real tools.
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-snug">
                    The fleets, co-living properties, and boutique stays I work
                    with are too big for a notes app and too small for
                    enterprise software. That gap is where most operators
                    actually live, and most software companies walk right past
                    them. Signal is how I serve the boutique stay side of it.
                    BNHG is why any of it exists.
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
              <SectionLabel>What I bring</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                6 things I am genuinely good at.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-snug">
                The first 3 come from running vehicles every week. The last 3
                come from the years I spent in tech. Together they are the
                reason my fleet advice does not stop at &ldquo;raise your daily
                rate.&rdquo;
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

      {/* BOUTIQUE BAND. Deliberately compact. A fleet operator reading this page
          should never wonder whether they are hiring a hotel consultant. Its job
          is to prove the method travels, point at Signal, then get out of the
          way. */}
      <section className="bg-cream py-12 md:py-14 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-8 lg:gap-12 items-center">
          <div className="relative aspect-[16/9] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-sm">
            <Image
              src="/images/Website%20Images/alex%20in%20hotel%20lobby.png"
              alt="Alex Henry in a boutique hotel lobby, the kind of independent stay Signal builds systems for"
              fill
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
              sizes="(min-width: 1024px) 28rem, 90vw"
            />
          </div>

          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/50 mb-4">
              Also served
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
              The same method runs boutique stays.
            </h2>
            <p className="font-sans text-base text-charcoal/80 leading-snug max-w-xl mb-5">
              Signal is where this work is packaged for independent hotels,
              inns, and design-forward short-term rentals. AI search visibility,
              OTA reconciliation and revenue recovery, voice agents, and ops
              automation. I mention it for 1 reason: it is proof this is a
              method rather than an industry trick. What I build for a fleet is
              not borrowed from a car playbook, and what I build for a hotel is
              not borrowed from a hotel one. It comes from knowing how to read
              an operation and find the work a machine should be doing.
            </p>
            <Link
              href="/signal"
              className="inline-flex items-center gap-2 font-sans font-semibold text-deep-teal hover:text-warm-gold transition-colors duration-200 underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Explore Signal engagements
            </Link>
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
            Let&rsquo;s look at it together.
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-12 max-w-2xl mx-auto">
            30 minutes with me will save you weeks of guessing. Bring the fleet,
            the claim that got denied, the boutique stay, or the integration
            that has been driving you crazy since spring. You will leave with a
            plan you can actually run, whether or not you ever hire me.
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
              href="/fleet"
              className="inline-flex items-center justify-center font-sans font-semibold text-white/85 hover:text-warm-gold transition-colors duration-200 text-lg underline underline-offset-4 decoration-warm-gold/40 hover:decoration-warm-gold"
            >
              Or see the fleet work
            </Link>
          </div>
        </div>
      </section>
    </LaneSection>
  );
}
