import type { Metadata } from "next";
import ManagementOffer from "@/components/sections/management/ManagementOffer";

export const metadata: Metadata = {
  title: "Co-living Management | Be Nice Hospitality",
  description:
    "Your spare rooms earn without becoming your second job. BNHG runs the listing, screening, leases, and turnover. You keep the mortgage, the insurance choice, and the final say.",
  keywords: [
    "co-living property management",
    "room rental management company",
    "mid-term rental management",
    "MTR property management Southeast",
    "co-living operator",
  ],
  alternates: { canonical: "https://benicehospitality.com/management/co-living" },
  openGraph: {
    title: "Co-living Management | Be Nice Hospitality",
    description:
      "Your spare rooms earn without becoming your second job. BNHG runs the listing, screening, leases, and turnover.",
    url: "https://benicehospitality.com/management/co-living",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Della%20Casual.png",
        width: 1200,
        height: 1200,
        alt: "A managed co-living property in the Southeast",
      },
    ],
  },
};

export default function ManagementCoLivingPage() {
  return <ManagementOffer asset="rooms" />;
}
