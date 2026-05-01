import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getAuditByToken } from "@/lib/audit/token";
import type { AuditData, DimensionKey } from "@/lib/types/audit";

const VIEW_COOKIE = "audit_view_id";

function findLowestDimensionKey(audit: AuditData): DimensionKey {
  const entries = Object.entries(audit.dimensions) as Array<
    [DimensionKey, { subscore: number }]
  >;
  let lowestKey = entries[0][0];
  let lowestScore = entries[0][1].subscore;
  for (const [key, value] of entries) {
    if (value.subscore < lowestScore) {
      lowestKey = key;
      lowestScore = value.subscore;
    }
  }
  return lowestKey;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const cookieStore = await cookies();
  const auditViewIdRaw = cookieStore.get(VIEW_COOKIE)?.value;
  const auditViewId = auditViewIdRaw ? parseInt(auditViewIdRaw, 10) : NaN;
  if (!Number.isFinite(auditViewId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const audit = await getAuditByToken(token);
  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const viewRows = await sql`
    SELECT id FROM audit_views WHERE id = ${auditViewId} AND audit_id = ${audit.id} LIMIT 1
  `;
  if (viewRows.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lowest = findLowestDimensionKey(audit.audit_data);
  return NextResponse.json({ recommended_dimension: lowest });
}
