import { NextResponse } from "next/server";
import { getAuditByToken } from "@/lib/audit/token";
import { auditTeaserLimiter } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { success } = auditTeaserLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await params;
  const audit = await getAuditByToken(token);
  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    hotel_name: audit.hotel_name,
    hotel_location: audit.hotel_location,
    overall_score: audit.overall_score,
    overall_grade: audit.overall_grade,
    generated_at: audit.audit_data.generated_at,
  });
}
