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
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { BLUEPRINT } from "@/lib/blueprint";
import BuyBlueprintButton from "./_components/BuyBlueprintButton";

/**
 * Room Rental Riches: The Blueprint — book sales page.
 *
 * Copy comes from the book itself: the back cover of blueprint_wrap_cover.png
 * and the module list in the manuscript. Nothing here is invented, and there
 * are deliberately NO testimonials — the only student quotes that exist are the
 * fabricated personas flagged in the monetization plan, which would be an FTC
 * problem to publish.
 */

const PRICE = `$${BLUEPRINT.priceUsd}`;
const LIST = `$${BLUEPRINT.priceListUsd}`;

export const metadata: Metadata = {
  title: "Room Rental Riches: The Blueprint",
  description:
    "Della Henry's field guide to mid-term co-living. Turn the home you already have into a cash-generating room rental business — property scoring, pricing, setup, operations, and scaling. PDF + ePub, $32.",
  alternates: {
    canonical: `https://benicehospitality.com${BLUEPRINT.path}`,
  },
  openGraph: {
    title: "Room Rental Riches: The Blueprint | Della Henry",
    description:
      "Room by room, mid-term co-living turns spare space into steady income. The exact system Della and Alex Henry run across their own homes, handed to you step by step.",
    url: `https://benicehospitality.com${BLUEPRINT.path}`,
    type: "book",
    images: [
      {
        url: `https://benicehospitality.com${BLUEPRINT.coverImage}`,
        width: 1400,
        height: 2100,
        alt: "Cover of Room Rental Riches: The Blueprint by Della Henry",
      },
    ],
  },
};

// The book's own back-cover promises.
const PROMISES = [
  "Find and score a property that actually works, before you spend a dollar.",
  "Furnish, price, and budget it for real profit instead of guesswork.",
  "Fill your rooms and run them on systems, not stress.",
  "Grow from one home toward a portfolio, on your own terms.",
];

// Modules as they appear in the manuscript.
const MODULES = [
  {
    n: "00",
    title: "Welcome to Room Rental Riches",
    body: "The three rental models and where room rentals win. Who this is for and what the road ahead looks like.",
  },
  {
    n: "01",
    title: "Property Viability and Target Audience",
    body: "The five things that make a property viable, who you are actually renting to, and the two tools that take emotion out of the decision.",
  },
  {
    n: "02",
    title: "Financial Foundations",
    body: "The six real start-up cost categories, a pricing formula that values each room on what it offers, and profit-first budgeting with a fifteen-minute review rhythm.",
  },
  {
    n: "03",
    title: "Setup and Design, Without Being an Interior Designer",
    body: "Design for your tenant's day rather than your taste. Mood board, furniture, cost-per-use buying, and staging that gets the listing clicked.",
  },
  {
    n: "04",
    title: "Operations and Management",
    body: "Listings across platforms, the five-touch messaging cadence, shared calendars, and money tracking. The systems that run the business so it does not run you.",
  },
  {
    n: "05",
    title: "Marketing, and Keeping Your Rooms Full",
    body: "The engine behind occupancy: where demand actually comes from and how to keep a pipeline rather than scrambling at every turnover.",
  },
  {
    n: "06",
    title: "Maximizing Revenue and Scaling",
    body: "The bonus chapter. Once it runs without you on call, how to take it further and grow toward a portfolio.",
  },
];

// Real pages rendered from the manuscript (scripts note: pdftoppm at 200dpi).
// These are actual interior pages, not mockups.
const LOOK_INSIDE = [
  {
    src: "/images/blueprint_page_roadmap.webp",
    alt: "The Be Nice Way five-phase roadmap page from the book",
    caption:
      "Every chapter follows the same five-phase method, so you always know which part you are in.",
  },
  {
    src: "/images/blueprint_page_toolkit.webp",
    alt: "A toolkit page pointing to the free Property Selection Checklist and Market Demand Worksheet",
    caption:
      "Lessons point to real worksheets and calculators — the same ones free at benicehospitality.com.",
  },
  {
    src: "/images/blueprint_page_actions.webp",
    alt: "A module recap page with a Your Action Items checklist",
    caption:
      "You close each module with an action list, not just notes. You build the business as you read.",
  },
];

