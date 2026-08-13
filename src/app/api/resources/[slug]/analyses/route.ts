import { NextResponse } from "next/server";
import {
  createAnalysis,
  countAnalyses,
  listAnalyses,
  MAX_ANALYSES_PER_TOOL,
} from "@/lib/resources/analyses";
import { analysisCreateBodySchema } from "@/lib/validation/resource-analyses";
import {
  guardAnalysisRead,
  guardAnalysisWrite,
  payloadTooLarge,
  readJsonBody,
} from "./_guard";

// Named analyses for a resource tool: list and create.
//
// Nested under [slug] rather than a sibling static tree so slug validation
// comes for free, and under /api/resources/ rather than /api/account/ because
// src/proxy.ts matches /account/:path* — see the standing note in
// ../save/route.ts. `analyses` sits BELOW [slug], so unlike /api/resources/saved
// it never competes with the dynamic segment for route precedence.

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const guard = await guardAnalysisRead(request, slug);

  if (!guard.ok) {
    if ("anonymous" in guard) {
      return NextResponse.json({
        loggedIn: false,
        analyses: [],
        cap: MAX_ANALYSES_PER_TOOL,
      });
    }
    return guard.response;
  }

  try {
    const analyses = await listAnalyses(guard.userId, slug);
    return NextResponse.json({
      loggedIn: true,
      analyses,
      cap: MAX_ANALYSES_PER_TOOL,
    });
  } catch (err) {
    console.error("[resources/analyses] list failed:", err);
    return NextResponse.json({ error: "Could not load." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const guard = await guardAnalysisWrite(request, slug);
  if (!guard.ok) return guard.response;

  const raw = await readJsonBody(request);
  if (!raw.ok) return raw.response;

  const parsed = analysisCreateBodySchema.safeParse(raw.body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (payloadTooLarge(parsed.data.data)) {
    return NextResponse.json({ error: "Analysis too large." }, { status: 413 });
  }

  try {
    const existing = await countAnalyses(guard.userId, slug);
    const data = guard.spec.sanitize(parsed.data.data ?? {});
    // The planner's context is the admin's cost overrides, so the stored
    // summary matches what the tool itself renders.
    const context = await guard.spec.loadContext?.();

    const analysis = await createAnalysis({
      userId: guard.userId,
      toolSlug: slug,
      name: parsed.data.name ?? guard.spec.defaultName(existing),
      data,
      schemaVersion: guard.spec.version,
      // Always recomputed here, never taken from the request — otherwise a
      // shared dashboard is one fetch away from "my property nets $9,999,999".
      summary: guard.spec.summarize(data, context),
    });

    if (!analysis) {
      return NextResponse.json(
        {
          error: `You can keep up to ${MAX_ANALYSES_PER_TOOL} analyses. Delete one to add another.`,
          cap: MAX_ANALYSES_PER_TOOL,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (err) {
    console.error("[resources/analyses] create failed:", err);
    return NextResponse.json({ error: "Could not create." }, { status: 500 });
  }
}
