import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price_cents: z.number().int().positive().optional(),
  position: z.number().int().optional(),
  is_published: z.boolean().optional(),
});

// Note: changing price_cents requires running `npm run stripe:sync` to
// publish a new Stripe Price (Stripe Prices are immutable). The admin UI
// surfaces a banner reminder; we don't trigger Stripe from here.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tierId: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { tierId: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.name === "string")
    await sql`UPDATE course_tiers SET name = ${body.name}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof body.description === "string")
    await sql`UPDATE course_tiers SET description = ${body.description}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof body.price_cents === "number")
    // Clearing stripe_price_id forces sync-stripe-prices.ts to mint a new
    // Stripe Price on next run.
    await sql`
      UPDATE course_tiers
      SET price_cents = ${body.price_cents}, stripe_price_id = NULL, updated_at = NOW()
      WHERE id = ${id}
    `;
  if (typeof body.position === "number")
    await sql`UPDATE course_tiers SET position = ${body.position}, updated_at = NOW() WHERE id = ${id}`;
  if (typeof body.is_published === "boolean")
    await sql`UPDATE course_tiers SET is_published = ${body.is_published}, updated_at = NOW() WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tierId: string }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { tierId: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await sql`DELETE FROM course_tiers WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
