import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  updateResource,
  deleteResource,
  type ResourceTier,
} from "@/lib/resources";

const VALID_TIERS: ResourceTier[] = ["any", "cohort", "operator"];

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface PatchBody {
  title?: unknown;
  summary?: unknown;
  body?: unknown;
  fileUploadId?: unknown;
  externalUrl?: unknown;
  requiredTier?: unknown;
  isPublished?: unknown;
}

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Parameters<typeof updateResource>[1] = {};
  if (typeof body.title === "string" && body.title.trim().length >= 4) {
    patch.title = body.title.trim();
  }
  if (typeof body.summary === "string") patch.summary = body.summary;
  if (typeof body.body === "string") patch.body = body.body;
  if (body.fileUploadId === null || typeof body.fileUploadId === "number") {
    patch.fileUploadId = body.fileUploadId;
  }
  if (body.externalUrl === null || typeof body.externalUrl === "string") {
    patch.externalUrl =
      typeof body.externalUrl === "string"
        ? body.externalUrl.trim() || null
        : null;
  }
  if (typeof body.requiredTier === "string") {
    if (!VALID_TIERS.includes(body.requiredTier as ResourceTier)) {
      return NextResponse.json(
        { error: `requiredTier must be one of ${VALID_TIERS.join(", ")}` },
        { status: 400 },
      );
    }
    patch.requiredTier = body.requiredTier as ResourceTier;
  }
  if (typeof body.isPublished === "boolean") patch.isPublished = body.isPublished;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }
  await updateResource(id, patch);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await deleteResource(id);
  return NextResponse.json({ success: true });
}
