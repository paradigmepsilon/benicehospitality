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
import {
  RRR_PRICES,
  RRR_PATHS,
  MASTERCLASS_WEEKS,
} from "@/lib/room-rental-riches";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

/**
 * Room Rental Riches, Masterclass — sales page.
 *
 * The tier formerly at /cohort. Every human-facing surface on the site already
 * called it the Masterclass; this route makes the URL agree. The old path
 * permanently redirects here (next.config.ts).
 *
 * THE STORED TIER VALUE IS STILL "cohort". It lives in the course_tiers CHECK
 * constraint, the WaitlistTier enum, and every /account and /admin path.
 * Renaming it is a migration. Only the label changed.
 *
 * NO DATES ANYWHERE ON THIS PAGE. There is no scheduled cohort. The page states
 * the cadence and the cap and says the waitlist gets first call, which is true.
 * Inventing a start date would be the one thing that makes a $2,497 page
 * genuinely dishonest.
 *
 * NO TESTIMONIALS, for the same reason as the Blueprint and self-paced pages.
 */

const PRICE = `$${RRR_PRICES.masterclassUsd.toLocaleString("en-US")}`;

const TIER = { name: "Masterclass", slug: "cohort" as const };

export const metadata: Metadata = {
  title: `Room Rental Riches: Masterclass (${PRICE})`,
  description:
    "Eight weeks of live guided work on your co-living portfolio, capped at fifteen operators, with a weekly hot seat and a direct line to Della. Everything in the self-paced course, plus the room.",
  alternates: {
    canonical: `https://benicehospitality.com${RRR_PATHS.masterclass}`,
  },
  openGraph: {
    title: "Room Rental Riches: Masterclass | Della Henry",
    description:
      "Eight weeks live, fifteen operators, one weekly hot seat each. The co-living operating system applied to your portfolio in real time.",
    url: `https://benicehospitality.com${RRR_PATHS.masterclass}`,
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/course-masterclass-cohort-v2.png",
        width: 1200,
        height: 800,
        alt: "Della Henry teaching a small cohort of co-living operators",
      },
    ],
  },
};

// What you walk out holding. Artifacts, not feelings.
const PROMISES = [
  "A market thesis you can defend to a lender.",
  "A property pitch you have already drilled against objections.",
  "Rates set from your own numbers, reviewed in the room.",
  "Three written SOPs somebody else could run tomorrow.",
];

const SPECS = [
  "8 weeks live",
  "Capped at 15",
  "Weekly hot seat",
  "Everything in self-paced",
];

// What the money actually buys over the $287 tier. Three things, stated plainly.
const WHAT_THE_ROOM_ADDS = [
  {
    title: "The room",
    body: "Fifteen operators working the same modules in the same eight weeks. You will watch fourteen other people hit the problem you are about to hit, two weeks before you hit it. That is the part a video cannot do.",
  },
  {
    title: "The hot seat",
    body: "Every week one slot is yours. Bring a real property, a real lease, a real number that is not working. It gets pulled apart in front of the room and you leave with a decision, not a maybe.",
  },
  {
    title: "The direct line",
    body: "Direct messaging with Della and Alex through all eight weeks, plus a permanent archive of the recordings, transcripts, and shared docs. The archive stays yours after the cohort closes.",
  },
];

const FAQS = [
  {
    q: "When does the next cohort start?",
    a: "There is no scheduled date yet, and we would rather tell you that than invent one. The Masterclass runs four times a year, capped at fifteen operators per cycle. When the next cycle is set, the waitlist hears first and gets a window to claim a seat before it opens publicly. That is what reserving does.",
  },
  {
    q: "What happens if I miss a session?",
    a: "Every session is recorded and transcribed, and the archive is permanently yours, so a missed week is recoverable. What is not recoverable is your hot seat, since those are scheduled by week. If you know you will be out, tell us early and we move your slot.",
  },
  {
    q: "Do I need a property already?",
    a: "No, and the eight weeks are sequenced so that it does not matter. Week two is where you commit to arbitrage, ownership, or co-host. Weeks three and four are market analysis and property pitching, which is exactly the work of getting a first door. Operators who already have doors spend those weeks re-underwriting what they own, which is usually uncomfortable and usually worth it.",
  },
  {
    q: "How is this different from the self-paced course?",
    a: "Same twelve modules. What changes is whether anyone is in it with you. Self-paced is $287 and runs on your schedule. The Masterclass is eight weeks with a deadline, a room, a weekly hot seat, and a direct line to Della and Alex. It also unlocks the full Bonus Pack deep dive on direct booking and AI visibility, where self-paced gets the four-lesson intro.",
  },
  {
    q: "When would Operator make more sense than this?",
    a: "When your bottleneck is your specific portfolio rather than your knowledge. Operator is ninety days of one-to-one work with Della, capped at five people a cycle, and it starts with a discovery call rather than a checkout page because we will not sell it until we know it is the right thing for what you already own. If you have doors and something is leaking, start with the call.",
  },
  {
    q: "Who is this NOT for?",
    a: "Anyone who wants to buy the answer instead of do the work. Every week has an assignment between sessions, and the hot seats only work if you show up with something real. If you cannot clear a couple of evenings a week for eight weeks, take the self-paced tier and come back for a later cohort. It is the same curriculum and nobody will think less of you.",
  },
];

