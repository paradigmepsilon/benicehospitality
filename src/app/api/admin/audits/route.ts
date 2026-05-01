import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const ALLOWED_SORTS = new Set(["created_at", "hotel_name", "overall_score"]);

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(10, parseInt(url.searchParams.get("limit") || "50", 10) || 50));
  const offset = (page - 1) * limit;
  const requestedSort = url.searchParams.get("sort") || "created_at";
  const sort = ALLOWED_SORTS.has(requestedSort) ? requestedSort : "created_at";
  const direction = (url.searchParams.get("dir") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const search = (url.searchParams.get("search") || "").trim();
  const pattern = `%${search}%`;

  const total = await sql`SELECT COUNT(*)::int AS count FROM audits`;
  const totalCount = total[0].count as number;

  const audits = search
    ? await sql`
        SELECT
          a.id, a.token, a.hotel_url, a.hotel_name, a.hotel_location,
          a.overall_score, a.overall_grade, a.status, a.created_at, a.expires_at,
          (SELECT COUNT(*)::int FROM audit_views av WHERE av.audit_id = a.id) AS unique_emails,
          (SELECT COUNT(*)::int FROM audit_events ae WHERE ae.audit_id = a.id AND ae.event_type = 'cta_clicked') AS cta_clicks,
          (SELECT COUNT(*)::int FROM audit_events ae WHERE ae.audit_id = a.id AND ae.event_type = 'booked_call') AS bookings
        FROM audits a
        WHERE a.hotel_name ILIKE ${pattern} OR a.hotel_url ILIKE ${pattern} OR a.hotel_slug ILIKE ${pattern}
        ORDER BY
          CASE WHEN ${sort} = 'created_at'    AND ${direction} = 'asc'  THEN a.created_at    END ASC,
          CASE WHEN ${sort} = 'created_at'    AND ${direction} = 'desc' THEN a.created_at    END DESC,
          CASE WHEN ${sort} = 'hotel_name'    AND ${direction} = 'asc'  THEN a.hotel_name    END ASC,
          CASE WHEN ${sort} = 'hotel_name'    AND ${direction} = 'desc' THEN a.hotel_name    END DESC,
          CASE WHEN ${sort} = 'overall_score' AND ${direction} = 'asc'  THEN a.overall_score END ASC,
          CASE WHEN ${sort} = 'overall_score' AND ${direction} = 'desc' THEN a.overall_score END DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT
          a.id, a.token, a.hotel_url, a.hotel_name, a.hotel_location,
          a.overall_score, a.overall_grade, a.status, a.created_at, a.expires_at,
          (SELECT COUNT(*)::int FROM audit_views av WHERE av.audit_id = a.id) AS unique_emails,
          (SELECT COUNT(*)::int FROM audit_events ae WHERE ae.audit_id = a.id AND ae.event_type = 'cta_clicked') AS cta_clicks,
          (SELECT COUNT(*)::int FROM audit_events ae WHERE ae.audit_id = a.id AND ae.event_type = 'booked_call') AS bookings
        FROM audits a
        ORDER BY
          CASE WHEN ${sort} = 'created_at'    AND ${direction} = 'asc'  THEN a.created_at    END ASC,
          CASE WHEN ${sort} = 'created_at'    AND ${direction} = 'desc' THEN a.created_at    END DESC,
          CASE WHEN ${sort} = 'hotel_name'    AND ${direction} = 'asc'  THEN a.hotel_name    END ASC,
          CASE WHEN ${sort} = 'hotel_name'    AND ${direction} = 'desc' THEN a.hotel_name    END DESC,
          CASE WHEN ${sort} = 'overall_score' AND ${direction} = 'asc'  THEN a.overall_score END ASC,
          CASE WHEN ${sort} = 'overall_score' AND ${direction} = 'desc' THEN a.overall_score END DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

  return NextResponse.json({
    audits,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
