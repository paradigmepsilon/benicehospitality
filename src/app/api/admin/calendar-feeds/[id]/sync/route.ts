import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { parseICalEvents } from "@/lib/ical";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  const feeds = await sql`
    SELECT * FROM calendar_feeds WHERE id = ${id}
  `;

  if (feeds.length === 0) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }

  const feed = feeds[0];

  if (!feed.url) {
    return NextResponse.json({ error: "This feed was uploaded as a file and cannot be re-synced. Delete and re-upload instead." }, { status: 400 });
  }

  try {
    const res = await fetch(feed.url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch calendar URL." }, { status: 400 });
    }

    const content = await res.text();
    const events = parseICalEvents(content);

    // Delete old events for this feed
    await sql`DELETE FROM calendar_events WHERE feed_id = ${id}`;

    // Insert new events
    for (const event of events) {
      await sql`
        INSERT INTO calendar_events (feed_id, uid, summary, event_date, start_time, end_time)
        VALUES (${id}, ${event.uid}, ${event.summary}, ${event.date}, ${event.startTime}, ${event.endTime})
        ON CONFLICT (feed_id, uid) DO UPDATE SET
          summary = EXCLUDED.summary,
          event_date = EXCLUDED.event_date,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time
      `;
    }

    await sql`
      UPDATE calendar_feeds SET last_synced_at = NOW() WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, events_synced: events.length });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json({ error: "Failed to sync calendar." }, { status: 500 });
  }
}
