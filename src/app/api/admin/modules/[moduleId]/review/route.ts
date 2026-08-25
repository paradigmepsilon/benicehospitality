import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth";
import { setModuleApproval } from "@/lib/course-review";

const bodySchema = z.object({ approved: z.boolean() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const auth = await requireAdminUser(request);
  if (auth.error) return auth.error;

  const { moduleId: idRaw } = await params;
  const moduleId = Number(idRaw);
  if (!Number.isFinite(moduleId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await setModuleApproval(moduleId, body.approved, auth.userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}
