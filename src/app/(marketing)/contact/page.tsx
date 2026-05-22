import type { Metadata } from "next";
import { Suspense } from "react";
import ContactHero from "@/components/sections/contact/ContactHero";
import ContactForm from "@/components/sections/contact/ContactForm";
import SectionDivider from "@/components/ui/SectionDivider";
import { SECTION_COLORS as C } from "@/lib/section-colors";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Boutique Hotel Consultants | Be Nice Hospitality Group",
  },
  description:
    "Start a conversation with Be Nice Hospitality Group. Request a free revenue snapshot, book a discovery call, or ask about our boutique hotel consulting services.",
  alternates: {
    canonical: "https://benicehospitality.com/contact",
  },
  openGraph: {
    title: "Contact Boutique Hotel Consultants | Be Nice Hospitality Group",
    description:
      "Get in touch with BNHG. Request a free resource, book a discovery call, or learn about our boutique hotel consulting and Guestally software.",
    url: "https://benicehospitality.com/contact",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <SectionDivider fromColor={C.nearBlack} toColor={C.cream} />
      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
      <SectionDivider fromColor={C.cream} toColor={C.nearBlack} flip />
    </>
  );
}
