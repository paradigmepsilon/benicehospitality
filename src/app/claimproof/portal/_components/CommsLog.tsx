"use client";

import { useState } from "react";
import { downloadCSV } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_COMMS_ENTRIES } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * Claim Communication Log. One entry per contact: who, channel, what was
 * said, what was promised and by when, and your next follow-up date. The
 * "promised by" discipline is the leverage: escalations cite these rows.
 */

type Entry = {
  date: string;
  who: string;
  channel: string;
  summary: string;
  promised: string;
  promisedBy: string;
  nextFollowUp: string;
  status: "open" | "done";
};

const BLANK: Entry = {
  date: "",
  who: "",
  channel: "Claim thread",
  summary: "",
  promised: "",
  promisedBy: "",
  nextFollowUp: "",
  status: "open",
};

const CHANNELS = ["Claim thread", "Email", "Phone", "Chat", "In person"];

export default function CommsLog({ claimId }: { claimId: number | null }) {
  const [ownEntries, setEntries] = useSyncedState<Entry[]>("comms-log", claimId, []);
  const [draft, setDraft] = useState<Entry>({ ...BLANK });
  const [example, setExample] = useState(false);
  const entries = example ? EXAMPLE_COMMS_ENTRIES : ownEntries;

  const set = (f: keyof Entry, v: string) =>
    setDraft((p) => ({ ...p, [f]: v }));

  function add() {
    if (!draft.date || !draft.summary.trim()) return;
    setEntries((p) => [{ ...draft }, ...p]);
    setDraft({ ...BLANK });
  }

  const field =
    "w-full rounded-md border border-white/12 bg-white/[0.03] px-3 py-2 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#E19C63]";

  return (
    <div className="space-y-6">
      <div className="cp-noprint flex justify-end">
        <ExampleToggle on={example} onToggle={setExample} />
      </div>
      {example && <ExampleBanner />}

      {/* add entry */}
      {!example && (
      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 md:p-6">
        <h3 className="font-sans font-bold text-white mb-4">Log a contact</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Date</span>
            <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Who (name/role)</span>
            <input value={draft.who} onChange={(e) => set("who", e.target.value)} placeholder="e.g. Sam, claims associate" className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Channel</span>
            <select value={draft.channel} onChange={(e) => set("channel", e.target.value)} className={field}>
              {CHANNELS.map((c) => (
                <option key={c} value={c} className="bg-[#27262E]">{c}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block font-sans text-xs text-white/55">What was discussed</span>
            <input value={draft.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Facts only, one line" className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Promised action (theirs or yours)</span>
            <input value={draft.promised} onChange={(e) => set("promised", e.target.value)} placeholder="e.g. supplement decision" className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Promised by (date)</span>
            <input type="date" value={draft.promisedBy} onChange={(e) => set("promisedBy", e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">My next follow-up</span>
            <input type="date" value={draft.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} className={field} />
          </label>
        </div>
        <button
          onClick={add}
          disabled={!draft.date || !draft.summary.trim()}
          className="mt-4 rounded-full bg-[#E19C63] px-5 py-2 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add entry
        </button>
      </div>
      )}

      {/* entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sans font-bold text-white">
              {example ? "Example log" : `Log (${entries.length})`}
            </h3>
            {!example && (
            <button
              onClick={() =>
                downloadCSV(
                  "claim-communication-log.csv",
                  ["Date", "Who", "Channel", "Discussed", "Promised", "Promised by", "Next follow-up", "Status"],
                  entries.map((e) => [e.date, e.who, e.channel, e.summary, e.promised, e.promisedBy, e.nextFollowUp, e.status]),
                )
              }
              className="rounded-full border border-[#E19C63]/50 px-4 py-1.5 font-sans text-xs font-semibold text-[#E19C63] transition-colors hover:bg-[#E19C63] hover:text-[#27262E]"
            >
              Export CSV
            </button>
            )}
          </div>
          {entries.map((e, i) => {
            const overdue =
              e.status === "open" &&
              e.promisedBy &&
              e.promisedBy < new Date().toISOString().slice(0, 10);
            return (
              <div
                key={i}
                className={
                  "rounded-xl border p-4 " +
                  (overdue
                    ? "border-[#E19C63]/40 bg-[#E19C63]/[0.06]"
                    : "border-white/10 bg-white/[0.02]")
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <p className="font-sans text-sm font-semibold text-white">
                    {e.date} · {e.who || "unnamed"} · {e.channel}
                  </p>
                  <div className="flex items-center gap-3">
                    {overdue && (
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#E19C63]">
                        Promise overdue: send Script 3
                      </span>
                    )}
                    {example ? (
                      <span
                        className={
                          "rounded-full px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider " +
                          (e.status === "done"
                            ? "bg-[#8BA5BE]/20 text-[#8BA5BE]"
                            : "border border-white/20 text-white/50")
                        }
                      >
                        {e.status === "done" ? "Resolved" : "Open"}
                      </span>
                    ) : (
                    <button
                      onClick={() =>
                        setEntries((p) =>
                          p.map((x, j) =>
                            j === i
                              ? { ...x, status: x.status === "open" ? "done" : "open" }
                              : x,
                          ),
                        )
                      }
                      className={
                        "rounded-full px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors " +
                        (e.status === "done"
                          ? "bg-[#8BA5BE]/20 text-[#8BA5BE]"
                          : "border border-white/20 text-white/50 hover:text-white")
                      }
                    >
                      {e.status === "done" ? "Resolved" : "Open"}
                    </button>
                    )}
                    {!example && (
                    <button
                      onClick={() => setEntries((p) => p.filter((_, j) => j !== i))}
                      aria-label="Delete entry"
                      className="font-sans text-white/30 transition-colors hover:text-[#E19C63]"
                    >
                      ×
                    </button>
                    )}
                  </div>
                </div>
                <p className="font-sans text-sm text-white/75">{e.summary}</p>
                {(e.promised || e.nextFollowUp) && (
                  <p className="mt-1 font-sans text-xs text-white/50">
                    {e.promised && (
                      <>Promised: {e.promised}{e.promisedBy ? ` by ${e.promisedBy}` : ""}. </>
                    )}
                    {e.nextFollowUp && <>Next follow-up: {e.nextFollowUp}.</>}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
