import type { Metadata } from "next";
import { Suspense } from "react";
import ManageBooking from "@/components/sections/book/ManageBooking";

export const metadata: Metadata = {
  title: "Manage Your Booking",
  description:
    "Reschedule or cancel your discovery call with Be Nice Hospitality Group.",
  robots: { index: false, follow: false },
};

export default function ManageBookingPage() {
  return (
    <Suspense fallback={null}>
      <ManageBooking />
    </Suspense>
  );
}
