import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Door {
  label: string;
  promise: string;
  ctaLabel: string;
  href: string;
}

// The three-bin ladder: Resources (free) -> Training (paid courses) ->
// Management (done-for-you). Same order as NAV_LEFT in src/lib/nav.ts, so
// the homepage teaches the same structure the header already shows.
const DOORS: Door[] = [
  {
    label: "Resources",
    promise:
      "Free calculators, checklists, and guides for co-living and rental fleet operators.",
    ctaLabel: "Browse the tools",
    href: "/resources",
  },
  {
    label: "Training",
    promise:
      "Room Rental Riches and Car Rental Riches, taught by the operators who run both.",
    ctaLabel: "See the courses",
    href: "/training",
  },
  {
    label: "Management",
    promise:
      "Hand the day-to-day to BNHG and keep ownership of the car or the property.",
    ctaLabel: "Check your fit",
    href: "/management",
  },
];

export default function ThreeDoors() {
  return (
    <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 md:mb-14">
          <AnimatedItem>
            <SectionLabel>Three ways in</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4">
              Learn it, train for it, or hand it off.
            </h2>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {DOORS.map((door) => (
            <AnimatedItem key={door.label}>
              <article className="h-full bg-cream border-t-2 border-warm-gold rounded-sm p-8 md:p-10 flex flex-col">
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight mb-4">
                  {door.label}
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug mb-8 flex-1">
                  {door.promise}
                </p>
                <Link
                  href={door.href}
                  className="group mt-auto inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-deep-teal hover:text-warm-gold-dark transition-colors duration-200"
                >
                  {door.ctaLabel}
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
