/* One-off setup for the Module 3 rollout:
 * Creates the "Setup" (Module 3) module for room-rental-riches so
 * import-lesson.ts has a module row to attach Lesson 3.1+ to.
 * Mirrors setup_module2.ts (planning sits at position 15).
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
    VALUES (${courseId}, 'setup', 'Setup: Design, Furnish, Stage, Wire',
            'Design for your tenant, furnish on budget, style and shoot the rooms, and wire the house to run without you.',
            'Setup', 20, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ setup module ensured (position 20)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
