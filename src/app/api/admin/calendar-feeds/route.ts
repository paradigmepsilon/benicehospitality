import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { parseICalEvents } from "@/lib/ical";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const feeds = await sql`
    SELECT * FROM calendar_feeds ORDER BY created_at DESC
  `;

  return NextResponse.json(feeds);
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, url, icsContent } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!url && !icsContent) {
    return NextResponse.json({ error: "Either a URL or file content is required." }, { status: 400 });
  }

  // Create the feed record
  const feedResult = await sql`
    INSERT INTO calendar_feeds (name, url)
    VALUES (${name}, ${url || null})
    RETURNING *
  `;
  const feed = feedResult[0];

  // Parse and import events
  try {
    let content: string;
    if (icsContent) {
      content = icsContent;
    } else {
      const res = await fetch(url);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch calendar URL." }, { status: 400 });
      }
      content = await res.text();
    }

    const events = parseICalEvents(content);

    for (const event of events) {
      await sql`
        INSERT INTO calendar_events (feed_id, uid, summary, event_date, start_time, end_time)
        VALUES (${feed.id}, ${event.uid}, ${event.summary}, ${event.date}, ${event.startTime}, ${event.endTime})
        ON CONFLICT (feed_id, uid) DO UPDATE SET
          summary = EXCLUDED.summary,
          event_date = EXCLUDED.event_date,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time
      `;
    }

    // Update last_synced_at
    await sql`
      UPDATE calendar_feeds SET last_synced_at = NOW() WHERE id = ${feed.id}
    `;

    return NextResponse.json({ ...feed, events_imported: events.length }, { status: 201 });
  } catch (error) {
    console.error("Failed to parse/import calendar events:", error);
    return NextResponse.json(
      { ...feed, warning: "Feed created but events could not be imported." },
      { status: 201 }
    );
  }
}
