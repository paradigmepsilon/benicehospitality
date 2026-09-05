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
import { CRR_BLUEPRINT } from "@/lib/crr-blueprint";
import { CRR_FREE_EBOOK } from "@/lib/crr-free-ebook";
import BuyCrrBlueprintButton from "./_components/BuyCrrBlueprintButton";

/**
 * The Inside Lane: sales page. (Route slug kept as car-rental-riches-blueprint
 * so the checkout, webhook, and download rails stay untouched; the book was
 * retitled 2026-09-04 from the Turo-only "Car Rental Riches Blueprint".)
 *
 * Mirror of the RRR Blueprint page (books/room-rental-riches-blueprint), with
 * Alex's voice: an operator's blueprint for an independent car rental and
 * fleet business, one car to fifty, with Turo taught as one channel. Receipts
 * over hype, no earnings promises, and the only dollar figure from Turo
 * appears labeled as Turo's own published gross average before costs.
 *
 * The cover (CRR_BLUEPRINT.coverImage) is rendered by
 * scripts/build-crr-covers.ts; re-run `npm run crr-covers:build` to refresh
 * it. The free ebook band near the bottom is the page's "not ready?" exit:
 * it feeds the same list the calculator does.
 *
 * Deliberately NO testimonials: the book is new and no real reader quotes
 * exist, and fabricating them would be an FTC problem.
 */

const PRICE = `$${CRR_BLUEPRINT.priceUsd}`;

export const metadata: Metadata = {
  title: "The Inside Lane",
  description:
    "What Turo, the rental giants, and the gurus won't tell you about building a car rental business, from one car to fifty. Written by Alex Henry, operator of a real Atlanta-area rental fleet. 17 chapters, PDF + ePub, $32.",
  alternates: {
    canonical: `https://benicehospitality.com${CRR_BLUEPRINT.path}`,
  },
  openGraph: {
    title: "The Inside Lane | Alex Henry",
    description:
      "Not another side-hustle book. How the rental giants really make money, what the marketplace won't tell you, and the underwriting and operating system Alex Henry uses across his own fleet, one car to fifty.",
    url: `https://benicehospitality.com${CRR_BLUEPRINT.path}`,
    type: "book",
    images: [
      {
        url: `https://benicehospitality.com${CRR_BLUEPRINT.coverImage}`,
        width: 1400,
        height: 2100,
        alt: "Cover of The Inside Lane by Alex Henry",
      },
    ],
  },
};

// Outcomes, not features. Each line is the result the reader walks away with,
// rendered with the checkmark treatment below (so no literal checkmark in the
// string).
const PROMISES = [
  "See how the rental giants actually make money, and copy the parts that work at your size.",
  "Underwrite a specific car three ways before you buy it: marketplace, weekly, direct.",
  "Build the insurance, claims, and fraud floor that decides which channels you can run.",
  "Win the channels the giants ignore: gig drivers, body shops, local search, direct booking.",
];

// The seventeen chapters, in five parts. `benefit` leads each card with the
// result the chapter gets you; the chapter title is kept underneath, since the
// delivery email points people to chapters by number.
const CHAPTERS = [
  { n: "01", benefit: "Turn every earnings number you've seen into gross or net, and know which.", title: "The Number That Hooks You" },
  { n: "02", benefit: "Learn the rental majors' real economics: depreciation, holding windows, ancillaries.", title: "How the Giants Actually Make Money" },
  { n: "03", benefit: "Understand the 2026 marketplace restructure and what a platform with no competitor does next.", title: "The Platform Story Nobody Tells Straight" },
  { n: "04", benefit: "Place yourself on the ladder from one car to fifty, and see what changes at each rung.", title: "Which Operator Are You?" },
  { n: "05", benefit: "Read six kinds of demand in your city, not one, and spot saturation before you buy.", title: "Read Your Market Like an Insider" },
  { n: "06", benefit: "Buy on the flat part of the value curve, and know what the auction pitch leaves out.", title: "Buy Like a Fleet Manager, Not a Consumer" },
  { n: "07", benefit: "Run one car's P&L as a marketplace listing, a weekly gig rental, and a direct rental.", title: "The Real P&L, Three Ways" },
  { n: "08", benefit: "Choose cash, financing, or a fleet line without fooling yourself.", title: "Cash, Financing, and Fleet Lines" },
  { n: "09", benefit: "Keep the books that insurers, banks, and buyers read, and handle taxes without mythology.", title: "The Books, the Silent Partner, and Taxes" },
  { n: "10", benefit: "Map every coverage layer, from the platform plan to commercial fleet insurance.", title: "Insurance Is the Business" },
  { n: "11", benefit: "Win claims with the metadata protocol, and stop identity fraud before the keys move.", title: "Claims, Fraud, and Theft: The Playbook" },
  { n: "12", benefit: "Price from your floor, work the lead-time game, and build the direct rate card.", title: "The Storefront and the Lead-Time Game" },
  { n: "13", benefit: "Run turnovers, maintenance, software, and renters on written systems.", title: "Systems From Car One" },
  { n: "14", benefit: "Rent to gig drivers, body shops, contractors, and local search, where prices aren't public.", title: "The Channels the Giants Don't Want You In" },
  { n: "15", benefit: "Build the legal and insurance floor, then the booking stack, before your first direct rental.", title: "The Direct-Booking Floor and Stack" },
  { n: "16", benefit: "Grow from car two to a fleet with a plan, a disposal schedule, and a manager.", title: "From Five Cars to Fifty" },
  { n: "17", benefit: "A week-by-week plan from decision to first rental, with tripwires written in advance.", title: "Your 90-Day Launch Plan" },
];

