import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateApplicationStatus } from "@/lib/management/applications";

// Mirrors the CHECK constraint on management_applications.status exactly.
// Keep this list in sync with scripts/migrate.ts if that constraint changes.
const VALID_STATUSES = [
  "new",
  "contacted",
  "call_booked",
  "qualified",
  "declined",
  "signed",
] as const;
type ApplicationStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUSES as readonly string[]).includes(value)
  );
}

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid application id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as { status?: unknown; notes?: unknown };

  // Status is optional on this route. The admin page fetches once on mount
  // and never polls, so the only status a tab knows is whatever was true at
  // load time. A booking moves a row to call_booked with no admin action at
  // all, so re-requiring status on every write would mean a plain notes edit
  // in a tab left open across that transition silently writes the old
  // status back over the new one. Treat "status omitted" as "leave status
  // alone" instead.
  const hasStatus = payload.status !== undefined;

  // Reject an unrecognized status here so a typo or stale client never
  // reaches Postgres and trips the table's CHECK constraint as a 500.
  if (hasStatus && !isValidStatus(payload.status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const notes =
    typeof payload.notes === "string"
      ? payload.notes.trim().slice(0, 2000)
      : undefined;

  if (!hasStatus) {
    if (notes === undefined) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      );
    }
    // Notes-only write: touch nothing but notes, so a concurrent status
    // change (admin-driven or the automatic call_booked transition) is
    // never clobbered by a stale value from this tab.
    await sql`
      UPDATE management_applications
      SET notes = ${notes}, updated_at = NOW()
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  }

  await updateApplicationStatus(id, payload.status as ApplicationStatus, notes);

  return NextResponse.json({ success: true });
}
