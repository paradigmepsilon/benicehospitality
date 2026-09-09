import type { Metadata } from "next";
import ManagementOffer from "@/components/sections/management/ManagementOffer";

export const metadata: Metadata = {
  title: "Fleet Management",
  description:
    "Your vehicle earns without becoming your second job. BNHG runs the listing, pricing, turnover, and claims. You keep the title, the insurance choice, and the final say.",
  keywords: [
    "fleet management for Turo hosts",
    "vehicle rental fleet management",
    "vehicle management company",
    "Turo host management",
    "rental fleet operator Southeast",
  ],
  alternates: { canonical: "https://benicehospitality.com/management/fleet" },
  openGraph: {
    title: "Fleet Management | Be Nice Hospitality Group",
    description:
      "Your vehicle earns without becoming your second job. BNHG runs the listing, pricing, turnover, and claims.",
    url: "https://benicehospitality.com/management/fleet",
    type: "website",
    images: [
      {
        url: "https://benicehospitality.com/images/Website%20Images/Alex%20Turo%20Shot.png",
        width: 1600,
        height: 900,
        alt: "A managed rental vehicle staged at golden hour",
      },
    ],
  },
};

export default function ManagementFleetPage() {
  return <ManagementOffer asset="car" />;
}
