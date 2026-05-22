import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/community-auth";
import {
  listResourcesForTier,
  getEffectiveTierForUser,
} from "@/lib/resources";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const effective =
    session.user.role === "admin"
      ? "admin"
      : await getEffectiveTierForUser(session.user.id);
  const resources = await listResourcesForTier(effective);
  return NextResponse.json({ resources });
}
