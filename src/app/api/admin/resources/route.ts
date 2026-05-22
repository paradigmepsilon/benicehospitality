import { NextResponse } from "next/server";
import { requireAuth, getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { createResource, type ResourceTier } from "@/lib/resources";

const VALID_TIERS: ResourceTier[] = ["any", "cohort", "operator"];

interface PostBody {
  title?: unknown;
  summary?: unknown;
  body?: unknown;
  fileUploadId?: unknown;
  externalUrl?: unknown;
  requiredTier?: unknown;
  isPublished?: unknown;
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = (await request.json().catch(() => null)) as PostBody | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    if (title.length < 4) {
      return NextResponse.json(
        { error: "title must be at least 4 characters" },
        { status: 400 },
      );
    }
    const tier = body.requiredTier as string;
    if (!VALID_TIERS.includes(tier as ResourceTier)) {
      return NextResponse.json(
        { error: `requiredTier must be one of ${VALID_TIERS.join(", ")}` },
        { status: 400 },
      );
    }

    const adminSession = await getSession();
    let createdByUserId: number | null = null;
    if (adminSession?.email) {
      const rows = (await sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${adminSession.email}) LIMIT 1
      `) as { id: number }[];
      createdByUserId = rows[0]?.id ?? null;
    }
    if (createdByUserId === null) {
      return NextResponse.json(
        { error: "Cannot resolve admin user" },
        { status: 500 },
      );
    }

    const resource = await createResource({
      title,
      summary: typeof body.summary === "string" ? body.summary : "",
      body: typeof body.body === "string" ? body.body : "",
      fileUploadId:
        typeof body.fileUploadId === "number" ? body.fileUploadId : null,
      externalUrl:
        typeof body.externalUrl === "string" && body.externalUrl.trim()
          ? body.externalUrl.trim()
          : null,
      requiredTier: tier as ResourceTier,
      isPublished:
        typeof body.isPublished === "boolean" ? body.isPublished : true,
      createdByUserId,
    });
    return NextResponse.json({ resource });
  } catch (err) {
    console.error("[admin/resources POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
