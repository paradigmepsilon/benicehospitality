/* One-off setup for the Module 5 rollout:
 * Creates the "Marketing" (Module 5) module for room-rental-riches so
 * import-lesson.ts has a module row to attach Lesson 5.1+ to.
 * Mirrors setup_module4.ts (operations sits at position 25).
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
    VALUES (${courseId}, 'marketing', 'Marketing: Filling Rooms Consistently',
            'Write the positioning statement that makes your homes recognizable, map a channel to every tenant profile, run a TikTok and Instagram content system on one filming day a month, and turn inquiries into signed tenants.',
            'Marketing', 30, true)
    ON CONFLICT (course_id, slug) DO NOTHING
  `;
  console.log("✓ marketing module ensured (position 30)");

  const rows = (await sql`
    SELECT slug, position, is_published FROM course_modules
    WHERE course_id = ${courseId} ORDER BY position
  `) as Array<{ slug: string; position: number; is_published: boolean }>;
  console.log("modules:", rows);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
