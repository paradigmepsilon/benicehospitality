import type { Metadata } from "next";
import BookingHero from "@/components/sections/book/BookingHero";
import BookingCalendar from "@/components/sections/book/BookingCalendar";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description:
    "Schedule a free 40-minute discovery call with Be Nice Hospitality Group. Pick a date and time that works for you — no sales pressure, just a genuine conversation about your boutique hotel.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/book",
  },
  openGraph: {
    title: "Book a Discovery Call | Be Nice Hospitality Group",
    description:
      "Schedule a free discovery call with BNHG. Choose a time that works for you and let's talk about what's possible for your boutique hotel.",
    url: "https://benicehospitalitygroup.com/book",
    type: "website",
    images: [
      { url: "/images/hero-banner.png", width: 1200, height: 630, alt: "Be Nice Hospitality Group" },
    ],
  },
};

export default function BookPage() {
  return (
    <>
      <BookingHero />
      <BookingCalendar />
    </>
  );
}
