import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";

interface Mention {
  name: string;
  context: string;
}

const MENTIONS: Mention[] = [
  { name: "Get Paid for Your Pad", context: "Podcast guest" },
  { name: "STR Unfiltered", context: "Podcast guest" },
  { name: "BiggerPockets STR", context: "Podcast guest" },
  { name: "Hospitable.com", context: "Featured operator" },
  { name: "Carsharing Connection", context: "Auto-operator panel" },
  { name: "AirDNA", context: "Source for 2026 operator data" },
];

/**
 * Press / featured-in strip. Logos are a content-team deliverable; until they
 * land we render a clean text strip. Keeps the credibility signal up without
 * shipping placeholder gray boxes.
 */
export default function PressBar() {
  return (
    <AnimatedSection theme="light" className="py-14 md:py-20 px-6 border-y border-light-gray">
      <div className="max-w-6xl mx-auto text-center">
        <AnimatedItem>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-charcoal/55 font-semibold mb-8">
            As featured in &amp; on
          </p>
        </AnimatedItem>

        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5">
          {MENTIONS.map((m) => (
            <AnimatedItem key={m.name}>
              <div className="text-center">
                <p className="font-display text-base md:text-lg font-semibold text-charcoal">
                  {m.name}
                </p>
                <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-charcoal/45 mt-1">
                  {m.context}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
