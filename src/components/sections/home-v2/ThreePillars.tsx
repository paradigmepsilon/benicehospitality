import Image from "next/image";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { STOCK_URBAN } from "@/lib/stock-images";

interface Pillar {
  number: string;
  title: string;
  body: string;
  details: string[];
}

const PILLARS: Pillar[] = [
  {
    number: "01",
    title: "Operate Like a Business",
    body: "Systems, SOPs, and workflows that survive any tool change.",
    details: [
      "Documented operating system",
      "Roles, hiring, and accountability",
      "Reporting cadences you actually trust",
    ],
  },
  {
    number: "02",
    title: "Automate With Intelligence",
    body: "AI integration that does not gut the guest experience.",
    details: [
      "Messaging that sounds like you",
      "Pricing logic that respects your margin",
      "Operations automation tied to real outcomes",
    ],
  },
  {
    number: "03",
    title: "Own Your Guests",
    body: "The Return Guest Framework and the direct booking conversion engine.",
    details: [
      "Direct booking site that converts on the basics",
      "Email capture and follow-up sequence",
      "Repeat-guest framework that earns the second stay",
    ],
  },
];

export default function ThreePillars() {
  return (
    <AnimatedSection theme="dark" className="relative py-20 md:py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={STOCK_URBAN.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/70 via-near-black/85 to-near-black" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <AnimatedItem>
            <SectionLabel light>The Method</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4 leading-tight">
              Host to Operator, in three pillars.
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((p) => (
            <AnimatedItem key={p.title}>
              <div className="border-t-2 border-warm-gold pt-5">
                <p className="font-display text-warm-gold text-sm font-semibold mb-2">{p.number}</p>
                <h3 className="font-display text-2xl font-semibold text-white mb-3 leading-tight">
                  {p.title}
                </h3>
                <p className="font-sans text-base text-white/75 mb-5 leading-relaxed">{p.body}</p>
                <ul className="space-y-2">
                  {p.details.map((d) => (
                    <li
                      key={d}
                      className="font-sans text-sm text-white/60 flex gap-2 leading-relaxed"
                    >
                      <span className="text-warm-gold mt-0.5">›</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
