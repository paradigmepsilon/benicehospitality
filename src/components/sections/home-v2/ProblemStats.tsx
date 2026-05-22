import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Stat {
  number: string;
  label: string;
  body: string;
}

const STATS: Stat[] = [
  {
    number: "61%",
    label: "Bookings still go through OTAs",
    body: "At 15 to 25 percent commission per booking, that is the single largest line item leaving your business every month.",
  },
  {
    number: "84%",
    label: "Of operators use AI in 2026",
    body: "Most use it badly. A chatbot here, a pricing tool there. Tools without an operating system underneath.",
  },
  {
    number: "70 / 38",
    label: "Have a direct booking site. Get meaningful direct bookings.",
    body: "Almost everyone has the asset. Almost no one runs the system that turns it into revenue.",
  },
  {
    number: "#1",
    label: "Word in a 1,400-host survey: cleaner",
    body: "Staffing is the silent crisis. Without an operations layer, every absence becomes tomorrow's review.",
  },
];

export default function ProblemStats() {
  return (
    <AnimatedSection theme="off-white" className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <AnimatedItem>
            <SectionLabel>The State of Operating in 2026</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              Running a real operation shouldn&apos;t feel this hard.
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <AnimatedItem key={s.label}>
              <div className="bg-white border border-light-gray rounded-md p-6 h-full">
                <p className="font-display text-4xl md:text-5xl font-semibold text-primary-green mb-2 leading-none">
                  {s.number}
                </p>
                <p className="font-sans text-sm font-semibold text-near-black mb-3 leading-tight">
                  {s.label}
                </p>
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed">{s.body}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
