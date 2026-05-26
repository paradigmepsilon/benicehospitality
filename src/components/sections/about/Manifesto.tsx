import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * The Manifesto. The "why this company exists" essay. Sits at /about#manifesto.
 *
 * Written as the short, shippable launch version. The full 1,500 to 2,500 word
 * piece is a content-team deliverable; this version covers the same ground
 * tightly so the URL is real from day one.
 */
export default function Manifesto() {
  return (
    <AnimatedSection id="manifesto" theme="light" className="py-20 md:py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <AnimatedItem>
            <SectionLabel>The Manifesto</SectionLabel>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-near-black mt-4 leading-tight">
              Use OTAs for discovery. Run the rest like a business.
            </h2>
          </AnimatedItem>
        </div>

        <div className="font-serif font-display text-lg text-charcoal/85 leading-[1.75] space-y-6">
          <AnimatedItem>
            <p>
              For the last decade, the people who actually run short-term rentals, long-term rentals, co-living buildings, experiential stays, and Turo fleets have been called &ldquo;hosts.&rdquo; That word is generous on a good day and condescending on a bad one. It implies that what these people do is hospitality at the scale of a dinner party. It is not.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              These people are operators. They run distributed operations across multiple properties or vehicles, often with revenue in the high 6 and low 7 figures. They make hiring decisions, vendor decisions, software decisions, and pricing decisions every single day. They lose more sleep over staffing and OTA dependency than most small business owners lose over anything. And yet the industry built around them has spent a decade pretending they are hobbyists.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              Be Nice Hospitality Group exists because that gap, between the work and the language, has finally become untenable. The math has changed. AirDNA called 2026 the best year to invest in short-term rentals since 2021, but only for operators who understand market selection, dynamic pricing, and operational efficiency. 84 percent of operators report using AI in their business. Most of them are using it badly: a chatbot here, a pricing tool there, more software, same chaos. 61 percent of independent bookings still flow through OTAs at 15 to 25 percent commission. 70 percent of operators have a direct booking site. Only 38 percent get meaningful direct bookings out of it.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              Almost everyone has the assets. Almost no one has the operating system underneath. That is the hole we exist to fill.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              The companies serving this audience today fall into 3 buckets. The first is the guru tier: people selling get-rich-on-Airbnb courses to first-time buyers at the top of the market. They are the loudest and the least useful. The second is the general business advisor tier: smart people who do not understand the specific math of the sharing economy and end up giving generic advice that does not survive contact with a 2 a.m. guest text. The third is the enterprise consulting tier: large firms built for hotel chains and large fleets, completely uninterested in the operator running 5 units or 8 vehicles.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              We sit in the gap between those 3. Not loud. Not generic. Not enterprise. Built for the operator with 5 to 50 units who has outgrown the YouTube tutorials and is not yet ready for a full COO hire. Built around a method we run ourselves before we teach it to anyone else.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              Our position is simple, and it sits at the top of every page on this site: <em>use OTAs for discovery, run the rest like a business.</em> We are not anti-Airbnb. The platforms are extraordinary discovery engines. The mistake is renting your customer relationship from them in perpetuity. The fix is to take everything that happens after the discovery moment, the booking, the messaging, the on-property experience, the upsells, the second stay, the referral, and treat it like the actual business it is.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              That is what the Foundation and Flagship courses teach. That is what the Operator&apos;s Boardroom helps you implement at scale. That is what Signal sells productized to boutique luxury hotels. That is what BNHG Labs ships in software, starting with Guestally. And that is what the Nice Host Network reinforces every Tuesday and Thursday with people who are doing the same work in different rooms.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              We do not believe in the side-hustle framing. We do not believe in the &ldquo;passive income&rdquo; framing. We do not think anyone should run a multi-unit operation on vibes. We believe operators deserve the same rigor that anyone running a real business gets. The systems, the team, the technology, the strategic seat at the table.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p>
              That is the company. That is the work. We are glad you are here.
            </p>
          </AnimatedItem>

          <AnimatedItem>
            <p className="font-sans text-sm text-charcoal/60 mt-12 pt-6 border-t border-light-gray">
              <span className="font-display italic text-charcoal text-base">Della &amp; Alex Henry</span>
              <br />
              <span>Co-founders, Be Nice Hospitality Group</span>
            </p>
          </AnimatedItem>
        </div>
      </div>
    </AnimatedSection>
  );
}
