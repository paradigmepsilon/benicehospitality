import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuditBySlugOrToken } from "@/lib/audit/token";
import AuditPageClient from "@/components/audit/AuditPageClient";

interface PageProps {
  // The route segment is still named [token] for backward compatibility, but
  // the value is treated as either a public slug (preferred) or a legacy
  // base64 token (fallback). See getAuditBySlugOrToken.
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const audit = await getAuditBySlugOrToken(token);
  if (!audit) {
    return { title: "Audit not found | Be Nice Hospitality Group" };
  }
  return {
    title: `${audit.hotel_name}, Tier 0 Audit | Be Nice Hospitality Group`,
    description: `Tier 0 audit for ${audit.hotel_name}. Overall score ${audit.overall_score}/100, grade ${audit.overall_grade}.`,
    robots: { index: false, follow: false },
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { token } = await params;
  const audit = await getAuditBySlugOrToken(token);
  if (!audit) {
    notFound();
  }

  // When the operator pasted custom HTML for this audit, render it verbatim.
  // The HTML is operator-controlled (admin-only PATCH), so we trust it. We
  // wrap it in a minimal container so it inherits site fonts.
  if (audit.custom_html) {
    return (
      <div
        className="audit-custom prose prose-neutral max-w-3xl mx-auto px-4 py-8"
        // eslint-disable-next-line react/no-danger -- admin-controlled content
        dangerouslySetInnerHTML={{ __html: audit.custom_html }}
      />
    );
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
