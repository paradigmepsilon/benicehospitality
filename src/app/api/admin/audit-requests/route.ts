import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "all";

  const rows =
    statusFilter === "all"
      ? await sql`
          SELECT id, hotel_url, email, role, status, audit_id, created_at, fulfilled_at
          FROM audit_requests
          ORDER BY created_at DESC
          LIMIT 200
        `
      : await sql`
          SELECT id, hotel_url, email, role, status, audit_id, created_at, fulfilled_at
          FROM audit_requests
          WHERE status = ${statusFilter}
          ORDER BY created_at DESC
          LIMIT 200
        `;

  const counts = await sql`
    SELECT status, COUNT(*)::int AS count FROM audit_requests GROUP BY status
  `;

  return NextResponse.json({ requests: rows, counts });
}
