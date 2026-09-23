import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { createEngagement, listEngagements } from "@/lib/fleet/engagements";
import { OWNERS, type OwnerKey } from "@/lib/fleet/journey";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  return NextResponse.json({ engagements: await listEngagements() });
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
    return NextResponse.json({ error: "Owner name is required" }, { status: 400 });
  }
  const owner = (OWNERS as readonly string[]).includes(body.owner as string)
    ? (body.owner as OwnerKey)
    : "alex";
  // Same rule as parsePatch: a bad state code is refused, never truncated to
  // two letters that happen to name a different state.
  const marketState = clean(body.marketState, 20);
  if (marketState && !/^[A-Za-z]{2}$/.test(marketState)) {
    return NextResponse.json({ error: "marketState must be a two-letter state code" }, { status: 400 });
  }

  const session = await getSession();
  const { id } = await createEngagement(
    {
      clientName,
      email: clean(body.email, 200),
      phone: clean(body.phone, 40),
      marketCity: clean(body.marketCity, 100),
      marketState: marketState?.toUpperCase() ?? null,
      source: clean(body.source, 100),
      owner,
      pipelineContactId: positiveInt(body.pipelineContactId),
      applicationId: positiveInt(body.applicationId),
    },
    session?.name || session?.email || null,
  );
  return NextResponse.json({ id }, { status: 201 });
}
