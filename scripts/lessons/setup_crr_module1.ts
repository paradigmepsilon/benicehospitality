/* One-off setup for Car Rental Riches Module 1:
 * Creates "The Business Nobody Explains" (Module 1) module row for
 * car-rental-riches so import-lesson.ts has a module to attach Lesson 1.1+ to.
 * Mirrors setup_module6.ts (RRR). Idempotent: safe to re-run.
 *
 * NOT RUN YET. The DB currently shows car-rental-riches as a placeholder course
 * with no modules; Alex runs this against the intended environment.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const course = (await sql`
    SELECT id FROM courses WHERE slug = 'car-rental-riches' LIMIT 1
  `) as Array<{ id: number }>;
  if (!course[0]) throw new Error("car-rental-riches course not found");
  const courseId = course[0].id;

  await sql`
    INSERT INTO course_modules (course_id, slug, title, summary, phase_label, position, is_published)
    VALUES (${courseId}, 'the-business-nobody-explains', 'The Business Nobody Explains',
            'What changed in 2026, how the rental giants actually make money, which of the four operator sizes you are, and an honest answer to whether this business is for you.',
            'Module 1', 10, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ the-business-nobody-explains module ensured (position 10)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