const FAQS = [
  {
    q: "What format is it?",
    a: "PDF and ePub, both included. The PDF is the designed edition with the worksheets and tables laid out properly; the ePub is there for e-readers. You get download links for both by email the moment you buy.",
  },
  {
    q: "Do I need to own a property already?",
    a: "No. Modules 1 and 2 are written for people who have not bought or leased anything yet — property scoring, viability, and the real start-up numbers come before anything else. If you already have the house, start at Module 2 and price it properly.",
  },
  {
    q: "How is this different from the course?",
    a: "The Blueprint is the written system, start to finish, at your own pace. The Room Rental Riches course is the same body of work taught with live support, accountability, and time with Della, at three commitment levels. Plenty of people read the book first and take the course when they want someone in it with them.",
  },
  {
    q: "What is the Nice Host Network account?",
    a: "When you buy, we set up your account with the email you check out with, so the free resource library — property calculators, setup checklists, cost worksheets — and your dashboard are ready without signing up separately. You just pick a password.",
  },
  {
    q: "Will this work outside the Southeast?",
    a: "The operating system travels. Property scoring, pricing logic, setup standards, guest experience, and the operational rhythms work anywhere. The market examples come from the Atlanta metro because that is where these homes actually run, so do your own homework on local rules for your city.",
  },
];

