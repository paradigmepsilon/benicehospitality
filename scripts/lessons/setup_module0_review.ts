/* One-off setup for the Module 0 review rollout:
 *  1. Creates the "Getting Started" (Module 0) module for room-rental-riches.
 *  2. Pulls the course out of public view until the admin marks it ready:
 *     is_published=false, is_purchasable=false, is_placeholder=true
 *     (catalog shows a "Coming soon" card; checkout is blocked).
 * Idempotent: safe to re-run.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const course = (await sql`
    SELECT id FROM courses WHERE slug = 'room-rental-riches' LIMIT 1
  `) as Array<{ id: number }>;
  if (!course[0]) throw new Error("room-rental-riches course not found");
  const courseId = course[0].id;

  await sql`
    INSERT INTO course_modules (course_id, slug, title, summary, phase_label, position, is_published)
    VALUES (${courseId}, 'getting-started', 'Getting Started',
            'Meet Della, the three rental models, and how the course works.',
            'Welcome', 5, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ getting-started module ensured (position 5)");

  await sql`
    UPDATE courses
    SET is_published = false, is_purchasable = false, is_placeholder = true,
        is_ready = false, updated_at = NOW()
    WHERE id = ${courseId}
  `;
  console.log("✓ room-rental-riches hidden pending admin review (Coming soon card)");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
