"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  PACKAGES,
  PATHS,
  PHASES,
  SECTIONS,
  SECTION_STATUSES,
  STAGES,
  VERDICTS,
  daysUntil,
  getDoc,
  getStage,
  stageIndex,
  stepsFor,
  type PathKey,
  type SectionStatusKey,
  type StageKey,
  type VerdictKey,
} from "@/lib/partnership/journey";
import type { EngagementDetail, EngagementPatch } from "@/lib/partnership/engagements";
import type { EmailTemplate } from "@/lib/partnership/emails";
import {
  OWNER_CHIP,
  SECTION_PIP,
  VERDICT_BADGE,
  docHref,
  dollars,
  shortDate,
  todayLocal,
} from "@/components/admin/partnership/ui";
import { Modal } from "@/components/admin/partnership/Modal";
import { relativeTime } from "@/lib/utils";

const EVENT_KINDS = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "doc", label: "Doc sent" },
] as const;

const VERDICT_HELP: Record<VerdictKey, string> = {
  go: "$1,000 credit · 30 days · opens the decision window",
  adjust: "$1,000 credit · 90 days · starts the Fix-It Path",
  no_go: "$500 credit · 12 months · opens the alternate paths",
};

// The paths that make sense after each verdict, with when to pick each one.
const PATH_CHOICES: Record<VerdictKey, { key: PathKey; when: string }[]> = {
  go: [
    { key: "partnership", when: "Buying the package (standard or founding)" },
    { key: "a_la_carte", when: "Buying one or more sections on their own" },
    { key: "market_watch", when: "A Go, but not ready to start yet" },
  ],
  adjust: [
    { key: "fix_it", when: "Making the fixes, then a free re-score" },
    { key: "market_watch", when: "Not making the fixes for now" },
  ],
  no_go: [
    { key: "alt_strategy", when: "Whole-home mid-term or short-term won the comparison" },
    { key: "next_property", when: "Good operator, wrong house: free Buy Box, then Rapid Screens" },
    { key: "market_watch", when: "Not ready: capital or timing" },
  ],
};

const card = "bg-white border border-[#e8e4dd] rounded-lg p-4 min-w-0";
const label = "block text-[11px] font-semibold tracking-wider uppercase text-[#1a1a1a]/45 mb-1";
const input =
  "w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors bg-white";
const btn = "px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40";
const btnDark = `${btn} bg-[#1a1a1a] text-white hover:bg-[#333]`;
const btnGreen = `${btn} bg-[#5b9a2f] text-white hover:bg-[#4a7d25]`;
const btnGhost = `${btn} bg-white border border-[#e8e4dd] text-[#1a1a1a]/70 hover:border-[#1a1a1a]/30`;

