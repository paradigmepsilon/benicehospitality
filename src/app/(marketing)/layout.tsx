import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Be Nice Hospitality Group",
            url: "https://benicehospitalitygroup.com",
            logo: "https://benicehospitalitygroup.com/images/logo.png",
            description:
              "Boutique hotel consulting and technology for independent luxury hotels with 10-50 rooms.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Hapeville",
              addressRegion: "GA",
              addressCountry: "US",
            },
            sameAs: [],
          }),
        }}
      />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
