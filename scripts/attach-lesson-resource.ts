import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";

// Attach a single resource file to a lesson as a downloadable attachment.
// The lesson page already renders a "Resources" section listing every
// lesson_asset with role='attachment' (see [lessonSlug]/page.tsx).
//
// Usage:
//   node --env-file=.env.local --import tsx scripts/attach-lesson-resource.ts \
//     <courseSlug> <lessonSlug> <filePath> [--position=N]
//
// Idempotent: re-running with the same (lesson, filename) UPDATES the
// existing row via the (lesson_id, relative_path) unique key.

const EXT_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".zip": "application/zip",
};

function inferContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXT_MIME[ext] ?? "application/octet-stream";
}

interface Args {
  courseSlug: string;
  lessonSlug: string;
  filePath: string;
  position?: number;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq < 0) continue;
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length < 3) {
    console.error(
      "Usage: attach-lesson-resource <courseSlug> <lessonSlug> <filePath> [--position=N]",
    );
    process.exit(1);
  }
  return {
    courseSlug: positional[0],
    lessonSlug: positional[1],
    filePath: positional[2],
    position: flags.position ? Number(flags.position) : undefined,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const fileAbs = path.resolve(args.filePath);
  const stat = await fs.stat(fileAbs).catch(() => null);
  if (!stat || !stat.isFile()) {
    console.error(`File not found or not a regular file: ${fileAbs}`);
    process.exit(1);
  }
  const filename = path.basename(fileAbs);

  // Resolve lesson via course + lesson slugs (JOIN through course_modules).
  const lessonRows = (await sql`
    SELECT l.id, l.title, l.position
    FROM course_lessons l
    JOIN course_modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE c.slug = ${args.courseSlug} AND l.slug = ${args.lessonSlug}
    LIMIT 1
  `) as Array<{ id: number; title: string; position: number }>;
  if (lessonRows.length === 0) {
    console.error(
      `Lesson not found: course=${args.courseSlug} lesson=${args.lessonSlug}`,
    );
    process.exit(1);
  }
  const lessonId = lessonRows[0].id;

  const buffer = await fs.readFile(fileAbs);
  const contentType = inferContentType(filename);
  const data = buffer.toString("base64");

  // Sort position within the lesson's attachments. Defaults to 0 if not
  // provided — the Resources UI lists them in (position, role, relative_path)
  // order so multiple attachments with position=0 sort by filename.
  const position = args.position ?? 0;

  await sql`
    INSERT INTO lesson_assets
      (lesson_id, filename, relative_path, content_type, data, size_bytes, role, position)
    VALUES (
      ${lessonId}, ${filename}, ${filename}, ${contentType},
      ${data}, ${buffer.length}, 'attachment', ${position}
    )
    ON CONFLICT (lesson_id, relative_path) DO UPDATE SET
      filename = EXCLUDED.filename,
      content_type = EXCLUDED.content_type,
      data = EXCLUDED.data,
      size_bytes = EXCLUDED.size_bytes,
      role = EXCLUDED.role,
      position = EXCLUDED.position
  `;

  const sizeKb = Math.max(1, Math.round(buffer.length / 1024));
  console.log(
    `✓ Attached ${filename} (${sizeKb} KB, ${contentType}) to lesson #${lessonId} ${args.lessonSlug}`,
  );
}

main().catch((err) => {
  console.error("attach-lesson-resource failed:", err);
  process.exit(1);
});
