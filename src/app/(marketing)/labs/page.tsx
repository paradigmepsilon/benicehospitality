import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroImageBand from "@/components/sections/shared/HeroImageBand";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import PageCTA from "@/components/sections/shared/PageCTA";

export const metadata: Metadata = {
  title: "BNHG Labs",
  description:
    "The innovation arm. Home of Guestally, the Labs Pass, and a portfolio of free diagnostic tools for sharing-economy operators.",
  alternates: { canonical: "https://benicehospitality.com/labs" },
  openGraph: {
    title: "BNHG Labs",
    description:
      "Where Alex builds the next generation of operator tools. Guestally, the Labs Pass, and 8 free diagnostics.",
    url: "https://benicehospitality.com/labs",
    type: "website",
  },
};

interface LabsTool {
  name: string;
  status: "live" | "beta" | "planned";
  href: string;
  body: string;
}

const TOOLS: LabsTool[] = [
  {
    name: "Guestally",
    status: "live",
    href: "/labs/guestally",
    body: "Property-side AI concierge for STR and co-living operators. The flagship Labs product. Founded by Alex Henry as a separate company within the BNHG portfolio. $179 / $299 / $349 per month.",
  },
  {
    name: "Audit Generator",
    status: "live",
    href: "/audit/request",
    body: "URL in. Branded report out. Drops a Tier-0 audit on any property in minutes. Free.",
  },
  {
    name: "Bernice Demo Sandbox",
    status: "beta",
    href: "/labs#bernice",
    body: "Live text thread with our AI guest concierge. Try it before you trust it.",
  },
  {
    name: "Operator Audit (Property)",
    status: "planned",
    href: "/labs#operator-audit",
    body: "The boutique-hotel audit, retuned for STR / LTR / co-living. Same engine, operator-flavored output.",
  },
  {
    name: "Fleet Screener",
    status: "planned",
    href: "/labs#fleet-screener",
    body: "AI-assisted renter screening for Turo and rental-fleet operators. Ships after CRR foundation.",
  },
];

const STATUS_STYLES: Record<LabsTool["status"], string> = {
  live: "bg-warm-gold text-near-black",
  beta: "bg-deep-teal text-cream",
  planned: "bg-light-gray text-charcoal/65",
};

const STATUS_LABEL: Record<LabsTool["status"], string> = {
  live: "Live",
  beta: "Beta",
  planned: "Planned",
};

export default function LabsPage() {
  return (
    <>
      <section className="bg-cream pt-32 md:pt-40 lg:pt-44 pb-20 md:pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-charcoal/70 mb-8">
            BNHG Labs
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-8">
            The AI tools we wished existed.
          </h1>
          <p className="font-sans text-lg md:text-xl text-charcoal leading-relaxed max-w-2xl mb-10">
            BNHG Labs is the innovation arm. Guestally is the flagship. The
            Labs Pass unlocks Pro versions of all 8 diagnostic tools. The
            build is public, the code is on screen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/labs/guestally" variant="primary" size="lg">
              Explore Guestally
            </Button>
            <Button href="/resources" variant="secondary" size="lg">
              Browse Free Diagnostics
            </Button>
          </div>
        </div>
      </section>

      <HeroImageBand
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85"
        alt="Builder workspace placeholder"
      />

      <SectionDivider fromColor={C.cream} toColor={C.primaryGreen} flip />

      <AnimatedSection
        theme="none"
        className="bg-primary-green text-white py-24 md:py-28 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-7">
              <AnimatedItem>
                <SectionLabel light>Flagship product</SectionLabel>
              </AnimatedItem>
              <AnimatedItem>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-[1.15] tracking-tight mt-4 mb-6">
                  Guestally.
                </h2>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-lg text-white/85 leading-relaxed mb-4">
                  The AI concierge platform for property operators. Automated
                  guest messaging, revenue-focused upsells, unified messaging
                  hub, and analytics that quantify the time your team is
                  getting back.
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <p className="font-sans text-base text-white/65 leading-relaxed mb-6">
                  Founded by Alex Henry as a separate company. Integrated with
                  the BNHG curriculum. 3 plans: Starter ($179/mo), Pro
                  ($299/mo), Operator ($349/mo).
                </p>
              </AnimatedItem>
              <AnimatedItem>
                <Link
                  href="/labs/guestally"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-warm-gold hover:text-gold-light transition-colors duration-200"
                >
                  See Guestally
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </AnimatedItem>
            </div>
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden border border-warm-gold/30">
                <Image
                  src="https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=85"
                  alt="Guestally interface placeholder"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-deep-teal/75 via-deep-teal/30 to-transparent"
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-2">
                    Product visual
                  </p>
                  <p className="font-display text-xl font-semibold text-cream">
                    Guestally interface
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.primaryGreen} toColor={C.cream} />

      <AnimatedSection theme="off-white" className="py-24 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedItem>
            <SectionLabel>The Labs Pass</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-6">
              $49 a month. All 8 tools, Pro versions.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal/85 leading-relaxed mb-8">
              The diagnostic tools are free at the basic tier. The Pro tier
              unlocks deeper analysis, monitoring across time, comparison
              views, and the things you&rsquo;d actually need to act on. One
              subscription, all the tools, cancel any time.
            </p>
          </AnimatedItem>
          <AnimatedItem>
            <Button href="/resources" variant="primary" size="lg">
              Browse the Free Tools First
            </Button>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.cream} toColor={C.white} flip />

      <AnimatedSection theme="light" className="py-24 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <AnimatedItem>
              <SectionLabel>The portfolio</SectionLabel>
            </AnimatedItem>
            <AnimatedItem>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mt-4 mb-4">
                Tools shipped, shipping, and on the bench.
              </h2>
            </AnimatedItem>
          </div>
          <AnimatedDiv
            stagger
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {TOOLS.map((t) => (
              <AnimatedItem key={t.name}>
                <Link
                  href={t.href}
                  className="block bg-white border border-light-gray rounded-lg p-7 h-full hover:border-deep-teal/40 transition-colors duration-200 group"
                >
                  <div className="flex items-baseline justify-between mb-3 gap-3">
                    <h3 className="font-display text-xl font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors">
                      {t.name}
                    </h3>
                    <span
                      className={[
                        "font-sans text-xs font-semibold uppercase tracking-[0.2em] px-2.5 py-1",
                        STATUS_STYLES[t.status],
                      ].join(" ")}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  <p className="font-sans text-base text-charcoal leading-relaxed">
                    {t.body}
                  </p>
                </Link>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      <SectionDivider fromColor={C.white} toColor={C.nearBlack} />

      <PageCTA />
    </>
  );
}
