import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "About Alex and Della Henry | Be Nice Hospitality Group",
  description:
    "We're Alex and Della Henry, the husband-and-wife team behind BNHG. Two U.S. military veterans helping independent hospitality brands run smarter, market sharper, and deliver guest experiences worth talking about.",
  alternates: { canonical: "https://benicehospitality.com/about" },
  openGraph: {
    title: "About Alex and Della Henry | Be Nice Hospitality Group",
    description:
      "Husband-and-wife veteran operators behind Be Nice Hospitality Group. We help boutique hotels, vacation rentals, and small hospitality groups deliver experiences worth returning for.",
    url: "https://benicehospitality.com/about",
    type: "profile",
  },
};

const HOW_WE_HELP = [
  {
    eyebrow: "01 · Technology",
    title: "Tech that takes work off your plate",
    body: "We pick, set up, and run the systems that make your property easier to operate and more profitable. PMS, booking engines, guest messaging, AI visibility, automations, and the integrations that hold it together. We've also built our own products — Guestally for guest messaging, Signal by BNHG for AI search visibility — because we couldn't find tools that fit how independents actually work.",
  },
  {
    eyebrow: "02 · Commercial Strategy",
    title: "Pricing, distribution, and the math",
    body: "Pricing, channels, direct booking, and the math behind your revenue. We help you stop leaking margin to OTAs and start owning your guest relationships, with a plan you can actually run.",
  },
  {
    eyebrow: "03 · Guest Experience",
    title: "The kind of stay people text their friends about",
    body: "From the first time a guest sees your property online to the post-stay note that earns the rebook, we design experiences that compound into repeat business and word of mouth.",
  },
];

const DELLA_SKILLS = [
  "Guest experience and journey design grounded in psychology and tourism",
  "Property management and on-property operations leadership",
  "Client account management and long-term partnership",
  "Brand voice, storytelling, and persona development",
  "Customer success and post-launch optimization",
];

const ALEX_SKILLS = [
  "Technology strategy and full hospitality tech stack design",
  "Systems integration, automation, and AI implementation",
  "Operational problem-solving and workflow design",
  "Vehicle and mobility operations leadership via Be Nice Autos",
  "Years of cross-industry experience in technology and operations",
];

