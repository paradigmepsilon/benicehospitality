import { sql } from "@/lib/db";

// Event-log + summary metrics for the admin analytics surface. Modeled on the
// audit_events helpers — recordEvent is fire-and-forget (errors swallowed),
// so emission can never break the calling path. Read helpers are dedicated
// queries called by /admin/(dashboard)/analytics in parallel.

export type EventType =
  | "auth.login"
  | "auth.logout"
  | "auth.signup"
  | "auth.email_verified"
  | "auth.onboarded"
  | "lesson.complete"
  | "forum.thread_create"
  | "forum.post_create";

export interface RecordEventInput {
  userId: number | null;
  eventType: EventType;
  metadata?: Record<string, unknown>;
}

export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    const meta = input.metadata ? JSON.stringify(input.metadata) : null;
    await sql`
      INSERT INTO user_events (user_id, event_type, metadata)
      VALUES (${input.userId}, ${input.eventType}, ${meta}::jsonb)
    `;
  } catch (err) {
    console.error("[analytics.recordEvent] swallowed:", err);
  }
}

// =============================================================================
// Read helpers
// =============================================================================

export interface OverviewMetrics {
  totalMembers: number;
  activeLast7d: number;
  signupsLast30d: number;
  courseCompletions: number;
  forumThreads: number;
  forumPosts: number;
}

interface CountRow {
  count: string | number;
}

function num(v: string | number | null | undefined): number {
  return v === null || v === undefined ? 0 : Number(v);
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const [
    totalMembers,
    activeLast7d,
    signupsLast30d,
    courseCompletions,
    forumThreads,
    forumPosts,
  ] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM users WHERE disabled_at IS NULL`,
    sql`
      SELECT COUNT(DISTINCT user_id) AS count FROM user_events
      WHERE event_type = 'auth.login'
        AND occurred_at > NOW() - INTERVAL '7 days'
    `,
    sql`SELECT COUNT(*) AS count FROM users WHERE created_at > NOW() - INTERVAL '30 days'`,
    sql`SELECT COUNT(*) AS count FROM lesson_progress`,
    sql`SELECT COUNT(*) AS count FROM forum_threads WHERE deleted_at IS NULL`,
    sql`SELECT COUNT(*) AS count FROM forum_posts WHERE deleted_at IS NULL`,
  ]);

  return {
    totalMembers: num((totalMembers as CountRow[])[0]?.count),
    activeLast7d: num((activeLast7d as CountRow[])[0]?.count),
    signupsLast30d: num((signupsLast30d as CountRow[])[0]?.count),
    courseCompletions: num((courseCompletions as CountRow[])[0]?.count),
    forumThreads: num((forumThreads as CountRow[])[0]?.count),
    forumPosts: num((forumPosts as CountRow[])[0]?.count),
  };
}

export interface DailyDatum {
  day: string; // YYYY-MM-DD
  count: number;
}

export async function getDailySignups(days = 30): Promise<DailyDatum[]> {
  const rows = (await sql`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days - 1})::int)::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    )
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS day,
      COUNT(u.id) AS count
    FROM days d
    LEFT JOIN users u ON DATE(u.created_at) = d.day
    GROUP BY d.day
    ORDER BY d.day ASC
  `) as Array<{ day: string; count: string | number }>;
  return rows.map((r) => ({ day: r.day, count: num(r.count) }));
}

export async function getDailyLogins(days = 30): Promise<DailyDatum[]> {
  const rows = (await sql`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days - 1})::int)::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    )
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS day,
      COUNT(e.id) AS count
    FROM days d
    LEFT JOIN user_events e
      ON e.event_type = 'auth.login' AND DATE(e.occurred_at) = d.day
    GROUP BY d.day
    ORDER BY d.day ASC
  `) as Array<{ day: string; count: string | number }>;
  return rows.map((r) => ({ day: r.day, count: num(r.count) }));
}

export interface RecentEvent {
  id: number;
  occurredAt: string;
  eventType: EventType;
  userEmail: string | null;
  userName: string | null;
  metadata: Record<string, unknown> | null;
}

export async function listRecentEvents(limit = 50): Promise<RecentEvent[]> {
  const rows = (await sql`
    SELECT e.id, e.event_type, e.metadata, e.occurred_at,
           u.email AS user_email, u.name AS user_name
    FROM user_events e
    LEFT JOIN users u ON u.id = e.user_id
    ORDER BY e.occurred_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: number;
    event_type: EventType;
    metadata: Record<string, unknown> | null;
    occurred_at: string;
    user_email: string | null;
    user_name: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    occurredAt: r.occurred_at,
    eventType: r.event_type,
    userEmail: r.user_email,
    userName: r.user_name,
    metadata: r.metadata,
  }));
}
