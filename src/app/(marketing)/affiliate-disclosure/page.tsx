import type { Metadata } from "next";
import Link from "next/link";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

// Site-wide affiliate disclosure. Linked from /marketplace and from the
// Co-Living Property Profitability Analysis Worksheet's cost sections, which
// are the two places affiliate links actually appear today.
//
// FTC guidance is that a material connection has to be disclosed clearly and
// near the link. The inline note next to each set of links does that job; this
// page is the fuller explanation both of them point at.

export const metadata: Metadata = {
  title: {
    absolute: "Affiliate Disclosure | Be Nice Hospitality Group",
  },
  description:
    "Some links on this site earn us a commission. What that means, which links they are, and how it affects what we recommend. Short answer: it does not.",
  alternates: {
    canonical: "https://benicehospitality.com/affiliate-disclosure",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Affiliate Disclosure | Be Nice Hospitality Group",
    description:
      "Some links on this site earn us a commission. What that means and how it affects what we recommend.",
    url: "https://benicehospitality.com/affiliate-disclosure",
    type: "website",
  },
};

const EFFECTIVE_DATE = "August 10, 2026";

export default function AffiliateDisclosurePage() {
  return (
    <>
      <section className="bg-near-black pt-48 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <p className="font-sans text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-warm-gold mb-6">
            Legal
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Affiliate Disclosure
          </h1>
          <p className="font-sans text-sm text-white/55 uppercase tracking-[0.2em] mb-8">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="font-sans text-lg md:text-xl text-white/80 leading-snug">
            Some of the product links on this site earn us a commission. It
            costs you nothing extra, and it does not change what we recommend.
            Here is exactly how it works.
          </p>
        </div>
      </section>

      <SectionDivider fromColor={C.nearBlack} toColor={C.offWhite} />

      <section className="bg-off-white py-20 md:py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <LegalSection title="1. The short version">
            <p>
              When you click certain product links on this site and buy
              something, the retailer pays us a small commission. You pay the
              same price you would have paid going there directly. That is the
              whole arrangement.
            </p>
          </LegalSection>

          <LegalSection title="2. Where these links appear">
            <ul>
              <li>
                <strong>The Marketplace.</strong> Every product on{" "}
                <Link
                  href="/marketplace"
                  className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
                >
                  /marketplace
                </Link>{" "}
                is there because we think it is worth using. Most carry
                affiliate links.
              </li>
              <li>
                <strong>
                  The Co-Living Property Profitability Analysis Worksheet.
                </strong>{" "}
                Some line items in the launch-cost section link to a specific
                product so you can see what the estimate is based on and buy it
                if you want to. Lines for services — an LLC filing, an insurance
                premium, a permit — have no product to link to and carry a note
                about where the number came from instead.
              </li>
            </ul>
            <p>
              Affiliate links are marked at the point of use. We do not hide
              them inside ordinary text links.
            </p>
          </LegalSection>

          <LegalSection title="3. How it affects what we recommend">
            <p>
              It does not. We recommend the thing we would tell a friend to buy.
              Della furnishes real co-living properties and we run real rentals,
              so most of what appears here is something we have actually bought,
              used, and replaced when it failed.
            </p>
            <p>
              Plenty of what we recommend earns us nothing at all. If the best
              answer to a question is a local contractor, a government filing,
              or simply not buying anything, that is what the tool says.
            </p>
          </LegalSection>

          <LegalSection title="4. About the prices you see">
            <p>
              Prices shown next to a product are what we last saw, not a live
              quote. Retail prices move, and the figure in a calculator is there
              to give you a realistic starting estimate, not a guarantee.{" "}
              <strong>Check the current price before you buy.</strong>
            </p>
            <p>
              Where a price is more than six months old, the tool flags it as
              possibly out of date rather than quietly presenting it as current.
            </p>
          </LegalSection>

          <LegalSection title="5. What the calculators are and are not">
            <p>
              The estimates in our free tools are planning figures based on
              Southeast market norms and our own operating costs. They are not
              financial, tax, legal, or investment advice, and they are not a
              promise of what your property will earn or cost. Replace our
              numbers with your own quotes before you commit capital.
            </p>
          </LegalSection>

          <LegalSection title="6. Programs we participate in">
            <p>
              We participate in affiliate programs run by Amazon, Lowe&apos;s,
              Wayfair, and various software and service providers. As an Amazon
              Associate we earn from qualifying purchases.
            </p>
          </LegalSection>

          <LegalSection title="7. Questions">
            <p>
              If you want to know whether a specific link is an affiliate link,
              or why we recommend something, just ask:{" "}
              <a
                href="mailto:admin@benicehospitality.com"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                admin@benicehospitality.com
              </a>
              .
            </p>
            <p>
              See also our{" "}
              <Link
                href="/privacy"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-primary-green hover:text-primary-green-dark underline underline-offset-2"
              >
                Terms
              </Link>
              .
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-near-black leading-tight mb-5">
        {title}
      </h2>
      <div className="font-sans text-base md:text-lg text-charcoal/85 leading-relaxed space-y-4 [&_ul]:space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_strong]:text-near-black [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
