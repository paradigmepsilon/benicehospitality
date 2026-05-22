import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import {
  grantEnrollment,
  revokeEnrollmentById,
  type EnrollmentTier,
} from "@/lib/lms";
import { sql } from "@/lib/db";

const VALID_TIERS: EnrollmentTier[] = [
  "self-paced",
  "cohort",
  "operator",
  "comp",
];

interface PostBody {
  userId?: unknown;
  courseId?: unknown;
  tier?: unknown;
  expiresAt?: unknown;
  notes?: unknown;
}

// POST /api/admin/enrollments — grant or upsert enrollment
export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = (await request.json().catch(() => null)) as PostBody | null;
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const userId = Number(body.userId);
    const courseId = Number(body.courseId);
    const tier = body.tier as string;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "userId must be a positive integer" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { error: "courseId must be a positive integer" },
        { status: 400 },
      );
    }
    if (!VALID_TIERS.includes(tier as EnrollmentTier)) {
      return NextResponse.json(
        {
          error: `tier must be one of ${VALID_TIERS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    let expiresAt: Date | null = null;
    if (body.expiresAt) {
      const candidate = new Date(String(body.expiresAt));
      if (Number.isNaN(candidate.getTime())) {
        return NextResponse.json(
          { error: "expiresAt must be an ISO date string" },
          { status: 400 },
        );
      }
      expiresAt = candidate;
    }

    // Verify user + course exist before grant. Failing FK constraints would
    // throw, but a clean 404 is friendlier than a 500.
    const userExists = (await sql`
      SELECT 1 FROM users WHERE id = ${userId} LIMIT 1
    `) as unknown[];
    if (userExists.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const courseExists = (await sql`
      SELECT 1 FROM courses WHERE id = ${courseId} LIMIT 1
    `) as unknown[];
    if (courseExists.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const adminSession = await getSession();
    let grantedByUserId: number | null = null;
    if (adminSession?.email) {
      const rows = (await sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${adminSession.email}) LIMIT 1
      `) as { id: number }[];
      grantedByUserId = rows[0]?.id ?? null;
    }

    const enrollment = await grantEnrollment({
      userId,
      courseId,
      tier: tier as EnrollmentTier,
      grantedByUserId,
      expiresAt,
      notes:
        typeof body.notes === "string" && body.notes.trim()
          ? body.notes.trim()
          : undefined,
    });
    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("[admin/enrollments POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/enrollments?id=N — revoke (soft delete)
export async function DELETE(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Query param `id` must be a positive integer" },
        { status: 400 },
      );
    }
    await revokeEnrollmentById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/enrollments DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
