import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import { CRR_FREE_EBOOK } from "@/lib/crr-free-ebook";
import { CRR_BLUEPRINT } from "@/lib/crr-blueprint";
import FreeEbookForm from "./_components/FreeEbookForm";

/**
 * Before You Buy the Car: landing page for the free Car Rental Riches ebook.
 *
 * The page has one job, the opt-in, so the form sits in the hero next to the
 * cover and again at the bottom. Everything between is proof that the guide
 * is worth an email: the twelve chapter titles (each one is a claim the
 * reader has not heard), who wrote it, and what it is not.
 *
 * Targets the "how to start a car rental business" search cluster, which is
 * larger and worse served than the Turo-specific one; the copy says "car
 * rental business" plainly and treats Turo as one channel.
 *
 * No testimonials (none exist), no earnings numbers except Turo's own gross
 * average, labeled gross.
 */

const TITLE = `${CRR_FREE_EBOOK.name}: ${CRR_FREE_EBOOK.subtitle}`;

export const metadata: Metadata = {
  title: `${CRR_FREE_EBOOK.name} (Free Guide)`,
  description:
    "Free guide: 12 things nobody tells you before you start a car rental business or rent out your first vehicle. Gross versus net, depreciation, insurance, the same car three ways, and the quit criteria. By Alex Henry, operator of a real Atlanta-area fleet.",
  alternates: {
    canonical: `https://benicehospitality.com${CRR_FREE_EBOOK.path}`,
  },
  openGraph: {
    title: `${TITLE} | Alex Henry`,
    description:
      "A free, twelve-chapter guide for anyone about to buy a car to rent out. One insider fact and one action per chapter, from an operator who runs a real fleet.",
    url: `https://benicehospitality.com${CRR_FREE_EBOOK.path}`,
    type: "book",
    images: [
      {
        url: `https://benicehospitality.com${CRR_FREE_EBOOK.coverImage}`,
        width: 1400,
        height: 2100,
        alt: `Cover of ${CRR_FREE_EBOOK.name} by Alex Henry`,
      },
    ],
  },
};

const NOT_FOR = [
  "It is not a list of the best cars for Turo. It is the method for deciding whether any car, on any channel, belongs in your driveway.",
  "It does not promise income. Every figure in it is labeled gross or net, and Turo's own average is labeled what it is: gross, before every cost.",
  "It is not the whole book. It is the twelve things that keep people from buying the wrong first car, which is where most of the money in this business is lost.",
];

