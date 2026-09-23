"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  OPERATING_STAGES,
  PHASES,
  TERM_REVIEW_WINDOW_DAYS,
  VEHICLE_STATUSES,
  daysUntil,
  getStage,
  isStatementLate,
  monthLabel,
  previousMonth,
  stepsFor,
  type OwnerKey,
  type PhaseKey,
  type VehicleStatusKey,
} from "@/lib/fleet/journey";
import type { EngagementListItem } from "@/lib/fleet/engagements";
import { shortDate, todayLocal } from "@/components/admin/partnership/ui";

type Row = EngagementListItem;

interface CrmContact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
}

// Stages with nothing left to chase, so a stale due date is not a fire.
const CLOSED_STAGES = new Set(["alumni", "declined", "closed_lost"]);
const MAX_CHIPS = 5;

// One chip per vehicle. Grey until reviewed, filling in as it moves, green once it earns.
const VEHICLE_CHIP: Record<VehicleStatusKey, string> = {
  proposed: "bg-[#1a1a1a]/5 text-[#1a1a1a]/60 border-[#1a1a1a]/15",
  accepted: "bg-[#f5a623]/15 text-[#8a6215] border-[#f5a623]/40",
  declined: "bg-[#c0674a]/12 text-[#8a4a32] border-[#c0674a]/35",
  onboarding: "bg-[#1A4D4F]/10 text-[#1A4D4F] border-[#1A4D4F]/30",
  live: "bg-[#5b9a2f]/15 text-[#2d4f15] border-[#5b9a2f]/45",
  paused: "bg-[#B08D57]/15 text-[#7a5e36] border-[#B08D57]/40",
  returned: "bg-white text-[#1a1a1a]/45 border-[#1a1a1a]/15",
};

const EMPTY_FORM = {
  clientName: "",
  email: "",
  phone: "",
  marketCity: "",
  marketState: "",
  source: "",
  owner: "alex" as OwnerKey,
};

// The three things a card can be late on. The statement flag needs the
// owner's statement day and a first live date; with either missing there is
// no deadline to miss, so it stays quiet.
function flagsFor(r: Row, today: string) {
  const overdue = !!r.nextActionDue && r.nextActionDue < today && !CLOSED_STAGES.has(r.stage);
  const liveDates = r.vehicles.map((v) => v.liveAt).filter((d): d is string => !!d).sort();
  const statementLate =
    OPERATING_STAGES.includes(r.stage) &&
    isStatementLate({
      doneKeys: r.doneStepKeys,
      statementDay: r.statementDay,
      firstLiveAt: liveDates[0] ?? null,
      today,
    });
  const termLeft = r.stage === "operating" && r.termEndsAt ? daysUntil(r.termEndsAt, today) : null;
  const termReviewDue = termLeft !== null && termLeft <= TERM_REVIEW_WINDOW_DAYS;
  return { overdue, statementLate, termReviewDue, termLeft };
}

