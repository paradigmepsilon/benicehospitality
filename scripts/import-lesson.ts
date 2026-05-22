import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";

// Bulk-import a lesson bundle from a folder on disk. Reads every file,
// infers a role, creates the lesson row + lesson_assets rows.
//
// Usage:
//   node --env-file=.env.local --import tsx scripts/import-lesson.ts \
//     <courseSlug> <moduleSlug> <lessonSlug> <folderPath> \
//     [--title="..."] [--summary="..."] [--position=N] [--minTier=cohort]
//
// Idempotent: re-running on the same folder UPDATES existing assets via
// the (lesson_id, relative_path) unique key.

interface Args {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  folder: string;
  title?: string;
  summary?: string;
  position?: number;
  minTier?: "self-paced" | "cohort" | "operator" | null;
  maxTier?: "self-paced" | "cohort" | "operator" | null;
  mainHtml?: string;
}

const SKIP_FILENAMES = new Set([".DS_Store", ".gitkeep", "Thumbs.db"]);
// Skip the master concatenated voiceover — the player references per-slide
// audio files; the master is redundant and 8MB+ wastes Postgres rows.
const SKIP_GLOB = /^(voiceover|master|combined)\.(mp3|m4a|wav)$/i;

const EXT_MIME: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".srt": "application/x-subrip",
  ".vtt": "text/vtt",
};

function inferContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXT_MIME[ext] ?? "application/octet-stream";
}

function inferRole(
  filename: string,
  contentType: string,
): "main_html" | "audio" | "image" | "attachment" | "other" {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "main_html";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("image/")) return "image";
  if (
    /\.(pdf|docx?|xlsx?|csv|pptx?)$/i.test(lower)
  ) {
    return "attachment";
  }
  return "other";
}

const BUNDLE_PATCH_MARKER = "<!-- bnhg-bundle-bridge -->";
function patchBundleHtml(html: string): string {
  if (html.includes(BUNDLE_PATCH_MARKER)) return html;
  const bridge = `
${BUNDLE_PATCH_MARKER}
<script>
(function () {
  function tryJump(slideIndex) {
    try { if (typeof window.goToSlide === 'function') { window.goToSlide(slideIndex); return true; } } catch (e) {}
    var slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return false;
    slides.forEach(function (s) { s.classList.remove('active'); });
    var clamped = Math.max(0, Math.min(slides.length - 1, slideIndex));
    slides[clamped].classList.add('active');
    return true;
  }
  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data && data.kind === 'goToSlide' && typeof data.slide === 'number') {
      tryJump(Math.max(0, data.slide - 1));
    }
  }, false);
  try { window.parent.postMessage({ kind: 'bnhg-bundle-ready' }, '*'); } catch (e) {}
})();
</script>`;
  if (html.includes("</body>")) return html.replace("</body>", `${bridge}\n</body>`);
  return html + bridge;
}

function parseArgs(argv: string[]): Args {
  // Expect: <courseSlug> <moduleSlug> <lessonSlug> <folder> [--flag=value]*
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
  if (positional.length < 4) {
    console.error(
      "Usage: import-lesson <courseSlug> <moduleSlug> <lessonSlug> <folder> [--title=...] [--summary=...] [--position=N] [--minTier=cohort] [--maxTier=self-paced] [--mainHtml=relative/path.html]",
    );
    process.exit(1);
  }
  const minTier = flags.minTier;
  if (
    minTier !== undefined &&
    !["self-paced", "cohort", "operator"].includes(minTier)
  ) {
    console.error("--minTier must be self-paced, cohort, or operator");
    process.exit(1);
  }
  const maxTier = flags.maxTier;
  if (
    maxTier !== undefined &&
    !["self-paced", "cohort", "operator"].includes(maxTier)
  ) {
    console.error("--maxTier must be self-paced, cohort, or operator");
    process.exit(1);
  }
  return {
    courseSlug: positional[0],
    moduleSlug: positional[1],
    lessonSlug: positional[2],
    folder: positional[3],
    title: flags.title,
    summary: flags.summary,
    position: flags.position ? Number(flags.position) : undefined,
    minTier: (minTier as Args["minTier"]) ?? null,
    maxTier: (maxTier as Args["maxTier"]) ?? null,
    mainHtml: flags.mainHtml,
  };
}

