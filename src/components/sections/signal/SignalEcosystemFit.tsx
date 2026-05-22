import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Surface {
  name: string;
  audience: string;
  body: string;
  href: string;
}

const SURFACES: Surface[] = [
  {
    name: "Education & Community",
    audience: "Sharing-economy operators",
    body: "Foundation and Flagship courses, plus the Nice Host Network. For property and auto operators running their own books.",
    href: "/education",
  },
  {
    name: "Advisory",
    audience: "Multi-asset operators",
    body: "The Operator's Boardroom. Fractional COO partnership for operators with 5 to 25 units across asset classes.",
    href: "/advisory",
  },
  {
    name: "Signal",
    audience: "Boutique luxury hotels",
    body: "Productized AI services for 10 to 50 room independent properties. Quick Wins, Sprints, Retainers, Custom Builds.",
    href: "/signal",
  },
  {
    name: "BNHG Labs",
    audience: "Everyone, software-first",
    body: "The product engine. Guestally and the rest of the AI tooling that members and clients get first.",
    href: "/labs",
  },
];

/**
 * Where Signal sits inside Be Nice Hospitality Group. Helps boutique hotel
 * buyers understand the parent company without burying the Signal brand.
 */
export default function SignalEcosystemFit() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>Where Signal Fits</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 leading-tight">
              Signal is one of four surfaces inside Be Nice Hospitality Group.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-base text-charcoal/70 mt-4 leading-relaxed">
              The other three serve different audiences. We surface the structure on purpose so you can see who you are buying from and what else is available if Signal is not quite the fit.
            </p>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SURFACES.map((s) => {
            const isSignal = s.name === "Signal";
            return (
              <AnimatedItem key={s.name}>
                <Link
                  href={s.href}
                  className={[
                    "group block rounded-md p-7 h-full transition-colors duration-200",
                    isSignal
                      ? "bg-near-black text-white"
                      : "bg-white border border-light-gray hover:border-primary-green",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "font-sans text-xs uppercase tracking-[0.2em] font-semibold mb-2",
                      isSignal ? "text-warm-gold" : "text-warm-gold",
                    ].join(" ")}
                  >
                    {s.audience}
                  </p>
                  <h3
                    className={[
                      "font-display text-2xl font-semibold mb-3 leading-tight transition-colors",
                      isSignal
                        ? "text-white"
                        : "text-near-black group-hover:text-primary-green",
                    ].join(" ")}
                  >
                    {s.name}
                  </h3>
                  <p
                    className={[
                      "font-sans text-sm leading-relaxed",
                      isSignal ? "text-white/75" : "text-charcoal/75",
                    ].join(" ")}
                  >
                    {s.body}
                  </p>
                  {isSignal && (
                    <p className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-warm-gold font-semibold">
                      You are here
                    </p>
                  )}
                </Link>
              </AnimatedItem>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
