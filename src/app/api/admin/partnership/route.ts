import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import {
  countFoundingClients,
  createEngagement,
  listEngagements,
} from "@/lib/partnership/engagements";
import { OWNERS, type OwnerKey } from "@/lib/partnership/journey";
import { markApplicationQualified } from "@/lib/management/applications";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const [engagements, foundingCount] = await Promise.all([
    listEngagements(),
    countFoundingClients(),
  ]);
  return NextResponse.json({ engagements, foundingCount });
}

function clean(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function positiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const clientName = clean(body.clientName, 200);
  if (!clientName) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }
  const owner = (OWNERS as readonly string[]).includes(body.owner as string)
    ? (body.owner as OwnerKey)
    : "della";
  const applicationId = positiveInt(body.applicationId);

  const session = await getSession();
  const { id } = await createEngagement(
    {
      clientName,
      email: clean(body.email, 200),
      phone: clean(body.phone, 40),
      propertyLabel: clean(body.propertyLabel, 200),
      propertyCity: clean(body.propertyCity, 100),
      propertyState: clean(body.propertyState, 2)?.toUpperCase() ?? null,
      source: clean(body.source, 100),
      owner,
      pipelineContactId: positiveInt(body.pipelineContactId),
      applicationId,
    },
    session?.name || session?.email || null,
  );
  // Starting a card is the "we are pursuing this" decision, so the application
  // moves to qualified on its own. Best effort: the card is already saved.
  if (applicationId) {
    try {
      await markApplicationQualified(applicationId);
    } catch (err) {
      console.error("[partnership] application status update failed:", err);
    }
  }
  return NextResponse.json({ id }, { status: 201 });
}
