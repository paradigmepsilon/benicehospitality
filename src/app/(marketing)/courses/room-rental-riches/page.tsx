import type { Metadata } from "next";
import Image from "next/image";
import CourseHero from "@/components/sections/courses/CourseHero";
import StatsStrip from "@/components/sections/courses/StatsStrip";
import TierComparison from "@/components/sections/courses/TierComparison";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "Room Rental Riches",
  description:
    "Run your portfolio like a real business. Three commitment tiers from $497 self-paced to $7,497 ninety-day Operator. Founding pricing for the first 100 students.",
  alternates: {
    canonical: "https://benicehospitality.com/courses/room-rental-riches",
  },
  openGraph: {
    title: "Room Rental Riches | BNHG",
    description:
      "The Host-to-Operator method for property operators. Three commitment tiers. Same curriculum.",
    url: "https://benicehospitality.com/courses/room-rental-riches",
    type: "website",
  },
};

const MODULE_IMAGE_BASE = "/images/Website Images";

const CURRICULUM = [
  {
    number: "01",
    phase: "Phase 1 · Foundation",
    title: "The MTR + Co-Living Opportunity",
    body: "Why now. The 2026 mid-term and co-living market. 19% MTR share. 136% growth since 2019. Atlanta as the case study. The seven-Southeast-metro opportunity map.",
    image: `${MODULE_IMAGE_BASE}/module-01-opportunity.png`,
    imageAlt: "Atlanta craftsman bungalow exterior at golden hour",
  },
  {
    number: "02",
    phase: "Phase 1 · Foundation",
    title: "Legal, Regulatory & Business Setup",
    body: "State-by-state matrix for GA, FL, TX, NC, SC, VA, TN. LLC formation. Insurance. Lease structure templates. The legal foundation that keeps the business standing.",
    image: `${MODULE_IMAGE_BASE}/module-02-legal-setup.png`,
    imageAlt: "Wooden desk with leather folio, fountain pen, and an olive plant",
  },
  {
    number: "03",
    phase: "Phase 1 · Foundation",
    title: "Choosing Your Path",
    body: "Arbitrage vs. ownership vs. co-host. The decision matrix and capital calculator. The forced-commitment exercise that gates the rest of the course. Pick a path before market analysis.",
    image: `${MODULE_IMAGE_BASE}/module-03-choosing-path.png`,
    imageAlt: "Three brass keys on a wooden surface beside a folded map",
  },
  {
    number: "04",
    phase: "Phase 2 · Acquisition",
    title: "Market Analysis & Property Selection",
    body: "AI-powered market research the competitors don't teach. 25+ prompts. Demand-driver mapping for seven Southeast metros. AirDNA and Furnished Finder Pro integrated.",
    image: `${MODULE_IMAGE_BASE}/module-04-market-analysis.png`,
    imageAlt: "Laptop on a linen desk showing a stylized city map",
  },
  {
    number: "05",
    phase: "Phase 2 · Acquisition",
    title: "Securing Your First Property",
    body: "Five email pitch versions. 25+ landlord objection handlers. 15+ owner objection handlers. Attorney-reviewed lease addendum templates. The outreach work that lands the first deal.",
    image: `${MODULE_IMAGE_BASE}/module-05-securing-property.png`,
    imageAlt: "Hands signing a lease document with a fountain pen and brass key",
  },
  {
    number: "06",
    phase: "Phase 3 · Setup",
    title: "Hospitality-Grade Design",
    body: "Five tenant personas. Will Guidara's Unreasonable Hospitality framework, applied. 50+ signature touches. The BNHG welcome basket. Room-by-room design that earns five stars.",
    image: `${MODULE_IMAGE_BASE}/module-06-design.png`,
    imageAlt: "Linen armchair reading nook with stacked books and an olive plant",
  },
  {
    number: "07",
    phase: "Phase 3 · Setup",
    title: "Your Modern Tech Stack",
    body: "Hospitable + PriceLabs + Turno + smart locks + Stessa, configured. 30+ AI guest-messaging prompts. The smart-lock comparison. The stack that runs without you in the loop.",
    image: `${MODULE_IMAGE_BASE}/module-07-tech-stack.png`,
    imageAlt: "Matte-black smart lock on a paneled wooden door",
  },
  {
    number: "08",
    phase: "Phase 4 · Launch",
    title: "Multi-Channel Listing Strategy",
    body: "Furnished Finder first (50% travel-nurse audience), then Airbnb, Zillow, Apartments.com, Hospitable Direct. 15+ AI listing-copy prompts. 30+ headline formulas. Per-platform photo strategy.",
    image: `${MODULE_IMAGE_BASE}/module-08-multi-channel.png`,
    imageAlt: "Smartphone on a linen surface displaying a real estate listing",
  },
  {
    number: "09",
    phase: "Phase 4 · Launch",
    title: "Pricing for Profit (MTR Math)",
    body: "MTR Pricing Calculator V3. The length-of-stay framework other operators get wrong. 15 to 25% discounts vs. an industry that runs 35 to 46%. Seven Southeast seasonal calendars. The math behind a $9,720 per year per property delta.",
    image: `${MODULE_IMAGE_BASE}/module-09-pricing.png`,
    imageAlt: "Open leather notebook with handwritten number columns, calculator and coffee",
  },
  {
    number: "10",
    phase: "Phase 5 · Operations",
    title: "Guest Experience Systems",
    body: "23+ message templates across six phases. 25-scenario issue-resolution playbook. Repeat-guest rebooking funnel. Difficult-guest scripts. The communication cadence that holds 4.85+ stars.",
    image: `${MODULE_IMAGE_BASE}/module-10-guest-experience.png`,
    imageAlt: "Handwritten welcome card propped against a vase of fresh herbs on a bedside table",
  },
  {
    number: "11",
    phase: "Phase 5 · Operations",
    title: "Cleaning, Maintenance & Vendor Management",
    body: "70+ item hospitality-grade cleaning checklist. Six-vendor essential network. Preventive-maintenance calendar. Emergency response protocol. The operations layer that doesn't break.",
    image: `${MODULE_IMAGE_BASE}/module-11-cleaning.png`,
    imageAlt: "Folded cream linen towels on a wooden bench beside a woven basket of supplies",
  },
  {
    number: "12",
    phase: "Phase 6 · Growth",
    title: "Scaling Beyond Your First Property",
    body: "Property #1 readiness audit. SOP template library (15+ pre-built). VA hiring playbook. The 5 to 10 property roadmap. Path-to-W-2-Replacement calculator. Honest 24 to 36 month timeline.",
    image: `${MODULE_IMAGE_BASE}/module-12-scaling.png`,
    imageAlt: "Row of brass keys hanging on a leather key holder above a wooden console",
  },
];

