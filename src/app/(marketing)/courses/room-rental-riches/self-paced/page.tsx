import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import WaitlistCta from "@/components/sections/courses/WaitlistCta";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BLUEPRINT } from "@/lib/blueprint";
import {
  RRR_PRICES,
  RRR_PATHS,
  CURRICULUM_BY_PHASE,
  LIVE_MODULE_COUNT,
  BONUS_PACK,
} from "@/lib/room-rental-riches";

/**
 * Room Rental Riches, Self-paced — sales page.
 *
 * Built in the same mould as the Blueprint sales page
 * (/books/room-rental-riches-blueprint): near-black hero carrying the price and
 * the CTA, a promise band behind a hairline rule, Della's voice in a pull
 * quote, then the light sections.
 *
 * TWO THINGS THIS PAGE IS DELIBERATELY HONEST ABOUT:
 *
 *   1. It does not print a lesson count. The hub page claims "125 lessons";
 *      Postgres has fourteen. Module and phase counts are real, so those are
 *      what appear here.
 *
 *   2. The phase spine marks which modules a student can open today. Two of
 *      twelve. Hiding that would make the waitlist CTA incoherent — the whole
 *      reason there is no buy button is that the course is still being built.
 *
 * NO TESTIMONIALS. The only RRR student quotes in existence are the fabricated
 * personas flagged in the monetization plan. Publishing those is an FTC
 * problem. Same call the Blueprint page made.
 */

const PRICE = `$${RRR_PRICES.selfPacedUsd}`;
const LIST = `$${RRR_PRICES.selfPacedListUsd}`;

const TIER = { name: "Self-paced", slug: "self_paced" as const };

export const metadata: Metadata = {
  title: `Room Rental Riches: Self-paced (${PRICE})`,
  description:
    "The full Room Rental Riches curriculum on your own timeline. Twelve modules across six phases, the resource library, lifetime access, and a year in the Nice Host Network. Founding price $287.",
  alternates: {
    canonical: `https://benicehospitality.com${RRR_PATHS.selfPaced}`,
  },
  openGraph: {
    title: "Room Rental Riches: Self-paced | Della Henry",
    description:
      "The whole co-living operating system, on your couch. Twelve modules, six phases, lifetime access, and a year in the network.",
    url: `https://benicehospitality.com${RRR_PATHS.selfPaced}`,
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/course-self-paced-student-v4.png",
        width: 1208,
        height: 1500,
        alt: "A student working through Room Rental Riches on a laptop at a home desk",
      },
    ],
  },
};

// Outcomes, not features. Rendered with the checkmark treatment below, so no
// literal glyph belongs in the strings.
const PROMISES = [
  "Score a property before you spend a dollar on it.",
  "Set rates you can defend instead of rates you guessed at.",
  "Fill your rooms without living in your inbox.",
  "Build an operation that survives you taking a week off.",
];

const SPECS = [
  "12 modules",
  "6 phases",
  "Lifetime access",
  "1 year in the network",
];

const FAQS = [
  {
    q: "What can I actually open today?",
    a: "Modules one and two, which is fourteen lessons covering the co-living opportunity and the whole legal, regulatory, and business-setup layer. The remaining ten modules plus the Bonus Pack are written and in production. That is exactly why there is a waitlist here instead of a checkout button. Founding students get every module the day it ships, at the founding price, with no upgrade fee.",
  },
  {
    q: "Do I need to own a property already?",
    a: "No. Phases one and two are built for people who have not signed a lease or closed on anything yet. Opportunity framing, legal setup, path commitment, then market analysis and the outreach that lands a first deal. If you already have the house, start at Phase three and set it up properly.",
  },
  {
    q: "How is this different from the Blueprint book?",
    a: "The Blueprint is the written system, front to back, for thirty-two dollars. It is the cheapest way to find out whether this model fits your property and your life. The course is the same body of work taught in depth, with the templates, calculators, prompt libraries, and vendor lists as working files rather than pages. Plenty of people read the book first and take the course once they know this is the business they want.",
  },
  {
    q: "How is this different from the Masterclass?",
    a: "Same curriculum. What changes is whether Della is in the room. Self-paced is you and the material on your schedule. The Masterclass is a two-day workshop where you apply the manual to your real business, with an individual hot seat and a 60-minute private follow-up, capped at six operators, at $2,497. If you implement better with a room around you, that is the one to look at.",
  },
  {
    q: "Will this work outside the Southeast?",
    a: "The operating system travels. Property scoring, pricing logic, setup standards, guest experience, and the operational rhythms work anywhere. The market examples and the state-by-state regulatory matrix cover Georgia, Florida, Texas, North Carolina, South Carolina, Virginia, and Tennessee, because that is where these homes actually run. Do your own homework on local rules for your city.",
  },
  {
    q: "Who is this NOT for?",
    a: "Anyone looking for passive income or a weekend to financial freedom. Renting by the room is a hospitality business with tenants, turnovers, and vendors in it. If you want a system you will actually run on Monday mornings, this is built for you. If you want something that runs itself while you sleep, it is not.",
  },
];

