/* One-off setup for the Module 6 rollout:
 * Creates the "Revenue and Scale" (Module 6) module for room-rental-riches so
 * import-lesson.ts has a module row to attach Lesson 6.1+ to.
 * Mirrors setup_module5.ts (marketing sits at position 30).
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
    VALUES (${courseId}, 'revenue-and-scale', 'Revenue and Scale: Upsells, Loyalty, Property #2',
            'Earn more from the home you already run with room tiers, housekeeping tiers, and a service menu, build the loyalty and referral engine that keeps rooms full, then score yourself against the five go/no-go criteria before property number two.',
            'Revenue and Scale', 35, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ revenue-and-scale module ensured (position 35)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
