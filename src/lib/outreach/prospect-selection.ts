import { sql } from "@/lib/db";

export interface SelectedProspect {
  id: number;
  name: string;
  email: string;
  hotel_name: string | null;
  hotel_location: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  fit_quality: string | null;
  region: string | null;
  state: string | null;
  city: string | null;
  owner_role: string | null;
  company: string | null;
  notes: string | null;
  room_count: string | null;
  pipeline_stage: string;
}

export interface SelectOptions {
  /**
   * When true, prospects that have ever been added to a campaign (any status —
   * sent, replied, rejected, anything) are excluded. Used by the campaign
   * creator and the auto-replenish flow so we never re-pick someone who's
   * already been touched.
   */
  excludeAlreadyTargeted?: boolean;
  /**
   * Additional prospect ids to exclude (e.g. the prospect being replaced
   * during reject-replenish, even if their target is being marked cancelled
   * in the same transaction).
   */
  excludeIds?: number[];
}

/**
 * Pick the next batch of prospects to put into a campaign.
 *
 * Order: A-tier first, then B, then C, then unrated. Within a tier, prefer
 * prospects that have never been part of an outbound campaign yet, then fall
 * back to most-recently imported. We only pull from stage='prospect' (not yet
 * contacted) to avoid double-touching anyone already in flight.
 */
export async function selectTopProspects(
  limit: number,
  opts: SelectOptions = {},
): Promise<SelectedProspect[]> {
  const exclude = opts.excludeIds && opts.excludeIds.length > 0 ? opts.excludeIds : [-1];
  const excludeAlready = opts.excludeAlreadyTargeted ?? false;
  const rows = await sql`
    SELECT
      pc.id, pc.name, pc.email, pc.hotel_name, pc.hotel_location,
      pc.website_url, pc.linkedin_url, pc.fit_quality, pc.region, pc.state, pc.city,
      pc.owner_role, pc.company, pc.notes, pc.room_count, pc.pipeline_stage,
      EXISTS (SELECT 1 FROM outreach_targets ot WHERE ot.pipeline_contact_id = pc.id) AS in_campaign
    FROM pipeline_contacts pc
    WHERE pc.pipeline_stage = 'prospect'
      AND pc.id <> ALL(${exclude}::int[])
      AND (${excludeAlready}::boolean = FALSE
           OR NOT EXISTS (SELECT 1 FROM outreach_targets ot WHERE ot.pipeline_contact_id = pc.id))
    ORDER BY
      in_campaign ASC,
      CASE pc.fit_quality
        WHEN 'A' THEN 1
        WHEN 'B' THEN 2
        WHEN 'C' THEN 3
        ELSE 4
      END ASC,
      pc.imported_at DESC NULLS LAST,
      pc.id ASC
    LIMIT ${limit}
  `;
  return rows as SelectedProspect[];
}
