import { sql } from "@/lib/db";
import type { ApplicationInput } from "./validate";

export interface ApplicationRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  asset: "car" | "rooms";
  assetCount: number;
  state: string;
  city: string | null;
  currentStatus: string;
  timeline: string;
  wants: string | null;
  heardFrom: string | null;
  status: string;
  bookingId: number | null;
  notes: string | null;
  createdAt: string;
}

export async function createApplication(
  input: ApplicationInput,
): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO management_applications
      (name, email, phone, asset, asset_count, state, city,
       current_status, timeline, wants, heard_from)
    VALUES
      (${input.name}, ${input.email}, ${input.phone || null}, ${input.asset},
       ${input.assetCount}, ${input.state}, ${input.city || null},
       ${input.currentStatus}, ${input.timeline}, ${input.wants || null},
       ${input.heardFrom || null})
    RETURNING id
  `;
  return { id: Number(rows[0].id) };
}

export async function listApplications(
  opts: { status?: string; limit?: number } = {},
): Promise<ApplicationRow[]> {
  const limit = Math.min(opts.limit ?? 200, 500);
  const rows = opts.status
    ? await sql`
        SELECT * FROM management_applications
        WHERE status = ${opts.status}
        ORDER BY created_at DESC LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM management_applications
        ORDER BY created_at DESC LIMIT ${limit}
      `;
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    email: r.email,
    phone: r.phone,
    asset: r.asset,
    assetCount: Number(r.asset_count),
    state: r.state,
    city: r.city,
    currentStatus: r.current_status,
    timeline: r.timeline,
    wants: r.wants,
    heardFrom: r.heard_from,
    status: r.status,
    bookingId: r.booking_id === null ? null : Number(r.booking_id),
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function updateApplicationStatus(
  id: number,
  status: string,
  notes?: string,
): Promise<void> {
  if (notes === undefined) {
    await sql`
      UPDATE management_applications
      SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return;
  }
  await sql`
    UPDATE management_applications
    SET status = ${status}, notes = ${notes}, updated_at = NOW() WHERE id = ${id}
  `;
}
