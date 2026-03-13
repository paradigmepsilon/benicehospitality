import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const subscribers = await sql`
    SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC
  `;

  if (format === "csv") {
    const header = "Email,Subscribed At,Source";
    const rows = subscribers.map(
      (s) =>
        `"${s.email}","${new Date(s.subscribed_at).toISOString()}","${s.source}"`
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=subscribers.csv",
      },
    });
  }

  return NextResponse.json(subscribers);
}
