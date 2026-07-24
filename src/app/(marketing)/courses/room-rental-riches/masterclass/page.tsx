import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import WaitlistCta from "@/components/sections/courses/WaitlistCta";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { RRR_PRICES, RRR_PATHS } from "@/lib/room-rental-riches";
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
 * SHAPE: a two-day, six-operator workshop, hosted quarterly, with a 60-minute
 * private follow-up. No dates anywhere on this page — there is no scheduled
 * session. The page states the cadence and the cap and says the waitlist gets
 * first call, which is true. Inventing a start date would be the one thing that
 * makes a $2,497 page genuinely dishonest.
 *
 * NO TESTIMONIALS, for the same reason as the Blueprint and self-paced pages.
 */

const PRICE = `$${RRR_PRICES.masterclassUsd.toLocaleString("en-US")}`;

const TIER = { name: "Masterclass", slug: "cohort" as const };

export const metadata: Metadata = {
  title: `Room Rental Riches: Masterclass (${PRICE})`,
  description:
    "A two-day, small-group workshop where six room rental operators work directly with Della and Alex Henry to apply the Room Rental Riches Operating Manual to their own business. Includes a 60-minute private follow-up. Hosted quarterly.",
  alternates: {
    canonical: `https://benicehospitality.com${RRR_PATHS.masterclass}`,
  },
  openGraph: {
    title: "Room Rental Riches: Masterclass | Della Henry",
    description:
      "Two days, six operators, your actual business on the table. Apply the Room Rental Riches Operating Manual alongside Della and Alex Henry.",
    url: `https://benicehospitality.com${RRR_PATHS.masterclass}`,
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/course-masterclass-cohort-v4.png",
        width: 1208,
        height: 1500,
        alt: "Della Henry teaching a small group of co-living operators",
      },
    ],
  },
};

const SPECS = [
  "Maximum 6 Operators",
  "Two-Day Workshop",
  "Only Hosted Quarterly",
  "60-Minute Private Follow-Up Session",
];

// Why the Masterclass is different: the self-paced course teaches the manual,
// the Masterclass is where you apply it. Three things the room adds.
const WHY_DIFFERENT = [
  {
    title: "Small Group Workshop",
    body: "With only six operators, every business receives meaningful discussion, feedback, and practical recommendations.",
  },
  {
    title: "Individual Business Reviews (Hot Seats)",
    body: "Bring your real business, questions, numbers, and challenges. Each operator will have dedicated time to workshop their business, receive live feedback, and learn alongside five other operators facing similar challenges.",
  },
  {
    title: "Private Follow-Up",
    body: "Within 30 days after the Masterclass, you'll schedule a private 60-minute strategy session to review your implementation, work through roadblocks, and refine your next steps.",
  },
];

// The two-day agenda. Each day is a workshop track plus three hot seats and
// individual action plans.
const AGENDA = [
  {
    day: "Day One",
    topics: [
      "Property positioning",
      "Revenue opportunities",
      "Hospitality experience",
      "Marketing",
      "Resident experience",
    ],
    close: ["Three Individual Business Reviews (Hot Seats)", "Individual action plans"],
  },
  {
    day: "Day Two",
    topics: [
      "Pricing",
      "Operations",
      "SOP development",
      "Automation",
      "Scaling systems",
    ],
    close: ["Three Individual Business Reviews (Hot Seats)", "Individual action plans"],
  },
];

// Everything the seat buys. A flat checklist, hero-checkmark treatment.
const INCLUDED = [
  "Full Room Rental Riches Course",
  "Room Rental Riches: The Blueprint",
  "Two-Day Small Group Workshop",
  "Maximum Six Operators",
  "Six Individual Business Reviews (Hot Seats)",
  "Personalized Action Plan",
  "Masterclass Workbook",
  "60-Minute Private Follow-Up Strategy Session",
  "Lifetime Course Access",
  "Access to the Room Rental Riches Community",
  "Weekly Community Office Hours",
];

// What we'll ask on the intake questionnaire, before the workshop.
const INTAKE = [
  "Your current room rental property",
  "Your biggest operational challenge",
  "Your current goals",
  "What you'd like to accomplish during the Masterclass",
];

