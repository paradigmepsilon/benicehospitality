import { sql } from "@/lib/db";

// Lesson asset = one file in a lesson's bundle. The HTML, the audio MP3s,
// images referenced by the player, and downloadable attachments all live
// here. Bytes are stored as base64 in the `data` column (matches the
// `uploads` pattern; we'll graduate to R2 only when scale forces it).

export type LessonAssetRole =
  | "main_html"
  | "audio"
  | "image"
  | "attachment"
  | "other";

export interface LessonAsset {
  id: number;
  lessonId: number;
  filename: string;
  relativePath: string;
  contentType: string;
  sizeBytes: number;
  role: LessonAssetRole;
  position: number;
  createdAt: string;
}

interface AssetRow {
  id: number;
  lesson_id: number;
  filename: string;
  relative_path: string;
  content_type: string;
  size_bytes: number;
  role: LessonAssetRole;
  position: number;
  created_at: string;
}

function rowToAsset(r: AssetRow): LessonAsset {
  return {
    id: r.id,
    lessonId: r.lesson_id,
    filename: r.filename,
    relativePath: r.relative_path,
    contentType: r.content_type,
    sizeBytes: r.size_bytes,
    role: r.role,
    position: r.position,
    createdAt: r.created_at,
  };
}

// =============================================================================
// Reads
// =============================================================================

export async function listAssetsForLesson(
  lessonId: number,
): Promise<LessonAsset[]> {
  const rows = (await sql`
    SELECT id, lesson_id, filename, relative_path, content_type,
           size_bytes, role, position, created_at
    FROM lesson_assets WHERE lesson_id = ${lessonId}
    ORDER BY position ASC, role, relative_path
  `) as AssetRow[];
  return rows.map(rowToAsset);
}

export async function getAssetByLessonAndPath(
  lessonId: number,
  relativePath: string,
): Promise<{ asset: LessonAsset; data: string } | null> {
  const rows = (await sql`
    SELECT id, lesson_id, filename, relative_path, content_type,
           size_bytes, role, position, created_at, data
    FROM lesson_assets
    WHERE lesson_id = ${lessonId} AND relative_path = ${relativePath}
    LIMIT 1
  `) as Array<AssetRow & { data: string }>;
  if (rows.length === 0) return null;
  const { data, ...rest } = rows[0];
  return { asset: rowToAsset(rest), data };
}

// Metadata-only lookup. Use this when the asset's bytes are too large to pull
// in a single query (Neon HTTP driver caps responses at 64MB). For huge
// assets (video MP4s), fetch the data in chunks via getAssetBytesByRange.
//
// `contentTag` is a cheap cache validator: size plus an md5 over the first
// 128KB of the base64 column. Re-importing a lesson upserts `data` in place
// and leaves `created_at` alone, so there is no timestamp to key an ETag off;
// hashing the whole column per request would be far too expensive on an 8MB
// video. Two different clips essentially never share both a byte length and a
// 128KB prefix, so this changes whenever the asset is replaced.
export async function getAssetMetaByLessonAndPath(
  lessonId: number,
  relativePath: string,
): Promise<(LessonAsset & { contentTag: string }) | null> {
  const rows = (await sql`
    SELECT id, lesson_id, filename, relative_path, content_type,
           size_bytes, role, position, created_at,
           md5(substring(data from 1 for 131072)) AS head_md5
    FROM lesson_assets
    WHERE lesson_id = ${lessonId} AND relative_path = ${relativePath}
    LIMIT 1
  `) as Array<AssetRow & { head_md5: string | null }>;
  if (!rows[0]) return null;
  const { head_md5, ...rest } = rows[0];
  return {
    ...rowToAsset(rest),
    contentTag: `${rest.size_bytes}-${head_md5 ?? "0"}`,
  };
}

// Pull a precise byte range [byteStart, byteEndInclusive] from an asset's
// base64-encoded `data` column. Uses Postgres substring() so we only fetch
// the slice we need — stays under Neon's 64MB single-response cap as long as
// the caller keeps the range under ~45MB. Handles base64 group alignment:
// 4 chars of base64 = 3 bytes of binary, so we round the char window to the
// enclosing 4-char groups, then trim the resulting Buffer to the exact range.
export async function getAssetBytesByRange(
  assetId: number,
  byteStart: number,
  byteEndInclusive: number,
): Promise<Buffer> {
  if (byteEndInclusive < byteStart) return Buffer.alloc(0);
  const groupStart = Math.floor(byteStart / 3);
  const groupEnd = Math.floor(byteEndInclusive / 3);
  const charOffsetOneIndexed = groupStart * 4 + 1; // SQL substring is 1-indexed
  const charCount = (groupEnd - groupStart + 1) * 4;
  const rows = (await sql`
    SELECT substr(data, ${charOffsetOneIndexed}, ${charCount}) AS chunk
    FROM lesson_assets WHERE id = ${assetId}
  `) as Array<{ chunk: string }>;
  if (rows.length === 0 || !rows[0].chunk) return Buffer.alloc(0);
  const groupBytes = Buffer.from(rows[0].chunk, "base64");
  const sliceFrom = byteStart - groupStart * 3;
  const sliceTo = sliceFrom + (byteEndInclusive - byteStart + 1);
  return groupBytes.subarray(sliceFrom, Math.min(sliceTo, groupBytes.length));
}

