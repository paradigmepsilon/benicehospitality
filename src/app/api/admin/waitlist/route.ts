import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { TIER_LABELS, type WaitlistTier } from "@/lib/validation/waitlist";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const signups = await sql`
    SELECT id, name, email, course_slug, tier, status, notes, created_at, notified_at
    FROM course_waitlist
    ORDER BY created_at DESC
  `;

  if (format === "csv") {
    const header = "ID,Name,Email,Course,Tier,Status,Created At,Notified At";
    const rows = signups.map((s) => {
      const tierLabel = TIER_LABELS[s.tier as WaitlistTier] || s.tier;
      const createdIso = new Date(s.created_at).toISOString();
      const notifiedIso = s.notified_at ? new Date(s.notified_at).toISOString() : "";
      return `${s.id},"${s.name.replace(/"/g, '""')}","${s.email}","${s.course_slug}","${tierLabel}","${s.status}","${createdIso}","${notifiedIso}"`;
    });
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=course-waitlist.csv",
      },
    });
  }

  return NextResponse.json(signups);
}
