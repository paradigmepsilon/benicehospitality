import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  getLessonById,
  getActiveEnrollment,
  userCanAccessLesson,
} from "@/lib/lms";
import {
  getAssetByLessonAndPath,
  getAssetMetaByLessonAndPath,
  getAssetBytesByRange,
  patchBundleHtml,
} from "@/lib/lesson-assets";

// Cap each Neon read at ~30MB binary (~40MB base64) to stay under the
// driver's 64MB HTTP response cap. Range responses larger than this are
// truncated and the browser re-requests; full-body responses stream
// multiple chunks back-to-back.
const MAX_CHUNK_BYTES = 30 * 1024 * 1024;

// Wildcard asset server. The bundle HTML lives at
//   /api/account/lessons/{id}/asset/{filename}.html
// and references its audio with relative paths like
//   audio/voiceover_03.mp3
// which resolve against the iframe URL, hitting this same route at
//   /api/account/lessons/{id}/asset/audio/voiceover_03.mp3
//
// Audio + video assets need HTTP Range support (Safari refuses to play
// otherwise; Chrome/Firefox use Range for seeking). We honor `Range: bytes=`
// requests with a 206 Partial Content response.
//
// Auth gates: admin OR active enrollment that meets the lesson's min_tier.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string; path: string[] }> },
) {
  const { lessonId: lessonIdRaw, path } = await params;
  const lessonId = Number(lessonIdRaw);
  if (!Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson id" }, { status: 400 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    const enrollment = await getActiveEnrollment(session.user.id, lesson.courseId);
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }
    if (!userCanAccessLesson(enrollment.tier, lesson.minTier, lesson.maxTier)) {
      return NextResponse.json(
        { error: "Tier does not include this lesson" },
        { status: 403 },
      );
    }
  }

  const relativePath = path.join("/");

  // Fetch metadata only — we'll pull bytes via substring() once we know the
  // requested range. This avoids the Neon 64MB single-response cap on large
  // video assets whose base64-encoded data column easily exceeds it.
  const meta = await getAssetMetaByLessonAndPath(lessonId, relativePath);
  if (!meta) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const isHtml =
    meta.role === "main_html" || meta.contentType === "text/html";

  // HTML bundles are small and need patching. Pull the whole data column.
  if (isHtml) {
    const full = await getAssetByLessonAndPath(lessonId, relativePath);
    if (!full) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    const decoded = Buffer.from(full.data, "base64").toString("utf8");
    const patched = patchBundleHtml(decoded);
    const bytes = Buffer.from(patched, "utf8");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  const totalSize = meta.sizeBytes;
  const rangeHeader = request.headers.get("range");

  // Range support — required for <audio>/<video> playback in Safari and
  // for seek operations in Chrome/Firefox. Each response is capped at
  // MAX_CHUNK_BYTES; if the client asks for more, we serve what we can and
  // they re-request the remainder.
  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (match) {
      const startRaw = match[1];
      const endRaw = match[2];
      let start: number;
      let end: number;
      if (startRaw === "" && endRaw !== "") {
        // Suffix range: last N bytes.
        const suffix = Number(endRaw);
        start = Math.max(0, totalSize - suffix);
        end = totalSize - 1;
      } else {
        start = Number(startRaw || 0);
        end = endRaw === "" ? totalSize - 1 : Math.min(Number(endRaw), totalSize - 1);
      }
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start <= end &&
        start < totalSize
      ) {
        const cappedEnd = Math.min(end, start + MAX_CHUNK_BYTES - 1);
        const chunk = await getAssetBytesByRange(meta.id, start, cappedEnd);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            "Content-Type": meta.contentType,
            "Content-Length": String(chunk.length),
            "Content-Range": `bytes ${start}-${cappedEnd}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "private, max-age=300",
          },
        });
      }
      // Malformed / unsatisfiable range → 416
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${totalSize}`,
          "Accept-Ranges": "bytes",
        },
      });
    }
  }

  // No Range header → stream the full asset in MAX_CHUNK_BYTES slices.
  // Browsers issuing `<video src=...>` usually start with Range immediately,
  // but tools like curl will hit this path. ReadableStream lets us return
  // 100MB+ without ever pulling the whole base64 column at once.
  const assetId = meta.id;
  let offset = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (offset >= totalSize) {
        controller.close();
        return;
      }
      const sliceEnd = Math.min(offset + MAX_CHUNK_BYTES - 1, totalSize - 1);
      const buf = await getAssetBytesByRange(assetId, offset, sliceEnd);
      if (buf.length === 0) {
        controller.close();
        return;
      }
      controller.enqueue(new Uint8Array(buf));
      offset = sliceEnd + 1;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": meta.contentType,
      "Content-Length": String(totalSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=300",
    },
  });
}
