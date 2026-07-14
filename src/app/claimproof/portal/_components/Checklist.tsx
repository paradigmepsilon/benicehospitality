"use client";

import { useSyncedState } from "./sync-client";
import { IconCheck } from "./Icons";

/**
 * Persistent checklist. State syncs to the buyer's account keyed by
 * (tool+section, claim), so a host can tick items on their phone mid-crisis
 * and see the same state on their laptop. Custom check marks + live progress.
 */
export default function Checklist({
  syncKey,
  claimId,
  title,
  intro,
  items,
}: {
  syncKey: string;
  claimId: number | null;
  title?: string;
  intro?: string;
  items: string[];
}) {
  const [done, setDone] = useSyncedState<Record<number, boolean>>(
    `check:${syncKey}`,
    claimId,
    {},
  );
  const doneCount = items.filter((_, i) => done[i]).length;
  const complete = doneCount === items.length && items.length > 0;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="rounded-[1.4rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.4rem-0.375rem)] bg-[#2A2932] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-6">
        {(title || items.length > 3) && (
          <div className="mb-2 flex items-baseline justify-between gap-4">
            {title ? (
              <h3 className="font-sans font-bold text-white">{title}</h3>
            ) : (
              <span />
            )}
            <span className="font-sans text-xs tabular-nums text-[#8BA5BE]">
              {doneCount}/{items.length}
            </span>
          </div>
        )}
        {intro && (
          <p className="mb-3 font-sans text-sm text-white/60">{intro}</p>
        )}

        {items.length > 3 && (
          <div className="cp-noprint mb-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
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
        )}

        <ul className="mt-1 space-y-1">
          {items.map((item, i) => (
            <li key={i}>
              <label className="group -mx-2 flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition-colors duration-300 hover:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={!!done[i]}
                  onChange={(e) =>
                    setDone((p) => ({ ...p, [i]: e.target.checked }))
                  }
                  className="peer sr-only print:not-sr-only print:h-4 print:w-4"
                />
                <span
                  aria-hidden
                  className={
                    "cp-noprint mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] " +
                    (done[i]
                      ? "border-[#E19C63] bg-[#E19C63] text-[#27262E]"
                      : "border-white/25 bg-white/[0.03] text-transparent group-hover:border-[#E19C63]/60")
                  }
                >
                  <IconCheck className="h-3 w-3" />
                </span>
                <span
                  className={
                    "font-sans text-sm leading-relaxed transition-colors duration-300 " +
                    (done[i] ? "text-white/35 line-through" : "text-white/85")
                  }
                >
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {complete && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#E19C63]/30 bg-[#E19C63]/[0.07] px-4 py-2.5 font-sans text-xs font-semibold text-[#E19C63]">
            <IconCheck className="h-3.5 w-3.5" />
            All clear. Move to the next section.
          </p>
        )}
      </div>
    </div>
  );
}
