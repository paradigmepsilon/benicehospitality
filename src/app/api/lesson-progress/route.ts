import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getCurrentSession } from "@/lib/community-auth";
import {
  markLessonComplete,
  unmarkLessonComplete,
  getActiveEnrollment,
} from "@/lib/lms";
import { recordEvent } from "@/lib/analytics";
import { PREVIEW_COOKIE_NAME } from "@/lib/preview-cookie";
import { getPostHogClient } from "@/lib/posthog-server";

interface LessonRefRow {
  course_id: number;
}

async function resolveLesson(lessonId: number): Promise<number | null> {
  const rows = (await sql`
    SELECT course_id FROM course_lessons WHERE id = ${lessonId} LIMIT 1
  `) as LessonRefRow[];
  return rows[0]?.course_id ?? null;
}

async function authorize(lessonId: number) {
  const session = await getCurrentSession();
  if (!session) return { error: "Unauthorized" as const, status: 401 };

  // Block admins-in-preview from writing lesson_progress for their own
  // user_id. The UI hides the "Mark complete" toggle in any preview mode,
  // but a stray fetch / replayed request must not slip through.
  if (session.user.role === "admin") {
    const cookieStore = await cookies();
    if (cookieStore.get(PREVIEW_COOKIE_NAME)?.value) {
      return { error: "Forbidden" as const, status: 403 };
    }
  }

  const courseId = await resolveLesson(lessonId);
  if (!courseId) return { error: "Lesson not found" as const, status: 404 };

  // Admins can mark any lesson; users need an active enrollment.
  if (session.user.role !== "admin") {
    const enrollment = await getActiveEnrollment(session.user.id, courseId);
    if (!enrollment) return { error: "Forbidden" as const, status: 403 };
  }

  return { userId: session.user.id };
}

function parseBody(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const id = (body as { lessonId?: unknown }).lessonId;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const lessonId = parseBody(body);
    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }
    const auth = await authorize(lessonId);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    await markLessonComplete(auth.userId, lessonId);
    void recordEvent({
      userId: auth.userId,
      eventType: "lesson.complete",
      metadata: { lessonId },
    });
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: String(auth.userId),
      event: "lesson_completed",
      properties: { lesson_id: lessonId },
    });
    await posthog.flush();
    return NextResponse.json({ success: true, complete: true });
  } catch (error) {
    console.error("[lesson-progress POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const lessonId = parseBody(body);
    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }
    const auth = await authorize(lessonId);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    await unmarkLessonComplete(auth.userId, lessonId);
    return NextResponse.json({ success: true, complete: false });
  } catch (error) {
    console.error("[lesson-progress DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
