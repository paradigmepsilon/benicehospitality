import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Surface {
  number: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}

const SURFACES: Surface[] = [
  {
    number: "01",
    title: "Community",
    body: "The Nice Host Network. 2 live, founder-led sessions every week, 47 weeks a year.",
    cta: "Join the Network",
    href: "/community",
  },
  {
    number: "02",
    title: "Courses",
    body: "Foundation and Flagship in Co-living and Auto editions. From the $97 Direct Booking Playbook up to the $799 flagship.",
    cta: "See the Catalog",
    href: "/education",
  },
  {
    number: "03",
    title: "Signal",
    body: "AI services for boutique stays: independent hotels, inns, and design-forward short-term and vacation rentals. Productized engagements with outcome guarantees.",
    cta: "Explore Signal",
    href: "/signal",
  },
  {
    number: "04",
    title: "Labs",
    body: "Where Alex builds the next generation of operator tech. Home of Guestally and the rest of the Labs portfolio.",
    cta: "Visit Labs",
    href: "/labs",
  },
];

export default function FiveSurfaces() {
  return (
    <AnimatedSection id="ecosystem" theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>The Ecosystem</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              4 surfaces. 1 operating system.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mt-4 leading-relaxed">
              Education and community feed Signal. Labs ships software all of it sells against. Pick the entry that maps to where you are.
            </p>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SURFACES.map((s) => (
            <AnimatedItem key={s.title}>
              <Link
                href={s.href}
                className="group block bg-white border border-light-gray rounded-md p-6 h-full hover:border-primary-green hover:shadow-md transition-all duration-200"
              >
                <p className="font-display text-warm-gold text-sm font-semibold mb-3">{s.number}</p>
                <h3 className="font-display text-xl font-semibold text-near-black mb-3 group-hover:text-primary-green transition-colors leading-tight">
                  {s.title}
                </h3>
                <p className="font-sans text-sm text-charcoal/70 mb-5 leading-relaxed">
                  {s.body}
                </p>
                <p className="font-sans text-xs font-semibold text-primary-green uppercase tracking-[0.15em]">
                  {s.cta} →
                </p>
              </Link>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
