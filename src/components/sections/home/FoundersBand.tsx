import Image from "next/image";
import Link from "next/link";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

interface Founder {
  name: string;
  role: string;
  image: string;
  href: string;
}

const FOUNDERS: Founder[] = [
  {
    name: "Alex Henry",
    role: "Technology and services",
    image: "/images/Website Images/Lex.png",
    href: "/alex",
  },
  {
    name: "Della Henry",
    role: "Operator-led education",
    image: "/images/Website Images/Dee.png",
    href: "/della",
  },
];

export default function FoundersBand() {
  return (
    <AnimatedSection
      theme="light"
      className="pt-12 md:pt-14 pb-24 md:pb-28 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
          <AnimatedItem>
            <SectionLabel>Who built this</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.15] tracking-tight mb-6">
              Built and run by operators.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal/85 leading-relaxed">
              Atlanta-headquartered. Veteran-founded. 2 operators who built
              the company they wished existed when they were running their own
              portfolios.
            </p>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16"
        >
          {FOUNDERS.map((f) => (
            <AnimatedItem key={f.name}>
              <Link
                href={f.href}
                className="group flex flex-col"
                aria-label={`${f.name}, visit personal page`}
              >
                <div className="aspect-square overflow-hidden mb-6 bg-light-gray">
                  <Image
                    src={f.image}
                    alt={f.name}
                    width={800}
                    height={800}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-deep-teal leading-tight group-hover:text-warm-gold transition-colors duration-200">
                  {f.name}
                </h3>
                <p className="mt-3 font-sans text-sm font-semibold tracking-wide text-warm-gold-dark inline-flex items-center gap-1.5">
                  Learn more about {f.name.split(" ")[0]}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </Link>
            </AnimatedItem>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  );
}
