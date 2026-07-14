"use client";

import { useState } from "react";
import type { Step } from "../_content/types";
import { useSyncedState } from "./sync-client";
import { IconCheck, IconClock, IconAlert } from "./Icons";

/**
 * Trackable step sequence. Each numbered step is checkable, and any step with
 * sub-tasks expands into an individually checkable list whose completion rolls
 * up into the step. State syncs to the account keyed by (tool + section id,
 * claim), so a host can tick items on their phone mid-crisis and see the same
 * state on their laptop. Renders (and prints) as a real, workable checklist.
 *
 * State shape kept intentionally simple and forward-compatible:
 *   { steps: { [i]: boolean }, subs: { [i]: { [j]: boolean } } }
 */

interface StepState {
  steps: Record<number, boolean>;
  subs: Record<number, Record<number, boolean>>;
}

const EMPTY: StepState = { steps: {}, subs: {} };

export default function TrackableSteps({
  syncKey,
  claimId,
  title,
  items,
}: {
  syncKey: string;
  claimId: number | null;
  title?: string;
  items: Step[];
}) {
  const [state, setState] = useSyncedState<StepState>(`steps:${syncKey}`, claimId, EMPTY);

  // A step counts as done when its own box is ticked OR (it has sub-tasks and
  // every sub-task is ticked). This lets a host either check the step wholesale
  // or work through its sub-tasks and have it complete itself.
  const stepDone = (i: number): boolean => {
    const step = items[i];
    if (step.subtasks && step.subtasks.length > 0) {
      const subs = state.subs[i] ?? {};
      const allSubs = step.subtasks.every((_, j) => subs[j]);
      return !!state.steps[i] || allSubs;
    }
    return !!state.steps[i];
  };

  const doneCount = items.filter((_, i) => stepDone(i)).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
  const complete = doneCount === items.length && items.length > 0;

  const toggleStep = (i: number, checked: boolean) => {
    setState((p) => {
      const next: StepState = { steps: { ...p.steps }, subs: { ...p.subs } };
      next.steps[i] = checked;
      // Ticking the parent ticks all its sub-tasks; unticking clears them, so
      // the two views never disagree.
      const step = items[i];
      if (step.subtasks && step.subtasks.length > 0) {
        next.subs[i] = {};
        step.subtasks.forEach((_, j) => {
          next.subs[i][j] = checked;
        });
      }
      return next;
    });
  };

  const toggleSub = (i: number, j: number, checked: boolean) => {
    setState((p) => {
      const next: StepState = { steps: { ...p.steps }, subs: { ...p.subs } };
      const row = { ...(next.subs[i] ?? {}) };
      row[j] = checked;
      next.subs[i] = row;
      // Keep the parent flag in sync with the "all sub-tasks done" rollup.
      const step = items[i];
      if (step.subtasks) {
        next.steps[i] = step.subtasks.every((_, k) => row[k]);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        {title ? (
          <h3 className="font-sans text-lg font-bold text-white">{title}</h3>
        ) : (
          <span />
        )}
        <span className="font-sans text-xs tabular-nums text-[#8BA5BE]">
          {doneCount}/{items.length} done
        </span>
      </div>

      {/* progress (screen only; the printed doc shows the boxes themselves) */}
      <div className="cp-noprint mb-5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={
            "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] " +
            (complete
              ? "bg-gradient-to-r from-[#E19C63] to-[#EBB183]"
              : "bg-[#E19C63]/70")
          }
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-3">
        {items.map((step, i) => {
          const done = stepDone(i);
          return (
            <li
              key={i}
              className={
                "relative rounded-[1.3rem] border p-5 pl-[4.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] transition-colors duration-300 " +
                (done
                  ? "border-[#E19C63]/30 bg-[#E19C63]/[0.05]"
                  : "border-white/10 bg-white/[0.02]")
              }
            >
              {/* number / check control */}
              <label className="absolute left-4 top-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) => toggleStep(i, e.target.checked)}
                  className="peer sr-only print:not-sr-only print:h-4 print:w-4"
                />
                <span
                  aria-hidden
                  className={
                    "cp-noprint flex h-8 w-8 items-center justify-center rounded-full font-display text-base font-semibold ring-1 transition-all duration-300 " +
                    (done
                      ? "bg-[#E19C63] text-[#27262E] ring-[#E19C63]"
                      : "bg-[#E19C63]/12 text-[#E19C63] ring-[#E19C63]/30 hover:ring-[#E19C63]/70")
                  }
                >
                  {done ? <IconCheck className="h-4 w-4" /> : i + 1}
                </span>
              </label>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4
                  className={
                    "font-sans font-bold transition-colors duration-300 " +
                    (done ? "text-white/45 line-through" : "text-white")
                  }
                >
                  {step.action}
                </h4>
                {step.minutes && (
                  <span className="inline-flex items-center gap-1 font-sans text-xs text-[#8BA5BE]/80">
                    <IconClock className="h-3 w-3" />
                    {step.minutes}
                  </span>
                )}
              </div>

              <p className="mt-2 font-sans text-sm leading-relaxed text-white/70">
                {step.detail}
              </p>

              {/* nested sub-tasks */}
              {step.subtasks && step.subtasks.length > 0 && (
                <ul className="mt-3 space-y-1 border-l border-white/10 pl-4">
                  {step.subtasks.map((sub, j) => {
                    const subDone = !!(state.subs[i]?.[j]);
                    return (
                      <li key={j}>
                        <label className="group -mx-2 flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.04]">
                          <input
                            type="checkbox"
                            checked={subDone}
                            onChange={(e) => toggleSub(i, j, e.target.checked)}
                            className="peer sr-only print:not-sr-only print:h-3.5 print:w-3.5"
                          />
                          <span
                            aria-hidden
                            className={
                              "cp-noprint mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded border transition-all duration-200 " +
                              (subDone
                                ? "border-[#E19C63] bg-[#E19C63] text-[#27262E]"
                                : "border-white/25 bg-white/[0.03] text-transparent group-hover:border-[#E19C63]/60")
                            }
                          >
                            <IconCheck className="h-2.5 w-2.5" />
                          </span>
                          <span
                            className={
                              "font-sans text-sm leading-relaxed transition-colors duration-200 " +
                              (subDone ? "text-white/35 line-through" : "text-white/80")
                            }
                          >
                            {sub}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* watch-outs (informational, not tracked) */}
              {step.mistakes && step.mistakes.length > 0 && (
                <div className="mt-3 rounded-xl border border-[#E19C63]/30 bg-[#E19C63]/[0.06] px-4 py-3">
                  <p className="flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#E19C63]">
                    <IconAlert className="h-3 w-3" />
                    Watch out
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {step.mistakes.map((mk, k) => (
                      <li key={k} className="font-sans text-sm text-white/70">
                        · {mk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {complete && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#E19C63]/30 bg-[#E19C63]/[0.07] px-4 py-2.5 font-sans text-xs font-semibold text-[#E19C63]">
          <IconCheck className="h-3.5 w-3.5" />
          Every step done. You have a complete, timestamped claim file.
        </p>
      )}
    </div>
  );
}
