import type { Metadata } from "next";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import HeroImageBand from "@/components/sections/shared/HeroImageBand";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: "The Nice Host Network",
  description:
    "The community for sharing-economy operators. 2 live, founder-led sessions a week. 47 weeks a year. Bundled with every course tier.",
  alternates: { canonical: "https://benicehospitality.com/community" },
  openGraph: {
    title: "The Nice Host Network | BNHG",
    description:
      "A room of operators doing the same work. 2 live sessions a week. 47 weeks live a year.",
    url: "https://benicehospitality.com/community",
    type: "website",
  },
};

const NETWORK_FEATURES = [
  {
    title: "Tuesday Workshops",
    body: "Della and Alex teach 1 operating concept live each week. Strategy, systems, AI, hiring, pricing. Bring your problem; leave with the next move.",
  },
  {
    title: "Thursday Implementation Hour",
    body: "Hot seats. 1 member at a time, a real situation, a working answer in 30 minutes or less. You watch the work get done in front of you.",
  },
  {
    title: "47 weeks live",
    body: "We take 1 week off per quarter and 2 at year-end. Everything else is live. If you're paying for a community, you should expect the founders in the room.",
  },
  {
    title: "Bundled with every course tier",
    body: "Buy any Room Rental Riches tier (self-paced, Masterclass, or Operator) and you're in. Self-paced gets 1 year. Masterclass gets 1 year plus the eight live weeks. Operator gets lifetime.",
  },
  {
    title: "Asset-class channels",
    body: "Co-living and property operators get their own room. Autos operators get theirs. Multi-asset operators get both. The signal stays high because the rooms stay specific.",
  },
  {
    title: "Labs released here first",
    body: "Every Labs tool ships to network members before it ships publicly. Guestally features, the audit generator, the screening tools we build next. You get the working version before the marketing version.",
  },
];

export default function CommunityPage() {
  return (
    <>
      <section className="bg-cream pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-8">
            The Nice Host Network
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-8">
            A room of operators doing the same work.
          </h1>
          <p className="font-sans text-lg md:text-xl text-charcoal leading-relaxed max-w-2xl mb-10">
            2 live, founder-led sessions a week. 47 weeks a year.
            Built for operators running co-living, short-term, mid-term, and
            long-term rentals, Turo fleets, and boutique stays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/education" variant="primary" size="lg">
              Get In Through a Course
            </Button>
            <Button href="/login" variant="secondary" size="lg">
              Login
            </Button>
          </div>
        </div>
      </section>

      <HeroImageBand
        src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=2000&q=85"
        alt="Operator network placeholder"
      />

      <AnimatedSection theme="off-white" className="py-24 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <AnimatedItem>
              <SectionLabel>What you get</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-6">
                Live work, not recorded screaming.
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-lg text-charcoal/85 leading-relaxed">
                Most operator communities are recorded courses, a Discord
                screaming match, or both. The Nice Host Network is the
                founders, in the room, doing the work in real time.
              </p>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            {NETWORK_FEATURES.map((f) => (
              <AnimatedItem key={f.title}>
                <article className="border-l-2 border-warm-gold pl-6 md:pl-8">
                  <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight mb-3">
                    {f.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal leading-relaxed">
                    {f.body}
                  </p>
                </article>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-24 md:py-28 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel light>The room</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.15] tracking-tight mt-4 mb-8">
              No fluff, no replays-only courses, no Discord screaming match.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-white/85 leading-relaxed">
              The members in this network are running real operations: 3
              units to 30, co-living to STR to LTR. They show up because
              the work is good, the founders are in it, and the conversation
              stays operator-class. Marketers don&rsquo;t last in here.
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.nearBlack} />
    </>
  );
}
