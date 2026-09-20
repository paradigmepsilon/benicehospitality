"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PHASES,
  SECTIONS,
  SECTION_STATUSES,
  VERDICTS,
  daysUntil,
  getStage,
  stepsFor,
  type OwnerKey,
  type PhaseKey,
} from "@/lib/partnership/journey";
import type { EngagementRow } from "@/lib/partnership/engagements";
import {
  SECTION_PIP,
  VERDICT_BADGE,
  dollars,
  shortDate,
  todayLocal,
} from "@/components/admin/partnership/ui";

type Row = EngagementRow & { doneStepKeys: string[] };

interface CrmContact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
}

const FOUNDING_SLOTS = 3;
const CLOSED_STAGES = new Set(["alumni", "closed_lost"]);

const EMPTY_FORM = {
  clientName: "",
  email: "",
  phone: "",
  propertyLabel: "",
  propertyCity: "",
  propertyState: "",
  source: "",
  owner: "della" as OwnerKey,
};

export default function PartnershipBoardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [foundingCount, setFoundingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<"all" | PhaseKey>("all");
  const [owner, setOwner] = useState<"all" | OwnerKey>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [contactId, setContactId] = useState<number | null>(null);
  const [crmQuery, setCrmQuery] = useState("");
  const [crmHits, setCrmHits] = useState<CrmContact[]>([]);

  // Search the CRM as you type so a client already in it is pulled in, linked,
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
    fetch("/api/admin/partnership")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Could not load the tracker");
        return res.json();
      })
      .then((data: { engagements: Row[]; foundingCount: number }) => {
        setRows(data.engagements);
        setFoundingCount(data.foundingCount);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // "Start a Launch Partnership engagement" on a CRM contact lands here with
  // the contact in the query string. Read it off window rather than
  // useSearchParams so the page needs no Suspense boundary.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("new") !== "1") return;
    setForm((f) => ({
      ...f,
      clientName: q.get("name") ?? "",
      email: q.get("email") ?? "",
      phone: q.get("phone") ?? "",
      source: q.get("source") ?? "",
    }));
    setContactId(Number(q.get("contactId")) || null);
    setShowForm(true);
  }, []);

  const today = todayLocal();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (phase !== "all" && getStage(r.stage)?.phase !== phase) return false;
      if (owner !== "all" && r.owner !== owner) return false;
      if (!q) return true;
      return [r.clientName, r.email, r.propertyLabel, r.propertyCity]
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

  // What needs a human today: late next actions, and credits about to lapse
  // on clients who have not chosen a path yet.
  const attention = useMemo(() => {
    const items: { id: number; name: string; text: string }[] = [];
    for (const r of rows) {
      if (CLOSED_STAGES.has(r.stage)) continue;
      if (r.nextActionDue && r.nextActionDue < today) {
        items.push({ id: r.id, name: r.clientName, text: `Overdue since ${shortDate(r.nextActionDue)}: ${r.nextAction ?? "next action"}` });
      }
      if (r.creditExpiresAt && r.creditCents > 0 && ["decision", "fix_it", "pivot", "nurture"].includes(r.stage)) {
        const left = daysUntil(r.creditExpiresAt, today);
        if (left >= 0 && left <= 7) {
          items.push({ id: r.id, name: r.clientName, text: `${dollars(r.creditCents)} credit expires in ${left} day${left === 1 ? "" : "s"}` });
        }
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
      const res = await fetch("/api/admin/partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pipelineContactId: contactId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add the client");
      router.push(`/admin/partnership/${data.id}`);
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
          {loading ? "Loading…" : `${rows.length} on the board`}
          {!loading && (
            <>
              {" · "}
              <span className={foundingCount >= FOUNDING_SLOTS ? "text-[#8a4a32] font-medium" : ""}>
                Founding clients {foundingCount} of {FOUNDING_SLOTS}
              </span>
            </>
          )}
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#1a1a1a] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          {showForm ? "Cancel" : "+ New client"}
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
          </div>
          <label className="sm:col-span-3 text-xs font-medium text-[#1a1a1a]/60">
            Client name
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
          <label className="sm:col-span-4 text-xs font-medium text-[#1a1a1a]/60">
            Property (a label, not the full address)
            <input placeholder="4BR ranch near the hospital" className={`${input} mt-1`} value={form.propertyLabel} onChange={(e) => setForm({ ...form, propertyLabel: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-medium text-[#1a1a1a]/60">
            City
            <input className={`${input} mt-1`} value={form.propertyCity} onChange={(e) => setForm({ ...form, propertyCity: e.target.value })} />
          </label>
          <label className="sm:col-span-1 text-xs font-medium text-[#1a1a1a]/60">
            State
            <input maxLength={2} className={`${input} mt-1 uppercase`} value={form.propertyState} onChange={(e) => setForm({ ...form, propertyState: e.target.value })} />
          </label>
          <label className="sm:col-span-2 text-xs font-medium text-[#1a1a1a]/60">
            Source
            <input placeholder="Discovery call, calculator, referral" className={`${input} mt-1`} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </label>
          <label className="sm:col-span-1 text-xs font-medium text-[#1a1a1a]/60">
            Lead
            <select className={`${input} mt-1`} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value as OwnerKey })}>
              <option value="della">Della</option>
              <option value="alex">Alex</option>
            </select>
          </label>
          <div className="sm:col-span-6 flex items-center gap-3">
            <button disabled={saving} className="bg-[#5b9a2f] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#4a7d25] disabled:opacity-50 transition-colors">
              {saving ? "Adding…" : "Add to the board"}
            </button>
            <span className="text-xs text-[#1a1a1a]/40">
              Contact and status only. Intake financials stay in the client folder.
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
                <Link href={`/admin/partnership/${a.id}`} className="font-medium text-[#1a1a1a] hover:text-[#5b9a2f]">
                  {a.name}
                </Link>
                <span className="text-[#1a1a1a]/60"> · {a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phase strip doubles as the filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
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
          placeholder="Search client, email, property, city…"
          className={`${input} flex-1`}
        />
        <div className="flex gap-1.5">
          {(["all", "della", "alex"] as const).map((o) => (
            <button key={o} onClick={() => setOwner(o)} className={pill(owner === o)}>
              {o === "all" ? "Everyone" : o === "della" ? "Della" : "Alex"}
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
            Add the first prospect with “+ New client”, or start one from a CRM contact.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50 py-12 text-center">Nothing matches those filters.</p>
      ) : (
        <div className="bg-white border border-[#e8e4dd] rounded-lg divide-y divide-[#e8e4dd]">
          {filtered.map((r) => {
            const stage = getStage(r.stage);
            const steps = stepsFor(r.stage, r.path);
            const done = steps.filter((s) => r.doneStepKeys.includes(s.key)).length;
            const overdue = !!r.nextActionDue && r.nextActionDue < today && !CLOSED_STAGES.has(r.stage);
            const creditLeft = r.creditExpiresAt ? daysUntil(r.creditExpiresAt, today) : null;
            return (
              <Link
                key={r.id}
                href={`/admin/partnership/${r.id}`}
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_auto_minmax(0,1.6fr)] gap-x-5 gap-y-2 px-4 py-3 hover:bg-[#f8f6f1] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a1a1a] truncate">{r.clientName}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#1a1a1a]/5 text-[10px] font-semibold text-[#1a1a1a]/60 flex items-center justify-center uppercase" title={`Lead: ${r.owner}`}>
                      {r.owner[0]}
                    </span>
                  </div>
                  <div className="text-xs text-[#1a1a1a]/50 truncate">
                    {[r.propertyLabel, [r.propertyCity, r.propertyState].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "No property yet"}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-[#1A4D4F] bg-[#1A4D4F]/8 border border-[#1A4D4F]/20 rounded-full px-2 py-0.5">
                      {stage?.label ?? r.stage}
                    </span>
                    {r.verdict && (
                      <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${VERDICT_BADGE[r.verdict]}`}>
                        {VERDICTS.find((v) => v.key === r.verdict)?.label}
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

                <div className="flex items-center gap-1" aria-label="Sections 1 to 5">
                  {SECTIONS.map((s, i) => (
                    <span
                      key={s.n}
                      title={`Section ${s.n} · ${s.short}: ${SECTION_STATUSES.find((x) => x.key === r.sections[i])?.label}`}
                      className={`w-6 h-6 rounded-full border text-[10px] font-semibold flex items-center justify-center ${SECTION_PIP[r.sections[i]]}`}
                    >
                      {s.n}
                    </span>
                  ))}
                </div>

                <div className="min-w-0 text-sm">
                  <div className={`truncate ${overdue ? "text-[#8a4a32] font-medium" : "text-[#1a1a1a]/75"}`}>
                    {r.nextAction || <span className="text-[#1a1a1a]/30">No next action set</span>}
                  </div>
                  <div className="text-xs text-[#1a1a1a]/45 flex flex-wrap gap-x-3">
                    {r.nextActionDue && <span className={overdue ? "text-[#8a4a32]" : ""}>Due {shortDate(r.nextActionDue)}</span>}
                    {r.creditCents > 0 && creditLeft !== null && (
                      <span className={creditLeft < 0 ? "line-through" : creditLeft <= 7 ? "text-[#8a6215] font-medium" : ""}>
                        {dollars(r.creditCents)} credit · {creditLeft < 0 ? "expired" : `${creditLeft}d left`}
                      </span>
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
