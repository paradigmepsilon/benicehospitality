import { sql } from "@/lib/db";
import {
  OWNERS,
  STAGE_KEYS,
  STEPS,
  STEP_KEYS,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_KEYS,
  VEHICLE_STEPS,
  VEHICLE_STEP_KEYS,
  getStage,
  monthLabel,
  parseMonthStepKey,
  vehicleLabel,
  type OwnerKey,
  type StageKey,
  type VehicleStatusKey,
} from "./journey";

export interface VehicleRow {
  id: number;
  engagementId: number;
  year: number | null;
  make: string | null;
  model: string | null;
  color: string | null;
  plateState: string | null;
  garagingCity: string | null;
  garagingState: string | null;
  status: VehicleStatusKey;
  liveAt: string | null;
  returnedAt: string | null;
  notes: string | null;
  doneStepKeys: string[];
}

export interface EngagementRow {
  id: number;
  pipelineContactId: number | null;
  applicationId: number | null;
  clientName: string;
  email: string | null;
  phone: string | null;
  marketCity: string | null;
  marketState: string | null;
  source: string | null;
  stage: StageKey;
  stageEnteredAt: string;
  owner: OwnerKey;
  agreementSignedAt: string | null;
  termEndsAt: string | null;
  statementDay: number | null;
  onboardingFeeCents: number;
  paidCents: number;
  nextAction: string | null;
  nextActionDue: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What the board needs per card: the row, its owner-level completions, and a one-line view of each vehicle. */
export interface EngagementListItem extends EngagementRow {
  doneStepKeys: string[];
  vehicles: { id: number; label: string; status: VehicleStatusKey; liveAt: string | null }[];
}

export interface EngagementEvent {
  id: number;
  kind: string;
  body: string;
  createdBy: string | null;
  createdAt: string;
}

export interface EngagementDetail extends EngagementRow {
  /** Owner-level completions: stage checklists and the monthly cycle. */
  doneSteps: { key: string; doneBy: string | null; doneAt: string }[];
  vehicles: VehicleRow[];
  events: EngagementEvent[];
}

// DATE columns come back as Date objects at UTC midnight; slice keeps the
// calendar day the admin typed instead of shifting it through a timezone.
function dateOnly(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: Record<string, any>): EngagementRow {
  return {
    id: Number(r.id),
    pipelineContactId: r.pipeline_contact_id === null ? null : Number(r.pipeline_contact_id),
    applicationId: r.application_id === null ? null : Number(r.application_id),
    clientName: r.client_name,
    email: r.email,
    phone: r.phone,
    marketCity: r.market_city,
    marketState: r.market_state,
    source: r.source,
    stage: r.stage,
    stageEnteredAt: new Date(r.stage_entered_at).toISOString(),
    owner: r.owner,
    agreementSignedAt: dateOnly(r.agreement_signed_at),
    termEndsAt: dateOnly(r.term_ends_at),
    statementDay: r.statement_day === null ? null : Number(r.statement_day),
    onboardingFeeCents: Number(r.onboarding_fee_cents),
    paidCents: Number(r.paid_cents),
    nextAction: r.next_action,
    nextActionDue: dateOnly(r.next_action_due),
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVehicle(r: Record<string, any>, doneStepKeys: string[]): VehicleRow {
  return {
    id: Number(r.id),
    engagementId: Number(r.engagement_id),
    year: r.year === null ? null : Number(r.year),
    make: r.make,
    model: r.model,
    color: r.color,
    plateState: r.plate_state,
    garagingCity: r.garaging_city,
    garagingState: r.garaging_state,
    status: r.status,
    liveAt: dateOnly(r.live_at),
    returnedAt: dateOnly(r.returned_at),
    notes: r.notes,
    doneStepKeys,
  };
}

export async function listEngagements(): Promise<EngagementListItem[]> {
  // Open work first by due date, undated rows after, newest first within ties.
  const rows = await sql`
    SELECT e.*,
      COALESCE(
        (SELECT array_agg(s.step_key) FROM fleet_steps s
         WHERE s.engagement_id = e.id AND s.vehicle_id IS NULL),
        '{}'
      ) AS done_step_keys,
      COALESCE(
        (SELECT json_agg(json_build_object(
            'id', v.id, 'year', v.year, 'make', v.make, 'model', v.model,
            'status', v.status, 'live_at', v.live_at) ORDER BY v.id)
         FROM fleet_vehicles v WHERE v.engagement_id = e.id),
        '[]'::json
      ) AS vehicles
    FROM fleet_engagements e
    ORDER BY e.next_action_due ASC NULLS LAST, e.created_at DESC
    LIMIT 500
  `;
  return rows.map((r) => ({
    ...mapRow(r),
    doneStepKeys: r.done_step_keys as string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vehicles: (r.vehicles as Record<string, any>[]).map((v) => ({
      id: Number(v.id),
      label: vehicleLabel({ year: v.year, make: v.make, model: v.model }),
      status: v.status,
      liveAt: dateOnly(v.live_at),
    })),
  }));
}

export async function getEngagement(id: number): Promise<EngagementDetail | null> {
  const rows = await sql`SELECT * FROM fleet_engagements WHERE id = ${id}`;
  if (rows.length === 0) return null;
  const [steps, vehicles, events] = await Promise.all([
    sql`SELECT vehicle_id, step_key, done_by, done_at FROM fleet_steps WHERE engagement_id = ${id}`,
    sql`SELECT * FROM fleet_vehicles WHERE engagement_id = ${id} ORDER BY id`,
    sql`
      SELECT id, kind, body, created_by, created_at FROM fleet_events
      WHERE engagement_id = ${id} ORDER BY created_at DESC, id DESC LIMIT 300
    `,
  ]);
  return {
    ...mapRow(rows[0]),
    doneSteps: steps
      .filter((s) => s.vehicle_id === null)
      .map((s) => ({ key: s.step_key, doneBy: s.done_by, doneAt: new Date(s.done_at).toISOString() })),
    vehicles: vehicles.map((v) =>
      mapVehicle(
        v,
        steps.filter((s) => s.vehicle_id !== null && Number(s.vehicle_id) === Number(v.id)).map((s) => s.step_key),
      ),
    ),
    events: events.map((e) => ({
      id: Number(e.id),
      kind: e.kind,
      body: e.body,
      createdBy: e.created_by,
      createdAt: new Date(e.created_at).toISOString(),
    })),
  };
}

export async function logEvent(
  engagementId: number,
  kind: string,
  body: string,
  actor: string | null,
): Promise<void> {
  await sql`
    INSERT INTO fleet_events (engagement_id, kind, body, created_by)
    VALUES (${engagementId}, ${kind}, ${body}, ${actor})
  `;
}

export interface CreateEngagementInput {
  clientName: string;
  email?: string | null;
  phone?: string | null;
  marketCity?: string | null;
  marketState?: string | null;
  source?: string | null;
  owner?: OwnerKey;
  pipelineContactId?: number | null;
  applicationId?: number | null;
}

export async function createEngagement(
  input: CreateEngagementInput,
  actor: string | null,
): Promise<{ id: number }> {
  // Both ids arrive from a URL the admin can edit. Looking each one up turns an
  // id that does not exist into NULL, instead of a foreign-key 500 that loses
  // the owner the admin just typed in.
  const rows = await sql`
    INSERT INTO fleet_engagements
      (client_name, email, phone, market_city, market_state, source, owner,
       pipeline_contact_id, application_id)
    VALUES
      (${input.clientName}, ${input.email || null}, ${input.phone || null},
       ${input.marketCity || null}, ${input.marketState || null},
       ${input.source || null}, ${input.owner ?? "alex"},
       (SELECT id FROM pipeline_contacts WHERE id = ${input.pipelineContactId ?? null}),
       (SELECT id FROM management_applications WHERE id = ${input.applicationId ?? null}))
    RETURNING id
  `;
  const id = Number(rows[0].id);
  await logEvent(id, "created", `Added to the tracker${input.source ? ` · source: ${input.source}` : ""}`, actor);
  return { id };
}

/** Fields the PATCH route accepts. Omitted means "leave alone". */
export interface EngagementPatch {
  clientName?: string;
  email?: string | null;
  phone?: string | null;
  marketCity?: string | null;
  marketState?: string | null;
  source?: string | null;
  stage?: StageKey;
  owner?: OwnerKey;
  agreementSignedAt?: string | null;
  termEndsAt?: string | null;
  statementDay?: number | null;
  onboardingFeeCents?: number;
  paidCents?: number;
  nextAction?: string | null;
  nextActionDue?: string | null;
  notes?: string | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed === "" ? null : trimmed;
}

function date(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return typeof value === "string" && ISO_DATE.test(value) ? value : undefined;
}

function cents(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100_000_000
    ? value
    : undefined;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

// Validated before any trimming to length: text(value, 2) would turn "Georgia"
// into "GE" and store the wrong state without complaint.
function stateCode(value: unknown): string | null | undefined {
  const v = text(value, 100);
  if (v === undefined || v === null) return v;
  return /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : undefined;
}

/**
 * Validates an untrusted PATCH body against the same lists the table's CHECK
 * constraints use, so a stale client gets a 400 instead of a Postgres 500.
 * Returns the error message, or the clean patch.
 */
export function parsePatch(body: unknown): { error: string } | { patch: EngagementPatch } {
  if (typeof body !== "object" || body === null) return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const patch: EngagementPatch = {};

  if (b.clientName !== undefined) {
    const name = text(b.clientName, 200);
    if (!name) return { error: "Owner name cannot be empty" };
    patch.clientName = name;
  }
  for (const [key, max] of [
    ["email", 200], ["phone", 40], ["marketCity", 100], ["source", 100],
    ["nextAction", 300], ["notes", 5000],
  ] as const) {
    const v = text(b[key], max);
    if (v !== undefined) patch[key] = v;
  }
  if (b.marketState !== undefined) {
    const v = stateCode(b.marketState);
    if (v === undefined) return { error: "marketState must be a two-letter state code" };
    patch.marketState = v;
  }

  if (b.stage !== undefined) {
    const v = oneOf(b.stage, STAGE_KEYS);
    if (!v) return { error: `stage must be one of: ${STAGE_KEYS.join(", ")}` };
    patch.stage = v;
  }
  if (b.owner !== undefined) {
    const v = oneOf(b.owner, OWNERS);
    if (!v) return { error: `owner must be one of: ${OWNERS.join(", ")}` };
    patch.owner = v;
  }

  for (const key of ["agreementSignedAt", "termEndsAt", "nextActionDue"] as const) {
    if (b[key] === undefined) continue;
    const v = date(b[key]);
    if (v === undefined) return { error: `${key} must be YYYY-MM-DD` };
    patch[key] = v;
  }
  for (const key of ["onboardingFeeCents", "paidCents"] as const) {
    if (b[key] === undefined) continue;
    const v = cents(b[key]);
    if (v === undefined) return { error: `${key} must be a whole number of cents` };
    patch[key] = v;
  }
  if (b.statementDay !== undefined) {
    // 28 is the ceiling so the day exists in every month, February included.
    if (b.statementDay === null || b.statementDay === "") patch.statementDay = null;
    else if (typeof b.statementDay === "number" && Number.isInteger(b.statementDay) && b.statementDay >= 1 && b.statementDay <= 28) {
      patch.statementDay = b.statementDay;
    } else return { error: "statementDay must be a day of the month from 1 to 28" };
  }

  if (Object.keys(patch).length === 0) return { error: "No valid fields to update." };
  return { patch };
}

/**
 * Applies a patch. The timeline is for things that happened, not for clicks:
 * only a deliberate action (`confirm`, the "Move to next stage" button) writes
 * a stage entry. Field edits write nothing.
 */
export async function updateEngagement(
  id: number,
  patch: EngagementPatch,
  actor: string | null,
  opts: { confirm?: boolean } = {},
): Promise<EngagementRow | null> {
  const currentRows = await sql`SELECT * FROM fleet_engagements WHERE id = ${id}`;
  if (currentRows.length === 0) return null;
  const current = mapRow(currentRows[0]);

  const pick = <K extends keyof EngagementPatch & keyof EngagementRow>(key: K) =>
    (patch[key] === undefined ? current[key] : patch[key]) as EngagementRow[K];
  const stageChanged = patch.stage !== undefined && patch.stage !== current.stage;

  const rows = await sql`
    UPDATE fleet_engagements SET
      client_name = ${pick("clientName")},
      email = ${pick("email")},
      phone = ${pick("phone")},
      market_city = ${pick("marketCity")},
      market_state = ${pick("marketState")},
      source = ${pick("source")},
      stage = ${pick("stage")},
      stage_entered_at = CASE WHEN ${stageChanged} THEN NOW() ELSE stage_entered_at END,
      owner = ${pick("owner")},
      agreement_signed_at = ${pick("agreementSignedAt")},
      term_ends_at = ${pick("termEndsAt")},
      statement_day = ${pick("statementDay")},
      onboarding_fee_cents = ${pick("onboardingFeeCents")},
      paid_cents = ${pick("paidCents")},
      next_action = ${pick("nextAction")},
      next_action_due = ${pick("nextActionDue")},
      notes = ${pick("notes")},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (stageChanged && opts.confirm) {
    await logEvent(
      id,
      "stage",
      `${getStage(current.stage)?.label ?? current.stage} → ${getStage(patch.stage!)?.label ?? patch.stage}`,
      actor,
    );
  }
  return mapRow(rows[0]);
}

export async function deleteEngagement(id: number): Promise<void> {
  await sql`DELETE FROM fleet_engagements WHERE id = ${id}`;
}

/* ── Vehicles ─────────────────────────────────────────────────────────── */

export interface VehiclePatch {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  plateState?: string | null;
  garagingCity?: string | null;
  garagingState?: string | null;
  status?: VehicleStatusKey;
  liveAt?: string | null;
  returnedAt?: string | null;
  notes?: string | null;
}

/** Validates an untrusted vehicle body. `requireIdentity` is for create: a vehicle needs at least a make or a model. */
export function parseVehiclePatch(
  body: unknown,
  opts: { requireIdentity?: boolean } = {},
): { error: string } | { patch: VehiclePatch } {
  if (typeof body !== "object" || body === null) return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const patch: VehiclePatch = {};

  if (b.year !== undefined) {
    const maxYear = new Date().getUTCFullYear() + 2;
    if (b.year === null || b.year === "") patch.year = null;
    else if (typeof b.year === "number" && Number.isInteger(b.year) && b.year >= 1980 && b.year <= maxYear) patch.year = b.year;
    else return { error: `year must be between 1980 and ${maxYear}` };
  }
  for (const [key, max] of [
    ["make", 60], ["model", 60], ["color", 40], ["garagingCity", 100], ["notes", 2000],
  ] as const) {
    const v = text(b[key], max);
    if (v !== undefined) patch[key] = v;
  }
  for (const key of ["plateState", "garagingState"] as const) {
    if (b[key] === undefined) continue;
    const v = stateCode(b[key]);
    if (v === undefined) return { error: `${key} must be a two-letter state code` };
    patch[key] = v;
  }
  if (b.status !== undefined) {
    const v = oneOf(b.status, VEHICLE_STATUS_KEYS);
    if (!v) return { error: `status must be one of: ${VEHICLE_STATUS_KEYS.join(", ")}` };
    patch.status = v;
  }
  for (const key of ["liveAt", "returnedAt"] as const) {
    if (b[key] === undefined) continue;
    const v = date(b[key]);
    if (v === undefined) return { error: `${key} must be YYYY-MM-DD` };
    patch[key] = v;
  }

  if (opts.requireIdentity && !patch.make && !patch.model) return { error: "A vehicle needs at least a make or a model" };
  if (Object.keys(patch).length === 0) return { error: "No valid fields to update." };
  return { patch };
}

export async function createVehicle(
  engagementId: number,
  patch: VehiclePatch,
  actor: string | null,
): Promise<{ id: number } | null> {
  const exists = await sql`SELECT 1 FROM fleet_engagements WHERE id = ${engagementId}`;
  if (exists.length === 0) return null;
  const rows = await sql`
    INSERT INTO fleet_vehicles
      (engagement_id, year, make, model, color, plate_state, garaging_city, garaging_state, status, notes)
    VALUES
      (${engagementId}, ${patch.year ?? null}, ${patch.make ?? null}, ${patch.model ?? null},
       ${patch.color ?? null}, ${patch.plateState ?? null}, ${patch.garagingCity ?? null},
       ${patch.garagingState ?? null}, ${patch.status ?? "proposed"}, ${patch.notes ?? null})
    RETURNING id
  `;
  await logEvent(engagementId, "vehicle", `Vehicle added: ${vehicleLabel({ year: patch.year ?? null, make: patch.make ?? null, model: patch.model ?? null })}`, actor);
  await sql`UPDATE fleet_engagements SET updated_at = NOW() WHERE id = ${engagementId}`;
  return { id: Number(rows[0].id) };
}

/**
 * Applies a vehicle patch. A status change is a real event (a car went live,
 * a car went home), so it is always logged, and the first move to live or
 * returned stamps that date unless the same request sets it.
 */
export async function updateVehicle(
  engagementId: number,
  vehicleId: number,
  patch: VehiclePatch,
  actor: string | null,
): Promise<VehicleRow | null> {
  const currentRows = await sql`
    SELECT * FROM fleet_vehicles WHERE id = ${vehicleId} AND engagement_id = ${engagementId}
  `;
  if (currentRows.length === 0) return null;
  const current = mapVehicle(currentRows[0], []);
  const next: VehiclePatch = { ...patch };
  const today = new Date().toISOString().slice(0, 10);

  const statusChanged = next.status !== undefined && next.status !== current.status;
  if (statusChanged && next.status === "live" && !current.liveAt && next.liveAt === undefined) next.liveAt = today;
  if (statusChanged && next.status === "returned" && !current.returnedAt && next.returnedAt === undefined) next.returnedAt = today;

  const pick = <K extends keyof VehiclePatch & keyof VehicleRow>(key: K) =>
    (next[key] === undefined ? current[key] : next[key]) as VehicleRow[K];

  const rows = await sql`
    UPDATE fleet_vehicles SET
      year = ${pick("year")},
      make = ${pick("make")},
      model = ${pick("model")},
      color = ${pick("color")},
      plate_state = ${pick("plateState")},
      garaging_city = ${pick("garagingCity")},
      garaging_state = ${pick("garagingState")},
      status = ${pick("status")},
      live_at = ${pick("liveAt")},
      returned_at = ${pick("returnedAt")},
      notes = ${pick("notes")},
      updated_at = NOW()
    WHERE id = ${vehicleId} AND engagement_id = ${engagementId}
    RETURNING *
  `;
  if (statusChanged) {
    const label = (key: VehicleStatusKey) => VEHICLE_STATUSES.find((s) => s.key === key)!.label;
    await logEvent(engagementId, "vehicle", `${vehicleLabel(mapVehicle(rows[0], []))}: ${label(current.status)} → ${label(next.status!)}`, actor);
  }
  await sql`UPDATE fleet_engagements SET updated_at = NOW() WHERE id = ${engagementId}`;
  const done = await sql`SELECT step_key FROM fleet_steps WHERE vehicle_id = ${vehicleId}`;
  return mapVehicle(rows[0], done.map((d) => d.step_key as string));
}

export async function deleteVehicle(engagementId: number, vehicleId: number, actor: string | null): Promise<boolean> {
  const removed = await sql`
    DELETE FROM fleet_vehicles WHERE id = ${vehicleId} AND engagement_id = ${engagementId}
    RETURNING year, make, model
  `;
  if (removed.length === 0) return false;
  await logEvent(engagementId, "vehicle", `Vehicle removed: ${vehicleLabel({ year: removed[0].year, make: removed[0].make, model: removed[0].model })}`, actor);
  return true;
}

/* ── Checklists ───────────────────────────────────────────────────────── */

/** The label a step key prints as in the timeline, or null when the key is not one this journey defines. */
export function describeStep(stepKey: string, vehicle: boolean): string | null {
  if (vehicle) return VEHICLE_STEPS.find((s) => s.key === stepKey)?.label ?? null;
  if (STEP_KEYS.has(stepKey)) return STEPS.find((s) => s.key === stepKey)!.label;
  const monthly = parseMonthStepKey(stepKey);
  return monthly ? `${monthly.step.label} · ${monthLabel(monthly.month)}` : null;
}

export async function setStepDone(
  engagementId: number,
  stepKey: string,
  done: boolean,
  actor: string | null,
  vehicleId: number | null = null,
): Promise<"ok" | "unknown_step" | "unknown_vehicle"> {
  if (vehicleId !== null && !VEHICLE_STEP_KEYS.has(stepKey)) return "unknown_step";
  let label = describeStep(stepKey, vehicleId !== null);
  if (!label) return "unknown_step";

  if (vehicleId !== null) {
    const v = await sql`
      SELECT year, make, model FROM fleet_vehicles WHERE id = ${vehicleId} AND engagement_id = ${engagementId}
    `;
    if (v.length === 0) return "unknown_vehicle";
    label = `${label} · ${vehicleLabel({ year: v[0].year, make: v[0].make, model: v[0].model })}`;
  }

  // Only a real completion is logged; a double click is not. The two partial
  // unique indexes need their predicate restated in ON CONFLICT.
  let changed: unknown[];
  if (done) {
    changed = vehicleId === null
      ? await sql`
          INSERT INTO fleet_steps (engagement_id, step_key, done_by)
          VALUES (${engagementId}, ${stepKey}, ${actor})
          ON CONFLICT (engagement_id, step_key) WHERE vehicle_id IS NULL DO NOTHING
          RETURNING id
        `
      : await sql`
          INSERT INTO fleet_steps (engagement_id, vehicle_id, step_key, done_by)
          VALUES (${engagementId}, ${vehicleId}, ${stepKey}, ${actor})
          ON CONFLICT (vehicle_id, step_key) WHERE vehicle_id IS NOT NULL DO NOTHING
          RETURNING id
        `;
  } else {
    changed = vehicleId === null
      ? await sql`
          DELETE FROM fleet_steps
          WHERE engagement_id = ${engagementId} AND step_key = ${stepKey} AND vehicle_id IS NULL
          RETURNING id
        `
      : await sql`
          DELETE FROM fleet_steps
          WHERE engagement_id = ${engagementId} AND step_key = ${stepKey} AND vehicle_id = ${vehicleId}
          RETURNING id
        `;
  }
  if (changed.length > 0) await logEvent(engagementId, "note", `${done ? "Done" : "Reopened"}: ${label}`, actor);
  await sql`UPDATE fleet_engagements SET updated_at = NOW() WHERE id = ${engagementId}`;
  return "ok";
}
