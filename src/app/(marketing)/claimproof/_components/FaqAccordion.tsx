"use client";

import { useState } from "react";

/**
 * FaqAccordion — the Claim Proof FAQ as an accessible accordion. One item open
 * at a time; the first is open by default. Smooth height/opacity transition via
 * a grid-rows trick so no fixed max-height guessing is needed.
 */
const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Isn't Turo's own app enough?",
    a: "The app is just where your photos go. This is what makes those photos win. Turo's process punishes blurry, late, or badly framed shots with denials, delays, and fees. Hosts lose claims on the free tool every day. Claim Proof is the discipline you run on top of it.",
  },
  {
    q: "Is this legal advice?",
    a: "No, and I am careful about that. It is operational guidance from a working fleet operator: the systems, the scripts, and the verified process facts. For a big-dollar dispute or anything truly legal, the manual tells you the same thing over and over, talk to a lawyer, and hand them the clean evidence file you now have.",
  },
  {
    q: "I only have one car. Which tier is right for me?",
    a: "Core if you just want the documentation routine and nothing more. Pro if you want the whole defense, because the scripts, the appeal workflow, and the arbitration playbook are the pages you will be grateful for the day something goes wrong. Honestly, most single-car hosts go with Pro.",
  },
  {
    q: "What happens when Turo changes its policy?",
    a: "Every policy fact is date-stamped, verified July 2026, so nothing in here pretends to last forever. Fleet owners get the revised edition free when the rules materially change, and every tier includes the re-verification checklist in the appendix so you can check for yourself.",
  },
  {
    q: "How do I get it?",
    a: "Instantly by email right after checkout. You get the print-ready PDFs plus access to the online Claim Command Center: set up a free account with your purchase email and your claims, checklists, and worksheets sync across all your devices. Buy it, check your inbox, and you're in.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-warm-gold/20 border-y border-warm-gold/20">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-warm-gold"
              >
                <span className="font-sans font-bold text-near-black">
                  {f.q}
                </span>
                <span
                  aria-hidden
                  className={`flex-none text-warm-gold transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              className={`grid transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 pr-8 font-sans text-sm leading-relaxed text-charcoal">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
