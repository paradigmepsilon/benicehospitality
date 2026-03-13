import type { Metadata } from "next";
import ContactHero from "@/components/sections/contact/ContactHero";
import ContactForm from "@/components/sections/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Be Nice Hospitality Group. Request a free revenue snapshot, book a discovery call, or ask about our boutique hotel consulting services.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/contact",
  },
  openGraph: {
    title: "Contact | Be Nice Hospitality Group",
    description:
      "Get in touch with BNHG. Request a free resource, book a discovery call, or learn about our boutique hotel consulting and Guestally software.",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactForm />
    </>
  );
}
