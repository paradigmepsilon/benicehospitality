import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import { bookingUrl, BOOKING_SOURCES } from "@/lib/booking-url";

export type PageCTAAudience = "default" | "operator" | "owner";

interface PresetCTA {
  href: string;
  label: string;
}

interface AudiencePreset {
  sectionLabel: string;
  headline: string;
  subtext: string;
  primary: PresetCTA;
  secondary: PresetCTA;
}

const AUDIENCE_PRESETS: Record<PageCTAAudience, AudiencePreset> = {
  default: {
    sectionLabel: "For members",
    headline: "Already in? Sign in.",
    subtext:
      "Members log in here for course access, the Nice Host Network, and the resources you've enrolled in. New here? Book a discovery call and we'll figure out the right way in.",
    primary: { href: "/login", label: "Login" },
    secondary: {
      href: bookingUrl({ source: BOOKING_SOURCES.PAGECTA_DEFAULT }),
      label: "Book a Discovery Call",
    },
  },
  operator: {
    sectionLabel: "Built for operators",
    headline: "Run your operation like a real business.",
    subtext:
      "Pick a course or join the Nice Host Network. You'll be in a room with operators doing the same work.",
    primary: { href: "/education", label: "See the Courses" },
    secondary: { href: "/community", label: "Join the Network" },
  },
  owner: {
    sectionLabel: "For boutique luxury hotels",
    headline: "Be the hotel AI recommends.",
    subtext:
      "AI services with outcome guarantees, built for 10 to 50 room independent properties.",
    primary: { href: "/signal", label: "Explore Signal" },
    secondary: {
      href: bookingUrl({
        callType: "discovery_call_45",
        source: BOOKING_SOURCES.PAGECTA_OWNER,
      }),
      label: "Book a Discovery Call",
    },
  },
};

interface PageCTAProps {
  headline?: string;
  subtext?: string;
  audience?: PageCTAAudience;
}

export default function PageCTA({
  headline,
  subtext,
  audience = "default",
}: PageCTAProps) {
  const preset = AUDIENCE_PRESETS[audience];
  const resolvedHeadline = headline ?? preset.headline;
  const resolvedSubtext = subtext ?? preset.subtext;

  return (
    <AnimatedSection theme="dark" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedItem>
          <SectionLabel light>{preset.sectionLabel}</SectionLabel>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
            {resolvedHeadline}
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="font-sans text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            {resolvedSubtext}
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {audience === "owner" ? (
              <>
                <Button
                  href={preset.secondary.href}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {preset.secondary.label}
                </Button>
                <Button
                  href={preset.primary.href}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {preset.primary.label}
                </Button>
              </>
            ) : (
              <>
                <Button
                  href={preset.primary.href}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {preset.primary.label}
                </Button>
                <Button
                  href={preset.secondary.href}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {preset.secondary.label}
                </Button>
              </>
            )}
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
