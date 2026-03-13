import Image from "next/image";
import AnimatedSection, {
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { TEAM } from "@/lib/constants";

export default function FoundingStory() {
  return (
    <AnimatedSection theme="off-white" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel>The Founding Story</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black leading-tight">
              Two Disciplines. One Purpose.
            </h2>
          </AnimatedItem>
        </div>

        <div className="space-y-12 mb-20">
          {TEAM.map((member, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <AnimatedItem key={i}>
                <div
                  className={[
                    "flex flex-col gap-8 items-center rounded-lg overflow-hidden",
                    isReversed ? "md:flex-row-reverse bg-near-black/3" : "md:flex-row bg-white",
                  ].join(" ")}
                >
                  <div className="relative w-full md:w-72 lg:w-80 h-80 md:h-96 shrink-0">
                    <Image
                      src={member.image || ""}
                      alt={member.name}
                      fill
                      className={`object-cover object-top${i === 0 ? " -scale-x-100" : ""}`}
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  <div className="flex-1 p-8 md:p-10">
                    <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-green mb-3">
                      {member.title}
                    </p>
                    <h3 className="font-display text-3xl font-semibold text-near-black mb-4">
                      {member.name}
                    </h3>
                    <p className="font-sans text-charcoal/80 leading-relaxed text-base">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </div>

        <AnimatedItem>
          <div className="bg-near-black text-white p-10 md:p-14 max-w-4xl mx-auto">
            <p className="font-display text-2xl md:text-3xl font-normal italic leading-relaxed text-center">
              &ldquo;We pair systems thinking with people thinking. That&apos;s
              what makes BNHG different. It&apos;s what makes our results
              stick.&rdquo;
            </p>
            <p className="font-sans text-center text-white/50 text-sm mt-6">
              Alex &amp; Della Henry, Founders
            </p>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