export default function BeforeYouBuyTheCarPage() {
  return (
    <>
      {/* HERO with the form */}
      <section className="relative overflow-hidden bg-near-black px-6 pb-16 pt-28 md:px-12 md:pt-32 lg:px-20 lg:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-warm-gold/20 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-[16rem] lg:mx-0 lg:max-w-none">
            <div className="relative">
              <Image
                src={CRR_FREE_EBOOK.coverImage}
                alt={`Cover of ${CRR_FREE_EBOOK.name} by Alex Henry`}
                width={1400}
                height={2100}
                priority
                quality={90}
                className="w-full rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
              />
              <span className="absolute -right-3 -top-3 rotate-3 rounded bg-warm-gold px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-near-black shadow-lg">
                Free
              </span>
            </div>
          </div>

          <div>
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold md:text-sm">
              Car Rental Riches · Free guide
            </p>
            <h1 className="mb-5 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">
              Twelve things nobody tells you before you rent out your first
              car.
            </h1>
            <p className="mb-8 max-w-2xl font-sans text-lg leading-snug text-white/85">
              Thinking about a car rental business, on Turo or off it? Read
              this first. Twelve short chapters, one insider fact and one action
              each, from an operator who runs a real fleet in the Atlanta area.
              Free, by email, PDF and ePub.
            </p>

            <div className="max-w-xl">
              <FreeEbookForm source="hero" />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      {/* THE TWELVE */}
      <AnimatedSection theme="off-white" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <AnimatedItem>
              <SectionLabel>What&rsquo;s inside</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                Twelve chapters. Four minutes each.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="mt-5 font-sans text-base leading-relaxed text-charcoal/75 md:text-lg">
                Every chapter ends with one thing to do. If you only do the
                actions, you will be ahead of most people who start this
                business.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CRR_FREE_EBOOK.chapters.map((title, i) => (
              <AnimatedItem key={title}>
                <article className="flex h-full items-start gap-4 rounded-lg border border-light-gray bg-white p-5 transition-colors duration-200 hover:border-deep-teal/40">
                  <span className="font-display text-2xl font-semibold leading-none text-warm-gold [font-variant-numeric:lining-nums_tabular-nums]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-lg font-semibold leading-snug text-deep-teal">
                    {title}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} />

      {/* WHO WROTE IT + WHAT IT IS NOT */}
      <AnimatedSection theme="light" className="px-6 py-14 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          <AnimatedItem>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm lg:mx-0 lg:max-w-none">
              <Image
                src="/images/Website%20Images/Alex%20Turo%20Shot.png"
                alt="Alex Henry with one of the Be Nice Autos fleet vehicles"
                fill
                quality={90}
                className="object-cover"
                style={{ filter: "saturate(0.9) contrast(1.05)" }}
                sizes="(min-width: 1024px) 18rem, (min-width: 640px) 24rem, 100vw"
              />
            </div>
          </AnimatedItem>

          <div>
            <AnimatedItem>
              <SectionLabel>Who wrote it</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-deep-teal md:text-5xl">
                An operator, not an influencer.
              </h2>
            </AnimatedItem>
            <AnimatedDiv
              stagger
              className="mt-8 space-y-4 font-sans text-base leading-relaxed text-charcoal/80 md:text-lg"
            >
              <AnimatedItem>
                <p>
                  I&rsquo;m Alex Henry. I run Be Nice Autos, a rental fleet in
                  the Atlanta area that rents by the week to working drivers,
                  by the day through the marketplace, and directly to local
                  customers. Real cars, real claims, real statements.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p>
                  This guide is what I would hand a friend who told me they
                  were about to buy a car to rent out. It is short because the
                  decision is short: buy the right first car, or don&rsquo;t
                  buy one yet.
                </p>
              </AnimatedItem>
            </AnimatedDiv>

            <AnimatedItem>
              <p className="mt-10 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
                What it is not
              </p>
            </AnimatedItem>
            <AnimatedDiv stagger className="mt-4 space-y-3">
              {NOT_FOR.map((line) => (
                <AnimatedItem key={line}>
                  <p className="flex items-start gap-3 font-sans text-base leading-relaxed text-charcoal/80">
                    <span
                      aria-hidden
                      className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-warm-gold"
                    />
                    <span>{line}</span>
                  </p>
                </AnimatedItem>
              ))}
            </AnimatedDiv>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.nearBlack} flip />

      {/* SECOND FORM + WHERE IT GOES NEXT */}
      <section className="bg-near-black px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
              Get the guide
            </p>
            <h2 className="mb-4 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
              Read it before you spend a dollar on a car.
            </h2>
            <p className="mb-8 max-w-xl font-sans text-base leading-relaxed text-white/70">
              PDF and ePub, delivered by email in about a minute. The metro and
              car-count fields are optional; they let me send you the version
              of the follow-up notes that fits where you are.
            </p>
            <FreeEbookForm source="footer" />
          </div>

          <div className="space-y-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-warm-gold">
              Where it goes next
            </p>
            <Link
              href="/turo-calculator"
              className="group block rounded-xl border border-white/15 bg-white/5 p-6 transition-colors duration-200 hover:border-warm-gold/60"
            >
              <p className="font-display text-xl font-semibold text-white group-hover:text-gold-light">
                The free Vehicle Profitability Calculator
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-white/65">
                Chapter seven says the same car is three different businesses.
                This runs any car three ways, marketplace, weekly, and direct,
                and gives you a PROCEED, CAUTION, or PASS.
              </p>
            </Link>
            <Link
              href={CRR_BLUEPRINT.path}
              className="group block rounded-xl border border-white/15 bg-white/5 p-6 transition-colors duration-200 hover:border-warm-gold/60"
            >
              <p className="font-display text-xl font-semibold text-white group-hover:text-gold-light">
                {CRR_BLUEPRINT.name}, the full book
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-white/65">
                {CRR_BLUEPRINT.subtitle} Seventeen chapters, PDF and ePub.
              </p>
            </Link>
            <p className="pt-2 font-sans text-xs leading-relaxed text-white/45">
              Educational content only, not legal, tax, financial, or insurance
              advice. Dollar figures in the guide are illustrative, not a
              promise of what you will earn. Car Rental Riches is an
              independent educational product, not affiliated with Turo Inc.
              or any rental company named in it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
