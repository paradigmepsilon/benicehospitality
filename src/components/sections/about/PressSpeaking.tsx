import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Appearance {
  outlet: string;
  context: string;
  date: string;
}

const APPEARANCES: Appearance[] = [
  {
    outlet: "Get Paid for Your Pad",
    context: "Operator-class positioning and the OTA-to-direct shift",
    date: "Spring 2026",
  },
  {
    outlet: "STR Unfiltered",
    context: "Why the host era is over and the operator era is here",
    date: "Spring 2026",
  },
  {
    outlet: "BiggerPockets STR",
    context: "Building an ops layer that survives a partial team",
    date: "Spring 2026",
  },
  {
    outlet: "Truth Be Told",
    context: "Della and Alex's own weekly podcast",
    date: "Ongoing",
  },
];

/**
 * Press & speaking. Anchor target for /about#press. Ships as a tight list now;
 * fills out as the podcast circuit completes. Includes a one-liner so anyone
 * landing here knows how to book Della and Alex.
 */
export default function PressSpeaking() {
  return (
    <AnimatedSection id="press" theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel>Press &amp; Speaking</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mt-4 leading-tight">
              Where we&apos;ve shown up.
            </h2>
          </AnimatedItem>
        </div>

        <div className="bg-white border border-light-gray rounded-md divide-y divide-light-gray">
          {APPEARANCES.map((a) => (
            <AnimatedItem key={a.outlet}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-5 sm:p-6">
                <div>
                  <p className="font-display text-lg font-semibold text-near-black">{a.outlet}</p>
                  <p className="font-sans text-sm text-charcoal/65 mt-1">{a.context}</p>
                </div>
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-warm-gold font-semibold whitespace-nowrap">
                  {a.date}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <AnimatedItem>
          <p className="mt-10 font-sans text-sm text-charcoal/65 text-center max-w-xl mx-auto leading-relaxed">
            Booking Della or Alex for a podcast, panel, or keynote? Email{" "}
            <a
              href="mailto:admin@benicehospitality.com"
              className="text-primary-green hover:text-primary-green-dark underline underline-offset-2 font-medium"
            >
              admin@benicehospitality.com
            </a>{" "}
            with the audience and the format. We answer within 1 business day.
          </p>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
