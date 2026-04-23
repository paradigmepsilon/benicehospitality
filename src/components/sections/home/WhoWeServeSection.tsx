import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { PROPERTY_TYPES } from "@/lib/constants";

export default function WhoWeServeSection() {
  return (
    <AnimatedSection theme="light" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedItem>
            <SectionLabel>Who We Serve</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-4 leading-tight">
              Built for Independent{" "}
              <span className="text-primary-green italic">
                Luxury Boutique Properties
              </span>
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal/70 max-w-2xl mx-auto">
              10 to 50 rooms. U.S. market. No brand affiliations required.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {PROPERTY_TYPES.map((type, i) => (
            <AnimatedItem key={i}>
              <div className="group overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-near-black/80 via-near-black/20 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 right-4 font-display text-lg font-semibold text-white leading-snug">
                    {type.name}
                  </h3>
                </div>
                <div className="bg-off-white p-4">
                  <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        <AnimatedItem>
          <div className="bg-off-white border-l-4 border-primary-green p-8 max-w-3xl mx-auto">
            <p className="font-sans text-base text-charcoal leading-relaxed">
              Whether you&apos;re an owner-operator wearing every hat, a
              first-time developer learning on the fly, or a small portfolio
              owner who can&apos;t yet justify a full commercial team,{" "}
              <strong className="font-semibold text-near-black">
                we built this for you.
              </strong>
            </p>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