async function walkFolder(
  rootDir: string,
  prefix = "",
): Promise<Array<{ absPath: string; relativePath: string; filename: string }>> {
  const out: Array<{
    absPath: string;
    relativePath: string;
    filename: string;
  }> = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(rootDir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await walkFolder(abs, rel)));
    } else if (entry.isFile()) {
      if (SKIP_FILENAMES.has(entry.name)) continue;
      if (prefix === "" && SKIP_GLOB.test(entry.name)) {
        // Skip master files at the bundle root.
        continue;
      }
      out.push({ absPath: abs, relativePath: rel, filename: entry.name });
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  // Resolve course + module.
  const courseRows = (await sql`
    SELECT id FROM courses WHERE slug = ${args.courseSlug} LIMIT 1
  `) as Array<{ id: number }>;
  if (courseRows.length === 0) {
    console.error(`Course not found: ${args.courseSlug}`);
    process.exit(1);
  }
  const courseId = courseRows[0].id;

  const moduleRows = (await sql`
    SELECT id, title FROM course_modules
    WHERE course_id = ${courseId} AND slug = ${args.moduleSlug} LIMIT 1
  `) as Array<{ id: number; title: string }>;
  if (moduleRows.length === 0) {
    console.error(
      `Module not found: ${args.moduleSlug} (in course ${args.courseSlug})`,
    );
    process.exit(1);
  }
  const moduleId = moduleRows[0].id;
  const moduleTitle = moduleRows[0].title;

  console.log(
    `Course #${courseId} ${args.courseSlug} / Module #${moduleId} ${moduleTitle}`,
  );

  // Walk the folder.
  const folderAbs = path.resolve(args.folder);
  const stat = await fs.stat(folderAbs).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    console.error(`Folder not found or not a directory: ${folderAbs}`);
    process.exit(1);
  }
  const files = await walkFolder(folderAbs);
  if (files.length === 0) {
    console.error("No files in folder.");
    process.exit(1);
  }
  console.log(`Found ${files.length} files in ${folderAbs}`);

  // Find the main HTML candidate. When --mainHtml=<relativePath> is given,
  // pick that file exactly. Otherwise fall back to the editorial/lesson/index
  // heuristic, then the first .html.
  const htmlCandidates = files.filter((f) =>
    /\.(html|htm)$/i.test(f.filename),
  );
  let mainHtml;
  if (args.mainHtml) {
    mainHtml = htmlCandidates.find((f) => f.relativePath === args.mainHtml);
    if (!mainHtml) {
      console.error(
        `--mainHtml="${args.mainHtml}" did not match any HTML file in ${folderAbs}.\n` +
          `Available HTML files:\n${htmlCandidates.map((f) => `  ${f.relativePath}`).join("\n")}`,
      );
      process.exit(1);
    }
  } else {
    mainHtml = htmlCandidates.find((f) => /editorial/i.test(f.filename));
    if (!mainHtml) mainHtml = htmlCandidates.find((f) => /lesson/i.test(f.filename));
    if (!mainHtml) mainHtml = htmlCandidates.find((f) => /^index\./i.test(f.filename));
    if (!mainHtml) mainHtml = htmlCandidates[0];
  }

  // Video lesson detection: if no HTML present and exactly one video file
  // exists, treat it as a video-kind lesson. video_url is computed after
  // INSERT once we have the lesson id.
  const videoCandidates = files.filter((f) =>
    /\.(mp4|webm|mov|m4v)$/i.test(f.filename),
  );
  const mainVideo =
    !mainHtml && videoCandidates.length === 1 ? videoCandidates[0] : undefined;
  const bodyKind: "bundle" | "video" | "text" = mainHtml
    ? "bundle"
    : mainVideo
      ? "video"
      : "text";

  // Upsert lesson row.
  const existingLesson = (await sql`
    SELECT id FROM course_lessons
    WHERE course_id = ${courseId} AND slug = ${args.lessonSlug} LIMIT 1
  `) as Array<{ id: number }>;

  let lessonId: number;
  if (existingLesson.length > 0) {
    lessonId = existingLesson[0].id;
    await sql`
      UPDATE course_lessons SET
        module_id = ${moduleId},
        title = COALESCE(${args.title ?? null}, title),
        summary = COALESCE(${args.summary ?? null}, summary),
        body_kind = ${bodyKind},
        bundle_main_filename = ${mainHtml ? mainHtml.relativePath : null},
        position = ${args.position ?? 0},
        min_tier = ${args.minTier},
        max_tier = ${args.maxTier},
        updated_at = NOW()
      WHERE id = ${lessonId}
    `;
    console.log(`  · Updated lesson #${lessonId} ${args.lessonSlug}`);
  } else {
    const inserted = (await sql`
      INSERT INTO course_lessons (
        course_id, module_id, slug, title, summary, body, position,
        body_kind, bundle_main_filename, min_tier, max_tier
      ) VALUES (
        ${courseId}, ${moduleId}, ${args.lessonSlug},
        ${args.title ?? args.lessonSlug},
        ${args.summary ?? ""},
        '',
        ${args.position ?? 0},
        ${bodyKind},
        ${mainHtml ? mainHtml.relativePath : null},
        ${args.minTier},
        ${args.maxTier}
      )
      RETURNING id
    `) as Array<{ id: number }>;
    lessonId = inserted[0].id;
    console.log(`  ✓ Created lesson #${lessonId} ${args.lessonSlug}`);
  }

  // For video lessons, point video_url at the asset-server path for the mp4.
  // We do this after the INSERT/UPDATE so the lesson id is known.
  if (mainVideo) {
    const videoUrl = `/api/account/lessons/${lessonId}/asset/${mainVideo.relativePath
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    await sql`
      UPDATE course_lessons SET video_url = ${videoUrl}, updated_at = NOW()
      WHERE id = ${lessonId}
    `;
    console.log(`  · video_url = ${videoUrl}`);
  }

  // Upload assets.
  // Neon's serverless HTTP driver caps a single request at 64MB. Files whose
  // base64 representation exceeds CHUNK_SIZE are uploaded as an empty row
  // first, then appended chunk-by-chunk via `data = data || $chunk`. Each
  // chunk stays well under the wire limit. Concatenation in Postgres is
  // O(n²) on the column value but acceptable for an admin import script.
  const CHUNK_SIZE = 32 * 1024 * 1024;
  let uploaded = 0;
  for (const f of files) {
    const buffer = await fs.readFile(f.absPath);
    const contentType = inferContentType(f.filename);
    const role = inferRole(f.filename, contentType);

    let dataBuf = buffer;
    if (role === "main_html" || contentType === "text/html") {
      const patched = patchBundleHtml(buffer.toString("utf8"));
      dataBuf = Buffer.from(patched, "utf8");
    }
    const data = dataBuf.toString("base64");

    if (data.length <= CHUNK_SIZE) {
      await sql`
        INSERT INTO lesson_assets
          (lesson_id, filename, relative_path, content_type, data, size_bytes, role, position)
        VALUES (
          ${lessonId}, ${f.filename}, ${f.relativePath}, ${contentType},
          ${data}, ${dataBuf.length}, ${role}, ${uploaded}
        )
        ON CONFLICT (lesson_id, relative_path) DO UPDATE SET
          filename = EXCLUDED.filename,
          content_type = EXCLUDED.content_type,
          data = EXCLUDED.data,
          size_bytes = EXCLUDED.size_bytes,
          role = EXCLUDED.role,
          position = EXCLUDED.position
      `;
    } else {
      // Start with an empty data column, then concatenate chunks.
      await sql`
        INSERT INTO lesson_assets
          (lesson_id, filename, relative_path, content_type, data, size_bytes, role, position)
        VALUES (
          ${lessonId}, ${f.filename}, ${f.relativePath}, ${contentType},
          '', ${dataBuf.length}, ${role}, ${uploaded}
        )
        ON CONFLICT (lesson_id, relative_path) DO UPDATE SET
          filename = EXCLUDED.filename,
          content_type = EXCLUDED.content_type,
          data = '',
          size_bytes = EXCLUDED.size_bytes,
          role = EXCLUDED.role,
          position = EXCLUDED.position
      `;
      const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await sql`
          UPDATE lesson_assets
          SET data = data || ${chunk}
          WHERE lesson_id = ${lessonId} AND relative_path = ${f.relativePath}
        `;
        const pct = Math.round(((i + 1) / totalChunks) * 100);
        console.log(`      chunk ${i + 1}/${totalChunks} (${pct}%)`);
      }
    }
    uploaded++;
    const sizeKb = Math.round(dataBuf.length / 1024);
    console.log(`    ${role.padEnd(11)} ${f.relativePath} (${sizeKb} KB)`);
  }

  console.log(
    `\nDone. ${uploaded} asset${uploaded === 1 ? "" : "s"} ingested for lesson #${lessonId}.`,
  );
  if (mainHtml) {
    console.log(`Main HTML: ${mainHtml.relativePath}`);
  } else if (mainVideo) {
    console.log(`Main video: ${mainVideo.relativePath}`);
  } else {
    console.warn("No HTML or single video detected. body_kind set to 'text'.");
  }
}

main().catch((err) => {
  console.error("import-lesson failed:", err);
  process.exit(1);
});
