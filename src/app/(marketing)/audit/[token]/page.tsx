import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuditByToken } from "@/lib/audit/token";
import AuditPageClient from "@/components/audit/AuditPageClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const audit = await getAuditByToken(token);
  if (!audit) {
    return { title: "Audit not found | Be Nice Hospitality Group" };
  }
  return {
    title: `${audit.hotel_name} — Tier 0 Audit | Be Nice Hospitality Group`,
    description: `Tier 0 Comprehensive Audit for ${audit.hotel_name}. Overall score ${audit.overall_score}/100, Grade ${audit.overall_grade}.`,
    robots: { index: false, follow: false },
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { token } = await params;
  const audit = await getAuditByToken(token);
  if (!audit) {
    notFound();
  }

  return (
    <AuditPageClient
      token={audit.token}
      hotelName={audit.hotel_name}
      hotelLocation={audit.hotel_location}
      overallScore={audit.overall_score}
      overallGrade={audit.overall_grade}
      generatedAt={audit.audit_data.generated_at}
    />
  );
}
