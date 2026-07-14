import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://benicehospitality.com";
const ORG_ID = `${SITE_URL}/#organization`;
const PROFESSIONAL_SERVICE_ID = `${SITE_URL}/#professional-service`;
const ALEX_ID = `${SITE_URL}/#alex-henry`;
const DELLA_ID = `${SITE_URL}/#della-henry`;
const GUESTALLY_ID = "https://guestally.ai/#organization";

const SIGNAL_ID = `${SITE_URL}/signal#service`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: "Be Nice Hospitality Group",
      publisher: { "@id": ORG_ID },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Be Nice Hospitality Group",
      alternateName: "BNHG",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      description:
        "Training, services, and software for operators running co-living properties, boutique stays, and rental fleets. Direct booking strategy, operations, guest experience, AI services (Signal), and Guestally software.",
      telephone: "+1-404-541-9934",
      email: "admin@benicehospitality.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hapeville",
        addressRegion: "GA",
        addressCountry: "US",
      },
      founder: [{ "@id": ALEX_ID }, { "@id": DELLA_ID }],
      subOrganization: [
        { "@id": GUESTALLY_ID },
        { "@id": SIGNAL_ID },
      ],
      sameAs: [
        "https://www.linkedin.com/company/be-nice-hospitality/",
        "https://www.instagram.com/benicehospitality",
        "https://guestally.ai",
      ],
    },
    {
      "@type": "Organization",
      "@id": GUESTALLY_ID,
      name: "Guestally",
      url: "https://guestally.ai",
      description:
        "Guest messaging and upsell automation software for independent boutique stays and hotels.",
      parentOrganization: { "@id": ORG_ID },
    },
    {
      "@type": "ProfessionalService",
      "@id": PROFESSIONAL_SERVICE_ID,
      name: "Be Nice Hospitality Group",
      url: SITE_URL,
      serviceType: "Hospitality Operations Consulting",
      description:
        "Consulting and fractional advisory services for independent boutique stays and co-living operators. Revenue strategy, operations, guest experience, and hospitality technology.",
      areaServed: {
        "@type": "Country",
        name: "United States",
      },
      priceRange: "$$$",
      telephone: "+1-404-541-9934",
      email: "admin@benicehospitality.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hapeville",
        addressRegion: "GA",
        addressCountry: "US",
      },
      provider: { "@id": ORG_ID },
      parentOrganization: { "@id": ORG_ID },
    },
    {
      "@type": "Person",
      "@id": ALEX_ID,
      name: "Alex Henry",
      jobTitle: "Co-Founder & CEO",
      worksFor: { "@id": ORG_ID },
      url: "https://alexhenry.bio",
      description:
        "Co-founder and CEO of Be Nice Hospitality Group. Military veteran with enterprise operations background focused on hospitality technology, revenue strategy, and direct booking for co-living properties, boutique stays, and rental fleets.",
      sameAs: [
        "https://alexhenry.bio",
        "https://www.linkedin.com/company/be-nice-hospitality/",
      ],
    },
    {
      "@type": "Person",
      "@id": DELLA_ID,
      name: "Della Henry",
      jobTitle: "Co-Founder",
      worksFor: { "@id": ORG_ID },
      description:
        "Co-founder of Be Nice Hospitality Group. Military veteran with deep hospitality operations experience helping independent boutique stays and co-living operators grow through guest experience and operations strategy.",
      sameAs: [
        "https://www.linkedin.com/company/be-nice-hospitality/",
      ],
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
