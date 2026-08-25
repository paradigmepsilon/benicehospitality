/* One-off setup for the Module 1 rollout:
 * Creates the "Research" (Module 1) module for room-rental-riches so
 * import-lesson.ts has a module row to attach Lesson 1.1+ to.
 * Mirrors setup_module0_review.ts (getting-started sits at position 5).
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
    VALUES (${courseId}, 'research', 'Research: Your Tenant, Your Property, Your Rules',
            'Pick your tenant, confirm it is legal, and score the property before you spend a dollar.',
            'Research', 10, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ research module ensured (position 10)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
