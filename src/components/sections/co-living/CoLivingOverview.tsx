import Image from "next/image";
import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

// Two blocks in one component. The terminology block has to come first: the
// site uses "co-living" and "room rentals" interchangeably, and a visitor who
// arrived on one term needs to know the other means the same thing before any
// of the copy below makes sense. The mechanics grid then answers "why does
// this model work" without asking for anything.
//
// Kept as one component rather than two sections because both blocks sit on
// the same white background — splitting them would mean a SectionDivider with
// identical from/to colors, which renders nothing.

const MECHANICS = [
  {
    numeral: "i",
    heading: "Rent by the Room",
    body: "Increase a property's income potential by renting individual furnished bedrooms rather than leasing the home as a single unit.",
  },
  {
    numeral: "ii",
    heading: "Longer Resident Stays",
    body: "Longer stays reduce turnover, create more predictable income, and allow you to focus on improving operations instead of constantly replacing residents.",
  },
  {
    numeral: "iii",
    heading: "Systems Create Flexibility",
    body: "Clear processes, documented standards, and operational systems make it easier to manage your properties consistently as your portfolio grows.",
  },
];

export default function CoLivingOverview() {
  return (
    <AnimatedSection theme="light" className="py-12 md:py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16 md:mb-20">
          <AnimatedItem>
            <SectionLabel>The language</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              Co-Living and Room Rentals
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-lg text-charcoal leading-snug space-y-5">
              <p>You may hear us use both terms throughout this website.</p>
              <p>
                Co-living is the more formal industry term for renting
                individual bedrooms within a shared home.
              </p>
              <p>
                Room rentals is the language many operators use because it is
                simpler, more recognizable, and better reflects how we run the
                business day to day.
              </p>
              <p className="font-display italic text-xl md:text-2xl text-deep-teal">
                They are the same business model.
              </p>
              <p>
                Throughout the rest of this website, we will primarily use room
                rentals for simplicity, but both terms refer to the same
                operating model.
              </p>
            </div>
          </AnimatedItem>
        </div>

        {/* Second block: why the model works. Shares this section's white
            background, so it opens with its own heading instead of a divider. */}
        <div className="max-w-3xl mb-14 md:mb-16">
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mb-6">
              Why Room Rentals Work
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="font-sans text-lg text-charcoal leading-snug space-y-4">
              <p>
                A successful room rental business is not built by simply renting
                bedrooms.
              </p>
              <p>
                It is built by creating a repeatable operating system that
                delivers a consistent resident experience while making the
                business easier to manage.
              </p>
            </div>
          </AnimatedItem>
        </div>

        <AnimatedDiv
          stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12"
        >
          {MECHANICS.map((m) => (
            <AnimatedItem key={m.heading}>
              <article className="border-l-2 border-warm-gold pl-6 md:pl-7 h-full">
                <p
                  aria-hidden="true"
                  className="font-display italic text-3xl text-warm-gold leading-none mb-4"
                >
                  {m.numeral}
                </p>
                <h3 className="font-display text-2xl font-semibold text-deep-teal leading-tight mb-4">
                  {m.heading}
                </h3>
                <p className="font-sans text-base text-charcoal/85 leading-snug">
                  {m.body}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedDiv>

        {/* Closes the section on the payoff: a real shared living area, the
            kind of common space the three mechanics above are describing. */}
        <AnimatedItem>
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-sm mt-14 md:mt-16">
            <Image
              src="/images/thehostsedge/hero-livingroom.png"
              alt="The shared living area of a well-designed co-living property, styled for a mid-term stay"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.05)" }}
            />
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