export default function PartnershipClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<EngagementDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [viewStage, setViewStage] = useState<StageKey | null>(null);
  const [pendingVerdict, setPendingVerdict] = useState<VerdictKey | null>(null);
  const [draft, setDraft] = useState({ nextAction: "", nextActionDue: "", notes: "", contract: "", paid: "", credit: "", creditExpiresAt: "" });
  const [eventKind, setEventKind] = useState<(typeof EVENT_KINDS)[number]["value"]>("note");
  const [eventBody, setEventBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [payLink, setPayLink] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [mail, setMail] = useState<{ templateId: string; subject: string; body: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/partnership/${id}`);
    if (!res.ok) {
      setError(res.status === 404 ? "That client is not on the board." : "Could not load this client.");
      return;
    }
    const d: EngagementDetail = await res.json();
    setData(d);
    setDraft({
      nextAction: d.nextAction ?? "",
      nextActionDue: d.nextActionDue ?? "",
      notes: d.notes ?? "",
      contract: d.contractCents ? String(d.contractCents / 100) : "",
      paid: d.paidCents ? String(d.paidCents / 100) : "",
      credit: d.creditCents ? String(d.creditCents / 100) : "",
      creditExpiresAt: d.creditExpiresAt ?? "",
    });
    // Drafts are merged server-side with this client's name, property, and credit date.
    fetch(`/api/admin/partnership/${id}/email`)
      .then((r) => (r.ok ? r.json() : { templates: [] }))
      .then((j) => setTemplates(j.templates));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Sends only the fields it means to change. `confirm` marks a deliberate
  // action (confirm verdict, move stage) and is the only thing that writes the
  // timeline; trying values in a dropdown never does.
  async function patch(body: EngagementPatch, opts: { confirm?: boolean; savedKey?: string } = {}) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/partnership/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, confirm: opts.confirm === true }),
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

  async function toggleStep(stepKey: string, done: boolean) {
    if (!data) return;
    setData({
      ...data,
      doneSteps: done
        ? [...data.doneSteps, { key: stepKey, doneBy: null, doneAt: new Date().toISOString() }]
        : data.doneSteps.filter((s) => s.key !== stepKey),
    });
    const res = await fetch(`/api/admin/partnership/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepKey, done }),
    });
    if (!res.ok) setError("That step did not save.");
    await load(); // a completed task is what the timeline records
  }

  async function post(path: string, body: unknown): Promise<{ ok: boolean; json: Record<string, string> }> {
    const res = await fetch(`/api/admin/partnership/${id}/${path}`, {
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
    const r = await post("checkout", { item: "s1" });
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

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/admin/partnership/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/partnership");
    else {
      setError("Remove failed.");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  const toCents = (v: string) => Math.round((parseFloat(v.replace(/[^0-9.]/g, "")) || 0) * 100);
  const today = todayLocal();
  const shownStage = viewStage ?? data?.stage ?? "lead";
  const steps = useMemo(() => (data ? stepsFor(shownStage, data.path) : []), [data, shownStage]);

  if (error && !data) {
    return (
      <div className={card}>
        <p className="text-sm text-[#8a4a32]">{error}</p>
        <Link href="/admin/partnership" className="text-sm text-[#5b9a2f] mt-2 inline-block">← Back to the board</Link>
      </div>
    );
  }
  if (!data) return <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Loading…</p>;

  const doneKeys = new Set(data.doneSteps.map((s) => s.key));
  const currentIdx = stageIndex(data.stage);
  const stage = getStage(data.stage)!;
  const stageDone = steps.length > 0 && steps.every((s) => doneKeys.has(s.key));
  const nextLinear = STAGES[currentIdx + 1];
  // Past the fork the journey is a straight line; inside it the verdict and
  // path decide where the client goes, so there is no single "next".
  const canAdvance = !!nextLinear && !["s1_verdict", "decision", "fix_it", "pivot", "handoff"].includes(data.stage) && stage.phase !== "after";
  const creditLeft = data.creditExpiresAt ? daysUntil(data.creditExpiresAt, today) : null;
  const showFork = currentIdx >= stageIndex("s1_verdict");
  const verdictStage = VERDICTS.find((v) => v.key === data.verdict)?.nextStage;
  const overdue = !!data.nextActionDue && data.nextActionDue < today;
  // Moving the stage never assumes money changed hands. Say so when it hasn't.
  const unpaidPastProposal =
    currentIdx > stageIndex("s1_proposed") && stage.phase !== "after" &&
    !doneKeys.has("s1_proposed.paid") && ["not_sold", "proposed"].includes(data.sections[0]);
  const nextDirty = draft.nextAction !== (data.nextAction ?? "") || draft.nextActionDue !== (data.nextActionDue ?? "");
  const moneyDirty = toCents(draft.contract) !== data.contractCents || toCents(draft.paid) !== data.paidCents;
  const creditDirty = toCents(draft.credit) !== data.creditCents || draft.creditExpiresAt !== (data.creditExpiresAt ?? "");
  const notesDirty = draft.notes !== (data.notes ?? "");
  const stageTemplates = templates.filter((t) => t.stage === data.stage);
  const openSlots = mail ? [...new Set(`${mail.subject}\n${mail.body}`.match(/\[\[[^\]]+\]\]/g) ?? [])] : [];
  const savedTick = (key: string) => saved === key && <span className="text-xs text-[#3d6a1f] font-medium">Saved ✓</span>;

  return (
    <div className="space-y-4 min-w-0">
      <Link href="/admin/partnership" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]">← All clients</Link>

      {error && <div className="bg-[#c0674a]/10 border border-[#c0674a]/30 text-[#8a4a32] text-sm rounded-lg px-4 py-3">{error}</div>}
      {saved === "mail" && <div className="bg-[#5b9a2f]/10 border border-[#5b9a2f]/30 text-[#2d4f15] text-sm rounded-lg px-4 py-3">Email sent and logged in the timeline.</div>}
      {overdue && (
        <div className="bg-[#f5a623]/10 border border-[#f5a623]/35 text-[#8a6215] text-sm rounded-lg px-4 py-3">
          <strong>Needs attention:</strong> “{data.nextAction || "Next action"}” was due {shortDate(data.nextActionDue!)}. This also shows at the top of the board.
        </div>
      )}
      {unpaidPastProposal && (
        <div className="bg-[#c0674a]/8 border border-[#c0674a]/25 text-[#8a4a32] text-sm rounded-lg px-4 py-3">
          <strong>No payment is recorded for Section 1.</strong> Moving a client to a later stage does not mark anything paid. Tick “Payment received” under Section 1 proposed, or set Section 1 to Sold, once the money is in.
        </div>
      )}

      {/* Header */}
      <div className={`${card} flex flex-wrap items-start justify-between gap-4`}>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-[#1a1a1a] break-words">{data.clientName}</h2>
          <p className="text-sm text-[#1a1a1a]/60">
            {[data.propertyLabel, [data.propertyCity, data.propertyState].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "No property yet"}
          </p>
          <p className="text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {data.email && <a className="text-[#1A4D4F] hover:underline break-all" href={`mailto:${data.email}`}>{data.email}</a>}
            {data.phone && <a className="text-[#1A4D4F] hover:underline" href={`tel:${data.phone}`}>{data.phone}</a>}
            {data.source && <span className="text-[#1a1a1a]/45">Source: {data.source}</span>}
            {data.pipelineContactId && <Link className="text-[#1a1a1a]/45 hover:text-[#1a1a1a]" href="/admin/outreach/crm">CRM contact #{data.pipelineContactId}</Link>}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className={label}>Lead</span>
            <select className={input} value={data.owner} disabled={busy} onChange={(e) => patch({ owner: e.target.value as "della" | "alex" })}>
              <option value="della">Della</option>
              <option value="alex">Alex</option>
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
                  const idx = stageIndex(s.key);
                  const isCurrent = s.key === data.stage;
                  const isViewed = s.key === shownStage;
                  // The three fork stages are alternatives, not a sequence: only the
                  // one this client's verdict actually sent them through counts as passed.
                  const isPast =
                    idx < currentIdx && p.key !== "after" && stage.phase !== "after" &&
                    (p.key !== "decide" || s.key === verdictStage);
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
              <p className="text-sm text-[#1a1a1a]/45">No checklist for this stage on the current path.</p>
            ) : (
              <ul className="divide-y divide-[#e8e4dd]">
                {steps.map((s) => {
                  const doc = s.doc ? getDoc(s.doc) : undefined;
                  const checked = doneKeys.has(s.key);
                  return (
                    <li key={s.key} className="flex items-start gap-3 py-2.5">
                      <input type="checkbox" checked={checked} onChange={(e) => toggleStep(s.key, e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#5b9a2f]" aria-label={s.label} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${checked ? "text-[#1a1a1a]/40 line-through" : "text-[#1a1a1a]"}`}>{s.label}</span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 ${OWNER_CHIP[s.owner]}`}>{s.owner}</span>
                          {s.flag && <span className="text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 bg-[#c0674a]/12 text-[#8a4a32]">{s.flag === "legal" ? "Legal" : "Money"}</span>}
                          {doc && <a href={docHref(doc.key)} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A4D4F] hover:underline">Open: {doc.title} ↗</a>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {!viewStage && canAdvance && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button disabled={busy} onClick={() => patch({ stage: nextLinear.key }, { confirm: true })} className={stageDone ? btnGreen : btnGhost}>
                  Move to {nextLinear.label} →
                </button>
                <span className="text-xs text-[#1a1a1a]/50">
                  {stageDone ? "Every step is done. Moving on is logged in the timeline." : "Steps are still open. You can move on anyway; it will be logged."}
                </span>
              </div>
            )}
          </div>

          {/* The fork */}
          {showFork && (
            <div className={card}>
              <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Verdict + path</h3>
              <p className="text-xs text-[#1a1a1a]/50 mb-3">
                Pick a verdict, then confirm it. Confirming sets the credit, moves the client to that verdict&apos;s stage, and logs it. Nothing happens until you confirm.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {VERDICTS.map((v) => {
                  const selected = (pendingVerdict ?? data.verdict) === v.key;
                  return (
                    <button
                      key={v.key}
                      disabled={busy}
                      onClick={() => setPendingVerdict(v.key === data.verdict ? null : v.key)}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${selected ? VERDICT_BADGE[v.key] + " ring-2 ring-offset-1 ring-current" : "bg-white border-[#e8e4dd] hover:border-[#1a1a1a]/30"}`}
                    >
                      <div className="font-display text-base font-semibold">{v.label}{data.verdict === v.key && <span className="ml-2 text-[10px] font-sans uppercase tracking-wider">confirmed</span>}</div>
                      <div className="text-[11px] text-[#1a1a1a]/55 leading-snug">{VERDICT_HELP[v.key]}</div>
                    </button>
                  );
                })}
              </div>
              {pendingVerdict && pendingVerdict !== data.verdict && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button disabled={busy} className={btnGreen} onClick={async () => { await patch({ verdict: pendingVerdict }, { confirm: true }); setPendingVerdict(null); }}>
                    Confirm verdict: {VERDICTS.find((v) => v.key === pendingVerdict)!.label}
                  </button>
                  <button className={btnGhost} onClick={() => setPendingVerdict(null)}>Cancel</button>
                </div>
              )}

              {data.verdict && (
                <>
                  <span className={`${label} mt-5`}>Path · which way this client is going</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PATH_CHOICES[data.verdict].map((c) => {
                      const active = data.path === c.key;
                      return (
                        <button key={c.key} disabled={busy || active} onClick={() => patch({ path: c.key }, { savedKey: "path" })}
                          className={`text-left rounded-lg border px-3 py-2 transition-colors ${active ? "bg-[#1A4D4F] border-[#1A4D4F] text-white" : "bg-white border-[#e8e4dd] hover:border-[#1A4D4F]/40"}`}>
                          <div className="text-sm font-medium">{PATHS.find((p) => p.key === c.key)!.label}</div>
                          <div className={`text-[11px] leading-snug ${active ? "text-white/70" : "text-[#1a1a1a]/55"}`}>{c.when}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#1a1a1a]/50 mt-1.5">The checklist above changes to match the path. {savedTick("path")}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mt-4 items-end">
                    <div>
                      <span className={label}>Credit ($)</span>
                      <input className={input} inputMode="decimal" value={draft.credit} onChange={(e) => setDraft({ ...draft, credit: e.target.value })} />
                    </div>
                    <div>
                      <span className={label}>Credit expires</span>
                      <input type="date" className={input} value={draft.creditExpiresAt} onChange={(e) => setDraft({ ...draft, creditExpiresAt: e.target.value })} />
                    </div>
                    <button disabled={busy || !creditDirty} className={btnDark} onClick={() => patch({ creditCents: toCents(draft.credit), creditExpiresAt: draft.creditExpiresAt || null }, { savedKey: "credit" })}>Save credit</button>
                  </div>
                  {creditLeft !== null && data.creditCents > 0 && (
                    <p className={`text-xs mt-2 ${creditLeft < 0 ? "text-[#8a4a32]" : creditLeft <= 7 ? "text-[#8a6215] font-medium" : "text-[#1a1a1a]/50"}`}>
                      {creditLeft < 0 ? `Credit expired ${shortDate(data.creditExpiresAt!)}.` : `${dollars(data.creditCents)} credit, ${creditLeft} day${creditLeft === 1 ? "" : "s"} left (through ${shortDate(data.creditExpiresAt!)}).`} {savedTick("credit")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Email drafts: nothing sends without a person reading and confirming it */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Emails for this stage</h3>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Drafts from the email pack, filled in with what the tracker knows. You read it, edit it, and confirm before anything goes to the client.</p>
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
                  <button disabled={busy || openSlots.length > 0 || !data.email} className={btnGreen} onClick={() => setConfirmSend(true)}>Send to client…</button>
                  <button className={btnGhost} onClick={() => navigator.clipboard.writeText(`${mail.subject}\n\n${mail.body}`)}>Copy text</button>
                  <button className={btnGhost} onClick={() => setMail(null)}>Close</button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Timeline</h3>
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Records what happened: tasks completed, a confirmed verdict, a stage move, emails sent, payments, and anything you log here. Changing a dropdown does not add an entry.</p>
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
            <p className="text-xs text-[#1a1a1a]/50 mb-3">Every open client should have one. Once the due date passes it appears under “Needs attention today” at the top of the board, and as a banner on this page.</p>
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

          {/* What they bought */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-3">Sections + money</h3>
            <span className={label}>Package</span>
            <select className={input} value={data.package} disabled={busy} onChange={(e) => patch({ package: e.target.value as EngagementPatch["package"] })}>
              {PACKAGES.map((p) => <option key={p.key} value={p.key}>{p.label}{p.priceCents ? ` · ${dollars(p.priceCents)}` : ""}</option>)}
            </select>
            <ul className="mt-3 space-y-2">
              {SECTIONS.map((s, i) => (
                <li key={s.n} className="flex items-center gap-2">
                  <span className={`shrink-0 w-6 h-6 rounded-full border text-[10px] font-semibold flex items-center justify-center ${SECTION_PIP[data.sections[i]]}`}>{s.n}</span>
                  <span className="flex-1 min-w-0 text-sm truncate" title={s.label}>{s.short} <span className="text-[#1a1a1a]/40">{dollars(s.priceCents)}</span></span>
                  <select className="text-xs border border-[#e8e4dd] rounded-md px-2 py-1 bg-white" value={data.sections[i]} disabled={busy}
                    onChange={(e) => patch({ sections: { [s.n]: e.target.value as SectionStatusKey } })}>
                    {SECTION_STATUSES.map((st) => <option key={st.key} value={st.key}>{st.label}</option>)}
                  </select>
                </li>
              ))}
            </ul>
            {(data.sections[0] === "not_sold" || data.sections[0] === "proposed") && (
              <div className="mt-4 pt-3 border-t border-[#e8e4dd]">
                {payLink ? (
                  <>
                    <span className={label}>Section 1 payment link · paste into the proposal email</span>
                    <input readOnly className={input} value={payLink} onFocus={(e) => e.target.select()} />
                    <p className="text-xs text-[#1a1a1a]/45 mt-1">When they pay, this page marks Section 1 sold and logs it. Send it only after the engagement letter is signed.</p>
                  </>
                ) : (
                  <button disabled={busy} onClick={createPayLink} className="text-xs font-medium text-[#1A4D4F] hover:underline disabled:opacity-50">Create a Section 1 card payment link ($1,000) →</button>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <span className={label}>Contract ($)</span>
                <input className={input} inputMode="decimal" value={draft.contract} onChange={(e) => setDraft({ ...draft, contract: e.target.value })} />
              </div>
              <div>
                <span className={label}>Paid to date ($)</span>
                <input className={input} inputMode="decimal" value={draft.paid} onChange={(e) => setDraft({ ...draft, paid: e.target.value })} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button disabled={busy || !moneyDirty} className={btnDark} onClick={() => patch({ contractCents: toCents(draft.contract), paidCents: toCents(draft.paid) }, { savedKey: "money" })}>Save amounts</button>
              {savedTick("money")}
            </div>
          </div>

          {/* Notes */}
          <div className={card}>
            <h3 className="font-display text-lg font-semibold text-[#1a1a1a] mb-1">Notes</h3>
            <p className="text-xs text-[#1a1a1a]/45 mb-2">No access codes, passwords, or account numbers. Financials live in the client folder.</p>
            <textarea rows={5} className={input} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            <div className="mt-2 flex items-center gap-3">
              <button disabled={busy || !notesDirty} className={btnDark} onClick={() => patch({ notes: draft.notes || null }, { savedKey: "notes" })}>Save notes</button>
              {savedTick("notes")}
            </div>
          </div>

          <div className="text-right">
            <button onClick={() => setConfirmDelete(true)} className={`${btn} bg-[#b3261e] text-white hover:bg-[#8f1d17]`}>Remove from the board</button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <Modal title={`Remove ${data.clientName}?`} onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-[#1a1a1a]/70">This permanently deletes this client from the tracker, along with their checklist and their whole timeline. It cannot be undone. Their CRM contact and their client folder are not touched.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setConfirmDelete(false)}>Keep</button>
            <button disabled={busy} className={`${btn} bg-[#b3261e] text-white hover:bg-[#8f1d17]`} onClick={handleDelete}>Yes, remove permanently</button>
          </div>
        </Modal>
      )}

      {confirmSend && mail && (
        <Modal title="Send this email to the client?" onClose={() => setConfirmSend(false)}>
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
