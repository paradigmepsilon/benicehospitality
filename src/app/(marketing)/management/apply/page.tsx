import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationForm from "@/components/sections/management/ApplicationForm";

export const metadata: Metadata = {
  title: "Apply for Management",
  description:
    "Tell us about your vehicle or your property. We confirm fit and schedule a call before anything is signed.",
  alternates: { canonical: "https://www.benicehospitality.com/management/apply" },
  openGraph: {
    title: "Apply for Management | Be Nice Hospitality Group",
    description:
      "Tell us about your vehicle or your property. We confirm fit and schedule a call before anything is signed.",
    url: "https://www.benicehospitality.com/management/apply",
    type: "website",
  },
};

export default function ManagementApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationForm />
    </Suspense>
  );
}