const BELIEFS = [
  {
    title: "Independent shouldn't mean under-equipped.",
    body: "Small operators deserve the same caliber of tools, thinking, and strategy as the major brands. We bring that work down to where you can actually use it.",
  },
  {
    title: "Technology should make hospitality more human.",
    body: "We use systems to give owners and teams back the time and bandwidth to take care of guests properly. Not the other way around.",
  },
  {
    title: "Honest beats clever.",
    body: "We'd rather tell you what we'd actually do than sell you something that sounds good in a deck. If we're not the fit, we'll say so.",
  },
  {
    title: "Be nice.",
    body: "It's literally the name of the company. It's also how we try to show up — for clients, for guests, and for each other.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO INTRO
          Dark hero with a curvy SectionDivider transitioning into the
          warmer Our Story section below. Matches the hero treatment
          used on Signal, Insights, and the other primary surfaces.
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-near-black pt-24 md:pt-32 lg:pt-36 pb-10 md:pb-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
              About Be Nice Hospitality
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-7">
              We&rsquo;re{" "}
              <span className="italic text-warm-gold">Alex and Della</span>{" "}
              Henry.
            </h1>
            <p className="font-sans text-lg md:text-xl text-white/85 leading-snug mb-6 max-w-xl">
              The husband-and-wife team behind BNHG. Two U.S. military veterans,
              lifelong partners, and lifelong operators.
            </p>
            <p className="font-sans text-base md:text-lg text-white/70 leading-relaxed max-w-xl mb-8">
              BNHG is the company we built to help independent hospitality
              brands run smarter, market sharper, and deliver the kind of
              guest experience people actually talk about.
            </p>
            <p className="font-script text-2xl md:text-3xl text-warm-gold">
              &mdash; Alex &amp; Della
            </p>
          </div>

          <div className="max-w-2xl mx-auto lg:max-w-none lg:mx-0">
            <div className="relative">
              <div className="absolute inset-0 bg-warm-gold/30 rounded-sm translate-x-3 translate-y-3" />
              <div className="relative overflow-hidden rounded-sm">
                <Image
                  src="/images/Website%20Images/hf_20260523_234948_572e0ebd-8748-4e21-84cd-68f9e2e2b41e.png"
                  alt="Della and Alex Henry, co-founders of Be Nice Hospitality Group"
                  width={5120}
                  height={2880}
                  priority
                  className="block w-full h-auto"
                  style={{ filter: "saturate(0.9) contrast(1.05)" }}
                  sizes="(min-width: 1024px) 45vw, 90vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — OUR STORY
          Asymmetric narrative + property photo. Pull quote in the
          middle for emotional anchor.
          ───────────────────────────────────────────────────────────── */}
      <AnimatedSection theme="off-white" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] lg:grid-rows-[auto_1fr] gap-10 lg:gap-x-16 lg:gap-y-10 items-start">
            <div className="lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28">
              <AnimatedItem>
                <SectionLabel>Our story</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
                  How we got{" "}
                  <span className="italic text-warm-gold-dark">here</span>.
                </h2>
              </AnimatedItem>
            </div>

            <AnimatedDiv
              stagger
              className="space-y-6 lg:col-start-2 lg:row-start-1 lg:row-span-2"
            >
              <AnimatedItem>
                <p className="font-sans text-lg md:text-xl text-charcoal leading-relaxed">
                  Hospitality wasn&rsquo;t where we started. We met in the
                  military, built a family, and after our service we started
                  looking for a way to put our energy into something that
                  mattered to us both.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                  Real estate and travel kept pulling us in. We bought our
                  first property, then another. We learned the work the hard
                  way &mdash; by doing it.
                </p>
              </AnimatedItem>

              <AnimatedItem>
                <div className="my-8 md:my-10 border-l-2 border-warm-gold pl-6 md:pl-8">
                  <p className="font-display text-2xl md:text-3xl text-deep-teal italic leading-snug">
                    &ldquo;We don&rsquo;t run BNHG from the outside. We run it
                    because we live it.&rdquo;
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem>
                <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                  We own and operate our own properties, including{" "}
                  <span className="font-semibold text-deep-teal">TRAD</span>, a
                  romantic getaway property near Atlanta that has become our
                  working laboratory for everything we now teach. Bookings,
                  reviews, OTA fees, tech headaches, guest expectations,
                  late-night messages, slow seasons, full seasons. We&rsquo;ve
                  handled all of it ourselves.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                  That hands-on experience gave us a perspective no consultant
                  gets from a slide deck. And the more we worked on our own
                  operations, the more we saw the same problems showing up
                  everywhere. Beautiful properties losing direct bookings to
                  OTAs. Strong brands invisible on Google, ChatGPT, and
                  Perplexity. Owners drowning in day-to-day operations because
                  no one had built them a system. Guest experiences left to
                  chance.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed font-medium">
                  BNHG is what we built in response.
                </p>
              </AnimatedItem>
            </AnimatedDiv>

            {/* Property photo — on lg sits in the left column under the
                section header; on small screens flows to the bottom of
                the section as its own row. */}
            <AnimatedItem className="lg:col-start-1 lg:row-start-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                <Image
                  src="/images/Website%20Images/hf_20260522_020323_3fe26e09-0861-4b3d-9eb0-e7e222785751.jpeg"
                  alt="TRAD, our working laboratory property near Atlanta"
                  fill
                  className="object-cover"
                  style={{ filter: "saturate(0.9) contrast(1.05)" }}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
              <p className="mt-3 font-sans text-xs text-charcoal/55 italic">
                TRAD &middot; our working laboratory near Atlanta
              </p>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.white} />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — HOW WE HELP
          Three-card editorial grid with numerals. Sits on white for
          a clean breath between the warmer sections.
          ───────────────────────────────────────────────────────────── */}
      <AnimatedSection theme="light" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel>How we help</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
                What we do for{" "}
                <span className="italic text-warm-gold-dark">
                  independent hospitality brands
                </span>
                .
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                Three lanes of work, all built around the same idea &mdash;
                meeting you where you actually are. A full strategic
                partnership, a focused project, or an honest second opinion.
                Whatever fits.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {HOW_WE_HELP.map((item) => (
              <AnimatedItem key={item.title}>
                <article className="h-full bg-off-white border border-light-gray rounded-sm p-8 md:p-10 flex flex-col">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
                    {item.eyebrow}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                    {item.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal/85 leading-relaxed">
                    {item.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.offWhite} flip />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — MEET DELLA
          Photo left, narrative + skills right. Pull quote and a
          warm signature line.
          ───────────────────────────────────────────────────────────── */}
      <AnimatedSection theme="off-white" className="py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
            <AnimatedItem>
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
                <div className="absolute inset-0 bg-warm-gold/30 rounded-sm translate-x-4 translate-y-4" />
                <div className="relative w-full h-full overflow-hidden rounded-sm">
                  <Image
                    src="/images/Website%20Images/hf_20260524_000326_0729b041-7c0a-48b5-9241-bf16ce0362f5.png"
                    alt="Della Henry, co-founder of Be Nice Hospitality Group"
                    fill
                    className="object-cover"
                    style={{ filter: "saturate(0.9) contrast(1.05)" }}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                  />
                </div>
              </div>
              <p className="mt-3 font-sans text-xs text-charcoal/55 italic text-center lg:text-left">
                Della &middot; Co-founder, hospitality &amp; guest experience
              </p>
            </AnimatedItem>

            <div>
              <AnimatedItem>
                <SectionLabel>Meet Della</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-3">
                  Della Henry
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-sm md:text-base font-semibold tracking-wide text-warm-gold-dark mb-6">
                  Co-founder &middot; Hospitality, Guest Experience &amp;
                  Client Success
                </p>
              </AnimatedItem>

              <AnimatedDiv stagger className="space-y-5">
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed">
                    Della &mdash; or{" "}
                    <span className="italic text-deep-teal">Dee</span> to most
                    people who know her &mdash; is the heart of BNHG&rsquo;s
                    hospitality, guest experience, and client work.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                    Her background is unusually well-matched to the job. She
                    holds degrees in{" "}
                    <span className="font-semibold text-deep-teal">
                      Psychology and Tourism
                    </span>{" "}
                    &mdash; a combination that means she&rsquo;s spent her
                    academic life studying both how people actually behave and
                    how the travel industry actually works. That dual lens
                    shows up in everything she touches. When Della builds a
                    guest persona, she isn&rsquo;t guessing. When she designs
                    a guest journey, she&rsquo;s pulling from real frameworks.
                    When she sits with a client to understand what they want
                    their property to feel like, she listens the way trained
                    psychologists do.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                    Clients call her when something&rsquo;s off, when a season
                    feels flat, when a launch needs a steady hand. Her work
                    spans property management, on-property operations, guest
                    experience design, brand storytelling, and the kind of
                    detail work that separates a five-star stay from a
                    forgettable one.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                    Day-to-day, Della also runs TRAD, hosts the{" "}
                    <span className="italic">Truth Be Told</span> show, and
                    leads the{" "}
                    <span className="font-semibold text-deep-teal">
                      Date Night Circle
                    </span>{" "}
                    &mdash; which keeps her close to the real, hands-on work
                    of welcoming guests and building experiences worth
                    returning to.
                  </p>
                </AnimatedItem>
              </AnimatedDiv>

              <AnimatedItem>
                <div className="mt-10 border-t border-light-gray pt-8">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
                    What she brings to your business
                  </p>
                  <ul className="space-y-3">
                    {DELLA_SKILLS.map((skill) => (
                      <li
                        key={skill}
                        className="flex gap-3 font-sans text-base text-charcoal/85 leading-snug"
                      >
                        <span
                          aria-hidden
                          className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-warm-gold shrink-0"
                        />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.offWhite} toColor={C.cream} />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — MEET ALEX
          Mirrored layout — photo on the right this time.
          ───────────────────────────────────────────────────────────── */}
      <AnimatedSection theme="off-white" className="bg-cream py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
            <div className="lg:order-1">
              <AnimatedItem>
                <SectionLabel>Meet Alex</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-3">
                  Alex Henry
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-sm md:text-base font-semibold tracking-wide text-warm-gold-dark mb-6">
                  Co-founder &middot; Technology, Operations &amp; Vehicle
                  Operations
                </p>
              </AnimatedItem>

              <AnimatedDiv stagger className="space-y-5">
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal leading-relaxed">
                    Alex is the operations and technology side of the
                    partnership. He has spent years working across technology
                    and operations roles, and BNHG is where all of that
                    experience comes together.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                    If something needs to be built, integrated, automated, or
                    fixed, that&rsquo;s Alex&rsquo;s lane. He&rsquo;s the
                    person who maps the workflow, chooses the tools, wires
                    them together, and makes sure they&rsquo;re still working
                    six months later &mdash; when most consultants have moved
                    on.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed">
                    Inside BNHG, his work covers technical strategy, systems
                    architecture, AI integration, and day-to-day operational
                    problem-solving for clients. He&rsquo;s also the founder
                    of{" "}
                    <span className="font-semibold text-deep-teal">
                      Be Nice Autos
                    </span>{" "}
                    &mdash; the family&rsquo;s vehicle and Turo fleet
                    operation, which has given him a working understanding of
                    two-sided service businesses, asset-light operations, and
                    the realities of generating revenue on someone else&rsquo;s
                    platform. Lessons that translate directly to running a
                    hospitality business in an OTA-dominated world.
                  </p>
                </AnimatedItem>
                <AnimatedItem>
                  <div className="my-8 border-l-2 border-primary-green pl-6">
                    <p className="font-display text-xl md:text-2xl text-deep-teal italic leading-snug">
                      &ldquo;When the tech stack is held together by tape,
                      Alex is usually the one drawing the new map.&rdquo;
                    </p>
                  </div>
                </AnimatedItem>
              </AnimatedDiv>

              <AnimatedItem>
                <div className="mt-6 border-t border-charcoal/15 pt-8">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-5">
                    What he brings to your business
                  </p>
                  <ul className="space-y-3">
                    {ALEX_SKILLS.map((skill) => (
                      <li
                        key={skill}
                        className="flex gap-3 font-sans text-base text-charcoal/85 leading-snug"
                      >
                        <span
                          aria-hidden
                          className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-primary-green shrink-0"
                        />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedItem>
            </div>

            <AnimatedItem className="lg:order-2">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                <div className="absolute inset-0 bg-primary-green/25 rounded-sm translate-x-4 translate-y-4" />
                <div className="relative w-full h-full overflow-hidden rounded-sm">
                  <Image
                    src="/images/Website%20Images/hf_20260524_000935_2ba24c6a-cd5e-4828-a6f6-71214622f97e.png"
                    alt="Alex Henry, co-founder of Be Nice Hospitality Group"
                    fill
                    className="object-cover"
                    style={{ filter: "saturate(0.9) contrast(1.05)" }}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                  />
                </div>
              </div>
              <p className="mt-3 font-sans text-xs text-charcoal/55 italic text-center lg:text-left">
                Alex &middot; Co-founder, technology &amp; operations
              </p>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — WHAT WE BELIEVE
          Four values on a warm dark green ground. Slight italic
          touches in the headings for personal voice.
          ───────────────────────────────────────────────────────────── */}
      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-10 md:py-14 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14">
            <AnimatedItem>
              <SectionLabel light>What we believe</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.1] tracking-tight mt-4 mb-5">
                A few things we&rsquo;ve come to{" "}
                <span className="italic text-warm-gold">believe</span> through
                the work.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-white/85 leading-relaxed">
                Not a manifesto. Not a poster on the wall. Just the four ideas
                that keep showing up when we choose what to build and how to
                work.
              </p>
            </AnimatedItem>
          </div>

          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {BELIEFS.map((b, i) => (
              <AnimatedItem key={b.title}>
                <article className="h-full bg-white/5 border border-white/15 rounded-sm p-8 md:p-10">
                  <p className="font-display text-2xl md:text-3xl font-semibold text-warm-gold leading-none mb-5">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight mb-4">
                    {b.title}
                  </h3>
                  <p className="font-sans text-base text-white/80 leading-relaxed">
                    {b.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.cream} />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7 — CLOSING / CTA
          Warm cream, intimate copy, signature line, two CTAs.
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-cream py-10 md:py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-warm-gold mb-6">
              Let&rsquo;s talk
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-6">
              If any of this sounds like{" "}
              <span className="italic text-warm-gold-dark">you</span>,
              we&rsquo;d love a conversation.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed mb-10 max-w-2xl mx-auto">
              No pitch. No pressure. Just a real talk about where you are,
              what&rsquo;s working, what isn&rsquo;t, and whether we can
              actually help. If we&rsquo;re not the fit, we&rsquo;ll tell you
              on the call.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/book" variant="primary" size="lg">
                Book a Discovery Call
              </Button>
              <Button href="/services" variant="secondary" size="lg">
                See Our Services
              </Button>
            </div>
          </AnimatedItem>
          <AnimatedItem>
            <p className="mt-12 font-script text-3xl md:text-4xl text-warm-gold-dark">
              &mdash; Alex &amp; Della
            </p>
          </AnimatedItem>
        </div>
      </section>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
