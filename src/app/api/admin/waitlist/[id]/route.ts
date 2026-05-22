import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const VALID_STATUSES = ["pending", "notified", "enrolled", "dismissed"] as const;
type WaitlistStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is WaitlistStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUSES as readonly string[]).includes(value)
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { status?: unknown; notes?: unknown };
  const status =
    payload.status !== undefined && isValidStatus(payload.status)
      ? payload.status
      : null;
  const notes =
    typeof payload.notes === "string" ? payload.notes.trim().slice(0, 2000) : null;

  if (status === null && notes === null) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 },
    );
  }

  // Build the update. Set notified_at when transitioning into 'notified'.
  let result;
  if (status !== null && notes !== null) {
    result = await sql`
      UPDATE course_waitlist
      SET status = ${status},
          notes = ${notes},
          notified_at = CASE WHEN ${status} = 'notified' AND notified_at IS NULL THEN NOW() ELSE notified_at END
      WHERE id = ${id}
      RETURNING id, status, notes, notified_at
    `;
  } else if (status !== null) {
    result = await sql`
      UPDATE course_waitlist
      SET status = ${status},
          notified_at = CASE WHEN ${status} = 'notified' AND notified_at IS NULL THEN NOW() ELSE notified_at END
      WHERE id = ${id}
      RETURNING id, status, notified_at
    `;
  } else {
    result = await sql`
      UPDATE course_waitlist
      SET notes = ${notes}
      WHERE id = ${id}
      RETURNING id, notes
    `;
  }

  if (result.length === 0) {
    return NextResponse.json({ error: "Signup not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, signup: result[0] });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const result = await sql`
    DELETE FROM course_waitlist WHERE id = ${id} RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Signup not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