export default function BlueprintPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-near-black px-6 pb-14 pt-28 md:px-12 md:pt-32 lg:px-20 lg:pt-36">
        {/* warm glow so the cover sits in light rather than floating on black */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-warm-gold/20 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-[18rem] lg:mx-0 lg:max-w-none">
            <div className="relative">
              <Image
                src={BLUEPRINT.coverImage}
                alt="Cover of Room Rental Riches: The Blueprint by Della Henry"
                width={1400}
                height={2100}
                priority
                className="w-full rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
              />
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                PDF + ePub
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Room Rental Riches · The Blueprint
            </p>
            <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              The home you already have is a business waiting to happen.
            </h1>
            <p className="mb-8 max-w-xl font-sans text-lg leading-snug text-white/85">
              Room by room, mid-term co-living turns spare space into steady
              income, with less work than a short-term rental and far more profit
              than a yearly lease. This is the exact system Della and Alex Henry
              run across their own homes, handed to you step by step.
            </p>

            {/* concrete, verifiable specs — the stuff a buyer scans for */}
            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-white/70">
              {[
                "137 pages",
                "7 modules",
                "PDF + ePub",
                "Instant download",
              ].map((spec) => (
                <span key={spec} className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-warm-gold" />
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

            <BuyBlueprintButton
              label={`Get the Blueprint — ${PRICE}`}
              source="hero"
            />

            <p className="mt-5 font-sans text-sm text-white/60">
              Delivered by email. Includes your Nice Host Network account.
            </p>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* WHAT YOU LEARN */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <AnimatedItem>
            <SectionLabel>Inside, you will learn to</SectionLabel>
          </AnimatedItem>
          <AnimatedDiv stagger className="mt-8 space-y-5">
            {PROMISES.map((p) => (
              <AnimatedItem key={p}>
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-deep-teal/10"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="#1A4D4F"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <p className="font-sans text-lg leading-relaxed text-charcoal">
                    {p}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} />

      {/* PULL QUOTE — Della's voice, verbatim from the welcome letter */}
      <section className="bg-near-black px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-auto mb-6 h-8 w-8 text-warm-gold"
            fill="currentColor"
          >
            <path d="M9.5 6C6.5 7.5 5 10 5 13.5V18h5v-5H7.8c0-2 .9-3.4 2.7-4.3L9.5 6zm8 0c-3 1.5-4.5 4-4.5 7.5V18h5v-5h-2.2c0-2 .9-3.4 2.7-4.3L17.5 6z" />
          </svg>
          <blockquote className="font-display text-2xl font-medium leading-snug text-white md:text-3xl lg:text-4xl">
            This blueprint is not theory. It is the exact system we run across our
            own co-living homes. We already made the mistakes so that you can skip
            them.
          </blockquote>
          <p className="mt-8 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-warm-gold">
            Della Henry · from the opening letter
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* LOOK INSIDE — real pages rendered from the manuscript */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>Look inside</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Real pages, not a promise.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                This is a working field guide, laid out to be used. Here are three
                pages straight from the book.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {LOOK_INSIDE.map((pg) => (
              <AnimatedItem key={pg.src}>
                <figure className="flex h-full flex-col">
                  <div className="overflow-hidden rounded-lg border border-light-gray bg-white shadow-[0_16px_40px_rgba(26,26,26,0.12)]">
                    <Image
                      src={pg.src}
                      alt={pg.alt}
                      width={900}
                      height={1353}
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                      className="w-full"
                    />
                  </div>
                  <figcaption className="mt-4 font-sans text-sm leading-relaxed text-charcoal/70">
                    {pg.caption}
                  </figcaption>
                </figure>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* THE MODULES */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          <AnimatedItem>
            <figure className="mb-12">
              <div className="overflow-hidden rounded-lg border border-light-gray bg-white shadow-[0_16px_40px_rgba(26,26,26,0.12)]">
                <Image
                  src="/images/blueprint_labeled_kitchen.webp"
                  alt="A modern co-living kitchen where each cupboard and drawer is labeled with a brass plate for a different room — Room 1 through Room 5."
                  width={1264}
                  height={848}
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="w-full"
                />
              </div>
              <figcaption className="mt-4 font-sans text-sm leading-relaxed text-charcoal/70">
                One home, run room by room. The Blueprint turns shared space into
                a system where every tenant has their place — and you have a
                business.
              </figcaption>
            </figure>
          </AnimatedItem>
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>What&rsquo;s inside</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Seven modules, front to back.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                Each module carries its own lessons, worksheets, and toolkit
                references. It is built to be worked through, not skimmed — the
                point is that you finish with a business rather than a pile of
                notes.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {MODULES.map((m, i) => {
              // Module 6 is the Bonus, and the odd card out in a 2-up grid.
              // Span it full width and lay it out horizontally so the wide card
              // reads as a deliberate finale rather than a stretched box.
              const isBonus = i === MODULES.length - 1;
              return (
                <AnimatedItem key={m.n} className={isBonus ? "md:col-span-2" : ""}>
                  <article
                    className={[
                      "flex h-full flex-col rounded-lg border p-7 transition-colors duration-200 md:p-8",
                      isBonus
                        ? "items-center border-warm-gold/30 bg-warm-gold/10 text-center hover:border-warm-gold/60"
                        : "border-light-gray bg-cream hover:border-deep-teal/40",
                    ].join(" ")}
                  >
                    <p
                      aria-hidden
                      className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-warm-gold"
                    >
                      {isBonus ? `${m.n} · Bonus` : m.n}
                    </p>
                    <h3 className="mb-3 font-display text-xl font-semibold leading-snug text-deep-teal">
                      {m.title}
                    </h3>
                    <p
                      className={[
                        "font-sans text-sm leading-relaxed text-charcoal/75",
                        isBonus ? "max-w-xl" : "",
                      ].join(" ")}
                    >
                      {m.body}
                    </p>
                  </article>
                </AnimatedItem>
              );
            })}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* WHAT YOU GET + BUY */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedItem>
            <SectionLabel>What you get</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <Image
              src="/images/blueprint_book_3d.webp"
              alt="A 3D render of the Room Rental Riches: The Blueprint book, standing upright."
              width={529}
              height={790}
              sizes="(min-width: 768px) 220px, 180px"
              className="mx-auto mt-8 w-44 drop-shadow-[0_22px_28px_rgba(26,26,26,0.22)] md:w-56"
            />
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mx-auto mt-8 max-w-2xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              The book, both formats, and a seat in the network.
            </h2>
          </AnimatedItem>

          <AnimatedDiv
            stagger
            className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 text-left sm:flex-row"
          >
            {[
              {
                t: "The full PDF",
                b: "The designed edition, worksheets and tables laid out to be used.",
              },
              {
                t: "The ePub",
                b: "The same book for your e-reader, included at no extra cost.",
              },
              {
                t: "Your network account",
                b: "Set up on your purchase email — free resource library and dashboard.",
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
              <BuyBlueprintButton
                label={`Get the Blueprint — ${PRICE}`}
                source="footer"
              />
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <p className="mt-6 font-sans text-sm text-charcoal/60">
              Secure checkout through Stripe. Download links arrive by email
              immediately.
            </p>
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
              Before you buy.
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
              Dollar figures in the book are illustrative examples drawn from our
              own operations, not a guarantee of what you will earn. Consult a
              licensed attorney and tax professional in your area before making
              decisions.{" "}
              <Link
                href="/room-rental-riches"
                className="text-deep-teal underline underline-offset-2"
              >
                See the whole Room Rental Riches path
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
