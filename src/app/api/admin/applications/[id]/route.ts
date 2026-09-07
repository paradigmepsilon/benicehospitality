import { NextResponse } from "next/server";
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

  // Reject an unrecognized status here so a typo or stale client never
  // reaches Postgres and trips the table's CHECK constraint as a 500.
  if (!isValidStatus(payload.status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const notes =
    typeof payload.notes === "string"
      ? payload.notes.trim().slice(0, 2000)
      : undefined;

  await updateApplicationStatus(id, payload.status, notes);

  return NextResponse.json({ success: true });
}
