import { NextResponse, after } from "next/server";
import {
  deleteAnalysis,
  getAnalysis,
  patchAnalysis,
} from "@/lib/resources/analyses";
import { analysisPatchBodySchema } from "@/lib/validation/resource-analyses";
import {
  guardAnalysisRead,
  guardAnalysisWrite,
  parseId,
  payloadTooLarge,
  readJsonBody,
} from "../_guard";
import { shelveResourceTool } from "@/lib/resources/saved";
import { recordResourceToolLead } from "@/lib/resources/leads";

// A single named analysis: read, write, delete.
//
// Ownership is folded into every SQL WHERE rather than checked here, and "not
// yours" and "does not exist" both return the same 404 body — never confirm a
// row exists to someone who cannot read it.

type Ctx = { params: Promise<{ slug: string; id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { slug, id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const guard = await guardAnalysisRead(request, slug);
  if (!guard.ok) {
    // The single-item read is a hard 401 unlike the collection read: there is
    // no branchless-client argument for an individual document.
    if ("anonymous" in guard) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    return guard.response;
  }

  try {
    const analysis = await getAnalysis(guard.userId, slug, id);
    if (!analysis) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[resources/analyses] read failed:", err);
    return NextResponse.json({ error: "Could not load." }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { slug, id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const guard = await guardAnalysisWrite(request, slug);
  if (!guard.ok) return guard.response;

  const raw = await readJsonBody(request);
  if (!raw.ok) return raw.response;

  const parsed = analysisPatchBodySchema.safeParse(raw.body);
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
    const hasData = parsed.data.data !== undefined;
    const data = hasData ? guard.spec.sanitize(parsed.data.data) : undefined;
    // Only on a data write. A bare rename must not pay for an overrides read.
    const context = hasData ? await guard.spec.loadContext?.() : undefined;

    const outcome = await patchAnalysis({
      userId: guard.userId,
      toolSlug: slug,
      id,
      baseRevision: parsed.data.baseRevision,
      name: parsed.data.name,
      data,
      schemaVersion: hasData ? guard.spec.version : undefined,
      summary: hasData ? guard.spec.summarize(data, context) : undefined,
    });

    if (outcome.status === "not-found") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    if (outcome.status === "conflict") {
      // Carry the server's current row so the client can offer "load theirs /
      // keep mine" without a second round trip.
      return NextResponse.json(
        { error: "stale", analysis: outcome.analysis },
        { status: 409 },
      );
    }
    // A real edit earns the tool its place on the dashboard. Not the create
    // route, which fires on open to give a member their first empty analysis —
    // shelving there would mean simply opening the planner shelved it.
    if (parsed.data.dirty === true) {
      const { userId, email, name } = guard;
      after(async () => {
        try {
          const { inserted } = await shelveResourceTool(userId, slug, "auto-use");
          if (inserted) {
            await recordResourceToolLead({ slug, email, name, userId });
          }
        } catch (shelveErr) {
          console.error("[resources/analyses] shelve failed:", shelveErr);
        }
      });
    }

    return NextResponse.json({ analysis: outcome.analysis });
  } catch (err) {
    console.error("[resources/analyses] patch failed:", err);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const { slug, id: rawId } = await ctx.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const guard = await guardAnalysisWrite(request, slug);
  if (!guard.ok) return guard.response;

  try {
    // Idempotent: a second delete of the same id is a success, not a 404. The
    // client fires this after an 8-second undo window and should never see an
    // error for having already won.
    await deleteAnalysis(guard.userId, slug, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resources/analyses] delete failed:", err);
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
