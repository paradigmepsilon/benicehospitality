"use client";

import { useState } from "react";
import { downloadCSV, money, num } from "./client-utils";
import { useSyncedState } from "./sync-client";
import { EXAMPLE_DOWNTIME } from "./ExampleData";
import { ExampleToggle, ExampleBanner } from "./ExampleUI";

/**
 * Downtime Cost Tracker. Top: the summary math (down date → back date or
 * today, net/day → idle days and lost income). Below: a stage log showing
 * WHERE the days went (claim, appraisal, parts, shop), which aims the week's
 * follow-up at the actual bottleneck.
 */

type StageEntry = { date: string; stage: string; note: string };

const STAGES = [
  "Waiting on claim decision",
  "Waiting on appraisal",
  "Waiting on supplement review",
  "Waiting on parts",
  "At the shop",
  "Other",
];

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 86400000) : 0;
}

export default function DowntimeTracker({ claimId }: { claimId: number | null }) {
  const [ownSummary, setSummary] = useSyncedState<{
    downDate: string;
    backDate: string;
    perDay: string;
  }>("downtime-summary", claimId, { downDate: "", backDate: "", perDay: "60" });
  const [ownLog, setLog] = useSyncedState<StageEntry[]>("downtime-log", claimId, []);
  const [draft, setDraft] = useState<StageEntry>({
    date: "",
    stage: STAGES[0],
    note: "",
  });
  const [example, setExample] = useState(false);
  const summary = example ? EXAMPLE_DOWNTIME.summary : ownSummary;
  const log = example ? EXAMPLE_DOWNTIME.log : ownLog;

  const today = new Date().toISOString().slice(0, 10);
  const end = summary.backDate || today;
  const idleDays = summary.downDate ? daysBetween(summary.downDate, end) : 0;
  const lost = idleDays * num(summary.perDay);

  const field =
    "w-full rounded-md border border-white/12 bg-white/[0.03] px-3 py-2 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#E19C63]";

  return (
    <div className="space-y-6">
      <div className="cp-noprint flex justify-end">
        <ExampleToggle on={example} onToggle={setExample} />
      </div>
      {example && <ExampleBanner />}

      {/* summary math */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Vehicle went down</span>
            <input type="date" value={summary.downDate} readOnly={example} onChange={(e) => setSummary((p) => ({ ...p, downDate: e.target.value }))} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Back in service (blank = still down)</span>
            <input type="date" value={summary.backDate} readOnly={example} onChange={(e) => setSummary((p) => ({ ...p, backDate: e.target.value }))} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs text-white/55">Net revenue per day ($)</span>
            <input inputMode="decimal" value={summary.perDay} readOnly={example} onChange={(e) => setSummary((p) => ({ ...p, perDay: e.target.value }))} className={field} />
          </label>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/12 pt-5">
          <div>
            <dt className="font-sans text-[11px] uppercase tracking-wider text-white/45">
              Idle days {!summary.backDate && summary.downDate ? "(and counting)" : ""}
            </dt>
            <dd className="font-display text-2xl font-semibold text-white tabular-nums">{idleDays}</dd>
          </div>
          <div>
            <dt className="font-sans text-[11px] uppercase tracking-wider text-white/45">Estimated lost income</dt>
            <dd className="font-display text-2xl font-semibold text-[#E19C63] tabular-nums">{money(lost)}</dd>
          </div>
        </dl>
        <p className="mt-3 font-sans text-[11px] text-white/35">
          Illustrative, from your own inputs. No system controls repair or review timelines.
        </p>
      </div>

      {/* stage log */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 md:p-6">
        <h3 className="font-sans font-bold text-white mb-4">Stage log: where are the days going?</h3>
        {!example && (
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr_auto]">
          <input type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} className={field} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={draft.stage} onChange={(e) => setDraft((p) => ({ ...p, stage: e.target.value }))} className={field}>
              {STAGES.map((s) => (
                <option key={s} value={s} className="bg-[#27262E]">{s}</option>
              ))}
            </select>
            <input value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="Note (e.g. bumper on backorder)" className={field} />
          </div>
          <button
            onClick={() => {
              if (!draft.date) return;
              setLog((p) => [{ ...draft }, ...p]);
              setDraft({ date: "", stage: STAGES[0], note: "" });
            }}
            disabled={!draft.date}
            className="rounded-full bg-[#E19C63] px-5 py-2 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
        )}

        {log.length > 0 && (
          <>
            <ul className="mt-5 space-y-2">
              {log.map((e, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
                  <span className="font-sans text-sm text-white/80">
                    <span className="text-white/45">{e.date}</span>{" "}
                    <span className="font-semibold text-white">{e.stage}</span>
                    {e.note && <span className="text-white/60"> · {e.note}</span>}
                  </span>
                  {!example && (
                  <button
                    onClick={() => setLog((p) => p.filter((_, j) => j !== i))}
                    aria-label="Delete"
                    className="font-sans text-white/30 hover:text-[#E19C63]"
                  >
                    ×
                  </button>
                  )}
                </li>
              ))}
            </ul>
            {!example && (
            <button
              onClick={() =>
                downloadCSV(
                  "downtime-log.csv",
                  ["Date", "Stage", "Note"],
                  log.map((e) => [e.date, e.stage, e.note]),
                )
              }
              className="mt-4 rounded-full border border-[#E19C63]/50 px-4 py-1.5 font-sans text-xs font-semibold text-[#E19C63] transition-colors hover:bg-[#E19C63] hover:text-[#27262E]"
            >
              Export CSV
            </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
