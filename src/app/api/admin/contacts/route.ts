import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const contacts = await sql`
    SELECT * FROM contact_submissions ORDER BY submitted_at DESC
  `;

  return NextResponse.json(contacts);
}
