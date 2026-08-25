/* One-off read-only state check for the approval-workflow build. */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const courses = await sql`
    SELECT id, slug, is_published, is_placeholder, is_purchasable FROM courses ORDER BY id`;
  console.log("courses:", JSON.stringify(courses));

  const enrollments = await sql`
    SELECT c.slug, e.tier, e.status, u.role, COUNT(*)::int AS n
    FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
    GROUP BY c.slug, e.tier, e.status, u.role ORDER BY c.slug`;
  console.log("enrollments:", JSON.stringify(enrollments));

  const purchases = await sql`
    SELECT status, COUNT(*)::int AS n FROM course_purchases GROUP BY status`;
  console.log("purchases:", JSON.stringify(purchases));

  const modules = await sql`
    SELECT m.slug, m.position, m.is_published, COUNT(l.id)::int AS lessons
    FROM course_modules m LEFT JOIN course_lessons l ON l.module_id = m.id
    WHERE m.course_id = (SELECT id FROM courses WHERE slug = 'room-rental-riches')
    GROUP BY m.id ORDER BY m.position`;
  console.log("rrr modules:", JSON.stringify(modules));

  const lessons = await sql`
    SELECT slug, body_kind, is_published, module_id FROM course_lessons
    WHERE course_id = (SELECT id FROM courses WHERE slug = 'room-rental-riches') ORDER BY position`;
  console.log("rrr lessons:", JSON.stringify(lessons));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
