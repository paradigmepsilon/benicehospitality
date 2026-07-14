"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchClaims,
  createClaim,
  type ClientClaim,
} from "./sync-client";
import { IconArrowUpRight, IconClock, IconCheck } from "./Icons";
import { money } from "./client-utils";

/**
 * The account buyer's tracked-claims panel on the dashboard. Server-synced:
 * every claim here follows them across devices. Legacy-token visitors never
 * see this (the dashboard only mounts it when `hasWorkspace`).
 */

const STAGE_LABEL: Record<string, string> = {
  documenting: "Documenting",
  filed: "Filed",
  awaiting_appraisal: "Awaiting appraisal",
  supplement_submitted: "Supplement submitted",
  in_repair: "In repair",
  awaiting_payment: "Awaiting payment",
  closed: "Closed",
};

export default function ClaimsPanel() {
  const [claims, setClaims] = useState<ClientClaim[] | null>(null);
  const [err, setErr] = useState(false);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchClaims()
      .then(setClaims)
      .catch(() => setErr(true));
  }, []);

  async function add() {
    if (!label.trim() || busy) return;
    setBusy(true);
    try {
      const claim = await createClaim({ label: label.trim() });
      setClaims((prev) => [claim, ...(prev ?? [])]);
      setLabel("");
      setCreating(false);
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }

  const open = (claims ?? []).filter((c) => c.status === "open");

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
            Your tracked claims
          </h2>
          <p className="mt-1 font-sans text-sm text-white/50">
            Synced to your account. Open on any device and pick up where you left off.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex-none rounded-full bg-[#E19C63] px-4 py-2 font-sans text-xs font-semibold text-[#27262E] transition-all duration-300 hover:bg-[#EBB183] active:scale-[0.97]"
          >
            + Track a claim
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E19C63]/30 bg-[#E19C63]/[0.05] p-4">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. 2022 Camry, trip #4821"
            className="min-w-0 flex-1 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 font-sans text-sm text-white outline-none placeholder:text-white/30 focus:border-[#E19C63]"
          />
          <button
            onClick={add}
            disabled={!label.trim() || busy}
            className="rounded-full bg-[#E19C63] px-4 py-2 font-sans text-xs font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183] disabled:opacity-40"
          >
            {busy ? "Adding…" : "Add claim"}
          </button>
          <button
            onClick={() => {
              setCreating(false);
              setLabel("");
            }}
            className="font-sans text-xs text-white/40 hover:text-white/70"
          >
            Cancel
          </button>
        </div>
      )}

      {err && (
        <p className="rounded-xl border border-[#E19C63]/30 bg-[#E19C63]/[0.06] px-4 py-3 font-sans text-sm text-[#E19C63]">
          Could not reach the sync service. Refresh to try again.
        </p>
      )}

      {claims == null && !err && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 font-sans text-sm text-white/40">
          Loading your claims…
        </div>
      )}

      {claims != null && claims.length === 0 && !creating && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <p className="font-sans text-sm text-white/60">
            No claims tracked yet. Add one the moment damage shows up, and every
            worksheet and log you fill will save against it.
          </p>
        </div>
      )}

      {open.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {open.map((c) => {
            const gap =
              c.shopEstimate != null && c.appraisalAmount != null
                ? Math.max(0, c.shopEstimate - c.appraisalAmount)
                : null;
            return (
              <li key={c.id}>
                <Link
                  href={`/claimproof/portal/claim/${c.id}`}
                  className="group flex h-full flex-col rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#E19C63]/50 hover:bg-white/[0.05] active:scale-[0.99]"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-sans font-bold text-white transition-colors group-hover:text-[#E19C63]">
                      {c.label}
                    </span>
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/12 text-white/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:border-[#E19C63] group-hover:bg-[#E19C63] group-hover:text-[#27262E]">
                      <IconArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <span className="mb-3 inline-flex w-max items-center gap-1.5 rounded-full bg-[#8BA5BE]/12 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-[#8BA5BE]">
                    {STAGE_LABEL[c.stage] ?? c.stage}
                  </span>
                  {gap != null && gap > 0 && (
                    <span className="mb-2 font-sans text-sm text-white/70">
                      Valuation gap{" "}
                      <span className="font-semibold text-[#E19C63]">{money(gap)}</span>
                    </span>
                  )}
                  {c.nextAction ? (
                    <span className="mt-auto flex items-start gap-1.5 font-sans text-sm text-white/60">
                      <IconClock className="mt-0.5 h-3.5 w-3.5 flex-none text-[#8BA5BE]" />
                      <span>
                        {c.nextAction}
                        {c.nextActionDate ? ` · ${c.nextActionDate}` : ""}
                      </span>
                    </span>
                  ) : (
                    <span className="mt-auto font-sans text-xs text-white/35">
                      No next action set
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {claims != null && claims.some((c) => c.status === "closed") && (
        <details className="mt-4">
          <summary className="cursor-pointer font-sans text-sm text-white/45 hover:text-white/70">
            Closed claims ({claims.filter((c) => c.status === "closed").length})
          </summary>
          <ul className="mt-3 space-y-2">
            {claims
              .filter((c) => c.status === "closed")
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/claimproof/portal/claim/${c.id}`}
                    className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.01] px-4 py-2.5 font-sans text-sm text-white/50 transition-colors hover:text-white/80"
                  >
                    <IconCheck className="h-3.5 w-3.5 flex-none text-[#8BA5BE]" />
                    {c.label}
                  </Link>
                </li>
              ))}
          </ul>
        </details>
      )}
    </section>
  );
}
