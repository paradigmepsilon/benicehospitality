import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import Button from "@/components/ui/Button";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BLUEPRINT } from "@/lib/blueprint";

/**
 * Room Rental Riches — the umbrella page.
 *
 * One place that shows the whole path: the book, the course, and the mastermind
 * that is still coming. Each card LINKS to the thing rather than restating it —
 * in particular the course card deliberately carries no tier pricing, because
 * /courses/room-rental-riches owns those numbers and two pages quoting prices
 * is how they drift apart.
 */

const PRICE = `$${BLUEPRINT.priceUsd}`;
const LIST = `$${BLUEPRINT.priceListUsd}`;

export const metadata: Metadata = {
  title: "Room Rental Riches",
  description:
    "The co-living operating system from Della Henry, at every level. Read the Blueprint, take the course, or join the mastermind when it opens.",
  alternates: { canonical: "https://benicehospitality.com/room-rental-riches" },
  openGraph: {
    title: "Room Rental Riches | Be Nice Hospitality Group",
    description:
      "One system, three ways in. The Blueprint book, the full course at three commitment levels, and the operator mastermind.",
    url: "https://benicehospitality.com/room-rental-riches",
    type: "website",
  },
};

export default function RoomRentalRichesPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-cream px-6 pb-14 pt-24 md:px-12 md:pb-16 md:pt-32 lg:px-20 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
            The Be Nice Way
          </p>
          <h1 className="mb-7 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-deep-teal md:text-6xl lg:text-7xl">
            Room Rental Riches.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-lg leading-snug text-charcoal md:text-xl">
            One operating system for renting rooms by the door, taught at
            whatever depth you need it. Read it, take it, or build alongside
            other operators running the same play.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* THE THREE WAYS IN */}
      <AnimatedSection theme="light" className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8"
          >
            {/* THE BOOK */}
            <AnimatedItem>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-warm-gold/45 bg-cream transition-colors duration-200 hover:border-warm-gold">
                <div className="relative aspect-[3/2] w-full bg-near-black">
                  <Image
                    src={BLUEPRINT.coverImage}
                    alt="Cover of Room Rental Riches: The Blueprint"
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-contain p-6"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                      The Book
                    </p>
                    <span className="rounded bg-warm-gold px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-near-black">
                      Available now
                    </span>
                  </div>
                  <h2 className="mb-3 font-display text-2xl font-semibold leading-snug text-deep-teal">
                    The Blueprint
                  </h2>
                  <p className="mb-5 font-sans text-sm leading-relaxed text-charcoal/75">
                    The whole system written down. Property scoring, pricing,
                    setup, operations, marketing, and scaling — with the
                    worksheets. PDF and ePub, plus your Nice Host Network
                    account.
                  </p>

                  <div className="mb-6 mt-auto flex items-baseline gap-2.5">
                    <span className="font-sans text-base text-charcoal/45 line-through">
                      {LIST}
                    </span>
                    <span className="font-display text-3xl font-semibold text-deep-teal [font-variant-numeric:lining-nums_tabular-nums]">
                      {PRICE}
                    </span>
                  </div>

                  <Button href={BLUEPRINT.path} variant="primary" fullWidth>
                    Get the Blueprint
                  </Button>
                </div>
              </article>
            </AnimatedItem>

            {/* THE COURSE */}
            <AnimatedItem>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-light-gray bg-cream transition-colors duration-200 hover:border-deep-teal/40">
                <div className="relative aspect-[3/2] w-full bg-cream">
                  <Image
                    src="/images/Website Images/Golden hour Atlanta Neighborhood.png"
                    alt="Atlanta neighborhood at golden hour"
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-warm-gold">
                      The Course
                    </p>
                    <span className="rounded bg-deep-teal/10 px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-deep-teal">
                      Enrolling
                    </span>
                  </div>
                  <h2 className="mb-3 font-display text-2xl font-semibold leading-snug text-deep-teal">
                    Room Rental Riches
                  </h2>
                  <p className="mb-5 font-sans text-sm leading-relaxed text-charcoal/75">
                    The same curriculum, taught with support and accountability.
                    Twelve modules across six phases, at three commitment levels
                    — self-paced, cohort, or Operator, where we install it with
                    you.
                  </p>

                  <div className="mt-auto">
                    <Button
                      href="/courses/room-rental-riches"
                      variant="secondary"
                      fullWidth
                    >
                      Compare the tiers
                    </Button>
                  </div>
                </div>
              </article>
            </AnimatedItem>

            {/* THE MASTERMIND */}
            <AnimatedItem>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-light-gray bg-light-gray/40">
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-cream">
                  <Image
                    src="/images/Website Images/Della Behind Desk.png"
                    alt="Della Henry at her desk"
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover opacity-55 grayscale"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-8">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/50">
                      The Mastermind
                    </p>
                    <span className="rounded bg-charcoal/10 px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/70">
                      Coming soon
                    </span>
                  </div>
                  <h2 className="mb-3 font-display text-2xl font-semibold leading-snug text-charcoal/70">
                    The Co-Living Mastermind
                  </h2>
                  <p className="mb-5 font-sans text-sm leading-relaxed text-charcoal/60">
                    A small room of operators past their first door and building
                    toward the fifth. Monthly working sessions, shared deal flow,
                    and honest numbers. Doors are not open yet.
                  </p>

                  <div className="mt-auto">
                    <Button href="/community" variant="secondary" fullWidth>
                      Join the network meanwhile
                    </Button>
                  </div>
                </div>
              </article>
            </AnimatedItem>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* WHERE TO START */}
      <AnimatedSection theme="off-white" className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>Where to start</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mb-8 mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              Most people read first.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="space-y-4 font-sans text-base leading-relaxed text-charcoal md:text-lg">
              <p>
                If you have not rented a room yet, start with the Blueprint. It
                is the cheapest way to find out whether this model fits your
                property and your life, and it covers the two decisions that cost
                the most to get wrong: which property, and what to charge.
              </p>
              <p>
                Take the course when you want someone in it with you — deadlines,
                feedback on your actual deal, and the parts that are easier shown
                than written. The curriculum is the same body of work; what
                changes is how much support comes with it.
              </p>
              <p className="font-semibold text-deep-teal">
                And if you would rather try before you spend anything, the free
                resource library has the property calculator, the setup
                checklist, and the start-up cost worksheet.
              </p>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href={BLUEPRINT.path} variant="primary" size="lg">
                Start with the Blueprint
              </Button>
              <Button href="/resources" variant="secondary" size="lg">
                Browse the free tools
              </Button>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mt-8 font-sans text-sm leading-relaxed text-charcoal/55">
              Educational content only, not legal, tax, or financial advice. Any
              dollar figures are illustrative examples from our own operations,
              not a guarantee of earnings.{" "}
              <Link
                href="/della"
                className="text-deep-teal underline underline-offset-2"
              >
                More about Della
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
