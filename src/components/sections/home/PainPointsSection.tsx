import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { PAIN_POINTS } from "@/lib/constants";

const STAT_SPLITS = [
  { highlight: "61%", context: "of independent hotel bookings go through OTAs" },
  { highlight: "65%", context: "of hotels reported staffing shortages in early 2025" },
  { highlight: "36%", context: "of owners say tech setup was the hardest part of opening" },
  { highlight: null, context: null },
];

export default function PainPointsSection() {
  return (
    <>
    <AnimatedSection theme="dark" className="py-24 px-0 overflow-hidden">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <AnimatedItem>
          <SectionLabel light>The Problem</SectionLabel>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
            Running a Boutique Hotel<br className="hidden md:block" />{" "}
            Shouldn&apos;t Feel This Hard
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <div className="w-16 h-px bg-warm-gold mt-6 mx-auto" />
        </AnimatedItem>
      </div>

      {/* Pain point cards */}
      <AnimatedDiv stagger className="space-y-px">
        {PAIN_POINTS.map((point, i) => {
          const split = STAT_SPLITS[i];
          const imageLeft = i % 2 === 0;
          const isLastCard = i === 3;

          return (
            <AnimatedItem key={i}>
              <div
                className={`
                  group relative flex flex-col ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"}
                  min-h-105 md:min-h-120
                  border-t border-white/5
                `}
              >
                {/* Image half */}
                <div className="relative w-full md:w-1/2 h-64 md:min-h-120 shrink-0 overflow-hidden">
                  {point.image && (
                    <Image
                      src={point.image}
                      alt={point.stat}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  {/* Gradient overlay toward text side */}
                  <div
                    className={`
                      absolute inset-0
                      ${imageLeft
                        ? "bg-linear-to-r from-transparent via-transparent to-near-black"
                        : "bg-linear-to-l from-transparent via-transparent to-near-black"
                      }
                    `}
                  />
                  {/* Mobile bottom gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-near-black via-transparent to-transparent md:hidden" />
                </div>

                {/* Content half */}
                <div className="relative w-full md:w-1/2 flex items-center">
                  <div className={`px-8 md:px-16 lg:px-20 py-12 md:py-16 max-w-xl ${imageLeft ? "" : "md:ml-auto"}`}>
                    <span className="font-sans text-xs tracking-[0.25em] uppercase text-warm-gold/60 mb-6 block">
                      0{i + 1}
                    </span>

                    {isLastCard ? (
                      <>
                        <p className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-white leading-tight mb-6">
                          You&apos;re the owner, GM, revenue manager,{" "}
                          <span className="text-warm-gold italic">
                            and maintenance supervisor.
                          </span>
                        </p>
                        <p className="font-sans text-base md:text-lg text-white/60 leading-relaxed">
                          {point.description}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-warm-gold leading-none mb-4 tracking-tight transition-colors duration-500 group-hover:text-white">
                          {split!.highlight}
                        </p>
                        <p className="font-display text-xl md:text-2xl font-semibold text-white leading-snug mb-6">
                          {split!.context}
                        </p>
                        <p className="font-sans text-base md:text-lg text-white/60 leading-relaxed">
                          {point.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedItem>
          );
        })}
      </AnimatedDiv>

    </AnimatedSection>

    {/* Divider statement */}
    <AnimatedSection theme="light" className="py-20 px-6">
      <AnimatedItem>
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-near-black leading-tight">
            We built BNHG to solve exactly these problems.
          </p>
        </div>
      </AnimatedItem>
    </AnimatedSection>
    </>
  );
}
