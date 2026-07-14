"use client";

import { useState } from "react";
import posthog from "posthog-js";

/**
 * StageSelector — the "Where are you in the process?" triage strip that sits
 * directly under the v2 hero. Four high-intent visitor states, each anchored
 * to the section of the page that speaks to that state. Clicking a card smooth-
 * scrolls to the matching anchor and fires a PostHog event so we can see which
 * stage drives the most revenue per visitor.
 *
 * Anchors (must exist on the page):
 *   prepare  → #stage-prepare  (the mechanism / what you get)
 *   today    → #stage-today    (24-hour rescue framing)
 *   underpaid→ #stage-underpaid(valuation-gap section)
 *   stuck    → #stage-stuck    (follow-up / escalation)
 */

const STAGES: Array<{
  id: "prepare" | "today" | "underpaid" | "stuck";
  anchor: string;
  label: string;
  sub: string;
  urgent?: boolean;
}> = [
  {
    id: "prepare",
    anchor: "#stage-prepare",
    label: "Preparing before a claim",
    sub: "Build a repeatable pre-trip and return-photo system.",
  },
  {
    id: "today",
    anchor: "#stage-today",
    label: "Damage found today",
    sub: "Follow the filing sequence before the window closes.",
    urgent: true,
  },
  {
    id: "underpaid",
    anchor: "#stage-underpaid",
    label: "Approved, but too low",
    sub: "Compare the appraisal to the shop estimate and build a supplement.",
  },
  {
    id: "stuck",
    anchor: "#stage-stuck",
    label: "Claim stuck",
    sub: "Track responses, promises, documents, and escalation attempts.",
  },
];

export default function StageSelector() {
  const [active, setActive] = useState<string | null>(null);

  function go(stage: (typeof STAGES)[number]) {
    setActive(stage.id);
    posthog.capture("claimproof_v2_stage_selected", { stage: stage.id });
    const el = document.querySelector(stage.anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <p className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-warm-gold mb-5">
        Where are you in the process?
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s)}
            className={
              "group text-left rounded-2xl p-5 md:p-6 transition-all duration-300 active:scale-[0.99] " +
              (active === s.id
                ? "bg-white ring-2 ring-warm-gold shadow-lg"
                : "bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] hover:ring-warm-gold/50")
            }
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className={
                  "font-sans font-bold leading-snug " +
                  (active === s.id ? "text-near-black" : "text-white")
                }
              >
                {s.label}
              </span>
              {s.urgent && (
                <span className="flex-none rounded-full bg-terracotta/20 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#E8917A]">
                  Urgent
                </span>
              )}
            </div>
            <p
              className={
                "font-sans text-sm leading-relaxed " +
                (active === s.id ? "text-charcoal" : "text-white/55")
              }
            >
              {s.sub}
            </p>
            <span
              className={
                "mt-3 inline-block font-sans text-xs font-semibold transition-colors " +
                (active === s.id
                  ? "text-warm-gold"
                  : "text-white/40 group-hover:text-warm-gold")
              }
            >
              Take me there →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
