import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import FAQSchema from "@/components/sections/faq/FAQSchema";
import PageCTA from "@/components/sections/shared/PageCTA";
import {
  TIER_ZERO_RESOURCES,
  getTierZeroResource,
  getAllTierZeroSlugs,
} from "@/lib/tier-zero-resources";

const SITE_URL = "https://benicehospitalitygroup.com";

export async function generateStaticParams() {
  return getAllTierZeroSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getTierZeroResource(slug);
  if (!resource) {
    return { title: "Resource Not Found" };
  }
  return {
    title: { absolute: resource.metaTitle },
    description: resource.metaDescription,
    keywords: resource.targetKeywords,
    alternates: {
      canonical: `${SITE_URL}/resources/${resource.slug}`,
    },
    openGraph: {
      title: resource.metaTitle,
      description: resource.metaDescription,
      url: `${SITE_URL}/resources/${resource.slug}`,
    },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getTierZeroResource(slug);
  if (!resource) notFound();

  const ctaHref = `/contact?resource=${resource.slug}`;
  const related = TIER_ZERO_RESOURCES.filter(
    (r) => r.slug !== resource.slug,
  ).slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: resource.name,
    description: resource.metaDescription,
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: "Boutique Hotel Consulting",
    areaServed: { "@type": "Country", name: "United States" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    url: `${SITE_URL}/resources/${resource.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQSchema items={resource.faq} />

      {/* Hero */}
      <section className="relative bg-near-black py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-near-black to-near-black/90" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
            Tier 0 Free Resource · {resource.pillar}
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight">
            {resource.heroHeadline}
          </h1>
          <p className="font-sans text-lg text-white/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            {resource.heroSubhead}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={ctaHref} variant="primary" size="lg">
              Request {resource.name}
            </Button>
            <Button href="/services#tier-0" variant="secondary" size="lg">
              See All Free Resources
            </Button>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-24 px-6 bg-off-white">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>What You Get</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-10 leading-tight">
            Inside the {resource.name}
          </h2>
          <ul className="space-y-4">
            {resource.whatYouGet.map((item, i) => (
              <li
                key={i}
                className="flex gap-4 items-start border-b border-light-gray pb-4"
              >
                <span className="font-display text-primary-green text-xl shrink-0 leading-none mt-1">
                  →
                </span>
                <span className="font-sans text-base text-charcoal leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Who It&apos;s For</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-10 leading-tight">
            Built For Operators Who…
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resource.whoItsFor.map((item, i) => (
              <div
                key={i}
                className="border border-light-gray rounded-lg p-6 hover:border-primary-green/50 transition-colors"
              >
                <p className="font-sans text-base text-charcoal leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-off-white">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-10 leading-tight">
            Three Steps. Nothing You Have to Prepare.
          </h2>
          <ol className="space-y-6">
            {resource.howItWorks.map((step, i) => (
              <li
                key={i}
                className="flex gap-6 items-start border-l-2 border-primary-green pl-6"
              >
                <div>
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-green mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-near-black mb-2">
                    {step.step}
                  </h3>
                  <p className="font-sans text-base text-charcoal/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Button href={ctaHref} variant="primary" size="lg">
              Request {resource.name}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-near-black mb-10 leading-tight">
            About This Resource
          </h2>
          <div className="divide-y divide-light-gray border-t border-b border-light-gray">
            {resource.faq.map((item, i) => (
              <details key={i} className="group py-6">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                  <span className="font-display text-lg md:text-xl font-semibold text-near-black leading-snug group-hover:text-primary-green transition-colors">
                    {item.question}
                  </span>
                  <span className="shrink-0 mt-1 w-6 h-6 flex items-center justify-center border border-near-black/30 rounded-full text-near-black group-open:rotate-45 transition-transform duration-200">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14M5 12h14"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 font-sans text-base text-charcoal/80 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related resources */}
      <section className="py-20 px-6 bg-off-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Other Free Resources</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mb-10 leading-tight">
            Explore the Rest of Tier 0
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/resources/${r.slug}`}
                className="block bg-white border border-light-gray rounded-lg p-6 hover:border-primary-green/50 hover:shadow-md transition-all"
              >
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-green mb-3">
                  {r.pillar}
                </p>
                <h3 className="font-display text-xl font-semibold text-near-black leading-snug mb-2">
                  {r.name}
                </h3>
                <p className="font-sans text-sm text-charcoal/70 leading-relaxed">
                  {r.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        headline={`Ready for Your ${resource.name}?`}
        subtext="No call required. No payment info. Just share your URL and we'll get to work."
      />
    </>
  );
}