const BONUS_PACK = {
  title: "Bonus Pack: Direct Booking & AI Visibility",
  body: "The intro (4 lessons) ships in every tier. Schema, llms.txt, the foundation AI-visibility checklist. Cohort and Operator unlock the deep dive: GEO/AEO content strategy, third-party citations, MCP readiness, the AI-era brand. The work that pays off from 2026 through 2030.",
};


export default function RRRPage() {
  return (
    <>
      <CourseHero
        eyebrow="Self-paced · Cohort · Operator"
        headline={
          <>
            Room Rental
            <br />
            Riches.
          </>
        }
        body="Run your portfolio like a real business. The Host-to-Operator method, taught at three commitment tiers. Same curriculum in all three. What changes is how much support, accountability, and time with Della you get."
        primaryCta={{ label: "Compare the Tiers", href: "#tiers" }}
        secondaryCta={{
          label: "Login",
          href: "/login",
        }}
        backgroundImage={{
          src: "/images/Website Images/Golden hour Atlanta Neighborhood.png",
          alt: "Atlanta neighborhood at golden hour",
        }}
        previewTitle="What's in the curriculum"
        previewItems={[
          "Phase 1 · Foundation: opportunity framing, legal setup, path commitment",
          "Phase 2 · Acquisition: AI-powered market analysis and first-property outreach",
          "Phase 3 · Setup: hospitality-grade design and the modern tech stack",
          "Phase 4 · Launch: multi-channel listings and the MTR pricing framework",
          "Phase 5 · Operations: guest-experience systems, cleaning, vendor network",
          "Phase 6 · Growth: SOPs, VA hiring, the path-to-W-2-replacement roadmap",
          "Bonus Pack: direct booking and AI visibility for the 2026 through 2030 era",
        ]}
      />

      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />

      <StatsStrip
        items={[
          { value: "12", label: "Modules + Bonus Pack" },
          { value: "6", label: "Phases" },
          { value: "125", label: "Lessons" },
          { value: "100", label: "Founding seats" },
        ]}
      />

      {/* Editorial image strip: four full-bleed property photos */}
      <section aria-hidden className="w-full bg-white p-2 md:p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            {
              src: "/images/Website Images/hf_20260512_145728_7a1638cd-85fa-44e7-a9a7-80d04c3a3dd2.png",
              alt: "Made bedroom with linen bedding at golden hour",
            },
            {
              src: "/images/Website Images/hf_20260512_145736_e7084398-0668-4426-9b89-fbfaf407bf36.png",
              alt: "BNHG welcome basket on a kitchen counter",
            },
            {
              src: "/images/Website Images/hf_20260512_145743_c9f28975-ffa7-4402-8f40-95df8295eee9.png",
              alt: "Sunlit living room with sofa and plants",
            },
            {
              src: "/images/Website Images/hf_20260512_145750_8e221a86-8307-4a76-afc6-cde6fa59b50f.png",
              alt: "Workspace nook with monitor and reading chair",
            },
          ].map((img) => (
            <div key={img.src} className="relative aspect-[4/3] md:aspect-square">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Who this is for */}
      <AnimatedSection theme="off-white" className="py-20 md:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <AnimatedItem>
              <SectionLabel>Who this is for</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-6">
                Two operators. One course.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedItem>
            <div className="font-sans text-base md:text-lg text-charcoal leading-relaxed space-y-4">
              <p className="font-semibold text-deep-teal">
                The aspiring operator without a property yet.
              </p>
              <p>
                You&rsquo;re looking at MTR and co-living because the math
                works and the W-2 doesn&rsquo;t. At least not for the next
                twenty years. You want to operate in the Southeast (Atlanta,
                Tampa, Charlotte, Raleigh, Nashville, Houston, somewhere on
                that map). You haven&rsquo;t signed your first lease or closed
                your first property yet, and you want a structured path from
                &ldquo;reading about this on Reddit&rdquo; to &ldquo;first
                booking in sixty days.&rdquo; Phases 1 and 2 are built for
                you. Opportunity framing, legal setup, path commitment, then
                AI-powered market analysis and the outreach work that lands
                the first deal.
              </p>
              <p className="font-semibold text-deep-teal pt-2">
                The operator past hosting.
              </p>
              <p>
                You have between three and thirty units. Some mix of
                short-term, mid-term, long-term, or co-living. Your revenue is
                real. Your time is the bottleneck. You&rsquo;ve outgrown the
                spreadsheet phase, you&rsquo;re tired of Sunday-night
                cleaner-scrambles, and you&rsquo;re paying enough in OTA
                commission to fund a full-time team member. Phases 3 through 6
                are where you&rsquo;ll spend your time. Hospitality-grade
                design, the modern tech stack, the MTR pricing framework,
                guest-experience systems, vendor networks, and the path to
                W-2 replacement.
              </p>
              <p className="text-warm-gold font-semibold pt-2">
                Same curriculum, both directions. Maya runs five units in
                suburban Atlanta and started in Phase 3. James was a travel
                nurse with no property yet and started in Phase 1. The course
                was built for both of them.
              </p>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      {/* Curriculum perk-card grid */}
      <AnimatedSection theme="light" className="py-20 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The curriculum</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                Six phases. Twelve modules. Plus the Bonus Pack.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Same curriculum in every tier. Foundation through scaling. The
                full arc, from no property yet to a portfolio that runs without
                you on call.
              </p>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {CURRICULUM.map((m) => (
              <AnimatedItem key={m.number}>
                <article className="bg-white border border-light-gray rounded-lg overflow-hidden h-full hover:border-deep-teal/40 transition-colors duration-200 flex flex-col">
                  <div className="relative aspect-[3/2] w-full bg-cream">
                    <Image
                      src={m.image}
                      alt={m.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7 md:p-8 flex-1 flex flex-col">
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2"
                    >
                      {m.phase}
                    </p>
                    <p
                      aria-hidden
                      className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/55 mb-4"
                    >
                      Module {m.number}
                    </p>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-deep-teal leading-tight mb-3">
                      {m.title}
                    </h3>
                    <p className="font-sans text-base text-charcoal leading-relaxed">
                      {m.body}
                    </p>
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>

          {/* Bonus Pack callout */}
          <AnimatedItem>
            <article className="mt-10 bg-deep-teal text-white rounded-lg p-8 md:p-10 border-2 border-warm-gold">
              <p
                aria-hidden
                className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-3"
              >
                Bonus Pack · Included
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream leading-tight mb-4">
                {BONUS_PACK.title}
              </h3>
              <p className="font-sans text-base md:text-lg text-cream/85 leading-relaxed">
                {BONUS_PACK.body}
              </p>
            </article>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.cream} />

      {/* Tier compare */}
      <AnimatedSection
        theme="off-white"
        id="tiers"
        className="py-20 md:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The three tiers</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4">
                Same curriculum. Three commitment levels.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base md:text-lg text-charcoal/75 leading-relaxed mt-5">
                Every tier ships the full twelve-module curriculum and the
                Bonus Pack. What changes is how much support, accountability,
                and time with Della you get.
              </p>
            </AnimatedItem>
          </div>

          <TierComparison />

          <div className="text-center mt-10 max-w-2xl mx-auto">
            <p className="font-sans text-sm text-charcoal/70 italic">
              Founding pricing: the first 100 students per tier get launch
              pricing. After that, prices move to $697, $3,497, and $9,997.
              Cohort and Operator tier prices include the launch cohort and
              don&rsquo;t increase until the cap is met.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
