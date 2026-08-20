"use client";

import CopyButton from "@/components/resources/CopyButton";
import {
  FORMATS,
  applyFields,
  blanksRemaining,
  variantFor,
  type FleetTemplate,
  type FleetTemplateFields,
  type FormatId,
} from "@/lib/resources/fleet-guest-message-templates/config";

/**
 * One trip-lifecycle message, as a full screen.
 *
 * Replaces the old ten-cards-in-a-scroll layout: a message now gets room to
 * carry its send timing and the reason for it, which is the harder half of the
 * question the operator is actually asking, plus a format switch that a card in
 * a stack had nowhere to put. Substitution happens here because the screen
 * already needs the fields; the FORMAT choice lives with the tool that owns all
 * ten, the same way the co-living tool holds its version index.
 */
export default function FleetTemplateScreen({
  template,
  index,
  total,
  fields,
  format,
  onFormatChange,
}: {
  template: FleetTemplate;
  index: number;
  total: number;
  fields: FleetTemplateFields;
  format: FormatId;
  onFormatChange: (f: FormatId) => void;
}) {
  const variant = variantFor(template, format);
  const body = applyFields(variant.body, fields);
  const blanks = blanksRemaining(body);
  const activeFormat = FORMATS.find((f) => f.id === variant.format) ?? FORMATS[1];

  return (
    <div className="bg-white border border-light-gray rounded-lg p-5 sm:p-6">
      <header>
        <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal/50">
          Message {index + 1} of {total}
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

      {/* Format switch. Same facts in all three, different length. Screen-only:
          print emits the format that is selected, not three copies of one
          message. */}
      <div className="no-print mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
            Format
          </p>
          <span
            className={[
              "font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full",
              blanks === 0
                ? "bg-primary-green/10 text-primary-green"
                : "bg-warm-gold/15 text-charcoal/70",
            ].join(" ")}
          >
            {blanks === 0
              ? "Ready to send"
              : `${blanks} blank${blanks === 1 ? "" : "s"} to fill`}
          </span>
        </div>
        <div
          role="group"
          aria-label={`Format for ${template.title}`}
          className="grid grid-cols-3 gap-2"
        >
          {FORMATS.map((f) => {
            const selected = f.id === variant.format;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFormatChange(f.id)}
                aria-pressed={selected}
                className={[
                  "font-sans text-sm font-medium px-3 py-2 min-h-11 rounded-md border cursor-pointer transition-colors",
                  selected
                    ? "bg-near-black text-white border-near-black"
                    : "bg-white text-near-black border-light-gray hover:border-primary-green",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="font-sans text-xs text-charcoal/55 mt-2">
          {activeFormat.hint}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-5 mb-2">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/45">
          {activeFormat.label} version
        </p>
        <div className="no-print shrink-0">
          <CopyButton text={body} label="Copy message" />
        </div>
      </div>

      <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
        <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
          {body}
        </p>
      </div>

      {template.hostNote && (
        <div className="mt-4 bg-warm-gold/10 border border-warm-gold/30 rounded-md p-3.5">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal/70 mb-1">
            Host note (don&rsquo;t send)
          </p>
          <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
            {template.hostNote}
          </p>
        </div>
      )}
    </div>
  );
}
