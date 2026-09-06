import { NextResponse } from "next/server";
import { processDueNurture } from "@/lib/nurture/engine";

// Resend and Neon both need Node APIs.
export const runtime = "nodejs";

/**
 * Vercel cron (see vercel.json, every 15 minutes): send every due course
 * nurture step once. Same header gate as /api/cron/process-nurture.
 */
async function handle(request: Request) {
  if (!request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await processDueNurture({ limit: 100 });
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