const FAQS = [
  {
    q: "Is this held in person or virtually?",
    a: "The Masterclass is hosted in person, with a virtual attendance option available for operators who can't travel. You'll choose your attendance preference after reserving your seat.",
  },
  {
    q: "Do I need a property already?",
    a: "Yes. This Masterclass is designed for operators with at least one room rental property already in operation. If you're still preparing to launch your first property, we recommend starting with the self-paced Room Rental Riches Course.",
  },
  {
    q: "How often is the Masterclass offered?",
    a: "We host the Masterclass once per quarter. Each session is limited to six operators to create a highly interactive learning experience.",
  },
  {
    q: "What's included after the Masterclass?",
    a: "Your Masterclass includes a private 60-minute follow-up strategy session, lifetime access to the course, the Room Rental Riches: The Blueprint, continued access to the Room Rental Riches Community, and weekly Community Office Hours.",
  },
  {
    q: "What should I bring?",
    a: "Bring your laptop, your business numbers, your questions, and an open mind. The more prepared you are, the more valuable the workshop becomes.",
  },
  {
    q: "What if I can't attend in person?",
    a: "You can join remotely and participate in the same discussions, workshops, and Individual Business Reviews (Hot Seats) as the in-person attendees.",
  },
];

// Reusable gold check for the checklists on this page.
function GoldCheck() {
  return (
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
  );
}

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
                  src="/images/Website%20Images/course-masterclass-cohort-v4.png"
                  alt="Della Henry teaching a small, diverse group of co-living operators around a conference table"
                  fill
                  priority
                  quality={90}
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 28rem, 100vw"
                  className="object-cover"
                  style={{ filter: "saturate(0.85) contrast(1.05)" }}
                />
              </div>
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                6 seats
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Room Rental Riches · Masterclass
            </p>
            <h1 className="mb-6 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              Build Your Room Rental Business Alongside Us.
            </h1>
            <p className="mb-5 max-w-2xl font-sans text-lg leading-snug text-white/85">
              The Room Rental Riches Masterclass is a two-day, small-group
              workshop where six room rental operators work directly with Della
              and Alex Henry to apply the Room Rental Riches Operating Manual to
              their own business.
            </p>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              This isn&apos;t another course to watch. It&apos;s a collaborative
              working session where we review real properties, real numbers,
              real systems, and real challenges together so you leave with a
              clearer strategy and an actionable plan for your business.
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

            <WaitlistCta tier={TIER} label="Reserve Your Seat" source="hero" />

            <p className="mt-5 max-w-2xl font-sans text-sm text-white/60">
              The Masterclass is intentionally limited to six operators and
              hosted only four times each year so every participant receives
              meaningful feedback, preparation, and personal attention.
            </p>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.white} />

      {/* WHY THIS MASTERCLASS IS DIFFERENT */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>Why it&apos;s different</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Why This Masterclass Is Different
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <div className="mt-5 space-y-4 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                <p>
                  The self-paced course teaches you the Room Rental Riches
                  Operating Manual. The Masterclass is where we apply it.
                </p>
                <p>
                  For two days, you&apos;ll work alongside five other room rental
                  operators while Della and Alex help you think through your
                  business, improve your systems, answer questions, and workshop
                  real operational challenges. Every conversation centers around
                  implementation.
                </p>
              </div>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
          >
            {WHY_DIFFERENT.map((x) => (
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

      <SectionDivider fromColor={C.white} toColor={C.offWhite} flip />

      {/* WHAT WE'LL WORKSHOP TOGETHER — the two-day agenda. */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>The two days</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                What We&apos;ll Workshop Together
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                Over two days we&apos;ll work through the systems that help room
                rental operators build profitable businesses that run on systems,
                not stress.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {AGENDA.map((d) => (
              <AnimatedItem key={d.day}>
                <article className="flex h-full flex-col rounded-lg border border-light-gray bg-white p-7 transition-colors duration-200 hover:border-deep-teal/40 md:p-8">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                    {d.day}
                  </span>
                  <ul className="mt-5 space-y-2.5">
                    {d.topics.map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <GoldCheck />
                        <span className="font-sans text-base leading-snug text-charcoal/85">
                          {t}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 space-y-2 border-t border-light-gray pt-5">
                    {d.close.map((c) => (
                      <p
                        key={c}
                        className="font-sans text-sm font-semibold leading-snug text-deep-teal"
                      >
                        {c}
                      </p>
                    ))}
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.primaryGreen} flip />

      {/* WHO THIS MASTERCLASS IS FOR */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green px-6 py-14 text-white md:py-16"
      >
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel light>Who it&apos;s for</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-6 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-white md:text-5xl">
              Who This Masterclass Is For
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-white/85 md:text-lg"
          >
            <AnimatedItem>
              <p>
                This Masterclass is designed for operators who already have at
                least one room rental property in operation.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                Whether you have one property or several, you&apos;ll get the
                most value by bringing a live business, real numbers, and a
                willingness to workshop your operation alongside other operators.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-semibold text-warm-gold">
                If you&apos;re still preparing to launch your first property,
                start with the self-paced Room Rental Riches Course. Once your
                first property is operating, the Masterclass becomes your next
                step.
              </p>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.white} />

      {/* EVERYTHING INCLUDED + PRICE + CTA */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <AnimatedItem>
              <SectionLabel>What is included</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Everything Included
              </h2>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="mx-auto mt-10 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2"
          >
            {INCLUDED.map((item) => (
              <AnimatedItem key={item}>
                <div className="flex items-start gap-3.5">
                  <GoldCheck />
                  <span className="font-sans text-base leading-snug text-charcoal/85 md:text-lg">
                    {item}
                  </span>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <div className="mt-12 text-center">
            <AnimatedItem>
              <p className="font-display text-5xl font-semibold text-deep-teal [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </p>
            </AnimatedItem>

            <AnimatedItem>
              <div className="mt-8 flex justify-center">
                <WaitlistCta
                  tier={TIER}
                  label="Reserve Your Seat"
                  source="footer"
                />
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <p className="mt-6 font-sans text-sm text-charcoal/60">
                Six seats a cycle, four cycles a year. Reserving costs nothing
                and holds your place in line, not your card.
              </p>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* WE ONLY HOST FOUR MASTERCLASSES EACH YEAR — scarcity, stated plainly. */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>The cadence</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-6 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              We Only Host Four Masterclasses Each Year
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg"
          >
            <AnimatedItem>
              <p>
                Rather than hosting large coaching programs every month, we
                intentionally keep this experience small. Each Masterclass is
                limited to six operators and is offered only once per quarter.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                That allows us to prepare for every participant, review each
                business beforehand, and create a collaborative environment where
                every operator receives meaningful attention.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-semibold text-deep-teal">
                If this session fills, the next opportunity will be the following
                quarter.
              </p>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* CONTINUE BUILDING AFTER THE WORKSHOP + slimmed cross-links. */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>After the two days</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-6 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Continue Building After the Workshop
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg"
          >
            <AnimatedItem>
              <p>
                The Masterclass doesn&apos;t end after two days. You&apos;ll
                continue implementing inside the Room Rental Riches Community,
                where you&apos;ll have access to weekly Community Office Hours,
                practical discussions, and a growing network of room rental
                operators.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p>
                Within 30 days, you&apos;ll also meet privately with Della for a
                60-minute follow-up strategy session to review your
                implementation, troubleshoot challenges, and refine your next
                steps.
              </p>
            </AnimatedItem>
          </AnimatedDiv>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatedItem>
            <div className="flex h-full flex-col border-t-2 border-deep-teal/30 bg-cream p-7 md:p-8">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">
                Not operating yet?
              </p>
              <p className="mb-6 flex-1 font-sans text-base leading-relaxed text-charcoal/85">
                The self-paced course is the full Room Rental Riches Operating
                Manual on your own schedule, for ${RRR_PRICES.selfPacedUsd}.
                Start there, launch your first property, then come back for the
                Masterclass.
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
            <div className="flex h-full flex-col border-t-2 border-warm-gold bg-cream p-7 md:p-8">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                Want one-to-one work?
              </p>
              <p className="mb-6 flex-1 font-sans text-base leading-relaxed text-charcoal/85">
                Operator is ninety days of one-to-one work where we diagnose what
                is leaking, build the fix, and stay until it runs without you. It
                starts with a conversation, not a checkout page.
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

      <SectionDivider fromColor={C.white} toColor={C.offWhite} flip />

      {/* BEFORE WE MEET — the intake questionnaire, framed as preparation. */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>Before we meet</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-6 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Before We Meet
            </h2>
          </AnimatedItem>
          <AnimatedDiv
            stagger
            className="space-y-4 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg"
          >
            <AnimatedItem>
              <p>
                After reserving your seat, you&apos;ll receive a short intake
                questionnaire. This isn&apos;t an application process. It&apos;s
                simply how we prepare.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-semibold text-deep-teal">We&apos;ll ask about:</p>
            </AnimatedItem>
          </AnimatedDiv>

          <AnimatedDiv stagger className="mt-6 space-y-3">
            {INTAKE.map((item) => (
              <AnimatedItem key={item}>
                <div className="flex items-start gap-3.5">
                  <GoldCheck />
                  <span className="font-sans text-base leading-snug text-charcoal/85 md:text-lg">
                    {item}
                  </span>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          <AnimatedItem>
            <p className="mt-8 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg">
              This allows Della and Alex to prepare before the workshop so every
              operator receives thoughtful, relevant feedback throughout the two
              days.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.white} />

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
