import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getLessonById, userCanAccessLesson } from "@/lib/lms";
import {
  PREVIEW_COOKIE_NAME,
  parsePreviewCookie,
} from "@/lib/preview-cookie";

// Admin "Preview" deep link from the course review tab. /account/* bounces
// admins back to /admin unless a member-preview cookie is set, so a bare link
// to the lesson player never lands. This route enters preview mode first
// (keeping the admin's current preview tier when it can already see the
// lesson, else the lesson's own min tier) and then redirects to the player.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { lessonId: idRaw } = await params;
  const lessonId = Number(idRaw);
  if (!Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  const courseRows = (await sql`
    SELECT slug FROM courses WHERE id = ${lesson.courseId} LIMIT 1
  `) as Array<{ slug: string }>;
  if (!courseRows[0]) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const currentRaw = cookieHeader.match(
    new RegExp(`(?:^|; )${PREVIEW_COOKIE_NAME}=([^;]+)`),
  )?.[1];
  const current = parsePreviewCookie(currentRaw);
  const keepCurrent =
    current !== null &&
    userCanAccessLesson(current, lesson.minTier, lesson.maxTier);
  const tier = keepCurrent ? current : (lesson.minTier ?? "self-paced");

  const target = new URL(
    `/account/courses/${courseRows[0].slug}/${lesson.slug}`,
    request.url,
  );
  const response = NextResponse.redirect(target, 302);
  response.cookies.set(PREVIEW_COOKIE_NAME, tier, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