const FAQS = [
  {
    q: "What format is it?",
    a: "PDF and ePub, both included. The PDF is the designed edition with the tables and worked numbers laid out properly; the ePub is there for e-readers. You get download links for both by email the moment you buy.",
  },
  {
    q: "Do I need a car already?",
    a: "No. Chapters 5 through 7 teach you to read your market and underwrite a specific car three ways before you commit to it, and Chapter 6 covers where operators actually buy. If you already have the car, go straight to Chapter 7 and run the numbers before you list it.",
  },
  {
    q: "How is this different from the course?",
    a: "The book is the written system, start to finish, at your own pace. The Car Rental Riches course teaches the same body of work in video, with the full tool suite, the gig-driver program, and the direct-booking build-out taught end to end. Plenty of people read the book first and step up to the course when they want more.",
  },
  {
    q: "What is the Nice Host Network account?",
    a: "When you buy, we set up your account with the email you check out with, so the free resource library and your dashboard are ready without signing up separately. You just pick a password.",
  },
  {
    q: "Will this work outside Atlanta?",
    a: "The method travels. Underwriting, listing, protection decisions, and the operating rhythms work in any market. The examples come from the Atlanta area because that is where the fleet actually runs, so do your own homework on your market and your local rules.",
  },
  {
    q: "Is this only about Turo?",
    a: "No. Turo gets three chapters, taught precisely for the way it works in 2026, because it is where most operators start. The rest of the book is the business around it: how the rental majors make money, commercial insurance, weekly rentals to gig drivers, insurance replacement, direct booking, and scaling to a fleet.",
  },
  {
    q: "Is this affiliated with Turo, Hertz, Enterprise, or Avis?",
    a: "No. The Inside Lane is an independent educational product and is not affiliated with, endorsed by, or sponsored by Turo Inc., Enterprise Holdings, Hertz Global Holdings, Avis Budget Group, or any other company named in it.",
  },
  {
    q: "Who is this NOT for?",
    a: "Anyone expecting money that shows up without work, or a get-rich-quick pitch. This is for people willing to run a small business properly: underwrite first, operate on systems, and read their own numbers.",
  },
];

