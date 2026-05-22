import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  createAsset,
  inferRoleFromFilename,
  patchBundleHtml,
  type LessonAssetRole,
} from "@/lib/lesson-assets";
import { getLessonById, updateLesson } from "@/lib/lms";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB — bundle MP3s + HTML fit comfortably.

const ALLOWED_MIME_PREFIXES = ["audio/", "image/", "video/"];
const ALLOWED_EXACT_MIMES = new Set([
  "text/html",
  "application/xhtml+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  // Some browsers report html/MP3 with these alternates.
  "application/octet-stream",
]);

const VALID_ROLES: ReadonlyArray<LessonAssetRole> = [
  "main_html",
  "audio",
  "image",
  "attachment",
  "other",
];

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form body" }, { status: 400 });
  }

  const lessonIdRaw = formData.get("lesson_id");
  const file = formData.get("file") as File | null;
  const relativePathRaw = formData.get("relative_path");
  const roleRaw = formData.get("role");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const lessonId = Number(lessonIdRaw);
  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    return NextResponse.json({ error: "Invalid lesson_id" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` },
      { status: 400 },
    );
  }

  // Permissive MIME check — we want the admin to be able to upload anything
  // sensible for a lesson, but not arbitrary binaries.
  const mime = file.type || "application/octet-stream";
  const allowed =
    ALLOWED_EXACT_MIMES.has(mime) ||
    ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
  if (!allowed) {
    return NextResponse.json(
      { error: `Unsupported file type: ${mime}` },
      { status: 400 },
    );
  }

  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // relative_path defaults to the filename (root-of-bundle). Caller can pass
  // e.g. "audio/voiceover_01.mp3" to nest the file.
  const relativePath = (
    typeof relativePathRaw === "string" && relativePathRaw.trim().length > 0
      ? relativePathRaw.trim()
      : file.name
  )
    // Sanitize: no leading slash, no .. traversal, no backslashes.
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\.\//g, "");

  const role: LessonAssetRole =
    typeof roleRaw === "string" && VALID_ROLES.includes(roleRaw as LessonAssetRole)
      ? (roleRaw as LessonAssetRole)
      : inferRoleFromFilename(file.name, mime);

  const buffer = Buffer.from(await file.arrayBuffer());

  // For HTML uploads we store the patched form so the live serve doesn't
  // need to re-patch on every request. Idempotent: re-uploading the same
  // patched HTML doesn't double-patch.
  const dataBase64 =
    role === "main_html" || mime === "text/html"
      ? Buffer.from(patchBundleHtml(buffer.toString("utf8")), "utf8").toString(
          "base64",
        )
      : buffer.toString("base64");

  const asset = await createAsset({
    lessonId,
    filename: file.name,
    relativePath,
    contentType: mime,
    data: dataBase64,
    sizeBytes: buffer.length,
    role,
  });

  // If this upload is the main HTML, mirror it onto the lesson row so the
  // member render knows which file to iframe.
  if (role === "main_html") {
    await updateLesson(lessonId, {
      bundleMainFilename: relativePath,
      bodyKind: "bundle",
    });
  }

  return NextResponse.json(asset, { status: 201 });
}
