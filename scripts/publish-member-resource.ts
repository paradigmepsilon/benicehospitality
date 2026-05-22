import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";

// Publish a file as a row in member_resources so it appears at
// /account/resources for enrolled students. Stores the file bytes in the
// uploads table and links via file_upload_id.
//
// Usage:
//   node --env-file=.env.local --import tsx scripts/publish-member-resource.ts \
//     <filePath> --title="..." --summary="..." [--tier=any|cohort|operator] \
//     [--slug=...] [--body="..."]
//
// Idempotent on slug: re-running with the same slug REPLACES the underlying
// upload (orphan upload row is deleted) and updates resource metadata.

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

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "untitled";
}

interface Args {
  filePath: string;
  title: string;
  summary: string;
  body: string;
  tier: "any" | "cohort" | "operator";
  slug?: string;
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
  if (positional.length < 1 || !flags.title) {
    console.error(
      "Usage: publish-member-resource <filePath> --title=\"...\" --summary=\"...\" [--tier=any|cohort|operator] [--slug=...] [--body=\"...\"]",
    );
    process.exit(1);
  }
  const tier = (flags.tier ?? "any") as Args["tier"];
  if (!["any", "cohort", "operator"].includes(tier)) {
    console.error("--tier must be any, cohort, or operator");
    process.exit(1);
  }
  return {
    filePath: positional[0],
    title: flags.title,
    summary: flags.summary ?? "",
    body: flags.body ?? flags.summary ?? "",
    tier,
    slug: flags.slug,
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
    console.error(`File not found: ${fileAbs}`);
    process.exit(1);
  }
  const filename = path.basename(fileAbs);
  const buffer = await fs.readFile(fileAbs);
  const contentType = inferContentType(filename);
  const data = buffer.toString("base64");

  // Use the first admin user as the creator (matches how seed data attributes
  // system-generated rows). For multi-admin teams this could become a flag.
  const adminRows = (await sql`
    SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1
  `) as Array<{ id: number }>;
  if (adminRows.length === 0) {
    console.error("No admin user found — cannot set created_by_user_id");
    process.exit(1);
  }
  const createdBy = adminRows[0].id;

  // Resolve final slug. If user-provided, use as-is (assumed unique or they
  // intend to overwrite). Otherwise derive from title and ensure uniqueness
  // against any other existing slug.
  let slug = args.slug ?? slugify(args.title);
  if (!args.slug) {
    let suffix = 2;
    while (true) {
      const conflict = (await sql`
        SELECT id FROM member_resources WHERE slug = ${slug} LIMIT 1
      `) as Array<{ id: number }>;
      if (conflict.length === 0) break;
      slug = `${slugify(args.title)}-${suffix++}`;
      if (suffix > 100) {
        console.error("Could not find a free slug after 100 attempts");
        process.exit(1);
      }
    }
  }

  // Check for existing resource at this slug — we'll need to swap its
  // upload row to keep things tidy.
  const existing = (await sql`
    SELECT id, file_upload_id FROM member_resources WHERE slug = ${slug} LIMIT 1
  `) as Array<{ id: number; file_upload_id: number | null }>;

  // Insert the new upload first so we have an id to link.
  const uploadRows = (await sql`
    INSERT INTO uploads (filename, content_type, data)
    VALUES (${filename}, ${contentType}, ${data})
    RETURNING id
  `) as Array<{ id: number }>;
  const newUploadId = uploadRows[0].id;

  let resourceId: number;
  if (existing.length === 0) {
    const rows = (await sql`
      INSERT INTO member_resources
        (slug, title, summary, body, file_upload_id, required_tier,
         is_published, created_by_user_id)
      VALUES
        (${slug}, ${args.title}, ${args.summary}, ${args.body}, ${newUploadId},
         ${args.tier}, true, ${createdBy})
      RETURNING id
    `) as Array<{ id: number }>;
    resourceId = rows[0].id;
    console.log(
      `✓ Created member_resource #${resourceId} ${slug} → upload #${newUploadId}`,
    );
  } else {
    resourceId = existing[0].id;
    const oldUploadId = existing[0].file_upload_id;
    await sql`
      UPDATE member_resources
      SET title = ${args.title},
          summary = ${args.summary},
          body = ${args.body},
          file_upload_id = ${newUploadId},
          required_tier = ${args.tier},
          updated_at = NOW()
      WHERE id = ${resourceId}
    `;
    if (oldUploadId !== null) {
      await sql`DELETE FROM uploads WHERE id = ${oldUploadId}`;
    }
    console.log(
      `✓ Updated member_resource #${resourceId} ${slug} → upload #${newUploadId} (replaced upload #${oldUploadId ?? "(none)"})`,
    );
  }

  const sizeKb = Math.max(1, Math.round(buffer.length / 1024));
  console.log(
    `  ${filename} (${sizeKb} KB, ${contentType}) tier=${args.tier} → /account/resources/${slug}`,
  );
}

main().catch((err) => {
  console.error("publish-member-resource failed:", err);
  process.exit(1);
});
