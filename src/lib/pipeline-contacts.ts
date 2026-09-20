// The one writer for "a person just touched us" rows in pipeline_contacts:
// the contact form, a discovery-call booking, the admin "+ Add Contact"
// button, and the resource funnel (src/lib/resources/leads.ts) all land here.
//
// Why this is not an ON CONFLICT upsert: pipeline_contacts lost its UNIQUE on
// email in scripts/migrate.ts, because multi-property hotel groups share one
// info@ address across several rows. `ON CONFLICT (email)` therefore has no
// index to infer and Postgres rejects the whole statement at plan time, which
// is how three call sites silently stopped writing to the CRM. The only unique
// left is the property key on (website_url, hotel_name), and that is the CSV
// importer's identity, not a person's. SELECT-then-write is the correct shape.
//
// This function throws. Public routes wrap it in their own best-effort
// try/catch; the admin route turns a failure into a JSON error.

import { sql } from "@/lib/db";

/** The slice of the neon tagged template this module uses. Injectable so the
 *  write flow can be tested without a database. */
export type PipelineDb = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<unknown>;

export type PipelineContactInput = {
  name: string;
  email: string;
  /** First-touch source. Only written on insert; never overwritten. */
  source: string;
  phone?: string | null;
  hotelName?: string | null;
  hotelLocation?: string | null;
  roomCount?: string | null;
  company?: string | null;
  /** Insert only, like pipelineStage: a repeat touch never rewrites either. */
  notes?: string | null;
  pipelineStage?: string | null;
};

export type PipelineContactResult = {
  id: number;
  /**
   * `property_match` means no row had this email, and the insert hit the
   * property unique because another row already owns this hotel. The id is
   * that existing row's, and it was left unmodified.
   */
  outcome: "inserted" | "updated" | "property_match";
};

type NormalizedContact = {
  name: string;
  email: string;
  source: string;
  phone: string | null;
  hotelName: string | null;
  hotelLocation: string | null;
  roomCount: string | null;
  company: string | null;
  notes: string | null;
  pipelineStage: string;
};

// The same "this is not really a hotel name" list the backfill in
// scripts/migrate.ts uses. Left as-is, a form filled with "n/a" would share a
// property key with every other "n/a" and collide with a stranger's row.
const PLACEHOLDER_HOTEL_NAMES = new Set(["-", "n/a", "na", "none"]);

function blankToNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

/**
 * Trim, lowercase the email, and turn every blank optional field into NULL.
 *
 * The NULLs carry the merge semantics: the UPDATE below is
 * `col = COALESCE(new, col)`, so NULL means "keep what is on file" and any
 * real value overwrites. An empty string is not NULL, which is how a
 * hotel-less repeat booking used to be able to blank a stored hotel_name.
 */
export function normalizePipelineContactInput(
  input: PipelineContactInput,
): NormalizedContact {
  const hotelName = blankToNull(input.hotelName);
  return {
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    source: input.source,
    phone: blankToNull(input.phone),
    hotelName:
      hotelName && PLACEHOLDER_HOTEL_NAMES.has(hotelName.toLowerCase())
        ? null
        : hotelName,
    hotelLocation: blankToNull(input.hotelLocation),
    roomCount: blankToNull(input.roomCount),
    company: blankToNull(input.company),
    notes: blankToNull(input.notes),
    pipelineStage: blankToNull(input.pipelineStage) ?? "prospect",
  };
}

/** SQLSTATE 23505, unique_violation. NeonDbError exposes it as `code`. */
export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === "23505"
  );
}

export async function upsertContactByEmail(
  input: PipelineContactInput,
  db: PipelineDb = sql,
): Promise<PipelineContactResult> {
  const c = normalizePipelineContactInput(input);

  // Shared info@ addresses mean several rows can carry one email. Oldest row
  // wins so repeat touches keep landing on the same contact.
  const existing = (await db`
    SELECT id FROM pipeline_contacts WHERE LOWER(email) = ${c.email} ORDER BY id LIMIT 1
  `) as Array<{ id: number }>;

  if (existing.length > 0) {
    const id = existing[0].id;
    // `source` is deliberately not updated. It records first touch, so the
    // campaign that originally found this person survives every later visit.
    await db`
      UPDATE pipeline_contacts
      SET name = COALESCE(NULLIF(${c.name}, ''), name),
          phone = COALESCE(${c.phone}, phone),
          hotel_name = COALESCE(${c.hotelName}, hotel_name),
          hotel_location = COALESCE(${c.hotelLocation}, hotel_location),
          room_count = COALESCE(${c.roomCount}, room_count),
          company = COALESCE(${c.company}, company),
          updated_at = NOW()
      WHERE id = ${id}
    `;
    return { id, outcome: "updated" };
  }

  try {
    const inserted = (await db`
      INSERT INTO pipeline_contacts
        (name, email, phone, hotel_name, hotel_location, room_count, company, pipeline_stage, source, notes)
      VALUES
        (${c.name}, ${c.email}, ${c.phone}, ${c.hotelName}, ${c.hotelLocation},
         ${c.roomCount}, ${c.company}, ${c.pipelineStage}, ${c.source}, ${c.notes})
      RETURNING id
    `) as Array<{ id: number }>;
    return { id: inserted[0].id, outcome: "inserted" };
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
  }

  // The insert hit the property unique. Inbound rows never carry a
  // website_url, so their key is ('', hotel_name) and there are two ways in.

  if (c.hotelName === null) {
    // Key ('', ''). Until the partial-index migration at the end of
    // scripts/migrate.ts has run, the live index is non-partial and allows
    // exactly one such row, so the second hotel-less lead collides. Reuse the
    // convention that file's backfill already stamps on these rows,
    // hotel_name = 'Inbound#' || id, rather than inventing a second one. The
    // id comes from the sequence inside the same statement, so the synthetic
    // name is unique by construction and there is no insert-then-rename gap.
    // A real hotel name from a later touch overwrites it through the COALESCE
    // above. Once the partial index is live this branch is unreachable.
    const inserted = (await db`
      WITH new_id AS (
        SELECT nextval(pg_get_serial_sequence('pipeline_contacts', 'id')) AS id
      )
      INSERT INTO pipeline_contacts
        (id, name, email, phone, hotel_name, hotel_location, room_count, company, pipeline_stage, source, notes)
      SELECT id, ${c.name}, ${c.email}, ${c.phone}, 'Inbound#' || id, ${c.hotelLocation},
             ${c.roomCount}, ${c.company}, ${c.pipelineStage}, ${c.source}, ${c.notes}
      FROM new_id
      RETURNING id
    `) as Array<{ id: number }>;
    return { id: inserted[0].id, outcome: "inserted" };
  }

  // Key ('', hotel_name): a second person from a hotel the CRM already has,
  // under a different email. The partial index does not change this case. A
  // row here is a property, so attach to it and let the caller log its
  // activity there. The row is left untouched: overwriting its name or email
  // with a stranger's would corrupt an outreach record.
  const property = (await db`
    SELECT id FROM pipeline_contacts
    WHERE LOWER(COALESCE(website_url, '')) = ''
      AND LOWER(COALESCE(hotel_name, '')) = LOWER(${c.hotelName})
    LIMIT 1
  `) as Array<{ id: number }>;
  if (property.length === 0) {
    throw new Error("pipeline_contacts unique violation with no matching property row");
  }
  return { id: property[0].id, outcome: "property_match" };
}