export default function FleetBoardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<"all" | PhaseKey>("all");
  const [owner, setOwner] = useState<"all" | OwnerKey>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [contactId, setContactId] = useState<number | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [crmQuery, setCrmQuery] = useState("");
  const [crmHits, setCrmHits] = useState<CrmContact[]>([]);

  // Search the CRM as you type so an owner already in it is pulled in, linked,
  // and never retyped. Debounced; the CRM route does the matching.
  useEffect(() => {
    const q = crmQuery.trim();
    if (q.length < 2) {
      setCrmHits([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/admin/crm?search=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { contacts: [] }))
        .then((j) => setCrmHits((j.contacts as CrmContact[]).slice(0, 6)));
    }, 250);
    return () => clearTimeout(t);
  }, [crmQuery]);

  function pickContact(c: CrmContact) {
    setForm((f) => ({ ...f, clientName: c.name ?? "", email: c.email ?? "", phone: c.phone ?? "", source: c.source ?? f.source }));
    setContactId(c.id);
    setCrmQuery("");
    setCrmHits([]);
  }

  useEffect(() => {
    fetch("/api/admin/fleet")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Could not load the tracker");
        return res.json();
      })
      .then((data: { engagements: Row[] }) => setRows(data.engagements))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // "Start a fleet engagement" on a car application or a CRM contact lands
  // here with the person in the query string. Read it off window rather than
  // useSearchParams so the page needs no Suspense boundary.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (!q.get("name") && q.get("new") !== "1") return;
    // A state that is not a two-letter code is left blank, never truncated.
    const state = (q.get("state") ?? "").trim();
    setForm((f) => ({
      ...f,
      clientName: q.get("name") ?? "",
      email: q.get("email") ?? "",
      phone: q.get("phone") ?? "",
      marketCity: q.get("city") ?? "",
      marketState: /^[A-Za-z]{2}$/.test(state) ? state.toUpperCase() : "",
      source: q.get("source") ?? "",
    }));
    setContactId(Number(q.get("contactId")) || null);
    setApplicationId(Number(q.get("applicationId")) || null);
    setShowForm(true);
  }, []);

  const today = todayLocal();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (phase !== "all" && getStage(r.stage)?.phase !== phase) return false;
      if (owner !== "all" && r.owner !== owner) return false;
      if (!q) return true;
      return [r.clientName, r.email, r.marketCity, ...r.vehicles.map((v) => v.label)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, search, phase, owner]);

  const phaseCounts = useMemo(() => {
    const counts = Object.fromEntries(PHASES.map((p) => [p.key, 0])) as Record<PhaseKey, number>;
    for (const r of rows) {
      const p = getStage(r.stage)?.phase;
      if (p) counts[p]++;
    }
    return counts;
  }, [rows]);

  const liveCount = useMemo(
    () => rows.reduce((n, r) => n + r.vehicles.filter((v) => v.status === "live").length, 0),
    [rows],
  );

  // What needs a human today: late next actions, a monthly statement that has
  // not gone out, and a minimum term about to end with no review started.
  const attention = useMemo(() => {
    const items: { id: number; name: string; text: string }[] = [];
    for (const r of rows) {
      const f = flagsFor(r, today);
      if (f.overdue) {
        items.push({ id: r.id, name: r.clientName, text: `Overdue since ${shortDate(r.nextActionDue!)}: ${r.nextAction ?? "next action"}` });
      }
      if (f.statementLate) {
        items.push({ id: r.id, name: r.clientName, text: `${monthLabel(previousMonth(today))} statement not sent · it was due by day ${r.statementDay}` });
      }
      if (f.termReviewDue) {
        items.push({
          id: r.id,
          name: r.clientName,
          text:
            f.termLeft! < 0
              ? `Minimum term ended ${shortDate(r.termEndsAt!)} · start the term review`
              : `Minimum term ends in ${f.termLeft} day${f.termLeft === 1 ? "" : "s"} · start the term review`,
        });
      }
    }
    return items;
  }, [rows, today]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pipelineContactId: contactId, applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add the owner");
      router.push(`/admin/fleet/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const pill = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
        : "bg-white text-[#1a1a1a]/60 border-[#e8e4dd] hover:border-[#1a1a1a]/30"
    }`;
  const input =
    "w-full px-3 py-2 text-sm border border-[#e8e4dd] rounded-lg focus:outline-none focus:border-[#5b9a2f] transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#1a1a1a]/60">
          {loading ? "Loading…" : `${rows.length} on the board · ${liveCount} vehicle${liveCount === 1 ? "" : "s"} live`}
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#1a1a1a] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          {showForm ? "Cancel" : "+ New owner"}
        </button>
      </div>

      {error && (
        <div className="bg-[#c0674a]/10 border border-[#c0674a]/30 text-[#8a4a32] text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-[#e8e4dd] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-6 relative">
            <label className="text-xs font-medium text-[#1a1a1a]/60">
              Already in the CRM? Search by name or email to pull them in
              <input className={`${input} mt-1`} placeholder="Start typing…" value={crmQuery} onChange={(e) => setCrmQuery(e.target.value)} />
            </label>
            {crmHits.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#e8e4dd] rounded-lg shadow-lg divide-y divide-[#e8e4dd]">
                {crmHits.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => pickContact(c)} className="w-full text-left px-3 py-2 text-sm hover:bg-[#f8f6f1]">
                      <span className="font-medium text-[#1a1a1a]">{c.name || "No name"}</span>
                      <span className="text-[#1a1a1a]/50">{[c.email, c.phone].filter(Boolean).map((v) => ` · ${v}`).join("")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {contactId && (
              <p className="text-xs text-[#3d6a1f] mt-1">
                Linked to CRM contact #{contactId}.{" "}
                <button type="button" className="underline" onClick={() => setContactId(null)}>Unlink</button>
              </p>
            )}
            {applicationId && (
              <p className="text-xs text-[#3d6a1f] mt-1">
                Linked to management application #{applicationId}.{" "}
                <button type="button" className="underline" onClick={() => setApplicationId(null)}>Unlink</button>
              </p>
            )}
          </div>
          <label className="sm:col-span-3 text-xs font-medium text-[#1a1a1a]/60">
            Owner name
            <input required className={`${input} mt-1`} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          </label>
          <label className="sm:col-span-3 text-xs font-medium text-[#1a1a1a]/60">
            Email
            <input type="email" className={`${input} mt-1`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-medium text-[#1a1a1a]/60">
            Phone
            <input className={`${input} mt-1`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="sm:col-span-3 text-xs font-medium text-[#1a1a1a]/60">
            Market city (where the vehicles will run)
            <input className={`${input} mt-1`} value={form.marketCity} onChange={(e) => setForm({ ...form, marketCity: e.target.value })} />
          </label>
          <label className="sm:col-span-1 text-xs font-medium text-[#1a1a1a]/60">
            State
            <input maxLength={2} className={`${input} mt-1 uppercase`} value={form.marketState} onChange={(e) => setForm({ ...form, marketState: e.target.value })} />
          </label>
          <label className="sm:col-span-4 text-xs font-medium text-[#1a1a1a]/60">
            Source
            <input placeholder="Management application, referral, CRM" className={`${input} mt-1`} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-medium text-[#1a1a1a]/60">
            Lead
            <select className={`${input} mt-1`} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value as OwnerKey })}>
              <option value="alex">Alex</option>
              <option value="della">Della</option>
            </select>
          </label>
          <div className="sm:col-span-6 flex items-center gap-3">
            <button disabled={saving} className="bg-[#5b9a2f] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#4a7d25] disabled:opacity-50 transition-colors">
              {saving ? "Adding…" : "Add to the board"}
            </button>
            <span className="text-xs text-[#1a1a1a]/40">
              Contact and status only. Vehicles are added on the owner&apos;s page. VINs and policy numbers stay on the signed Exhibit A.
            </span>
          </div>
        </form>
      )}

      {attention.length > 0 && (
        <div className="bg-[#f5a623]/10 border border-[#f5a623]/35 rounded-lg p-4">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[#8a6215] mb-2">
            Needs attention today
          </h2>
          <ul className="space-y-1">
            {attention.map((a, i) => (
              <li key={`${a.id}-${i}`} className="text-sm">
                <Link href={`/admin/fleet/${a.id}`} className="font-medium text-[#1a1a1a] hover:text-[#5b9a2f]">
                  {a.name}
                </Link>
                <span className="text-[#1a1a1a]/60"> · {a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phase strip doubles as the filter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PHASES.map((p) => {
          const active = phase === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPhase(active ? "all" : p.key)}
              title={p.blurb}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                active ? "bg-[#1A4D4F] border-[#1A4D4F] text-white" : "bg-white border-[#e8e4dd] hover:border-[#1A4D4F]/40"
              }`}
            >
              <div className={`text-[11px] font-semibold tracking-wider uppercase ${active ? "text-white/70" : "text-[#1a1a1a]/45"}`}>
                {p.label}
              </div>
              <div className="font-display text-2xl font-semibold leading-tight">{phaseCounts[p.key]}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-[#e8e4dd] rounded-lg p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search owner, email, city, vehicle…"
          className={`${input} flex-1`}
        />
        <div className="flex gap-1.5">
          {(["all", "alex", "della"] as const).map((o) => (
            <button key={o} onClick={() => setOwner(o)} className={pill(owner === o)}>
              {o === "all" ? "Everyone" : o === "alex" ? "Alex" : "Della"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Loading the board…</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#e8e4dd] rounded-lg">
          <p className="text-sm text-[#1a1a1a]/50">Nobody on the board yet.</p>
          <p className="text-xs text-[#1a1a1a]/35 mt-1">
            Add the first owner with “+ New owner”, or start one from a car application or a CRM contact.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Nothing matches those filters.</p>
      ) : (
        <div className="bg-white border border-[#e8e4dd] rounded-lg divide-y divide-[#e8e4dd]">
          {filtered.map((r) => {
            const stage = getStage(r.stage);
            const steps = stepsFor(r.stage);
            const done = steps.filter((s) => r.doneStepKeys.includes(s.key)).length;
            const { overdue, statementLate, termReviewDue } = flagsFor(r, today);
            return (
              <Link
                key={r.id}
                href={`/admin/fleet/${r.id}`}
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_minmax(0,1.4fr)] gap-x-5 gap-y-2 px-4 py-3 hover:bg-[#f8f6f1] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a1a1a] truncate">{r.clientName}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#1a1a1a]/5 text-[10px] font-semibold text-[#1a1a1a]/60 flex items-center justify-center uppercase" title={`Lead: ${r.owner}`}>
                      {r.owner[0]}
                    </span>
                  </div>
                  <div className="text-xs text-[#1a1a1a]/50 truncate">
                    {[r.marketCity, r.marketState].filter(Boolean).join(", ") || "No market yet"}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-[#1A4D4F] bg-[#1A4D4F]/8 border border-[#1A4D4F]/20 rounded-full px-2 py-0.5">
                      {stage?.label ?? r.stage}
                    </span>
                    {statementLate && (
                      <span className="text-xs font-medium border rounded-full px-2 py-0.5 bg-[#c0674a]/12 text-[#8a4a32] border-[#c0674a]/35">
                        Statement late
                      </span>
                    )}
                    {termReviewDue && (
                      <span className="text-xs font-medium border rounded-full px-2 py-0.5 bg-[#f5a623]/15 text-[#8a6215] border-[#f5a623]/40">
                        Term review due
                      </span>
                    )}
                  </div>
                  {steps.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[140px] rounded-full bg-[#1a1a1a]/8 overflow-hidden">
                        <div className="h-full bg-[#5b9a2f]" style={{ width: `${(done / steps.length) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-[#1a1a1a]/45">{done} of {steps.length}</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex flex-wrap items-center gap-1" aria-label="Vehicles">
                  {r.vehicles.length === 0 ? (
                    <span className="text-xs text-[#1a1a1a]/30">No vehicles yet</span>
                  ) : (
                    <>
                      {r.vehicles.slice(0, MAX_CHIPS).map((v) => (
                        <span key={v.id} className={`max-w-full truncate text-[11px] font-medium border rounded-full px-2 py-0.5 ${VEHICLE_CHIP[v.status]}`}>
                          {v.label} · {VEHICLE_STATUSES.find((s) => s.key === v.status)?.label ?? v.status}
                        </span>
                      ))}
                      {r.vehicles.length > MAX_CHIPS && (
                        <span className="text-[11px] text-[#1a1a1a]/45">+{r.vehicles.length - MAX_CHIPS} more</span>
                      )}
                    </>
                  )}
                </div>

                <div className="min-w-0 text-sm">
                  <div className={`truncate ${overdue ? "text-[#8a4a32] font-medium" : "text-[#1a1a1a]/75"}`}>
                    {r.nextAction || <span className="text-[#1a1a1a]/30">No next action set</span>}
                  </div>
                  <div className="text-xs text-[#1a1a1a]/45 flex flex-wrap gap-x-3">
                    {r.nextActionDue && <span className={overdue ? "text-[#8a4a32]" : ""}>Due {shortDate(r.nextActionDue)}</span>}
                    {r.termEndsAt && OPERATING_STAGES.includes(r.stage) && (
                      <span className={termReviewDue ? "text-[#8a6215] font-medium" : ""}>Term ends {shortDate(r.termEndsAt)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
