import { sql } from "@/lib/db";
import type { ApplicationInput } from "./validate";
import type { ApplicationStatus } from "./statuses";

export { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "./statuses";

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
  status: ApplicationStatus;
  bookingId: number | null;
  notes: string | null;
  /** BOOKING_SOURCES value of the CTA that sent them to the form, or null. */
  clickSource: string | null;
  /** Tracker cards already started from this application, if any. */
  fleetEngagementId: number | null;
  partnershipEngagementId: number | null;
  createdAt: string;
}

export async function createApplication(
  input: ApplicationInput,
): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO management_applications
      (name, email, phone, asset, asset_count, state, city,
       current_status, timeline, wants, heard_from, click_source)
    VALUES
      (${input.name}, ${input.email}, ${input.phone || null}, ${input.asset},
       ${input.assetCount}, ${input.state}, ${input.city || null},
       ${input.currentStatus}, ${input.timeline}, ${input.wants || null},
       ${input.heardFrom || null}, ${input.clickSource})
    RETURNING id
  `;
  return { id: Number(rows[0].id) };
}

export async function listApplications(
  opts: { status?: string; limit?: number } = {},
): Promise<ApplicationRow[]> {
  const limit = Math.min(opts.limit ?? 200, 500);
  // The two subselects are what let the list say "open the card" instead of
  // "start a card" once one exists. Oldest card wins if there are ever two.
  const rows = opts.status
    ? await sql`
        SELECT a.*,
          (SELECT f.id FROM fleet_engagements f WHERE f.application_id = a.id ORDER BY f.id LIMIT 1) AS fleet_engagement_id,
          (SELECT p.id FROM partnership_engagements p WHERE p.application_id = a.id ORDER BY p.id LIMIT 1) AS partnership_engagement_id
        FROM management_applications a
        WHERE a.status = ${opts.status}
        ORDER BY a.created_at DESC LIMIT ${limit}
      `
    : await sql`
        SELECT a.*,
          (SELECT f.id FROM fleet_engagements f WHERE f.application_id = a.id ORDER BY f.id LIMIT 1) AS fleet_engagement_id,
          (SELECT p.id FROM partnership_engagements p WHERE p.application_id = a.id ORDER BY p.id LIMIT 1) AS partnership_engagement_id
        FROM management_applications a
        ORDER BY a.created_at DESC LIMIT ${limit}
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
    clickSource: r.click_source ?? null,
    fleetEngagementId: r.fleet_engagement_id == null ? null : Number(r.fleet_engagement_id),
    partnershipEngagementId:
      r.partnership_engagement_id == null ? null : Number(r.partnership_engagement_id),
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

/**
 * Called when a tracker card is created from an application. Only moves an
 * application that is still in the intake states; a declined or signed row
 * is a decision an admin already made and is left alone. Best effort at the
 * call sites: the card must never fail to save because this did.
 */
export async function markApplicationQualified(id: number): Promise<void> {
  await sql`
    UPDATE management_applications
    SET status = 'qualified', updated_at = NOW()
    WHERE id = ${id} AND status IN ('new', 'contacted', 'call_booked')
  `;
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
