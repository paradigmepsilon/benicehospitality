"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MONTHLY_STEPS,
  OPERATING_STAGES,
  OWNERS,
  PHASES,
  STAGES,
  TERM_REVIEW_WINDOW_DAYS,
  VEHICLE_STATUSES,
  VEHICLE_STEP_GROUPS,
  daysUntil,
  getDoc,
  getStage,
  isStatementLate,
  monthLabel,
  monthStepKey,
  stageIndex,
  statementMonths,
  stepsFor,
  vehicleLabel,
  vehicleStepsFor,
  type OwnerKey,
  type StageKey,
  type StepOwner,
  type VehicleStatusKey,
} from "@/lib/fleet/journey";
import type { EngagementDetail, EngagementPatch, VehiclePatch, VehicleRow } from "@/lib/fleet/engagements";
import type { EmailTemplate } from "@/lib/fleet/emails";
import { OWNER_CHIP, dollars, shortDate, todayLocal } from "@/components/admin/partnership/ui";
import { Modal } from "@/components/admin/partnership/Modal";
import { relativeTime } from "@/lib/utils";

const EVENT_KINDS = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "doc", label: "Doc sent" },
] as const;

const OWNER_LABEL: Record<OwnerKey, string> = { alex: "Alex", della: "Della" };

const card = "bg-white border border-[#e8e4dd] rounded-lg p-4 min-w-0";
const label = "block text-[11px] font-semibold tracking-wider uppercase text-[#1a1a1a]/45 mb-1";
const input =
  "w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors bg-white";
const btn = "px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40";
const btnDark = `${btn} bg-[#1a1a1a] text-white hover:bg-[#333]`;
const btnGreen = `${btn} bg-[#5b9a2f] text-white hover:bg-[#4a7d25]`;
const btnGhost = `${btn} bg-white border border-[#e8e4dd] text-[#1a1a1a]/70 hover:border-[#1a1a1a]/30`;
const btnRed = `${btn} bg-[#b3261e] text-white hover:bg-[#8f1d17]`;
const chip = "text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5";
const chipWarn = `${chip} bg-[#c0674a]/12 text-[#8a4a32]`;

// Same doc route shape as the co-living tracker, on the fleet path.
const docHref = (key: string) => `/api/admin/fleet/docs/${key}`;

// An onboarding fee is whatever Exhibit B says, so cents show when there are any.
const money = (cents: number) =>
  cents % 100 === 0
    ? dollars(cents)
    : `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type VehicleDraft = {
  year: string;
  make: string;
  model: string;
  color: string;
  plateState: string;
  garagingCity: string;
  garagingState: string;
  liveAt: string;
  returnedAt: string;
  notes: string;
};

const NEW_VEHICLE = { year: "", make: "", model: "", color: "", plateState: "", garagingCity: "", garagingState: "" };

function draftOf(v: VehicleRow): VehicleDraft {
  return {
    year: v.year === null ? "" : String(v.year),
    make: v.make ?? "",
    model: v.model ?? "",
    color: v.color ?? "",
    plateState: v.plateState ?? "",
    garagingCity: v.garagingCity ?? "",
    garagingState: v.garagingState ?? "",
    liveAt: v.liveAt ?? "",
    returnedAt: v.returnedAt ?? "",
    notes: v.notes ?? "",
  };
}

/** The vehicle being edited: what the form holds, and the saved values it started from. */
type VehicleEdit = { id: number; base: VehicleDraft; draft: VehicleDraft };

// Only the fields the admin changed go to the server, measured against the
// values the form started from, so an untouched field is never sent.
function vehicleChanges({ draft, base }: VehicleEdit): VehiclePatch {
  const out: VehiclePatch = {};
  if (draft.year !== base.year) out.year = draft.year.trim() ? Number(draft.year) : null;
  for (const k of ["make", "model", "color", "plateState", "garagingCity", "garagingState", "liveAt", "returnedAt", "notes"] as const) {
    if (draft[k] !== base[k]) out[k] = draft[k].trim() || null;
  }
  return out;
}

// After a save the server may have changed more than was sent: a move to Live
// or Returned stamps that date. Untouched fields pick up the saved values, so
// an open form never sends a stale blank back over a stamped date.
function rebase(edit: VehicleEdit, row: VehicleRow): VehicleEdit {
  const base = draftOf(row);
  const draft = { ...edit.draft };
  for (const k of Object.keys(base) as (keyof VehicleDraft)[]) {
    if (edit.draft[k] === edit.base[k]) draft[k] = base[k];
  }
  return { id: edit.id, base, draft };
}

const yearOk =(y: string) => y.trim() === "" || /^\d{4}$/.test(y.trim());
const stateOk = (s: string) => s.trim() === "" || /^[A-Za-z]{2}$/.test(s.trim());

type ChecklistStep = { key: string; label: string; owner: StepOwner; doc?: string; flag?: "money" | "legal" };

/** One checklist row: the box, who owns it, a money or legal flag, and its doc. */
function StepItem({ step, checked, onToggle }: { step: ChecklistStep; checked: boolean; onToggle: (done: boolean) => void }) {
  const doc = step.doc ? getDoc(step.doc) : undefined;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#5b9a2f]" aria-label={step.label} />
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${checked ? "text-[#1a1a1a]/40 line-through" : "text-[#1a1a1a]"}`}>{step.label}</span>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className={`${chip} ${OWNER_CHIP[step.owner]}`}>{step.owner}</span>
          {step.flag && <span className={chipWarn}>{step.flag === "legal" ? "Legal" : "Money"}</span>}
          {doc && <a href={docHref(doc.key)} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A4D4F] hover:underline">Open: {doc.title} ↗</a>}
        </div>
      </div>
    </li>
  );
}