export async function getAssetById(
  id: number,
): Promise<LessonAsset | null> {
  const rows = (await sql`
    SELECT id, lesson_id, filename, relative_path, content_type,
           size_bytes, role, position, created_at
    FROM lesson_assets WHERE id = ${id} LIMIT 1
  `) as AssetRow[];
  return rows[0] ? rowToAsset(rows[0]) : null;
}

// =============================================================================
// Writes
// =============================================================================

export async function createAsset(opts: {
  lessonId: number;
  filename: string;
  relativePath: string;
  contentType: string;
  data: string; // base64
  sizeBytes: number;
  role?: LessonAssetRole;
  position?: number;
}): Promise<LessonAsset> {
  const rows = (await sql`
    INSERT INTO lesson_assets
      (lesson_id, filename, relative_path, content_type, data, size_bytes, role, position)
    VALUES (
      ${opts.lessonId}, ${opts.filename}, ${opts.relativePath},
      ${opts.contentType}, ${opts.data}, ${opts.sizeBytes},
      ${opts.role ?? "other"}, ${opts.position ?? 0}
    )
    ON CONFLICT (lesson_id, relative_path) DO UPDATE SET
      filename = EXCLUDED.filename,
      content_type = EXCLUDED.content_type,
      data = EXCLUDED.data,
      size_bytes = EXCLUDED.size_bytes,
      role = EXCLUDED.role,
      position = EXCLUDED.position
    RETURNING id, lesson_id, filename, relative_path, content_type,
              size_bytes, role, position, created_at
  `) as AssetRow[];
  return rowToAsset(rows[0]);
}

export async function updateAsset(
  id: number,
  patch: Partial<{
    filename: string;
    relativePath: string;
    role: LessonAssetRole;
    position: number;
  }>,
): Promise<void> {
  if (typeof patch.filename === "string")
    await sql`UPDATE lesson_assets SET filename = ${patch.filename} WHERE id = ${id}`;
  if (typeof patch.relativePath === "string")
    await sql`UPDATE lesson_assets SET relative_path = ${patch.relativePath} WHERE id = ${id}`;
  if (patch.role !== undefined)
    await sql`UPDATE lesson_assets SET role = ${patch.role} WHERE id = ${id}`;
  if (typeof patch.position === "number")
    await sql`UPDATE lesson_assets SET position = ${patch.position} WHERE id = ${id}`;
}

export async function deleteAsset(id: number): Promise<void> {
  await sql`DELETE FROM lesson_assets WHERE id = ${id}`;
}

// =============================================================================
// Helpers: role inference + HTML patcher
// =============================================================================

export function inferRoleFromFilename(
  filename: string,
  contentType: string,
): LessonAssetRole {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "main_html";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("image/")) return "image";
  if (
    lower.endsWith(".pdf") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".ppt")
  ) {
    return "attachment";
  }
  return "other";
}

// Patches a bundle's main HTML so the in-iframe player listens for
// postMessage from the parent, lets us deep-link to a slide, and emits its
// own slide-changed events back. Idempotent — if the marker is already
// present we leave the HTML alone.
export const BUNDLE_PATCH_MARKER = "<!-- bnhg-bundle-bridge -->";

export function patchBundleHtml(html: string): string {
  if (html.includes(BUNDLE_PATCH_MARKER)) return html;
  const bridge = `
${BUNDLE_PATCH_MARKER}
<script>
(function () {
  // Bridge between the BNHG lesson page and the embedded slide player.
  // Listens for { kind: 'goToSlide', slide: N } messages and tries to
  // jump the player. Relies on the player exposing goToSlide(idx) on
  // window or on a 'state' object — both are present in the v4 player.
  function tryJump(slideIndex) {
    try {
      if (typeof window.goToSlide === 'function') {
        window.goToSlide(slideIndex);
        return true;
      }
    } catch (e) {}
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
  // Tell the parent we're ready so it can flush any pending slide jumps.
  try { window.parent.postMessage({ kind: 'bnhg-bundle-ready' }, '*'); } catch (e) {}
})();
</script>`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${bridge}\n</body>`);
  }
  return html + bridge;
}
