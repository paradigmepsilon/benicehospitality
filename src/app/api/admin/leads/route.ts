import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") || "").trim();
  const stageFilter = url.searchParams.get("stage") || "all";
  const pattern = `%${search}%`;

  // Aggregate leads from audit_views. The "stage" is derived from the highest
  // event reached: cold (only email_submitted), engaged (cta_clicked), booked
  // (booked_call). Most recent activity drives the timestamp shown.
  const leads = search
    ? await sql`
        SELECT
          av.email,
          COUNT(DISTINCT av.audit_id)::int AS audits_viewed,
          MAX(av.last_viewed_at) AS last_viewed_at,
          MAX(GREATEST(av.last_viewed_at, COALESCE((
            SELECT MAX(occurred_at) FROM audit_events ae WHERE ae.audit_view_id = av.id
          ), av.last_viewed_at))) AS last_activity_at,
          (SELECT COUNT(*)::int FROM audit_events ae JOIN audit_views av2 ON av2.id = ae.audit_view_id WHERE av2.email = av.email AND ae.event_type = 'cta_clicked') AS cta_clicks,
          (SELECT COUNT(*)::int FROM audit_events ae JOIN audit_views av2 ON av2.id = ae.audit_view_id WHERE av2.email = av.email AND ae.event_type = 'booked_call') AS bookings,
          (
            SELECT a.hotel_name FROM audit_views av3
            JOIN audits a ON a.id = av3.audit_id
            WHERE av3.email = av.email
            ORDER BY av3.first_viewed_at ASC
            LIMIT 1
          ) AS first_audit_hotel
        FROM audit_views av
        WHERE av.email ILIKE ${pattern}
        GROUP BY av.email
        ORDER BY last_activity_at DESC
        LIMIT 200
      `
    : await sql`
        SELECT
          av.email,
          COUNT(DISTINCT av.audit_id)::int AS audits_viewed,
          MAX(av.last_viewed_at) AS last_viewed_at,
          MAX(GREATEST(av.last_viewed_at, COALESCE((
            SELECT MAX(occurred_at) FROM audit_events ae WHERE ae.audit_view_id = av.id
          ), av.last_viewed_at))) AS last_activity_at,
          (SELECT COUNT(*)::int FROM audit_events ae JOIN audit_views av2 ON av2.id = ae.audit_view_id WHERE av2.email = av.email AND ae.event_type = 'cta_clicked') AS cta_clicks,
          (SELECT COUNT(*)::int FROM audit_events ae JOIN audit_views av2 ON av2.id = ae.audit_view_id WHERE av2.email = av.email AND ae.event_type = 'booked_call') AS bookings,
          (
            SELECT a.hotel_name FROM audit_views av3
            JOIN audits a ON a.id = av3.audit_id
            WHERE av3.email = av.email
            ORDER BY av3.first_viewed_at ASC
            LIMIT 1
          ) AS first_audit_hotel
        FROM audit_views av
        GROUP BY av.email
        ORDER BY last_activity_at DESC
        LIMIT 200
      `;

  // Derive stage on the server side after fetching counts
  type Lead = (typeof leads)[number] & { stage: "cold" | "engaged" | "booked" };
  const enriched: Lead[] = (leads as unknown as Lead[]).map((l) => {
    const stage =
      (l.bookings as unknown as number) > 0
        ? "booked"
        : (l.cta_clicks as unknown as number) > 0
          ? "engaged"
          : "cold";
    return { ...l, stage };
  });

  const filtered = stageFilter === "all" ? enriched : enriched.filter((l) => l.stage === stageFilter);

  const counts = {
    all: enriched.length,
    cold: enriched.filter((l) => l.stage === "cold").length,
    engaged: enriched.filter((l) => l.stage === "engaged").length,
    booked: enriched.filter((l) => l.stage === "booked").length,
  };

  return NextResponse.json({ leads: filtered, counts });
}