export default function FleetOwnerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<EngagementDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [viewStage, setViewStage] = useState<StageKey | null>(null);
  const [draft, setDraft] = useState({
    nextAction: "", nextActionDue: "", notes: "",
    signedAt: "", termEndsAt: "", statementDay: "", fee: "", paid: "",
    clientName: "", email: "", phone: "", marketCity: "", marketState: "", source: "",
  });
  const [eventKind, setEventKind] = useState<(typeof EVENT_KINDS)[number]["value"]>("note");
  const [eventBody, setEventBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmMove, setConfirmMove] = useState(false);
  // The vehicle being edited keeps its own draft, so ticking a checklist box
  // (which reloads the page data) does not wipe what is being typed.
  const [vehicleEdit, setVehicleEdit] = useState<VehicleEdit | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState<Record<number, boolean>>({});
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState(NEW_VEHICLE);
  const [vehicleError, setVehicleError] = useState("");
  const [removeVehicle, setRemoveVehicle] = useState<VehicleRow | null>(null);
  const [payLink, setPayLink] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [mail, setMail] = useState<{ templateId: string; subject: string; body: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/fleet/${id}`);
    if (!res.ok) {
      setError(res.status === 404 ? "That owner is not on the board." : "Could not load this owner.");
      return;
    }
    const d: EngagementDetail = await res.json();
    setData(d);
    setDraft({
      nextAction: d.nextAction ?? "",
      nextActionDue: d.nextActionDue ?? "",
      notes: d.notes ?? "",
      signedAt: d.agreementSignedAt ?? "",
      termEndsAt: d.termEndsAt ?? "",
      statementDay: d.statementDay === null ? "" : String(d.statementDay),
      fee: d.onboardingFeeCents ? String(d.onboardingFeeCents / 100) : "",
      paid: d.paidCents ? String(d.paidCents / 100) : "",
      clientName: d.clientName,
      email: d.email ?? "",
      phone: d.phone ?? "",
      marketCity: d.marketCity ?? "",
      marketState: d.marketState ?? "",
      source: d.source ?? "",
    });
    // Drafts are merged server-side with this owner's name, vehicles, market, and term end.
    fetch(`/api/admin/fleet/${id}/email`)
      .then((r) => (r.ok ? r.json() : { templates: [] }))
      .then((j) => setTemplates(j.templates));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Sends only the fields it means to change. `confirm` marks the deliberate
  // "Move to next stage" action and is the only thing that writes a stage
  // entry to the timeline; trying values in a dropdown never does.
  async function patch(body: EngagementPatch, opts: { confirm?: boolean; savedKey?: string } = {}) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/fleet/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts.confirm ? { ...body, confirm: true } : body),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setViewStage(null);
      await load();
      if (opts.savedKey) {
        setSaved(opts.savedKey);
        setTimeout(() => setSaved((k) => (k === opts.savedKey ? "" : k)), 2500);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // No vehicleId is an owner-level step: a stage checklist or the monthly cycle.
  async function toggleStep(stepKey: string, done: boolean, vehicleId?: number) {
    if (!data) return;
    setData(
      vehicleId === undefined
        ? {
            ...data,
            doneSteps: done
              ? [...data.doneSteps, { key: stepKey, doneBy: null, doneAt: new Date().toISOString() }]
              : data.doneSteps.filter((s) => s.key !== stepKey),
          }
        : {
            ...data,
            vehicles: data.vehicles.map((v) =>
              v.id !== vehicleId
                ? v
                : { ...v, doneStepKeys: done ? [...v.doneStepKeys, stepKey] : v.doneStepKeys.filter((k) => k !== stepKey) },
            ),
          },
    );
    const res = await fetch(`/api/admin/fleet/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicleId === undefined ? { stepKey, done } : { stepKey, done, vehicleId }),
    });
    if (!res.ok) setError("That step did not save.");
    await load(); // a completed task is what the timeline records
  }

  async function post(path: string, body: unknown): Promise<{ ok: boolean; json: Record<string, string> }> {
    const res = await fetch(`/api/admin/fleet/${id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, json: await res.json().catch(() => ({})) };
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventBody.trim()) return;
    setBusy(true);
    const r = await post("events", { kind: eventKind, body: eventBody });
    if (r.ok) setEventBody("");
    else setError("Could not log that.");
    await load();
    setBusy(false);
  }

  async function createPayLink() {
    setBusy(true);
    setError("");
    const r = await post("checkout", { item: "onboarding_fee" });
    if (r.ok) setPayLink(r.json.url);
    else setError(r.json.error || "Could not create the link");
    await load();
    setBusy(false);
  }

  async function sendMail() {
    if (!mail) return;
    setBusy(true);
    setError("");
    const r = await post("email", { ...mail, confirmed: true });
    setConfirmSend(false);
    if (r.ok) {
      setMail(null);
      setSaved("mail");
      setTimeout(() => setSaved(""), 4000);
    } else setError(r.json.error || "Not sent");
    await load();
    setBusy(false);
  }

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setVehicleError("");
    const { year, ...rest } = newVehicle;
    const r = await post("vehicles", year.trim() ? { ...rest, year: Number(year) } : rest);
    if (r.ok) {
      setAddingVehicle(false);
      setNewVehicle(NEW_VEHICLE);
    } else setVehicleError(r.json.error || "Could not add that vehicle.");
    await load();
    setBusy(false);
  }

  // A status change is logged by the server, which also stamps the live or returned date.
  async function patchVehicle(vehicleId: number, body: VehiclePatch): Promise<boolean> {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/fleet/${id}/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error || "That vehicle did not save.");
    else setVehicleEdit((cur) => (cur && cur.id === vehicleId ? rebase(cur, json as VehicleRow) : cur));
    await load();
    setBusy(false);
    return res.ok;
  }

  async function handleRemoveVehicle() {
    if (!removeVehicle) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/fleet/${id}/vehicles/${removeVehicle.id}`, { method: "DELETE" });
    if (!res.ok) setError("That vehicle was not removed.");
    else if (vehicleEdit?.id === removeVehicle.id) setVehicleEdit(null);
    setRemoveVehicle(null);
    await load();
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/admin/fleet/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/fleet");
    else {
      setError("Remove failed.");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  const toCents = (v: string) => Math.round((parseFloat(v.replace(/[^0-9.]/g, "")) || 0) * 100);
  const today = todayLocal();
  const shownStage = viewStage ?? data?.stage ?? "lead";
  const steps = useMemo(() => stepsFor(shownStage), [shownStage]);

  if (error && !data) {
    return (
      <div className={card}>
        <p className="text-sm text-[#8a4a32]">{error}</p>
        <Link href="/admin/fleet" className="text-sm text-[#5b9a2f] mt-2 inline-block">← Back to the board</Link>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Loading…</p>;

  const doneKeys = new Set(data.doneSteps.map((s) => s.key));
  const currentIdx = stageIndex(data.stage);
  const stage = getStage(data.stage)!;
  const phase = PHASES.find((p) => p.key === stage.phase)!;
  const currentSteps = stepsFor(data.stage);
  const openCount = currentSteps.filter((s) => !doneKeys.has(s.key)).length;
  const stageDone = currentSteps.length > 0 && openCount === 0;
  // The main line runs lead through offboarding, then alumni. Not now,
  // declined, and lost are exits, reached from the dropdown, so they have no "next".
  const onMainLine = currentIdx <= stageIndex("alumni");
  const nextStage = currentIdx <= stageIndex("offboarding") ? STAGES[currentIdx + 1] : undefined;
  const overdue = !!data.nextActionDue && data.nextActionDue < today;
  const feePaid = doneKeys.has("signed.fee_paid");
  // Moving the stage never assumes money changed hands. Say so when it hasn't.
  const unpaidPastSigned =
    currentIdx > stageIndex("signed") && currentIdx <= stageIndex("offboarding") &&
    data.onboardingFeeCents > 0 && data.paidCents === 0 && !feePaid;

  const operating = OPERATING_STAGES.includes(data.stage);
  const firstLiveAt = data.vehicles.map((v) => v.liveAt).filter((d): d is string => !!d).sort()[0] ?? null;
  const months = firstLiveAt ? statementMonths(today, 6, firstLiveAt.slice(0, 7)) : [];
  const statementLate = operating && isStatementLate({ doneKeys: [...doneKeys], statementDay: data.statementDay, firstLiveAt, today });
  const termLeft = data.termEndsAt ? daysUntil(data.termEndsAt, today) : null;
  // The review reminder only means something while BNHG still has the vehicles.
  const termReviewDue = termLeft !== null && termLeft <= TERM_REVIEW_WINDOW_DAYS && (stage.phase === "onboard" || stage.phase === "operate");
  const activeVehicles = data.vehicles.filter((v) => v.status !== "declined").length;

  const dayText = draft.statementDay.trim();
  const dayValue = dayText === "" ? null : Number(dayText);
  const dayValid = dayValue === null || (Number.isInteger(dayValue) && dayValue >= 1 && dayValue <= 28);
  const nextDirty = draft.nextAction !== (data.nextAction ?? "") || draft.nextActionDue !== (data.nextActionDue ?? "");
  const agreementDirty =
    draft.signedAt !== (data.agreementSignedAt ?? "") || draft.termEndsAt !== (data.termEndsAt ?? "") ||
    dayText !== (data.statementDay === null ? "" : String(data.statementDay));
  const moneyDirty = toCents(draft.fee) !== data.onboardingFeeCents || toCents(draft.paid) !== data.paidCents;
  const notesDirty = draft.notes !== (data.notes ?? "");
  const contactDirty =
    draft.clientName !== data.clientName || draft.email !== (data.email ?? "") || draft.phone !== (data.phone ?? "") ||
    draft.marketCity !== (data.marketCity ?? "") || draft.marketState !== (data.marketState ?? "") || draft.source !== (data.source ?? "");
  const stageTemplates = templates.filter((t) => t.stage === data.stage);
  const openSlots = mail ? [...new Set(`${mail.subject}\n${mail.body}`.match(/\[\[[^\]]+\]\]/g) ?? [])] : [];
  const savedTick = (key: string) => saved === key && <span className="text-xs text-[#3d6a1f] font-medium">Saved ✓</span>;

  return (
    <div className="space-y-4 min-w-0">
      <Link href="/admin/fleet" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]">← All owners</Link>

      {error && <div className="bg-[#c0674a]/10 border border-[#c0674a]/30 text-[#8a4a32] text-sm rounded-lg px-4 py-3">{error}</div>}
      {saved === "mail" && <div className="bg-[#5b9a2f]/10 border border-[#5b9a2f]/30 text-[#2d4f15] text-sm rounded-lg px-4 py-3">Email sent and logged in the timeline.</div>}
      {overdue && (
        <div className="bg-[#f5a623]/10 border border-[#f5a623]/35 text-[#8a6215] text-sm rounded-lg px-4 py-3">
          <strong>Needs attention:</strong> “{data.nextAction || "Next action"}” was due {shortDate(data.nextActionDue!)}. This also shows at the top of the board.
        </div>
      )}
      {unpaidPastSigned && (
        <div className="bg-[#c0674a]/8 border border-[#c0674a]/25 text-[#8a4a32] text-sm rounded-lg px-4 py-3">
          <strong>No onboarding fee payment is recorded.</strong> Moving an owner to a later stage does not mark anything paid. Tick “Onboarding fee received” under Signed · fee due once the money is in.
        </div>
      )}

      {/* Header */}
      <div className={`${card} flex flex-wrap items-start justify-between gap-4`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-[#1a1a1a] break-words">{data.clientName}</h2>
            <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-[#1A4D4F] text-white">{phase.label} · {stage.label}</span>
            {statementLate && <span className={chipWarn}>Statement late</span>}
            {termReviewDue && <span className={`${chip} bg-[#f5a623]/15 text-[#8a6215]`}>Term review due</span>}
          </div>
          <p className="text-sm text-[#1a1a1a]/60 mt-0.5">
            {[data.marketCity, data.marketState].filter(Boolean).join(", ") || "No market yet"} · {activeVehicles} vehicle{activeVehicles === 1 ? "" : "s"}
          </p>
          <p className="text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {data.email && <a className="text-[#1A4D4F] hover:underline break-all" href={`mailto:${data.email}`}>{data.email}</a>}
            {data.phone && <a className="text-[#1A4D4F] hover:underline" href={`tel:${data.phone}`}>{data.phone}</a>}
            {data.source && <span className="text-[#1a1a1a]/45">Source: {data.source}</span>}
            {data.pipelineContactId && <Link className="text-[#1a1a1a]/45 hover:text-[#1a1a1a]" href="/admin/outreach/crm">CRM contact #{data.pipelineContactId}</Link>}
            {data.applicationId && <Link className="text-[#1a1a1a]/45 hover:text-[#1a1a1a]" href="/admin/applications">Application #{data.applicationId}</Link>}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className={label}>Lead</span>
            <select className={input} value={data.owner} disabled={busy} onChange={(e) => patch({ owner: e.target.value as OwnerKey })}>
              {OWNERS.map((o) => <option key={o} value={o}>{OWNER_LABEL[o]}</option>)}
            </select>
          </div>
          <div>
            <span className={label}>Stage (jump to any)</span>
            <select className={input} value={data.stage} disabled={busy} onChange={(e) => patch({ stage: e.target.value as StageKey })}>
              {PHASES.map((p) => (
                <optgroup key={p.key} label={p.label}>
                  {STAGES.filter((s) => s.phase === p.key).map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {nextStage && (
            <button disabled={busy} onClick={() => setConfirmMove(true)} className={stageDone ? btnGreen : btnGhost}>
              Move to {nextStage.label} →
            </button>
          )}
        </div>
      </div>

      {/* Journey map: wraps instead of scrolling sideways */}
      <div className={card}>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {PHASES.map((p) => (
            <div key={p.key} className="min-w-0">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#1a1a1a]/40 mb-1.5">{p.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.filter((s) => s.phase === p.key).map((s) => {
                  const isCurrent = s.key === data.stage;
                  const isViewed = s.key === shownStage;
                  // From an exit stage there is no telling how far the owner got, so nothing counts as passed.
                  const isPast = onMainLine && stageIndex(s.key) < currentIdx;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setViewStage(s.key === data.stage ? null : s.key)}
                      className={`text-xs rounded-md border px-2.5 py-1.5 transition-colors ${
                        isCurrent
                          ? "bg-[#1A4D4F] border-[#1A4D4F] text-white font-medium"
                          : isPast
                            ? "bg-[#5b9a2f]/10 border-[#5b9a2f]/30 text-[#2d4f15]"
                            : "bg-white border-[#e8e4dd] text-[#1a1a1a]/50 hover:border-[#1a1a1a]/30"
                      } ${isViewed && !isCurrent ? "ring-2 ring-[#B08D57]" : ""}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4">
        <div className="space-y-4 min-w-0">
          {/* Checklist */}
          <div className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-[#1a1a1a]">
                {getStage(shownStage)?.label}
                {viewStage && <span className="ml-2 text-xs font-sans font-normal text-[#7a5e36]">previewing · not the current stage</span>}
              </h3>
              {getStage(shownStage)?.exit && <span className="text-xs text-[#1a1a1a]/50">Done when: {getStage(shownStage)!.exit}</span>}
            </div>
            <p className="text-sm text-[#1a1a1a]/60 mt-1 mb-3">{getStage(shownStage)?.why}</p>
            {steps.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/45">No checklist for this stage.</p>
            ) : (
              <ul className="divide-y divide-[#e8e4dd]">
                {steps.map((s) => (
                  <StepItem key={s.key} step={s} checked={doneKeys.has(s.key)} onToggle={(done) => toggleStep(s.key, done)} />
                ))}
              </ul>
            )}
          </div>

          {/* Vehicles: one per Exhibit A column, each with its own Exhibit C checklist */}
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-[#1a1a1a]">Vehicles</h3>
              <button className={btnGhost} onClick={() => { setVehicleError(""); setAddingVehicle(true); }}>+ Add vehicle</button>
            </div>
            <p className="text-xs text-[#1a1a1a]/45 mt-1 mb-3">VIN, policy numbers, and lienholder details are not stored here. They live on the signed Exhibit A.</p>
            {data.vehicles.length === 0 ? (
              <p className="text-sm text-[#1a1a1a]/45">No vehicles yet. Add every vehicle the owner wants managed.</p>
            ) : (
              <ul className="space-y-3">
                {data.vehicles.map((v) => {
                  const statusSelect = (
                    <select
                      className="text-xs border border-[#e8e4dd] rounded-md px-2 py-1 bg-white"
                      value={v.status}
                      disabled={busy}
                      aria-label={`Status of ${vehicleLabel(v)}`}
                      onChange={(e) => patchVehicle(v.id, { status: e.target.value as VehicleStatusKey })}
                    >
                      {VEHICLE_STATUSES.map((st) => <option key={st.key} value={st.key}>{st.label}</option>)}
                    </select>
                  );
                  // A declined vehicle stays on the card as a record, folded away with no checklists.
                  if (v.status === "declined") {
                    return (
                      <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 border border-[#e8e4dd] rounded-lg px-3 py-2 bg-[#f8f6f1]">
                        <span className="text-sm text-[#1a1a1a]/45 min-w-0 break-words">{vehicleLabel(v)} · declined, no checklist</span>
                        <span className="flex items-center gap-3">
                          {statusSelect}
                          <button className="text-xs text-[#8a4a32] hover:underline" onClick={() => setRemoveVehicle(v)}>Remove</button>
                        </span>
                      </li>
                    );
                  }
                  const showReturn = v.status === "returned" || v.status === "paused" || data.stage === "offboarding";
                  const groups = VEHICLE_STEP_GROUPS.filter((g) => g.key !== "return" || showReturn);
                  const vDone = new Set(v.doneStepKeys);
                  const vSteps = groups.flatMap((g) => vehicleStepsFor(g.key));
                  const vCount = vSteps.filter((s) => vDone.has(s.key)).length;
                  // A finished checklist folds itself away. The toggle overrides that either way.
                  const open = vehicleOpen[v.id] ?? vCount < vSteps.length;
                  const edit = vehicleEdit?.id === v.id ? vehicleEdit : null;
                  const editing = edit?.draft ?? null;
                  const changes = edit ? vehicleChanges(edit) : {};
                  const fieldsOk = !editing || (yearOk(editing.year) && stateOk(editing.plateState) && stateOk(editing.garagingState));
                  const setField = (k: keyof VehicleDraft, value: string) => edit && setVehicleEdit({ ...edit, draft: { ...edit.draft, [k]: value } });
                  const summary = [
                    v.color,
                    v.plateState && `${v.plateState} plate`,
                    (v.garagingCity || v.garagingState) && `Garaged in ${[v.garagingCity, v.garagingState].filter(Boolean).join(", ")}`,
                    v.liveAt && `Live ${shortDate(v.liveAt)}`,
                    v.returnedAt && `Returned ${shortDate(v.returnedAt)}`,
                  ].filter(Boolean).join(" · ");
                  return (
                    <li key={v.id} className="border border-[#e8e4dd] rounded-lg p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1a1a1a] break-words">{vehicleLabel(v)}</div>
                          <div className="text-xs text-[#1a1a1a]/55">{summary || "No details yet"}</div>
                          <div className="text-[11px] text-[#1a1a1a]/40">{VEHICLE_STATUSES.find((st) => st.key === v.status)?.blurb}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${vCount === vSteps.length ? "text-[#3d6a1f] font-medium" : "text-[#1a1a1a]/50"}`}>{vCount} of {vSteps.length} done</span>
                          {statusSelect}
                        </div>
                      </div>
                      {v.notes && !editing && <p className="text-xs text-[#1a1a1a]/60 mt-2 whitespace-pre-wrap break-words">{v.notes}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <button className="text-[#1A4D4F] hover:underline" onClick={() => setVehicleOpen({ ...vehicleOpen, [v.id]: !open })}>{open ? "Hide checklist" : "Show checklist"}</button>
                        {!editing && <button className="text-[#1A4D4F] hover:underline" onClick={() => setVehicleEdit({ id: v.id, base: draftOf(v), draft: draftOf(v) })}>Edit details</button>}
                        <button className="text-[#8a4a32] hover:underline" onClick={() => setRemoveVehicle(v)}>Remove vehicle</button>
                      </div>

                      {editing && (
                        <div className="mt-3 pt-3 border-t border-[#e8e4dd]">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <span className={label}>Year</span>
                              <input className={input} inputMode="numeric" maxLength={4} value={editing.year} onChange={(e) => setField("year", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Make</span>
                              <input className={input} value={editing.make} onChange={(e) => setField("make", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Model</span>
                              <input className={input} value={editing.model} onChange={(e) => setField("model", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Color</span>
                              <input className={input} value={editing.color} onChange={(e) => setField("color", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Plate state</span>
                              <input className={`${input} uppercase`} maxLength={2} value={editing.plateState} onChange={(e) => setField("plateState", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Garaging city</span>
                              <input className={input} value={editing.garagingCity} onChange={(e) => setField("garagingCity", e.target.value)} />
                            </div>
                            <div>
                              <span className={label}>Garaging state</span>
                              <input className={`${input} uppercase`} maxLength={2} value={editing.garagingState} onChange={(e) => setField("garagingState", e.target.value)} />
                            </div>
                            <div className="hidden sm:block" />
                            <div className="col-span-2">
                              <span className={label}>Live date</span>
                              <input type="date" className={input} value={editing.liveAt} onChange={(e) => setField("liveAt", e.target.value)} />
                            </div>
                            <div className="col-span-2">
                              <span className={label}>Returned date</span>
                              <input type="date" className={input} value={editing.returnedAt} onChange={(e) => setField("returnedAt", e.target.value)} />
                            </div>
                            <div className="col-span-2 sm:col-span-4">
                              <span className={label}>Vehicle notes</span>
                              <textarea rows={2} className={input} value={editing.notes} onChange={(e) => setField("notes", e.target.value)} />
                            </div>
                          </div>
                          {!fieldsOk && <p className="text-xs text-[#8a4a32] mt-2">Year is four digits. States are two letters.</p>}
                          <p className="text-xs text-[#1a1a1a]/45 mt-2">Setting the status to Live or Returned fills in that date for you the first time. No VIN, policy number, or lienholder detail in the notes.</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              disabled={busy || !fieldsOk || Object.keys(changes).length === 0}
                              className={btnDark}
                              onClick={async () => { if (await patchVehicle(v.id, changes)) setVehicleEdit(null); }}
                            >
                              Save vehicle
                            </button>
                            <button className={btnGhost} onClick={() => setVehicleEdit(null)}>Cancel</button>
                          </div>
                        </div>
                      )}

                      {open && groups.map((g) => (
                        <div key={g.key} className="mt-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className={`${label} mb-0`}>{g.label}</span>
                            <span className="text-[11px] text-[#1a1a1a]/40">{g.source}</span>
                          </div>
                          <ul className="divide-y divide-[#e8e4dd]">
                            {vehicleStepsFor(g.key).map((s) => (
                              <StepItem key={s.key} step={s} checked={vDone.has(s.key)} onToggle={(done) => toggleStep(s.key, done, v.id)} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Monthly cycle: only while BNHG is running at least one vehicle */}
          {operating && (
            <div className={card}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[#1a1a1a]">
                  Monthly cycle
                  {statementLate && <span className={`${chipWarn} ml-2 font-sans align-middle`}>Statement late</span>}
                </h3>
                {getDoc("owner_statement") && (
                  <a href={docHref("owner_statement")} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A4D4F] hover:underline">Open: {getDoc("owner_statement")!.title} ↗</a>
                )}
              </div>
              <p className="text-xs text-[#1a1a1a]/50 mt-1 mb-3">One statement and one distribution per month, on the dates the agreement names. Each row is the month the statement covers. Every tick is logged in the timeline.</p>
              {data.statementDay === null && (
                <p className="text-xs text-[#8a6215] bg-[#f5a623]/10 border border-[#f5a623]/35 rounded-lg px-3 py-2 mb-3">Enter the statement day from this owner&apos;s Exhibit B to turn on the late flag.</p>
              )}
              {!firstLiveAt ? (
                <p className="text-sm text-[#1a1a1a]/45">No vehicle has a live date yet. Set a vehicle to Live, or enter its live date, and the months show up here.</p>
              ) : months.length === 0 ? (
                <p className="text-sm text-[#1a1a1a]/45">The first vehicle went live this month. The first statement is owed next month.</p>
              ) : (
                <>
                  <ul className="divide-y divide-[#e8e4dd]">
                    {months.map((month, i) => {
                      const monthDone = MONTHLY_STEPS.filter((s) => doneKeys.has(monthStepKey(month, s.key))).length;
                      return (
                        <li key={month} className="py-3">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-[#1a1a1a]">{monthLabel(month)}</span>
                            <span className={`text-xs ${monthDone === MONTHLY_STEPS.length ? "text-[#3d6a1f] font-medium" : "text-[#1a1a1a]/50"}`}>{monthDone} of {MONTHLY_STEPS.length} done</span>
                            {/* The late flag is always about the newest row: last month's statement. */}
                            {i === 0 && statementLate && <span className={chipWarn}>Statement late · was due on day {data.statementDay}</span>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                            {MONTHLY_STEPS.map((s) => {
                              const key = monthStepKey(month, s.key);
                              const checked = doneKeys.has(key);
                              return (
                                <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={checked} onChange={(e) => toggleStep(key, e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#5b9a2f]" />
                                  <span className={checked ? "text-[#1a1a1a]/40 line-through" : "text-[#1a1a1a]"}>
                                    {s.label}
                                    {"flag" in s && <span className={`${chipWarn} ml-1.5 no-underline inline-block`}>Money</span>}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-xs text-[#1a1a1a]/40 mt-1">Shows the last six statement months, newest first.</p>
                </>
              )}
            </div>
          )}

          {/* Email drafts: nothing sends without a person reading and confirming it */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Emails for this stage</h3>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Drafts from the email pack, filled in with what the tracker knows. You read it, edit it, and confirm before anything goes to the owner.</p>
            {stageTemplates.length === 0 && !mail && <p className="text-sm text-[#1a1a1a]/45">No email is tied to this stage.</p>}
            {!mail && (
              <ul className="space-y-2">
                {stageTemplates.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 border border-[#e8e4dd] rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#1a1a1a]">{t.title}</div>
                      <div className="text-xs text-[#1a1a1a]/50">When: {t.trigger} · From: {t.sender}</div>
                    </div>
                    <button className={btnGhost} onClick={() => setMail({ templateId: t.id, subject: t.subject, body: t.body })}>Review draft</button>
                  </li>
                ))}
              </ul>
            )}
            {!mail && templates.length > 0 && (
              <select className={`${input} mt-3`} value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setMail({ templateId: t.id, subject: t.subject, body: t.body }); }}>
                <option value="">Open a draft from another stage…</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.title}</option>)}
              </select>
            )}
            {mail && (
              <div className="space-y-2">
                <div className="text-xs text-[#1a1a1a]/55">To: <strong>{data.email || "no email on file"}</strong>{templates.find((t) => t.id === mail.templateId)?.attach && <> · Attach by hand is not possible here: <em>{templates.find((t) => t.id === mail.templateId)!.attach}</em>. If this email needs attachments, copy the text into your mail client instead.</>}</div>
                <input className={input} value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} />
                <textarea rows={14} className={`${input} font-mono text-[13px] leading-relaxed`} value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} />
                {openSlots.length > 0 && <p className="text-xs text-[#8a4a32]">Still to fill in before this can send: {openSlots.join(" · ")}</p>}
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy || openSlots.length > 0 || !data.email} className={btnGreen} onClick={() => setConfirmSend(true)}>Send to owner…</button>
                  <button className={btnGhost} onClick={() => navigator.clipboard.writeText(`${mail.subject}\n\n${mail.body}`)}>Copy text</button>
                  <button className={btnGhost} onClick={() => setMail(null)}>Close</button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Timeline</h3>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Records what happened: tasks completed, a stage move, a vehicle added or changing status, emails sent, payments, and anything you log here. Changing the stage dropdown does not add an entry.</p>
            <form onSubmit={addEvent} className="flex flex-col sm:flex-row gap-2 mb-4">
              <select className={`${input} sm:w-32`} value={eventKind} onChange={(e) => setEventKind(e.target.value as typeof eventKind)}>
                {EVENT_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
              <input className={`${input} flex-1 min-w-0`} placeholder="What happened?" value={eventBody} onChange={(e) => setEventBody(e.target.value)} />
              <button disabled={busy || !eventBody.trim()} className={btnDark}>Log</button>
            </form>
            <ul className="space-y-2.5">
              {data.events.map((ev) => (
                <li key={ev.id} className="flex gap-3 text-sm">
                  <span className="shrink-0 w-14 text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a]/40 pt-0.5">{ev.body.startsWith("Done:") || ev.body.startsWith("Reopened:") ? "task" : ev.kind}</span>
                  <div className="min-w-0">
                    <p className="text-[#1a1a1a]/85 break-words">{ev.body}</p>
                    <p className="text-xs text-[#1a1a1a]/40">{relativeTime(ev.createdAt)}{ev.createdBy ? ` · ${ev.createdBy}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          {/* Next action */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Next action</h3>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Every open owner should have one. Once the due date passes it appears under “Needs attention today” at the top of the board, and as a banner on this page.</p>
            <span className={label}>What happens next</span>
            <input className={input} value={draft.nextAction} onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })} />
            <span className={`${label} mt-3`}>Due</span>
            <input type="date" className={input} value={draft.nextActionDue} onChange={(e) => setDraft({ ...draft, nextActionDue: e.target.value })} />
            <div className="mt-3 flex items-center gap-3">
              <button disabled={busy || !nextDirty} className={btnDark} onClick={() => patch({ nextAction: draft.nextAction || null, nextActionDue: draft.nextActionDue || null }, { savedKey: "next" })}>Save next action</button>
              {savedTick("next")}
              {!nextDirty && data.nextAction && saved !== "next" && <span className="text-xs text-[#1a1a1a]/45">Saved{data.nextActionDue ? ` · due ${shortDate(data.nextActionDue)}` : " · no due date"}</span>}
            </div>
          </div>

          {/* What was signed, and what has been paid */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Agreement + money</h3>
            <p className="text-xs text-[#1a1a1a]/45 mb-3">Every date and amount here is copied from this owner&apos;s signed agreement and Exhibit B. Nothing is filled in for you. The management percentage is not stored; it lives in the agreement.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={label}>Agreement signed</span>
                <input type="date" className={input} value={draft.signedAt} onChange={(e) => setDraft({ ...draft, signedAt: e.target.value })} />
              </div>
              <div>
                <span className={label}>Minimum term ends (earliest vehicle)</span>
                <input type="date" className={input} value={draft.termEndsAt} onChange={(e) => setDraft({ ...draft, termEndsAt: e.target.value })} />
              </div>
              <div>
                <span className={label}>Statement day (1 to 28)</span>
                <input className={input} inputMode="numeric" maxLength={2} value={draft.statementDay} onChange={(e) => setDraft({ ...draft, statementDay: e.target.value })} />
              </div>
            </div>
            {!dayValid && <p className="text-xs text-[#8a4a32] mt-2">Statement day is a whole number from 1 to 28.</p>}
            <div className="mt-3 flex items-center gap-3">
              <button
                disabled={busy || !agreementDirty || !dayValid}
                className={btnDark}
                onClick={() => patch({ agreementSignedAt: draft.signedAt || null, termEndsAt: draft.termEndsAt || null, statementDay: dayValue }, { savedKey: "agreement" })}
              >
                Save agreement dates
              </button>
              {savedTick("agreement")}
            </div>
            {termLeft !== null && (
              <p className={`text-xs mt-2 ${termReviewDue ? "text-[#8a6215] font-medium" : "text-[#1a1a1a]/50"}`}>
                {termLeft < 0
                  ? `Minimum term ended ${shortDate(data.termEndsAt!)}.`
                  : `${termLeft} day${termLeft === 1 ? "" : "s"} left in the minimum term (through ${shortDate(data.termEndsAt!)}).`}
                {termReviewDue && <span className={`${chip} bg-[#f5a623]/15 text-[#8a6215] ml-2`}>Term review due</span>}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#e8e4dd]">
              <div>
                <span className={label}>Onboarding fee ($)</span>
                <input className={input} inputMode="decimal" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} />
              </div>
              <div>
                <span className={label}>Paid so far ($)</span>
                <input className={input} inputMode="decimal" value={draft.paid} onChange={(e) => setDraft({ ...draft, paid: e.target.value })} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {/* A link already on screen was made for the old fee, so it is cleared with the save. */}
              <button disabled={busy || !moneyDirty} className={btnDark} onClick={() => { setPayLink(""); patch({ onboardingFeeCents: toCents(draft.fee), paidCents: toCents(draft.paid) }, { savedKey: "money" }); }}>Save amounts</button>
              {savedTick("money")}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e8e4dd]">
              {feePaid ? (
                <p className="text-xs text-[#1a1a1a]/50">“Onboarding fee received” is ticked, so no payment link is offered. Reopen that step under Signed · fee due if another link is needed.</p>
              ) : payLink ? (
                <>
                  <span className={label}>Onboarding fee payment link · paste into the email to the owner</span>
                  <div className="flex gap-2">
                    <input readOnly className={`${input} min-w-0`} value={payLink} onFocus={(e) => e.target.select()} />
                    <button
                      className={btnGhost}
                      onClick={() => { navigator.clipboard.writeText(payLink); setSaved("link"); setTimeout(() => setSaved((k) => (k === "link" ? "" : k)), 2500); }}
                    >
                      {saved === "link" ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-[#1a1a1a]/45 mt-1">This link charges {money(data.onboardingFeeCents)}. When the owner pays, this page ticks “Onboarding fee received”, adds the amount to paid so far, and logs it. Send it only after the agreement is signed.</p>
                </>
              ) : (
                <>
                  <button
                    disabled={busy || data.onboardingFeeCents === 0 || moneyDirty}
                    onClick={createPayLink}
                    className="text-xs font-medium text-[#1A4D4F] hover:underline disabled:opacity-50 disabled:hover:no-underline disabled:cursor-not-allowed"
                  >
                    Create onboarding fee payment link{data.onboardingFeeCents > 0 ? ` (${money(data.onboardingFeeCents)})` : ""} →
                  </button>
                  {data.onboardingFeeCents === 0 ? (
                    <p className="text-xs text-[#1a1a1a]/45 mt-1">Enter this owner&apos;s onboarding fee first</p>
                  ) : moneyDirty ? (
                    <p className="text-xs text-[#1a1a1a]/45 mt-1">Save the amounts first. The link is made for the saved fee.</p>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Notes</h3>
            <p className="text-xs text-[#1a1a1a]/45 mb-2">No VINs, policy numbers, bank details, or passwords. Those live in the owner folder and on the signed exhibits.</p>
            <textarea rows={5} className={input} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            <div className="mt-2 flex items-center gap-3">
              <button disabled={busy || !notesDirty} className={btnDark} onClick={() => patch({ notes: draft.notes || null }, { savedKey: "notes" })}>Save notes</button>
              {savedTick("notes")}
            </div>
          </div>

          {/* Contact details */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-3">Contact details</h3>
            <span className={label}>Owner name</span>
            <input className={input} value={draft.clientName} onChange={(e) => setDraft({ ...draft, clientName: e.target.value })} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="col-span-2">
                <span className={label}>Email</span>
                <input type="email" className={input} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </div>
              <div className="col-span-2">
                <span className={label}>Phone</span>
                <input className={input} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </div>
              <div>
                <span className={label}>Market city</span>
                <input className={input} value={draft.marketCity} onChange={(e) => setDraft({ ...draft, marketCity: e.target.value })} />
              </div>
              <div>
                <span className={label}>State</span>
                <input className={`${input} uppercase`} maxLength={2} value={draft.marketState} onChange={(e) => setDraft({ ...draft, marketState: e.target.value })} />
              </div>
              <div className="col-span-2">
                <span className={label}>Source</span>
                <input className={input} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} />
              </div>
            </div>
            {!stateOk(draft.marketState) && <p className="text-xs text-[#8a4a32] mt-2">State is a two-letter code.</p>}
            <div className="mt-3 flex items-center gap-3">
              <button
                disabled={busy || !contactDirty || !draft.clientName.trim() || !stateOk(draft.marketState)}
                className={btnDark}
                onClick={() =>
                  patch(
                    {
                      clientName: draft.clientName, email: draft.email || null, phone: draft.phone || null,
                      marketCity: draft.marketCity || null, marketState: draft.marketState || null, source: draft.source || null,
                    },
                    { savedKey: "contact" },
                  )
                }
              >
                Save contact details
              </button>
              {savedTick("contact")}
            </div>
          </div>

          <div className="text-right">
            <button onClick={() => setConfirmDelete(true)} className={btnRed}>Remove from the board</button>
          </div>
        </div>
      </div>

      {confirmMove && nextStage && (
        <Modal title={`Move ${data.clientName} to ${nextStage.label}?`} onClose={() => setConfirmMove(false)}>
          <p className="text-sm text-[#1a1a1a]/70">This moves the owner from <strong>{stage.label}</strong> to <strong>{nextStage.label}</strong> and logs it in the timeline.</p>
          <p className="text-sm text-[#1a1a1a]/70 mt-2">
            {openCount === 0
              ? "Every step in this stage is done."
              : `${openCount} step${openCount === 1 ? " is" : "s are"} still open in ${stage.label}. You can move on anyway.`}
          </p>
          {data.stage === "signed" && !feePaid && (
            <p className="text-sm text-[#8a4a32] mt-2">“Onboarding fee received” is not ticked. Moving the stage does not mark anything paid.</p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setConfirmMove(false)}>Stay</button>
            {/* Close first: once the move lands, "next" already means the stage after it. */}
            <button disabled={busy} className={btnGreen} onClick={() => { setConfirmMove(false); patch({ stage: nextStage.key }, { confirm: true }); }}>Yes, move to {nextStage.label}</button>
          </div>
        </Modal>
      )}

      {addingVehicle && (
        <Modal title="Add a vehicle" onClose={() => setAddingVehicle(false)}>
          <form onSubmit={addVehicle}>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">One per Exhibit A column. It starts as Proposed. No VIN, policy number, or lienholder detail goes here.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={label}>Year</span>
                <input className={input} inputMode="numeric" maxLength={4} value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
              </div>
              <div>
                <span className={label}>Color</span>
                <input className={input} value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} />
              </div>
              <div>
                <span className={label}>Make</span>
                <input className={input} value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} />
              </div>
              <div>
                <span className={label}>Model</span>
                <input className={input} value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
              </div>
              <div>
                <span className={label}>Plate state</span>
                <input className={`${input} uppercase`} maxLength={2} value={newVehicle.plateState} onChange={(e) => setNewVehicle({ ...newVehicle, plateState: e.target.value })} />
              </div>
              <div />
              <div>
                <span className={label}>Garaging city</span>
                <input className={input} value={newVehicle.garagingCity} onChange={(e) => setNewVehicle({ ...newVehicle, garagingCity: e.target.value })} />
              </div>
              <div>
                <span className={label}>Garaging state</span>
                <input className={`${input} uppercase`} maxLength={2} value={newVehicle.garagingState} onChange={(e) => setNewVehicle({ ...newVehicle, garagingState: e.target.value })} />
              </div>
            </div>
            {!(yearOk(newVehicle.year) && stateOk(newVehicle.plateState) && stateOk(newVehicle.garagingState)) && (
              <p className="text-xs text-[#8a4a32] mt-2">Year is four digits. States are two letters.</p>
            )}
            {vehicleError && <p className="text-xs text-[#8a4a32] mt-2">{vehicleError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setAddingVehicle(false)}>Cancel</button>
              <button
                disabled={busy || (!newVehicle.make.trim() && !newVehicle.model.trim()) || !yearOk(newVehicle.year) || !stateOk(newVehicle.plateState) || !stateOk(newVehicle.garagingState)}
                className={btnDark}
              >
                Add vehicle
              </button>
            </div>
          </form>
        </Modal>
      )}

      {removeVehicle && (
        <Modal title={`Remove ${vehicleLabel(removeVehicle)}?`} onClose={() => setRemoveVehicle(null)}>
          <p className="text-sm text-[#1a1a1a]/70">This permanently deletes this vehicle and its checklist from the owner&apos;s card. It cannot be undone. The removal itself is logged in the timeline. If the vehicle was reviewed and turned down, set its status to Declined instead so the record stays.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setRemoveVehicle(null)}>Keep</button>
            <button disabled={busy} className={btnRed} onClick={handleRemoveVehicle}>Yes, remove permanently</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={`Remove ${data.clientName}?`} onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-[#1a1a1a]/70">This permanently deletes this owner from the tracker, along with their vehicles, every checklist, the monthly cycle, and their whole timeline. It cannot be undone. Their CRM contact, their application, and the owner folder are not touched.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setConfirmDelete(false)}>Keep</button>
            <button disabled={busy} className={btnRed} onClick={handleDelete}>Yes, remove permanently</button>
          </div>
        </Modal>
      )}

      {confirmSend && mail && (
        <Modal title="Send this email to the owner?" onClose={() => setConfirmSend(false)}>
          <p className="text-sm text-[#1a1a1a]/70">It goes to <strong>{data.email}</strong> right now, from BNHG, with replies coming to the admin inbox. It will be logged in the timeline.</p>
          <p className="mt-3 text-sm font-medium text-[#1a1a1a] break-words">{mail.subject}</p>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-[#1a1a1a]/70 bg-[#f8f6f1] border border-[#e8e4dd] rounded-lg p-3">{mail.body}</pre>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setConfirmSend(false)}>Go back</button>
            <button disabled={busy} className={btnGreen} onClick={sendMail}>Yes, send it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
