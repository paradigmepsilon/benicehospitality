/**
 * Weekly funnel report: the numbers behind the course funnel, straight from
 * Neon, so the Friday review is numbers rather than vibes.
 *
 *   node --env-file=.env.local --import tsx scripts/funnel-report.ts [weeks]
 */

import { sql } from "../src/lib/db";

const weeks = Math.max(1, Math.min(26, Number(process.argv[2] || 4)));

async function section(title: string, q: Promise<unknown>) {
  console.log(`\n== ${title} ==`);
  try {
    const rows = (await q) as Record<string, unknown>[];
    if (rows.length === 0) console.log("(no rows)");
    else console.table(rows);
  } catch (err) {
    console.log("query failed:", (err as Error).message);
  }
}

async function main() {
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`Funnel report: last ${weeks} weeks (since ${since.slice(0, 10)})`);

  await section("Owned list, totals", sql`
    SELECT
      (SELECT COUNT(*)::int FROM newsletter_subscribers) AS newsletter,
      (SELECT COUNT(DISTINCT email)::int FROM resource_leads) AS tool_leads,
      (SELECT COUNT(DISTINCT email)::int FROM course_waitlist) AS waitlist,
      (SELECT COUNT(*)::int FROM users) AS accounts,
      (SELECT COUNT(*)::int FROM unsubscribes) AS unsubscribed
  `);

  await section("New leads by week and source", sql`
    SELECT week::date, source, COUNT(*)::int AS n FROM (
      SELECT date_trunc('week', subscribed_at) AS week, 'newsletter:' || source AS source FROM newsletter_subscribers WHERE subscribed_at >= ${since}
      UNION ALL
      SELECT date_trunc('week', created_at), 'tool:' || tool_slug FROM resource_leads WHERE created_at >= ${since}
      UNION ALL
      SELECT date_trunc('week', created_at), 'waitlist:' || course_slug FROM course_waitlist WHERE created_at >= ${since}
    ) x GROUP BY 1, 2 ORDER BY 1 DESC, 3 DESC
  `);

  await section("Nurture: enrollments by sequence and status", sql`
    SELECT sequence_key, status, COUNT(*)::int AS n
    FROM course_nurture_enrollments GROUP BY 1, 2 ORDER BY 1, 2
  `);

  await section("Nurture: sends by week", sql`
    SELECT date_trunc('week', sent_at)::date AS week,
      COUNT(*) FILTER (WHERE resend_message_id IS NOT NULL)::int AS sent,
      COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS failed
    FROM course_nurture_sends WHERE sent_at >= ${since} GROUP BY 1 ORDER BY 1 DESC
  `);

  await section("Nurture: stop reasons", sql`
    SELECT stop_reason, COUNT(*)::int AS n FROM course_nurture_enrollments
    WHERE status = 'stopped' GROUP BY 1 ORDER BY 2 DESC
  `);

  await section("Waitlist by course and tier", sql`
    SELECT course_slug, tier, COUNT(*)::int AS n FROM course_waitlist GROUP BY 1, 2 ORDER BY 1, 2
  `);

  await section("Purchases by week", sql`
    SELECT week::date, product, COUNT(*)::int AS n, SUM(cents)::int AS cents FROM (
      SELECT date_trunc('week', purchased_at) AS week, 'claimproof:' || tier AS product, amount_cents AS cents
        FROM claimproof_purchases WHERE status = 'succeeded' AND purchased_at >= ${since}
      UNION ALL
      SELECT date_trunc('week', created_at), 'course:' || status, amount_cents
        FROM course_purchases WHERE created_at >= ${since}
      UNION ALL
      SELECT date_trunc('week', e.granted_at), 'enrollment:' || c.slug || ':' || e.tier, 0
        FROM enrollments e JOIN courses c ON c.id = e.course_id
        WHERE e.granted_by_user_id IS NULL AND e.granted_at >= ${since}
    ) x GROUP BY 1, 2 ORDER BY 1 DESC, 3 DESC
  `);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