export default function CrrBlueprintPage() {
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
                src={CRR_BLUEPRINT.coverImage}
                alt={`Cover of ${CRR_BLUEPRINT.name} by ${CRR_BLUEPRINT.author}`}
                width={1400}
                height={2100}
                priority
                quality={90}
                className="w-full rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
              />
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                PDF + ePub
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Car Rental Riches · The Book
            </p>
            <h1 className="mb-6 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              What Turo, the Rental Giants, and the Gurus Won&rsquo;t Tell You
              About Building a Car Rental Business.
            </h1>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              I run a real rental fleet in the Atlanta area. This book is the
              system I actually use, from one car to fifty: how the big chains
              really make money, what the marketplace won&rsquo;t tell you, how
              to underwrite a car three ways before you buy it, and how to win
              the channels the giants ignore. Every chapter carries a box
              marked &ldquo;What they don&rsquo;t tell you,&rdquo; and every
              claim in it is sourced.
            </p>

            {/* concrete, verifiable specs, the stuff a buyer scans for */}
            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-white/70">
              {[
                "17 chapters in 5 parts",
                "PDF + ePub",
                "Instant download",
                "90-day launch plan included",
              ].map((spec) => (
                <span key={spec} className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-warm-gold" />
                  {spec}
                </span>
              ))}
            </div>

            <div className="mb-8 flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold text-warm-gold [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </span>
            </div>

            <BuyCrrBlueprintButton
              label={`Get the book for ${PRICE}`}
              source="hero"
            />

            <p className="mt-5 font-sans text-sm text-white/60">
              Delivered by email. Includes your Nice Host Network account.
            </p>
          </div>
        </div>

        {/* The promise, in the hero rather than a scroll away, below the buy
            column and behind a rule so it reads as its own band instead of
            crowding the headline and CTA. Two-up on desktop keeps each line to
            one line. */}
        <div className="relative mx-auto mt-14 max-w-6xl border-t border-white/15 pt-10 md:mt-16">
          <p className="mb-7 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
            Inside, you will learn to
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

      {/* PULL QUOTE: Alex's framing of the whole book, and the one place the
          Turo figure appears, labeled as Turo's own published gross average
          before costs. Runs straight on from the hero's dark ground. */}
      <section className="bg-near-black px-6 pb-14 md:px-12 md:pb-20 lg:px-20">
        {/* Closes the promise band. A curve divider would be invisible here,
            both sides are near-black, so the rule does the separating. */}
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
            Turo publishes its own average: $10,489 a year per vehicle, gross,
            before any costs. The rental giants report that roughly a third of
            every dollar goes to depreciation. This book is about the words the
            ads leave out, and about running the numbers like an operator before
            you spend a dollar.
          </blockquote>
          <p className="mt-8 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-warm-gold">
            Alex Henry · author
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.white} />

      {/* WHY I WROTE THIS: Alex's letter. Short paragraphs on purpose; the
          line breaks are the cadence of how he actually says it. */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <AnimatedItem>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm lg:mx-0 lg:max-w-none">
              <Image
                src="/images/Website%20Images/Alex%20Turo%20Shot.png"
                alt="Alex Henry with one of the Be Nice Autos fleet vehicles"
                fill
                quality={90}
                className="object-cover"
                style={{ filter: "saturate(0.9) contrast(1.05)" }}
                sizes="(min-width: 1024px) 20rem, (min-width: 640px) 24rem, 100vw"
              />
            </div>
          </AnimatedItem>

          <div>
            <AnimatedItem>
              <SectionLabel>Why I wrote this</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                The advice I found was written for a business that no longer exists.
              </h2>
            </AnimatedItem>

            <AnimatedDiv
              stagger
              className="mt-8 space-y-4 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg"
            >
              <AnimatedItem>
                <p>I started Be Nice Autos with one car and a spreadsheet.</p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  Most of what I read before that first listing was already out
                  of date, and none of it explained the business I was actually
                  entering: the one the rental chains run.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  Then 2026 arrived: earnings plans, a variable host share, two
                  marketplaces gone, and banks tightening on independents. The
                  math changed again.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  I learned the current version the way operators do: by running
                  cars, renting by the week to drivers, reading my own
                  statements and the majors&rsquo; filings, and fixing what broke.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p className="pt-2">
                  This is the manual I wish someone had handed me before my
                  first listing went live.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  If it stops you from buying one wrong car, it has done its
                  job.
                </p>
              </AnimatedItem>
            </AnimatedDiv>

            <AnimatedItem>
              <p className="mt-8 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-warm-gold">
                Alex Henry
              </p>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

      {/* THE CHAPTERS */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>What&rsquo;s inside</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Seventeen chapters, one car to fifty.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                Every chapter ends with one action step. It is built to be
                worked through, not skimmed: the point is that you finish with a
                business decision made, not a pile of notes.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CHAPTERS.map((ch, i) => {
              // Chapter 17 is the launch plan and the odd card out in a 2-up
              // grid. Span it full width so the wide card reads as a
              // deliberate finale rather than a stretched box.
              const isFinale = i === CHAPTERS.length - 1;
              return (
                <AnimatedItem key={ch.n} className={isFinale ? "md:col-span-2" : ""}>
                  <article
                    className={[
                      "flex h-full flex-col rounded-lg border p-7 transition-colors duration-200 md:p-8",
                      isFinale
                        ? "items-center border-warm-gold/30 bg-warm-gold/10 text-center hover:border-warm-gold/60"
                        : "border-light-gray bg-cream hover:border-deep-teal/40",
                    ].join(" ")}
                  >
                    <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-warm-gold">
                      {`Chapter ${ch.n}`}
                    </p>
                    <h3 className="mb-2 font-display text-xl font-semibold leading-snug text-deep-teal">
                      {ch.benefit}
                    </h3>
                    <p className="font-sans text-sm font-semibold text-charcoal/60">
                      {ch.title}
                    </p>
                  </article>
                </AnimatedItem>
              );
            })}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* WHAT YOU GET + BUY */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedItem>
            <SectionLabel>What you get</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="mx-auto mt-8 max-w-2xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
              The operator&rsquo;s blueprint, both formats, and a seat in the
              network.
            </h2>
          </AnimatedItem>

          <AnimatedDiv
            stagger
            className="mx-auto mt-10 flex max-w-3xl flex-col items-stretch gap-3 text-left sm:flex-row"
          >
            {[
              {
                t: "The full PDF",
                b: "The designed edition, with the three-way P&L, the 2026 tables, and the insider sidebars laid out to be used.",
              },
              {
                t: "The ePub",
                b: "The same manual for your e-reader, included at no extra cost.",
              },
              {
                t: "Your network account",
                b: "Set up on your purchase email: free resource library and dashboard.",
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
              <span className="font-display text-5xl font-semibold text-deep-teal [font-variant-numeric:lining-nums_tabular-nums]">
                {PRICE}
              </span>
            </div>
          </AnimatedItem>

          <AnimatedItem>
            <div className="mt-8 flex justify-center">
              <BuyCrrBlueprintButton
                label={`Get the book for ${PRICE}`}
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

      <SectionDivider fromColor={C.white} toColor={C.nearBlack} flip />

      {/* NOT READY? The free ebook. Same list as the calculator; the guide is
          the twelve-chapter short version of Parts I to III of this book. */}
      <section className="bg-near-black px-6 py-14 md:px-12 md:py-16 lg:px-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[10rem] lg:mx-0">
            <Image
              src={CRR_FREE_EBOOK.coverImage}
              alt={`Cover of ${CRR_FREE_EBOOK.name} by ${CRR_FREE_EBOOK.author}`}
              width={1400}
              height={2100}
              quality={85}
              className="w-full rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
            />
          </div>
          <div>
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
              Not ready to buy? Start free.
            </p>
            <h2 className="mb-4 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
              {CRR_FREE_EBOOK.name}: {CRR_FREE_EBOOK.subtitle.toLowerCase()}.
            </h2>
            <p className="mb-6 max-w-2xl font-sans text-base leading-relaxed text-white/70">
              The short version of Parts I to III of this book. Twelve
              four-minute chapters, one insider fact and one action each, free
              by email. If it stops you from buying one wrong car, it has done
              its job.
            </p>
            <Link
              href={CRR_FREE_EBOOK.path}
              className="inline-flex items-center justify-center rounded-full bg-warm-gold px-8 py-3.5 font-sans text-sm font-semibold text-near-black transition-colors duration-200 hover:bg-gold-light"
            >
              Get the free guide
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* FAQ */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
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
                <details className="group rounded-lg border border-light-gray bg-white p-6 transition-colors duration-200 hover:border-deep-teal/40">
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
              Educational content only, not legal, tax, financial, or insurance
              advice. Dollar figures in these pages are illustrative, not a
              guarantee of what you will earn, and the Turo average cited above
              is Turo&rsquo;s own published gross figure before costs. The Inside
              Lane is an independent educational product, not affiliated with
              Turo Inc. or any rental company named in it. Consult a licensed
              attorney, insurance professional, and tax professional in your
              area before making decisions.{" "}
              <Link
                href="/courses/car-rental-riches"
                className="text-deep-teal underline underline-offset-2"
              >
                See the whole Car Rental Riches path
              </Link>
              .
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </>
  );
}
