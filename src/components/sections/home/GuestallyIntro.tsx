import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { GUESTALLY_FEATURES } from "@/lib/constants";

export default function GuestallyIntro() {
  return (
    <AnimatedSection
      theme="none"
      className="bg-near-black py-24 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <AnimatedItem>
              <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-terracotta mb-4">
                Proprietary Software
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <div className="mb-6">
                <Image
                  src="/images/Guestally.png"
                  alt="Guestally"
                  width={600}
                  height={160}
                  className="h-28 md:h-36 w-auto brightness-0 invert"
                />
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-xl text-white/80 mb-6 leading-relaxed">
                SMS-first guest engagement and upsell automation, built
                exclusively for boutique hotels.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="font-sans text-base text-white/60 mb-10 leading-relaxed">
                Most guest messaging platforms were built for large hotels with
                dedicated tech teams. Guestally was built for operators like
                you. Properties where every hour matters and every dollar of
                incremental revenue counts.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <Button
                href="https://guestally.ai"
                external
                variant="terracotta"
                size="lg"
              >
                Learn More About Guestally →
              </Button>
            </AnimatedItem>
          </div>

          {/* Right: Features */}
          <AnimatedDiv stagger className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {GUESTALLY_FEATURES.map((feature, i) => (
              <AnimatedItem key={i}>
                <div className="bg-white/5 border border-white/10 p-6 hover:bg-white/10 hover:border-terracotta/40 transition-all duration-300">
                  <p className="font-sans text-xs font-semibold tracking-widest text-terracotta/60 uppercase mb-3">0{i + 1}</p>
                  <h3 className="font-sans font-semibold text-white mb-2 text-base">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedDiv>
        </div>
      </div>
    </AnimatedSection>
  );
}
