/* One-off setup for the Module 2 rollout:
 * Creates the "Planning" (Module 2) module for room-rental-riches so
 * import-lesson.ts has a module row to attach Lesson 2.1+ to.
 * Mirrors setup_module1.ts (research sits at position 10).
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
    VALUES (${courseId}, 'planning', 'Planning: Money, Entity, Insurance, Launch Plan',
            'Budget the launch, price the rooms, set up the entity and insurance, and leave with a 90-day plan.',
            'Planning', 15, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ planning module ensured (position 15)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