export default function SelfPacedPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-near-black px-6 pb-14 pt-28 md:px-12 md:pt-32 lg:px-20 lg:pt-36">
        {/* Warm glow so the photo sits in light rather than floating on black. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-warm-gold/20 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <Image
                  src="/images/Website%20Images/course-self-paced-student-v4.png"
                  alt="A student working through the Room Rental Riches curriculum on a laptop at a home desk"
                  fill
                  priority
                  quality={90}
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                  style={{ filter: "saturate(0.85) contrast(1.05)" }}
                />
              </div>
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                Founding price
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Room Rental Riches · Self-paced
            </p>
            <h1 className="mb-6 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              The Whole Co-Living Operating System, on Your Own Schedule.
            </h1>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              Twelve modules across six phases, from picking a property to
              handing the operation to somebody else. The same system Alex and I
              run across our own co-living homes, with the calculators,
              templates, and vendor lists as working files. No cohort schedule.
              No deadline but yours.
            </p>

            {/* Concrete, verifiable specs. Deliberately no lesson count — see
                the file header. */}
            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-white/70">
              {SPECS.map((spec) => (
                <span key={spec} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-warm-gold"
                  />
                  {spec}
                </span>
              ))}
            </div>

            <div className="mb-8 flex items-baseline gap-3">
              <span className="font-sans text-xl text-white/50 line-through">
                {LIST}
              </span>
              <span className="font-display text-5xl font-semibold text-warm-gold [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </span>
            </div>

            <WaitlistCta
              tier={TIER}
              label="Reserve a founding seat"
              source="hero"
            />

            <p className="mt-5 font-sans text-sm text-white/60">
              Enrollment is not open yet. One note when it is, nothing else.
            </p>
          </div>
        </div>

        {/* The promise, in the hero rather than a scroll away, but below the
            buy column and behind a rule so it reads as its own band. */}
        <div className="relative mx-auto mt-14 max-w-6xl border-t border-white/15 pt-10 md:mt-16">
          <p className="mb-7 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
            By the end, you will be able to
          </p>
          <ul className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-warm-gold/15"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="#B08D57"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span className="font-sans text-base leading-snug text-white/85 md:text-lg">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PULL QUOTE — runs straight on from the hero's dark ground. The promise
          band closes the pitch, the quote answers "says who?" before the page
          opens to light. */}
      <section className="bg-near-black px-6 pb-14 md:px-12 md:pb-20 lg:px-20">
        {/* A curve divider would be invisible here, both sides being
            near-black, so the rule does the separating. */}
        <div aria-hidden className="mx-auto max-w-6xl border-t border-white/15" />

        <div className="mx-auto mt-14 max-w-3xl text-center md:mt-16">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-auto mb-6 h-8 w-8 text-warm-gold"
            fill="currentColor"
          >
            <path d="M9.5 6C6.5 7.5 5 10 5 13.5V18h5v-5H7.8c0-2 .9-3.4 2.7-4.3L9.5 6zm8 0c-3 1.5-4.5 4-4.5 7.5V18h5v-5h-2.2c0-2 .9-3.4 2.7-4.3L17.5 6z" />
          </svg>
          <blockquote className="font-display text-2xl font-medium leading-snug text-white md:text-3xl lg:text-4xl">
            I did not build this to be watched. I built it to be worked. If you
            finish it and all you have is a full notebook, I did it wrong.
          </blockquote>
          <p className="mt-8 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-warm-gold">
            Della Henry
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.white} />

      {/* WHO THIS IS FOR — the two operator profiles. Copy deliberately kept in
          step with the hub page so the two surfaces never describe different
          people. */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>Who this is for</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-8 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Two operators. One course.
            </h2>
          </AnimatedItem>

          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-charcoal md:text-lg"
          >
            <AnimatedItem>
              <p className="font-semibold text-deep-teal">
                The aspiring operator without a door yet.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                You are looking at co-living because the math works and the W-2
                does not, at least not for the next twenty years. You want to
                operate somewhere in the Southeast. You have not signed a lease
                or closed on anything, and you want a structured path from
                reading about this on Reddit to a first booking. Phases one and
                two are built for you.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="pt-2 font-semibold text-deep-teal">
                The operator past hosting.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                You have somewhere between three and thirty units. Your revenue
                is real. Your time is the bottleneck. You have outgrown the
                spreadsheet phase, you are tired of Sunday-night cleaner
                scrambles, and you pay enough in platform commission to fund a
                part-time team member. Phases three through six are where you
                will spend your time.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="pt-2 font-semibold text-warm-gold">
                And if you want passive income, this is the wrong page. Renting
                by the room is a hospitality business with tenants, turnovers,
                and vendors in it. The course makes it run on systems. It does
                not make it run on nothing.
              </p>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* THE PHASE SPINE — the signature section.
          Six phases, twelve modules, on one continuous rule. The numbering is
          load-bearing here: the curriculum genuinely is a sequence, and Phase 3
          gates Phase 4 by design. The status marks turn the honest release
          story into part of the structure rather than a disclaimer bolted on
          underneath it. */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>The curriculum</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Six phases, in the order you have to do them.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                This is not a library you graze. Each phase assumes the one
                before it is finished, and Phase one ends with a commitment
                exercise that gates the rest on purpose. Most people who stall
                in this business stalled because they skipped it.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="space-y-12 md:space-y-14">
            {CURRICULUM_BY_PHASE.map(({ phase, modules }) => (
              <AnimatedItem key={phase}>
                <div>
                  <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
                    {phase}
                  </p>
                  {/* The spine itself. Padding lives on each <li> rather than
                      the <ol> so `left-0` on the marker lands exactly on the
                      border and -translate-x-1/2 centres it. */}
                  <ol className="space-y-8 border-l border-deep-teal/20">
                    {modules.map((m) => {
                      const isLive = m.status === "live";
                      return (
                        <li key={m.number} className="relative pl-7 md:pl-9">
                          <span
                            aria-hidden
                            className={[
                              "absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full",
                              isLive
                                ? "bg-warm-gold ring-4 ring-warm-gold/20"
                                : "bg-cream ring-1 ring-deep-teal/30",
                            ].join(" ")}
                          />
                          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="font-mono text-xs font-semibold tracking-[0.2em] text-charcoal/50">
                              Module {m.number}
                            </span>
                            {isLive ? (
                              <span className="rounded bg-warm-gold px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-near-black">
                                Available now
                              </span>
                            ) : (
                              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal/40">
                                In production
                              </span>
                            )}
                          </div>
                          <h3
                            className={[
                              "font-display text-xl font-semibold leading-snug md:text-2xl",
                              isLive ? "text-deep-teal" : "text-deep-teal/75",
                            ].join(" ")}
                          >
                            {m.benefit}
                          </h3>
                          <p className="mt-1 font-sans text-sm font-semibold text-charcoal/55">
                            {m.title}
                          </p>
                          <p className="mt-3 font-sans text-base leading-relaxed text-charcoal/80">
                            {m.body}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          {/* The honest release line. Sits under the spine because by this
              point the reader has already seen which dots are gold. */}
          <AnimatedItem>
            <div className="mt-12 border-l-2 border-warm-gold bg-white p-7 md:p-8">
              <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                Where the build is
              </p>
              <p className="font-sans text-base leading-relaxed text-charcoal/85">
                {LIVE_MODULE_COUNT === 1
                  ? "One module is"
                  : `${LIVE_MODULE_COUNT} modules are`}{" "}
                finished and in the platform right now. The rest are written and
                in production, and they release as each one is done. Founding
                students get every module the day it ships, at the founding
                price, with no upgrade fee. That is what the seat reserves.
              </p>
            </div>
          </AnimatedItem>

          {/* Bonus Pack. Same gold treatment the Blueprint page gives its bonus
              module, so the two pages agree on what "bonus" looks like. */}
          <AnimatedItem>
            <article className="mt-6 rounded-lg border border-warm-gold/30 bg-warm-gold/10 p-7 text-center md:p-8">
              <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-warm-gold">
                Bonus Pack · Included
              </p>
              <h3 className="mb-3 font-display text-2xl font-semibold leading-snug text-deep-teal">
                {BONUS_PACK.title}
              </h3>
              <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-charcoal/80">
                {BONUS_PACK.body}
              </p>
            </article>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* WHAT YOU GET */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedItem>
            <SectionLabel>What you get</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              The curriculum, the files, and a year in the room.
            </h2>
          </AnimatedItem>

          <AnimatedDiv
            stagger
            className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 text-left sm:flex-row"
          >
            {[
              {
                t: "The twelve modules",
                b: "Six phases, foundation through scaling, yours for life including every update.",
              },
              {
                t: "The resource library",
                b: "The pricing calculator, lease addendum templates, AI prompt libraries, SOPs, and the cleaning checklist.",
              },
              {
                t: "A year in the network",
                b: "The Nice Host Network, two founder-led live sessions a week, plus quarterly office hours with Della.",
              },
            ].map((x, i, arr) => (
              <Fragment key={x.t}>
                <AnimatedItem className="flex-1">
                  <div className="flex h-full flex-col rounded-xl bg-deep-teal p-6 shadow-[0_16px_36px_rgba(26,77,79,0.28)] ring-1 ring-warm-gold/25">
                    <p className="mb-2 font-display text-lg font-semibold text-white">
                      {x.t}
                    </p>
                    <p className="font-sans text-sm leading-relaxed text-white/85">
                      {x.b}
                    </p>
                  </div>
                </AnimatedItem>
                {i < arr.length - 1 && (
                  <div
                    aria-hidden
                    className="flex items-center justify-center font-display text-4xl font-bold leading-none text-warm-gold"
                  >
                    +
                  </div>
                )}
              </Fragment>
            ))}
          </AnimatedDiv>

          <AnimatedItem>
            <div className="mt-12 flex items-baseline justify-center gap-3">
              <span className="font-sans text-xl text-charcoal/45 line-through">
                {LIST}
              </span>
              <span className="font-display text-5xl font-semibold text-deep-teal [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </span>
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <div className="mt-8 flex justify-center">
              <WaitlistCta
                tier={TIER}
                label="Reserve a founding seat"
                source="footer"
              />
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <p className="mt-6 font-sans text-sm text-charcoal/60">
              Founding price held for the first hundred students. One note when
              enrollment opens, nothing else.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* CROSS-LINK — the Masterclass, for the reader who has decided they want
          somebody in the room with them. */}
      <AnimatedSection theme="off-white" className="px-6 py-12 md:py-14">
        <div className="mx-auto max-w-4xl">
          <AnimatedItem>
            <div className="flex flex-col items-start gap-6 border-t-2 border-warm-gold bg-white p-7 md:flex-row md:items-center md:justify-between md:p-9">
              <div className="max-w-xl">
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                  Would you rather not do it alone?
                </p>
                <p className="font-sans text-base leading-relaxed text-charcoal/85">
                  Same curriculum, a two-day workshop where you apply it to your
                  real business, an individual hot seat of your own, and a room
                  capped at six operators. That one is the Masterclass.
                </p>
              </div>
              <Button href={RRR_PATHS.masterclass} variant="secondary" size="md">
                See the Masterclass
              </Button>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* FAQ */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>Questions</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-10 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Before you reserve.
            </h2>
          </AnimatedItem>

          <AnimatedDiv stagger className="space-y-4">
            {FAQS.map((f) => (
              <AnimatedItem key={f.q}>
                <details className="group rounded-lg border border-light-gray bg-cream p-6 transition-colors duration-200 hover:border-deep-teal/40">
                  <summary className="cursor-pointer list-none font-display text-lg font-semibold text-deep-teal marker:content-none">
                    {f.q}
                  </summary>
                  <p className="mt-4 font-sans text-base leading-relaxed text-charcoal/80">
                    {f.a}
                  </p>
                </details>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <AnimatedItem>
            <p className="mt-12 font-sans text-sm leading-relaxed text-charcoal/55">
              Educational content only, not legal, tax, or financial advice.
              Dollar figures on this page are illustrative examples drawn from
              our own operations, not a guarantee of what you will earn. Consult
              a licensed attorney and tax professional in your area before making
              decisions. Want the written version first?{" "}
              <Link
                href={BLUEPRINT.path}
                className="text-deep-teal underline underline-offset-2"
              >
                Read the Blueprint
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
