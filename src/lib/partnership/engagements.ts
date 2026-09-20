import { sql } from "@/lib/db";
import {
  OWNERS,
  PACKAGE_KEYS,
  PATH_KEYS,
  SECTION_STATUS_KEYS,
  STAGE_KEYS,
  STEPS,
  STEP_KEYS,
  VERDICTS,
  VERDICT_KEYS,
  creditForVerdict,
  getStage,
  type OwnerKey,
  type PackageKey,
  type PathKey,
  type SectionStatusKey,
  type StageKey,
  type VerdictKey,
} from "./journey";

export interface EngagementRow {
  id: number;
  pipelineContactId: number | null;
  clientName: string;
  email: string | null;
  phone: string | null;
  propertyLabel: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  source: string | null;
  stage: StageKey;
  stageEnteredAt: string;
  path: PathKey;
  verdict: VerdictKey | null;
  verdictAt: string | null;
  package: PackageKey;
  sections: [SectionStatusKey, SectionStatusKey, SectionStatusKey, SectionStatusKey, SectionStatusKey];
  owner: OwnerKey;
  creditCents: number;
  creditExpiresAt: string | null;
  contractCents: number;
  paidCents: number;
  nextAction: string | null;
  nextActionDue: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementEvent {
  id: number;
  kind: string;
  body: string;
  createdBy: string | null;
  createdAt: string;
}

export interface EngagementDetail extends EngagementRow {
  doneSteps: { key: string; doneBy: string | null; doneAt: string }[];
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
    clientName: r.client_name,
    email: r.email,
    phone: r.phone,
    propertyLabel: r.property_label,
    propertyCity: r.property_city,
    propertyState: r.property_state,
    source: r.source,
    stage: r.stage,
    stageEnteredAt: new Date(r.stage_entered_at).toISOString(),
    path: r.path,
    verdict: r.verdict,
    verdictAt: dateOnly(r.verdict_at),
    package: r.package,
    sections: [r.s1_status, r.s2_status, r.s3_status, r.s4_status, r.s5_status],
    owner: r.owner,
    creditCents: Number(r.credit_cents),
    creditExpiresAt: dateOnly(r.credit_expires_at),
    contractCents: Number(r.contract_cents),
    paidCents: Number(r.paid_cents),
    nextAction: r.next_action,
    nextActionDue: dateOnly(r.next_action_due),
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export async function listEngagements(): Promise<(EngagementRow & { doneStepKeys: string[] })[]> {
  // Open work first by due date, undated rows after, newest first within ties.
  const rows = await sql`
    SELECT e.*,
      COALESCE(
        (SELECT array_agg(s.step_key) FROM partnership_steps s WHERE s.engagement_id = e.id),
        '{}'
      ) AS done_step_keys
    FROM partnership_engagements e
    ORDER BY e.next_action_due ASC NULLS LAST, e.created_at DESC
    LIMIT 500
  `;
  return rows.map((r) => ({ ...mapRow(r), doneStepKeys: r.done_step_keys as string[] }));
}

export async function getEngagement(id: number): Promise<EngagementDetail | null> {
  const rows = await sql`SELECT * FROM partnership_engagements WHERE id = ${id}`;
  if (rows.length === 0) return null;
  const [steps, events] = await Promise.all([
    sql`SELECT step_key, done_by, done_at FROM partnership_steps WHERE engagement_id = ${id}`,
    sql`
      SELECT id, kind, body, created_by, created_at FROM partnership_events
      WHERE engagement_id = ${id} ORDER BY created_at DESC, id DESC LIMIT 300
    `,
  ]);
  return {
    ...mapRow(rows[0]),
    doneSteps: steps.map((s) => ({
      key: s.step_key,
      doneBy: s.done_by,
      doneAt: new Date(s.done_at).toISOString(),
    })),
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
    INSERT INTO partnership_events (engagement_id, kind, body, created_by)
    VALUES (${engagementId}, ${kind}, ${body}, ${actor})
  `;
}

export interface CreateEngagementInput {
  clientName: string;
  email?: string | null;
  phone?: string | null;
  propertyLabel?: string | null;
  propertyCity?: string | null;
  propertyState?: string | null;
  source?: string | null;
  owner?: OwnerKey;
  pipelineContactId?: number | null;
}

export async function createEngagement(
  input: CreateEngagementInput,
  actor: string | null,
): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO partnership_engagements
      (client_name, email, phone, property_label, property_city, property_state,
       source, owner, pipeline_contact_id)
    VALUES
      (${input.clientName}, ${input.email || null}, ${input.phone || null},
       ${input.propertyLabel || null}, ${input.propertyCity || null},
       ${input.propertyState || null}, ${input.source || null},
       ${input.owner ?? "della"}, ${input.pipelineContactId ?? null})
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
  propertyLabel?: string | null;
  propertyCity?: string | null;
  propertyState?: string | null;
  source?: string | null;
  stage?: StageKey;
  path?: PathKey;
  verdict?: VerdictKey | null;
  verdictAt?: string | null;
  package?: PackageKey;
  sections?: Partial<Record<1 | 2 | 3 | 4 | 5, SectionStatusKey>>;
  owner?: OwnerKey;
  creditCents?: number;
  creditExpiresAt?: string | null;
  contractCents?: number;
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
    if (!name) return { error: "Client name cannot be empty" };
    patch.clientName = name;
  }
  for (const [key, max] of [
    ["email", 200], ["phone", 40], ["propertyLabel", 200], ["propertyCity", 100],
    ["propertyState", 2], ["source", 100], ["nextAction", 300], ["notes", 5000],
  ] as const) {
    const v = text(b[key], max);
    if (v !== undefined) patch[key] = v;
  }

  const enums = [
    ["stage", STAGE_KEYS], ["path", PATH_KEYS], ["package", PACKAGE_KEYS], ["owner", OWNERS],
  ] as const;
  for (const [key, allowed] of enums) {
    if (b[key] === undefined) continue;
    const v = oneOf(b[key], allowed as readonly string[]);
    if (!v) return { error: `${key} must be one of: ${allowed.join(", ")}` };
    (patch as Record<string, unknown>)[key] = v;
  }

  if (b.verdict !== undefined) {
    if (b.verdict === null) patch.verdict = null;
    else {
      const v = oneOf(b.verdict, VERDICT_KEYS);
      if (!v) return { error: `verdict must be one of: ${VERDICT_KEYS.join(", ")}` };
      patch.verdict = v;
    }
  }

  for (const key of ["verdictAt", "creditExpiresAt", "nextActionDue"] as const) {
    if (b[key] === undefined) continue;
    const v = date(b[key]);
    if (v === undefined) return { error: `${key} must be YYYY-MM-DD` };
    patch[key] = v;
  }
  for (const key of ["creditCents", "contractCents", "paidCents"] as const) {
    if (b[key] === undefined) continue;
    const v = cents(b[key]);
    if (v === undefined) return { error: `${key} must be a whole number of cents` };
    patch[key] = v;
  }

  if (b.sections !== undefined) {
    if (typeof b.sections !== "object" || b.sections === null) return { error: "sections must be an object" };
    patch.sections = {};
    for (const [n, status] of Object.entries(b.sections as Record<string, unknown>)) {
      const num = Number(n);
      const v = oneOf(status, SECTION_STATUS_KEYS);
      if (![1, 2, 3, 4, 5].includes(num) || !v) return { error: "sections must map 1 to 5 onto a valid status" };
      patch.sections[num as 1 | 2 | 3 | 4 | 5] = v;
    }
  }

  if (Object.keys(patch).length === 0) return { error: "No valid fields to update." };
  return { patch };
}

/**
 * Applies a patch. Logging a verdict applies the tiered credit policy and
 * moves the client to that verdict's fork stage, unless the same request sets
 * those fields itself.
 *
 * The timeline is for things that happened, not for clicks. Trying a package,
 * a path, or a section status in a dropdown writes nothing. Only a deliberate
 * action (`confirm`: the "Confirm verdict" and "Move to next stage" buttons)
 * writes an entry, and only for the verdict and the stage.
 */
export async function updateEngagement(
  id: number,
  patch: EngagementPatch,
  actor: string | null,
  opts: { confirm?: boolean } = {},
): Promise<EngagementRow | null> {
  const currentRows = await sql`SELECT * FROM partnership_engagements WHERE id = ${id}`;
  if (currentRows.length === 0) return null;
  const current = mapRow(currentRows[0]);
  const next: EngagementPatch = { ...patch };
  const events: [kind: string, body: string][] = [];

  if (next.verdict && next.verdict !== current.verdict) {
    const rule = VERDICTS.find((v) => v.key === next.verdict)!;
    const verdictAt = next.verdictAt ?? current.verdictAt ?? new Date().toISOString().slice(0, 10);
    next.verdictAt = verdictAt;
    const credit = creditForVerdict(next.verdict, verdictAt);
    if (next.creditCents === undefined) next.creditCents = credit.creditCents;
    if (next.creditExpiresAt === undefined) next.creditExpiresAt = credit.creditExpiresAt;
    if (next.stage === undefined) next.stage = rule.nextStage;
    if (next.path === undefined && next.verdict === "adjust") next.path = "fix_it";
    events.push([
      "verdict",
      `Verdict confirmed: ${rule.label}. Credit $${(next.creditCents / 100).toLocaleString("en-US")} through ${next.creditExpiresAt}`,
    ]);
  }
  if (next.stage && next.stage !== current.stage) {
    events.push(["stage", `${getStage(current.stage)?.label ?? current.stage} → ${getStage(next.stage)?.label ?? next.stage}`]);
  }
  if (!opts.confirm) events.length = 0;

  const s = (n: 1 | 2 | 3 | 4 | 5) => next.sections?.[n] ?? current.sections[n - 1];
  const pick = <K extends keyof EngagementPatch & keyof EngagementRow>(key: K) =>
    (next[key] === undefined ? current[key] : next[key]) as EngagementRow[K];
  const stageChanged = next.stage !== undefined && next.stage !== current.stage;

  const rows = await sql`
    UPDATE partnership_engagements SET
      client_name = ${pick("clientName")},
      email = ${pick("email")},
      phone = ${pick("phone")},
      property_label = ${pick("propertyLabel")},
      property_city = ${pick("propertyCity")},
      property_state = ${pick("propertyState")},
      source = ${pick("source")},
      stage = ${pick("stage")},
      stage_entered_at = CASE WHEN ${stageChanged} THEN NOW() ELSE stage_entered_at END,
      path = ${pick("path")},
      verdict = ${pick("verdict")},
      verdict_at = ${pick("verdictAt")},
      package = ${pick("package")},
      s1_status = ${s(1)}, s2_status = ${s(2)}, s3_status = ${s(3)},
      s4_status = ${s(4)}, s5_status = ${s(5)},
      owner = ${pick("owner")},
      credit_cents = ${pick("creditCents")},
      credit_expires_at = ${pick("creditExpiresAt")},
      contract_cents = ${pick("contractCents")},
      paid_cents = ${pick("paidCents")},
      next_action = ${pick("nextAction")},
      next_action_due = ${pick("nextActionDue")},
      notes = ${pick("notes")},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  for (const [kind, body] of events) await logEvent(id, kind, body, actor);
  return mapRow(rows[0]);
}

export async function setStepDone(
  engagementId: number,
  stepKey: string,
  done: boolean,
  actor: string | null,
): Promise<"ok" | "unknown_step"> {
  if (!STEP_KEYS.has(stepKey)) return "unknown_step";
  const label = STEPS.find((s) => s.key === stepKey)!.label;
  if (done) {
    const inserted = await sql`
      INSERT INTO partnership_steps (engagement_id, step_key, done_by)
      VALUES (${engagementId}, ${stepKey}, ${actor})
      ON CONFLICT (engagement_id, step_key) DO NOTHING
      RETURNING id
    `;
    // Only a real completion is logged; a double click is not.
    if (inserted.length > 0) await logEvent(engagementId, "note", `Done: ${label}`, actor);
  } else {
    const removed = await sql`
      DELETE FROM partnership_steps WHERE engagement_id = ${engagementId} AND step_key = ${stepKey} RETURNING id
    `;
    if (removed.length > 0) await logEvent(engagementId, "note", `Reopened: ${label}`, actor);
  }
  await sql`UPDATE partnership_engagements SET updated_at = NOW() WHERE id = ${engagementId}`;
  return "ok";
}

export async function deleteEngagement(id: number): Promise<void> {
  await sql`DELETE FROM partnership_engagements WHERE id = ${id}`;
}

/**
 * Founding-client pricing is for the first three. A founding proposal that was
 * lost or parked in Market Watch gives its slot back, so it is not counted.
 */
export async function countFoundingClients(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM partnership_engagements
    WHERE package = 'founding' AND stage NOT IN ('closed_lost', 'nurture')
  `;
  return Number(rows[0].n);
}
