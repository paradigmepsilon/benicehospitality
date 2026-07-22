import AnimatedSection, {
  AnimatedDiv,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

// Sits directly beneath the hero on purpose. On social Della gives the five
// W's and never the how — every live ends by sending people here. This is the
// payoff for that promise, so it has to answer "what IS this" in about sixty
// seconds before asking anyone for anything.

const MECHANICS = [
  {
    numeral: "i",
    heading: "You rent the room, not the house",
    body: "One property, four to six private rooms, shared kitchen and living space. Each room is its own lease at its own rent. A house that fetches sixteen hundred a month whole can clear well past that by the door, because you are selling a room to somebody who needs one, not a whole house to somebody who does not.",
  },
  {
    numeral: "ii",
    heading: "The stay is measured in months, not nights",
    body: "Thirty days and up. Travel nurses on thirteen-week contracts. Corporate relocations. Insurance displacement placements after a house fire or a flood. These people need somewhere real to live for a season, and they are not price-shopping a hot tub on a Saturday.",
  },
  {
    numeral: "iii",
    heading: "The operations are boring, and that is the point",
    body: "A weekend rental turns fifty-two times a year. A co-living room turns three or four. Fewer turns means fewer cleans, fewer messages, fewer emergencies at eleven at night. That is the whole reason I moved my portfolio here. My weekends came back.",
  },
];

export default function CoLivingOverview() {
  return (
    <AnimatedSection theme="light" className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14 md:mb-16">
          <AnimatedItem>
            <SectionLabel>Start here</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-deep-teal leading-[1.1] tracking-tight mt-4 mb-6">
              What co-living actually is.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="font-sans text-lg text-charcoal leading-snug">
              If you came here from one of my lives, this is the part I never
              explain on camera. Co-living is not a hack and it is not a new
              idea. It is a rooming house with better systems and a better
              class of tenant. Three things make it work.
            </p>
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

        <AnimatedItem>
          <div className="mt-14 md:mt-16 max-w-3xl bg-off-white border-t-2 border-warm-gold p-8 md:p-10">
            <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-warm-gold mb-4">
              Della&rsquo;s take
            </p>
            <p className="font-display italic text-xl md:text-2xl text-deep-teal leading-snug">
              Co-living is not for everybody, and I would rather tell you that
              here than take your money and let you find out. If your property
              is in a market with no hospital, no university, and no corporate
              corridor, the demand is not there. Run the free score below. It
              will tell you straight.
            </p>
          </div>
        </AnimatedItem>
      </div>
    </AnimatedSection>
  );
}
