"use client";

import { RefreshCw } from "lucide-react";
import CopyButton from "@/components/resources/CopyButton";
import type { MessageTemplate } from "@/lib/resources/guest-message-templates/config";

/**
 * One message template, as a full screen.
 *
 * Replaces the old six-cards-in-a-scroll layout: a template now gets room to
 * carry its send timing and the reason for it, which is the harder half of the
 * question the operator is actually asking. Pure presentation, no state, so the
 * version index lives with the tool that owns all six.
 */
export default function TemplateScreen({
  template,
  index,
  total,
  versionIndex,
  onNewVersion,
}: {
  template: MessageTemplate;
  index: number;
  total: number;
  versionIndex: number;
  onNewVersion: () => void;
}) {
  const count = template.variants.length;
  const variant = template.variants[versionIndex % count];

  return (
    <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
      <header>
        <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal/50">
          Template {index + 1} of {total}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-near-black mt-1">
          {template.title}
        </h2>
        <p className="font-sans text-sm text-charcoal/60 mt-1.5">
          {template.purpose}
        </p>
      </header>

      {/* The timing callout. Dark on screen; the resource-tool print stylesheet
          flips it to white with a border, so it stays legible on paper. */}
      <div className="bg-near-black rounded-lg p-4 sm:p-5 mt-4 text-white">
        <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
          When to send
        </p>
        <p className="font-display text-lg sm:text-xl font-semibold leading-snug">
          {template.whenToSend}
        </p>
        <p className="font-sans text-sm text-white/75 leading-relaxed mt-2">
          {template.whyThisTiming}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-5 mb-2">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
          Version {(versionIndex % count) + 1} of {count}
          <span className="text-charcoal/35"> · </span>
          {variant.label}
        </p>
        <div className="no-print flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewVersion}
            title="Swap this template for a different wording"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-charcoal/70 hover:text-primary-green px-2 py-1 rounded-md cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden />
            New version
          </button>
          <CopyButton text={variant.body} label="Copy message" />
        </div>
      </div>

      <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
        <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
          {variant.body}
        </p>
      </div>
    </div>
  );
}
