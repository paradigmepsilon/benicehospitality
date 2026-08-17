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
import BuyCrrBlueprintButton from "./_components/BuyCrrBlueprintButton";

/**
 * The Car Rental Riches Blueprint: sales page.
 *
 * Mirror of the RRR Blueprint page (books/room-rental-riches-blueprint), with
 * Alex's voice: an honest operator's manual for starting a Turo business in
 * the 2026 earnings-plan era. Receipts over hype, no earnings promises, and
 * the only dollar figure from Turo appears labeled as Turo's own published
 * gross average before costs.
 *
 * The cover asset (CRR_BLUEPRINT.coverImage) does not exist yet, so the hero
 * renders a typographic cover in the same slot. Swap it for a real <Image>
 * once /images/crr_blueprint_cover.webp lands.
 *
 * Deliberately NO testimonials: the book is new and no real reader quotes
 * exist, and fabricating them would be an FTC problem.
 */

const PRICE = `$${CRR_BLUEPRINT.priceUsd}`;

export const metadata: Metadata = {
  title: "The Car Rental Riches Blueprint",
  description:
    "An honest operator's manual for starting a Turo business in the 2026 earnings-plan era. Written by Alex Henry, operator of a real Atlanta-area rental fleet. 11 chapters, PDF + ePub, $32.",
  alternates: {
    canonical: `https://benicehospitality.com${CRR_BLUEPRINT.path}`,
  },
  openGraph: {
    title: "The Car Rental Riches Blueprint | Alex Henry",
    description:
      "Not another side-hustle book. The underwriting method, listing playbook, and operating system Alex Henry uses across his own rental fleet, written for the way Turo actually works in 2026.",
    url: `https://benicehospitality.com${CRR_BLUEPRINT.path}`,
    type: "book",
    images: [
      {
        url: `https://benicehospitality.com${CRR_BLUEPRINT.coverImage}`,
        width: 1400,
        height: 2100,
        alt: "Cover of The Car Rental Riches Blueprint by Alex Henry",
      },
    ],
  },
};

// Outcomes, not features. Each line is the result the reader walks away with,
// rendered with the checkmark treatment below (so no literal checkmark in the
// string).
const PROMISES = [
  "Underwrite a specific car before you buy it, not after.",
  "Read an earnings plan and know exactly what each trade-off costs you.",
  "Run each car in about two hours a week with real SOPs.",
  "Build toward bookings you own, not just marketplace listings.",
];

// The eleven chapters. `benefit` leads each card with the result the chapter
// gets you; the chapter title is kept underneath, since the delivery email
// points people to chapters by number.
const CHAPTERS = [
  {
    n: "01",
    benefit: "Decide whether this business fits your life, with honest math.",
    title: "The $874 Question",
  },
  {
    n: "02",
    benefit: "Understand the 2026 earnings plans and why older advice now costs money.",
    title: "What Changed in 2026",
  },
  {
    n: "03",
    benefit: "Score a specific car before you buy it, with a fully worked P&L.",
    title: "The Underwriting Method",
  },
  {
    n: "04",
    benefit: "Buy, lease, or list the car you have, and finance it sensibly.",
    title: "Getting the Car",
  },
  {
    n: "05",
    benefit: "Photos, copy, and the 2026 pricing levers that actually matter.",
    title: "The Listing That Books Itself",
  },
  {
    n: "06",
    benefit: "Read the protection trade-offs and document every trip like a professional.",
    title: "Protection Is Not Insurance",
  },
  {
    n: "07",
    benefit: "SOPs, automation, and guest experience that keep the week small.",
    title: "Operations in Two Hours a Week Per Car",
  },
  {
    n: "08",
    benefit: "Real P&L, depreciation, and what a 1099-K means for you.",
    title: "The Money Chapter",
  },
  {
    n: "09",
    benefit: "Know when the numbers say add a car, and how to do it.",
    title: "Car #2 and Beyond",
  },
  {
    n: "10",
    benefit: "Start building direct bookings you own, off the marketplace.",
    title: "Beyond the Marketplace",
  },
  {
    n: "11",
    benefit: "A week-by-week plan from decision to first booking.",
    title: "Your 90-Day Launch Plan",
  },
];

const FAQS = [
  {
    q: "What format is it?",
    a: "PDF and ePub, both included. The PDF is the designed edition with the tables and worked numbers laid out properly; the ePub is there for e-readers. You get download links for both by email the moment you buy.",
  },
  {
    q: "Do I need a car already?",
    a: "No. Chapter 3 teaches you to underwrite a car before you commit to it, and Chapter 4 covers buying, leasing, and listing a car you already own. If you already have the car, go straight to Chapter 3 and run the numbers before you list it.",
  },
  {
    q: "How is this different from the course?",
    a: "The Blueprint is the written system, start to finish, at your own pace. The Car Rental Riches course teaches the same body of work in more depth, with the full direct-booking build-out. Plenty of people read the book first and step up to the course when they want more.",
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
    q: "Is this affiliated with Turo?",
    a: "No. The Car Rental Riches Blueprint is an independent educational product and is not affiliated with, endorsed by, or sponsored by Turo Inc.",
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
              {/* Typographic cover: the real cover asset is not produced yet,
                  so this styled stand-in holds the slot with the same aspect
                  ratio and shadow treatment as the RRR page's <Image>. */}
              <div className="flex aspect-[2/3] w-full flex-col justify-between rounded-sm bg-gradient-to-b from-deep-teal to-near-black p-7 shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-warm-gold">
                  Car Rental Riches
                </p>
                <div>
                  <p className="font-display text-3xl font-semibold leading-tight text-white">
                    The Car Rental Riches Blueprint
                  </p>
                  <p className="mt-4 font-sans text-sm leading-snug text-white/75">
                    {CRR_BLUEPRINT.subtitle}
                  </p>
                </div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  {CRR_BLUEPRINT.author}
                </p>
              </div>
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                PDF + ePub
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Car Rental Riches · The Blueprint
            </p>
            <h1 className="mb-6 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              An Honest Operator&rsquo;s Manual for Starting a Turo Business in
              the 2026 Earnings-Plan Era.
            </h1>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              I run a real rental fleet in the Atlanta area. This book is the
              system I actually use: how to underwrite a car before you buy it,
              list it so it books, protect it properly, and run it in about two
              hours a week, written for the way Turo works now, not the way it
              worked in 2021.
            </p>

            {/* concrete, verifiable specs, the stuff a buyer scans for */}
            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-white/70">
              {[
                "11 chapters",
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
              label={`Get the Blueprint for ${PRICE}`}
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
            before any costs. This book is about the word gross, and about
            running the numbers like an operator before you spend a dollar.
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
                The advice I found was written for a Turo that no longer exists.
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
                  of date.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  Then 2026 arrived: earnings plans, a variable host share, and
                  a market with one less competitor. The math changed again.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  I learned the current version the way operators do: by running
                  cars, reading my own statements, and fixing what broke.
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
                Eleven chapters, decision to launch.
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
              // Chapter 11 is the launch plan and the odd card out in a 2-up
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
              The operator&rsquo;s manual, both formats, and a seat in the
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
                b: "The designed edition, with the worked P&L and the 2026 tables laid out to be used.",
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
                label={`Get the Blueprint for ${PRICE}`}
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

      <SectionDivider fromColor={C.white} toColor={C.cream} flip />

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
              is Turo&rsquo;s own published gross figure before costs. The Car
              Rental Riches Blueprint is an independent educational product, not
              affiliated with Turo Inc. Consult a licensed attorney and tax
              professional in your area before making decisions.{" "}
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
