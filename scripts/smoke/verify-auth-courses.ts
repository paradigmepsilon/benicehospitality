import { neon } from "@neondatabase/serverless";

async function verify() {
  const sql = neon(process.env.DATABASE_URL!);

  const users = (await sql`
    SELECT id, email, name, role, created_at FROM users ORDER BY id
  `) as Array<{ id: number; email: string; name: string; role: string }>;

  const courses = (await sql`
    SELECT id, slug, title, is_published, is_placeholder,
      (SELECT COUNT(*) FROM course_lessons WHERE course_id = courses.id) AS lesson_count
    FROM courses ORDER BY id
  `) as Array<{
    id: number;
    slug: string;
    title: string;
    is_published: boolean;
    is_placeholder: boolean;
    lesson_count: number;
  }>;

  const enrollments = (await sql`
    SELECT e.id, u.email, c.slug AS course_slug, e.tier, e.status
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.id
  `) as Array<{
    id: number;
    email: string;
    course_slug: string;
    tier: string;
    status: string;
  }>;

  console.log("Users:");
  for (const u of users) console.log(`  ${u.role.padEnd(5)} ${u.email}`);

  console.log("\nCourses:");
  for (const c of courses) {
    const flags = [
      c.is_published ? "published" : "draft",
      c.is_placeholder ? "placeholder" : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.log(
      `  ${c.slug.padEnd(20)} (${flags}) — ${c.lesson_count} lessons`,
    );
  }

  console.log("\nEnrollments:");
  for (const e of enrollments) {
    console.log(
      `  ${e.email.padEnd(35)} → ${e.course_slug.padEnd(20)} [${e.tier}, ${e.status}]`,
    );
  }
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