export default function MasterclassPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-near-black px-6 pb-14 pt-28 md:px-12 md:pt-32 lg:px-20 lg:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-warm-gold/20 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <Image
                  src="/images/Website%20Images/course-masterclass-cohort-v2.png"
                  alt="Della Henry teaching a small, diverse cohort of co-living operators around a conference table"
                  fill
                  priority
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                  style={{ filter: "saturate(0.85) contrast(1.05)" }}
                />
              </div>
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                15 seats
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Room Rental Riches · Masterclass
            </p>
            <h1 className="mb-6 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              Eight Weeks. Fifteen Operators. Your Actual Portfolio on the Table.
            </h1>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              The same twelve modules as the self-paced course, except you are
              not doing them alone. Eight weeks of live guided work where the
              deal you are underwriting, the room that will not fill, and the
              numbers you are not sure about get worked on in front of people
              who are doing the same thing.
            </p>

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

            <div className="mb-8">
              <span className="font-display text-5xl font-semibold text-warm-gold [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </span>
            </div>

            <WaitlistCta tier={TIER} label="Reserve a seat" source="hero" />

            <p className="mt-5 font-sans text-sm text-white/60">
              Four cohorts a year. The next cycle has no date set yet, and the
              waitlist gets first call when it does.
            </p>
          </div>
        </div>

        {/* The promise band. Artifacts you leave with, not adjectives. */}
        <div className="relative mx-auto mt-14 max-w-6xl border-t border-white/15 pt-10 md:mt-16">
          <p className="mb-7 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
            Eight weeks later, you walk out with
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

      {/* PULL QUOTE — why the cap exists. It is the objection a $2,497 buyer
          raises first, so it gets answered before the page opens to light. */}
      <section className="bg-near-black px-6 pb-14 md:px-12 md:pb-20 lg:px-20">
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
            Fifteen is not scarcity marketing. It is the largest room where
            everybody still gets a hot seat and I still know what everybody is
            working on. At thirty I would be running a webinar.
          </blockquote>
          <p className="mt-8 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-warm-gold">
            Della Henry
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.white} />

      {/* WHAT THE ROOM ADDS — the honest delta over the $287 tier. */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>What the money buys</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                The curriculum is the same. Three things are not.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                You can get every module for $287 and plenty of people should.
                Here is what the difference actually is, so you can decide
                honestly which one you need.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
          >
            {WHAT_THE_ROOM_ADDS.map((x) => (
              <AnimatedItem key={x.title}>
                <article className="flex h-full flex-col rounded-lg border border-light-gray bg-cream p-7 transition-colors duration-200 hover:border-deep-teal/40 md:p-8">
                  <h3 className="mb-3 font-display text-xl font-semibold leading-snug text-deep-teal">
                    {x.title}
                  </h3>
                  <p className="font-sans text-base leading-relaxed text-charcoal/80">
                    {x.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* THE EIGHT-WEEK ARC — the signature section.
          Splitting each week into what happens live and what you do between
          sessions is the point. A flat list of topics reads like a syllabus and
          hides the thing a cohort buyer is actually paying for, which is the
          rhythm: show up, get taken apart, go do the work, come back. */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>The eight-week arc</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Twelve modules, eight weeks, and homework every one of them.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                Ninety minutes live each week. Then something to go build before
                the next one. The assignments are the reason people finish this
                and do not finish courses.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="space-y-6">
            {MASTERCLASS_WEEKS.map((w, i) => {
              // The bonus week is the finale, so it gets the gold treatment
              // rather than another white card in the stack.
              const isBonus = i === MASTERCLASS_WEEKS.length - 1;
              return (
                <AnimatedItem key={w.week}>
                  <article
                    className={[
                      "rounded-lg border p-7 transition-colors duration-200 md:p-8",
                      isBonus
                        ? "border-warm-gold/40 bg-warm-gold/10 hover:border-warm-gold/70"
                        : "border-light-gray bg-white hover:border-deep-teal/40",
                    ].join(" ")}
                  >
                    <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                        {isBonus ? "Bonus week" : `Week ${w.week}`}
                      </span>
                      <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/45">
                        {w.modules}
                      </span>
                    </div>

                    <h3 className="mb-5 font-display text-xl font-semibold leading-snug text-deep-teal md:text-2xl">
                      {w.title}
                    </h3>

                    <dl className="grid grid-cols-1 gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-4">
                      <dt className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-deep-teal md:pt-1 md:text-right">
                        Live
                      </dt>
                      <dd className="font-sans text-base leading-relaxed text-charcoal/85">
                        {w.live}
                      </dd>

                      <dt className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/45 md:pt-1 md:text-right">
                        Between
                      </dt>
                      <dd className="font-sans text-base leading-relaxed text-charcoal/65 italic">
                        {w.between}
                      </dd>
                    </dl>
                  </article>
                </AnimatedItem>
              );
            })}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      {/* WHO PICKS THIS — kept from the old cohort page, tightened. */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green px-6 py-14 text-white md:py-16"
      >
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel light>Who picks this tier</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-6 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-white md:text-5xl">
              You move when the room moves.
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-white/85 md:text-lg"
          >
            <AnimatedItem>
              <p>
                The Masterclass is the right pick if you implement better with
                peer pressure than alone. You want a deadline, a cadence, and a
                room of operators going through the same modules in the same
                eight weeks. Left to your own schedule, you would still be on
                Module three in November.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                You also want Della and Alex live for the questions that do not
                fit in a video. The ones with a real address and a real number
                attached. That is what the hot seat is for.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-semibold text-warm-gold">
                If two evenings a week for eight weeks is not something you can
                clear right now, take the self-paced tier instead. It is the
                same curriculum, and a Masterclass seat you cannot show up for
                is worth less than a course you actually finish.
              </p>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.white} />

      {/* WHAT'S INCLUDED + PRICE + CTA */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedItem>
            <SectionLabel>What is included</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Everything in the course, plus the eight weeks, plus the archive.
            </h2>
          </AnimatedItem>

          <AnimatedDiv
            stagger
            className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 text-left sm:flex-row"
          >
            {[
              {
                t: "The whole course",
                b: "All twelve modules, lifetime access, the resource library, and the full Bonus Pack deep dive rather than the intro.",
              },
              {
                t: "Eight weeks live",
                b: "Ninety minutes a week with Della and Alex, a hot seat of your own each week, plus the bonus AI-visibility workshop.",
              },
              {
                t: "The archive and the year",
                b: "Recordings, transcripts, and shared docs stay yours. Plus a year in the Nice Host Network and direct messaging throughout.",
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
            <p className="mt-12 font-display text-5xl font-semibold text-deep-teal [font-variant-numeric:lining-nums_tabular-nums]">
              {PRICE}
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <div className="mt-8 flex justify-center">
              <WaitlistCta
                tier={TIER}
                label="Reserve a seat"
                source="footer"
              />
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <p className="mt-6 font-sans text-sm text-charcoal/60">
              Fifteen seats a cycle, four cycles a year. Reserving costs
              nothing and holds your place in line, not your card.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* CROSS-LINKS — down to self-paced, up to Operator. */}
      <AnimatedSection theme="off-white" className="px-6 py-12 md:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatedItem>
            <div className="flex h-full flex-col border-t-2 border-deep-teal/30 bg-white p-7 md:p-8">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">
                Not ready for eight weeks?
              </p>
              <p className="mb-6 flex-1 font-sans text-base leading-relaxed text-charcoal/85">
                The self-paced tier is the same twelve modules on your own
                schedule, for $
                {RRR_PRICES.selfPacedUsd}. You can move up to a later cohort
                whenever the timing works.
              </p>
              <div>
                <Button
                  href={RRR_PATHS.selfPaced}
                  variant="secondary"
                  size="md"
                >
                  See the self-paced course
                </Button>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <div className="flex h-full flex-col border-t-2 border-warm-gold bg-white p-7 md:p-8">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                Already have doors?
              </p>
              <p className="mb-6 flex-1 font-sans text-base leading-relaxed text-charcoal/85">
                Operator is ninety days of one-to-one work where we diagnose
                what is leaking, build the fix, and stay until it runs without
                you. It starts with a conversation, not a checkout page.
              </p>
              <div>
                <Button
                  href={bookingUrl({
                    founder: "della",
                    source: BOOKING_SOURCES.COLIVING_FINAL_CTA,
                  })}
                  variant="secondary"
                  size="md"
                >
                  Book a discovery call
                </Button>
              </div>
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
              decisions.{" "}
              <Link
                href={RRR_PATHS.hub}
                className="text-deep-teal underline underline-offset-2"
              >
                Compare all three tiers
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
