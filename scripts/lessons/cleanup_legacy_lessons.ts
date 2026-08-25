/* One-off cleanup for the Blueprint rebuild (2026-08-25, per Alex):
 * remove the antiquated 12-module-era lessons and module shells from
 * room-rental-riches so only Module 0 ("getting-started") is in review.
 *
 * Lessons and modules are regenerable: bundles live on disk under Courses/
 * (filesystem is the source of truth at build time) and re-import via
 * scripts/import-lesson.ts once rebuilt in the hybrid format. A metadata
 * snapshot (no asset blobs) is written next to this script before deleting.
 * lesson_assets and lesson_progress rows cascade with their lessons.
 */
import { writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const KEEP_MODULE_SLUG = "getting-started";

async function main() {
  const course = (await sql`
    SELECT id FROM courses WHERE slug = 'room-rental-riches' LIMIT 1
  `) as Array<{ id: number }>;
  if (!course[0]) throw new Error("room-rental-riches not found");
  const courseId = course[0].id;

  const modules = await sql`
    SELECT * FROM course_modules
    WHERE course_id = ${courseId} AND slug <> ${KEEP_MODULE_SLUG}
    ORDER BY position`;
  const lessons = await sql`
    SELECT l.id, l.slug, l.title, l.summary, l.position, l.body_kind,
           l.video_url, l.bundle_main_filename, l.min_tier, l.max_tier,
           m.slug AS module_slug
    FROM course_lessons l
    LEFT JOIN course_modules m ON m.id = l.module_id
    WHERE l.course_id = ${courseId}
      AND (m.slug IS NULL OR m.slug <> ${KEEP_MODULE_SLUG})
    ORDER BY l.position`;

  const snapshotPath = `${__dirname}/legacy_lessons_snapshot_${Date.now()}.json`;
  writeFileSync(snapshotPath, JSON.stringify({ modules, lessons }, null, 2));
  console.log(`✓ snapshot: ${snapshotPath} (${modules.length} modules, ${lessons.length} lessons)`);

  const lessonIds = (lessons as Array<{ id: number }>).map((l) => l.id);
  if (lessonIds.length > 0) {
    const deleted = await sql`
      DELETE FROM course_lessons WHERE id = ANY(${lessonIds}) RETURNING slug`;
    console.log(`✓ deleted ${deleted.length} legacy lessons (assets + progress cascade)`);
  }
  const deletedModules = await sql`
    DELETE FROM course_modules
    WHERE course_id = ${courseId} AND slug <> ${KEEP_MODULE_SLUG}
    RETURNING slug`;
  console.log(`✓ deleted ${deletedModules.length} legacy module shells`);

  const remaining = await sql`
    SELECT m.slug AS module, l.slug AS lesson, l.review_status
    FROM course_modules m
    LEFT JOIN course_lessons l ON l.module_id = m.id
    WHERE m.course_id = ${courseId}
    ORDER BY m.position, l.position`;
  console.log("remaining:", JSON.stringify(remaining));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
