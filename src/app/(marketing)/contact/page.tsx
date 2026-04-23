import type { Metadata } from "next";
import { Suspense } from "react";
import ContactHero from "@/components/sections/contact/ContactHero";
import ContactForm from "@/components/sections/contact/ContactForm";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Boutique Hotel Consultants | Be Nice Hospitality Group",
  },
  description:
    "Start a conversation with Be Nice Hospitality Group. Request a free revenue snapshot, book a discovery call, or ask about our boutique hotel consulting services.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/contact",
  },
  openGraph: {
    title: "Contact Boutique Hotel Consultants | Be Nice Hospitality Group",
    description:
      "Get in touch with BNHG. Request a free resource, book a discovery call, or learn about our boutique hotel consulting and Guestally software.",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
    </>
  );
}
