import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await sql`
    SELECT content_type, data FROM uploads WHERE id = ${id}
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const { content_type, data } = result[0];
  const buffer = Buffer.from(data, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": content_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
