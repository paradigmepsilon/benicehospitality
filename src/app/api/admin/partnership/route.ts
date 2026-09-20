import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import {
  countFoundingClients,
  createEngagement,
  listEngagements,
} from "@/lib/partnership/engagements";
import { OWNERS, type OwnerKey } from "@/lib/partnership/journey";

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
  const contactId = Number(body.pipelineContactId);

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
      pipelineContactId: Number.isInteger(contactId) && contactId > 0 ? contactId : null,
    },
    session?.name || session?.email || null,
  );
  return NextResponse.json({ id }, { status: 201 });
}
