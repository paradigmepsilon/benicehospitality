import { NextResponse } from "next/server";
import {
  copyName,
  duplicateAnalysis,
  getAnalysis,
  MAX_ANALYSES_PER_TOOL,
} from "@/lib/resources/analyses";
import { analysisDuplicateBodySchema } from "@/lib/validation/resource-analyses";
import { guardAnalysisWrite, parseId, readJsonBody } from "../../_guard";

// Copy an analysis. Server-side INSERT … SELECT so the client never has to
// round-trip a 200KB payload up and back down just to clone it.

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const guard = await guardAnalysisWrite(request, slug);
  if (!guard.ok) return guard.response;

  // A name is optional; the body itself may be absent entirely.
  let name: string | undefined;
  const raw = await readJsonBody(request).catch(() => null);
  if (raw && raw.ok) {
    const parsed = analysisDuplicateBodySchema.safeParse(raw.body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    name = parsed.data.name;
  }

  try {
    if (!name) {
      const source = await getAnalysis(guard.userId, slug, id);
      if (!source) return NextResponse.json({ error: "Not found." }, { status: 404 });
      name = copyName(source.name);
    }

    const result = await duplicateAnalysis({
      userId: guard.userId,
      toolSlug: slug,
      id,
      name,
    });

    if (result === null) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    if (result === "cap") {
      return NextResponse.json(
        {
          error: `You can keep up to ${MAX_ANALYSES_PER_TOOL} analyses. Delete one to add another.`,
          cap: MAX_ANALYSES_PER_TOOL,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ analysis: result }, { status: 201 });
  } catch (err) {
    console.error("[resources/analyses] duplicate failed:", err);
    return NextResponse.json({ error: "Could not duplicate." }, { status: 500 });
  }
}
