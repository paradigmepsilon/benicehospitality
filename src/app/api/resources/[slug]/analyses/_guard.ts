import { NextResponse } from "next/server";
import { getResourceTool } from "@/lib/resources/registry";
import { getCurrentSession } from "@/lib/community-auth";
import { getAnalysisTool, type AnalysisToolSpec } from "@/lib/resources/analysis-schemas";
import { isAdminPreviewing } from "@/lib/resources/preview-guard";
import { resourceAnalysisLimiter, getClientIp } from "@/lib/rate-limit";

// The guard chain every analyses route runs, in one place so the six handlers
// cannot drift apart on the order or on a status code.
//
// Order matters: slug checks before auth so an unknown tool 404s for everyone
// rather than leaking that authentication is what you were missing; the rate
// limit after auth so an anonymous flood cannot consume a member's budget.

/** Max serialized payload. Same threshold and shape as the state route's 413. */
export const MAX_PAYLOAD_BYTES = 256_000;

export interface GuardOk {
  ok: true;
  userId: number;
  /** Carried so a write path can record the one-time CRM lead without a second
   *  session read. Only ever used when the shelf upsert reports an INSERT. */
  email: string;
  name: string;
  slug: string;
  spec: AnalysisToolSpec;
}

export type GuardResult = GuardOk | { ok: false; response: NextResponse };

function fail(body: Record<string, unknown>, status: number): GuardResult {
  return { ok: false, response: NextResponse.json(body, { status }) };
}

export async function guardAnalysisWrite(
  request: Request,
  slug: string,
): Promise<GuardResult> {
  if (!getResourceTool(slug)) return fail({ error: "Unknown tool." }, 404);

  // In the registry but not analysis-enabled. Same 404 — from the caller's
  // point of view this endpoint genuinely does not exist for that tool.
  const spec = getAnalysisTool(slug);
  if (!spec) return fail({ error: "Unknown tool." }, 404);

  const session = await getCurrentSession();
  if (!session) return fail({ error: "Not authenticated." }, 401);

  if (!resourceAnalysisLimiter.check(getClientIp(request)).success) {
    return fail({ error: "Too many requests." }, 429);
  }

  // A real 403, not the save route's fake success: handing a previewing admin a
  // fabricated analysis id would make the next autosave PATCH 404 against a row
  // that was never written.
  if (await isAdminPreviewing(session.user.role)) {
    return fail(
      { error: "Preview mode is read-only.", preview: true },
      403,
    );
  }

  return {
    ok: true,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    slug,
    spec,
  };
}

/** Read path. Anonymous gets an empty list rather than a 401 so the client can stay branchless. */
export async function guardAnalysisRead(
  request: Request,
  slug: string,
): Promise<GuardResult | { ok: false; anonymous: true }> {
  if (!getResourceTool(slug)) return fail({ error: "Unknown tool." }, 404);
  const spec = getAnalysisTool(slug);
  if (!spec) return fail({ error: "Unknown tool." }, 404);

  const session = await getCurrentSession();
  if (!session) return { ok: false, anonymous: true };

  if (!resourceAnalysisLimiter.check(getClientIp(request)).success) {
    return fail({ error: "Too many requests." }, 429);
  }

  // Previewing admins see an empty shelf rather than their own real analyses
  // surfaced under a member's identity — the same choice /account/resources
  // already makes.
  if (await isAdminPreviewing(session.user.role)) {
    return { ok: false, anonymous: true };
  }

  return {
    ok: true,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    slug,
    spec,
  };
}

export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON." }, { status: 400 }),
    };
  }
}

/** Guards a runaway payload before it reaches Postgres. */
export function payloadTooLarge(data: unknown): boolean {
  if (data === undefined) return false;
  return JSON.stringify(data ?? {}).length > MAX_PAYLOAD_BYTES;
}

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
