import type { Metadata } from "next";
import BookingHero from "@/components/sections/book/BookingHero";
import BookingCalendar from "@/components/sections/book/BookingCalendar";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description:
    "Schedule a free 30-minute discovery call with Be Nice Hospitality Group. Pick a date and time that works for you — no sales pressure, just a genuine conversation about your boutique hotel.",
  alternates: {
    canonical: "https://benicehospitalitygroup.com/book",
  },
  openGraph: {
    title: "Book a Discovery Call | Be Nice Hospitality Group",
    description:
      "Schedule a free discovery call with BNHG. Choose a time that works for you and let's talk about what's possible for your boutique hotel.",
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
