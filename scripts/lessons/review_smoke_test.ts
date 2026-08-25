/* Smoke test for the review workflow against the live DB.
 * Approve → verify → unapprove one draft lesson (net zero change), and
 * confirm "mark ready" refuses while drafts exist. */
import {
  getCourseReviewState,
  setLessonApproval,
  setCourseReady,
} from "../../src/lib/course-review";
import { neon } from "@neondatabase/serverless";

const rawSql = neon(process.env.DATABASE_URL!);

async function main() {
  const admins = (await rawSql`
    SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1
  `) as Array<{ id: number }>;
  if (!admins[0]) throw new Error("no admin user found");
  const adminId = admins[0].id;

  const s = await getCourseReviewState(1);
  if (!s) throw new Error("course 1 not found");
  console.log("drafts:", s.draftLessonCount, "draftModules:", s.draftModuleCount, "modules:", s.modules.length);
  const gs = s.modules.find((m) => m.slug === "getting-started")!;
  console.log("getting-started:", gs.lessons.map((l) => `${l.slug}:${l.reviewStatus}`).join(", "));

  const ready = await setCourseReady(1, true, adminId);
  console.log("ready-while-drafts attempt:", JSON.stringify(ready));
  if (ready.ok) throw new Error("ready should have been refused!");

  const l01 = gs.lessons.find((l) => l.slug === "lesson-0-1")!;
  console.log("approve:", JSON.stringify(await setLessonApproval(l01.id, true, adminId)));
  const s2 = (await getCourseReviewState(1))!;
  const l01b = s2.modules.find((m) => m.slug === "getting-started")!.lessons.find((l) => l.slug === "lesson-0-1")!;
  console.log("after approve → drafts:", s2.draftLessonCount, "| l01 published:", l01b.isPublished, "| approvedBy:", l01b.approvedBy);

  console.log("unapprove:", JSON.stringify(await setLessonApproval(l01.id, false, adminId)));
  const s3 = (await getCourseReviewState(1))!;
  const l01c = s3.modules.find((m) => m.slug === "getting-started")!.lessons.find((l) => l.slug === "lesson-0-1")!;
  console.log("after revert → drafts:", s3.draftLessonCount, "| l01 status:", l01c.reviewStatus, "| published:", l01c.isPublished);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
