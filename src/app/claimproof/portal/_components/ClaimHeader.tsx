"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { patchClaim, deleteClaim, type ClientClaim } from "./sync-client";
import { money } from "./client-utils";
import { IconCheck } from "./Icons";

/**
 * Editable claim skeleton. Every field autosaves to the server (debounced),
 * so the dashboard card and any device stay current. This is the claim's
 * "memory": stage, next action, and the two figures that drive the gap.
 */

const STAGES: Array<{ value: string; label: string }> = [
  { value: "documenting", label: "Documenting" },
  { value: "filed", label: "Filed, awaiting contact" },
  { value: "awaiting_appraisal", label: "Awaiting appraisal" },
  { value: "supplement_submitted", label: "Supplement submitted" },
  { value: "in_repair", label: "In repair" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "closed", label: "Closed" },
];

type SaveState = "idle" | "saving" | "saved";

export default function ClaimHeader({ claim }: { claim: ClientClaim }) {
  const router = useRouter();
  const [c, setC] = useState<ClientClaim>(claim);
  const [save, setSave] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(patch: Partial<ClientClaim>) {
    setC((prev) => ({ ...prev, ...patch }));
    if (timer.current) clearTimeout(timer.current);
    setSave("saving");
    timer.current = setTimeout(async () => {
      try {
        await patchClaim(claim.id, patch);
        setSave("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSave("idle"), 1500);
      } catch {
        setSave("idle");
      }
    }, 600);
  }

  async function onDelete() {
    if (!confirm("Delete this claim and everything tracked under it? This cannot be undone.")) {
      return;
    }
    try {
      await deleteClaim(claim.id);
      router.push("/claimproof/portal");
    } catch {
      // no-op; stay on the page
    }
  }

  const gap =
    c.shopEstimate != null && c.appraisalAmount != null
      ? Math.max(0, c.shopEstimate - c.appraisalAmount)
      : null;

  const inputCls =
    "w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#E19C63]";
  const labelCls = "mb-1 block font-sans text-[11px] uppercase tracking-wider text-white/45";

  return (
    <div className="cp-rise rounded-[1.5rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.5rem-0.375rem)] bg-[#2A2932] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <input
            value={c.label}
            onChange={(e) => commit({ label: e.target.value })}
            className="min-w-0 flex-1 bg-transparent font-display text-2xl font-semibold text-white outline-none md:text-3xl"
          />
          <span
            className={
              "flex-none font-sans text-xs " +
              (save === "saving" ? "text-[#8BA5BE]" : save === "saved" ? "text-[#E19C63]" : "text-transparent")
            }
          >
            {save === "saving" ? "Saving…" : save === "saved" ? (
              <span className="inline-flex items-center gap-1">
                <IconCheck className="h-3 w-3" /> Saved
              </span>
            ) : (
              "·"
            )}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className={labelCls}>Stage</span>
            <select
              value={c.stage}
              onChange={(e) => commit({ stage: e.target.value })}
              className={inputCls}
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#27262E]">
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Vehicle</span>
            <input
              value={c.vehicle ?? ""}
              onChange={(e) => commit({ vehicle: e.target.value })}
              placeholder="2022 Camry, plate ABC1234"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Trip #</span>
            <input
              value={c.trip ?? ""}
              onChange={(e) => commit({ trip: e.target.value })}
              placeholder="#4821"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Initial appraisal ($)</span>
            <input
              inputMode="decimal"
              value={c.appraisalAmount ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                commit({ appraisalAmount: v === "" ? null : Number(v) });
              }}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Shop estimate ($)</span>
            <input
              inputMode="decimal"
              value={c.shopEstimate ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                commit({ shopEstimate: v === "" ? null : Number(v) });
              }}
              className={inputCls}
            />
          </label>
          <div className="flex flex-col justify-end">
            <span className={labelCls}>Valuation gap</span>
            <span className="font-display text-2xl font-semibold tabular-nums text-[#E19C63]">
              {gap != null ? money(gap) : "—"}
            </span>
          </div>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Next action</span>
            <input
              value={c.nextAction ?? ""}
              onChange={(e) => commit({ nextAction: e.target.value })}
              placeholder="e.g. Send supplement if no decision by Fri"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>By date</span>
            <input
              type="date"
              value={c.nextActionDate ?? ""}
              onChange={(e) => commit({ nextActionDate: e.target.value || null })}
              className={inputCls}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button
            onClick={() =>
              commit({ status: c.status === "open" ? "closed" : "open" })
            }
            className="rounded-full border border-white/20 px-4 py-1.5 font-sans text-xs font-semibold text-white/70 transition-colors hover:border-[#8BA5BE] hover:text-[#8BA5BE]"
          >
            {c.status === "open" ? "Mark closed" : "Reopen claim"}
          </button>
          <button
            onClick={onDelete}
            className="font-sans text-xs text-white/35 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
          >
            Delete claim
          </button>
        </div>
      </div>
    </div>
  );
}
