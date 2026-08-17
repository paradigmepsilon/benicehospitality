"use client";

import { useMemo } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import { useResourceTool } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  FLEET_TEMPLATES,
  DEFAULT_FIELDS,
  applyFields,
  blanksRemaining,
  type FleetTemplateFields,
} from "@/lib/resources/fleet-guest-message-templates/config";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";

const SLUG = "fleet-guest-message-templates";
const TOOL_NAME = getResourceTool(SLUG)!.name;

const FIELD_DEFS: {
  key: keyof FleetTemplateFields;
  label: string;
  placeholder: string;
  token: string;
}[] = [
  { key: "guestName", label: "Guest name", placeholder: "e.g. Jordan", token: "[GUEST NAME]" },
  { key: "carNickname", label: "Car nickname", placeholder: "e.g. 2021 Camry", token: "[CAR]" },
  {
    key: "pickupLocation",
    label: "Pickup location",
    placeholder: "e.g. 123 Main St, spot 4",
    token: "[PICKUP LOCATION]",
  },
];

export default function FleetGuestTemplatesTool({
  canSync = false,
}: {
  /**
   * May this visitor's work be written to their account? `access.canSync` from
   * getResourceAccess: true only for a logged-in member who is not an admin
   * previewing a member tier.
   */
  canSync?: boolean;
}) {
  const { state, setState, reset } = useResourceTool<FleetTemplateFields>(
    SLUG,
    DEFAULT_FIELDS,
    { sync: canSync },
  );

  const filledCount = FIELD_DEFS.filter((f) => state[f.key].trim()).length;

  // Substituted bodies, recomputed live as the member types.
  const rendered = useMemo(
    () =>
      FLEET_TEMPLATES.map((t) => {
        const body = applyFields(t.body, state);
        return { ...t, renderedBody: body, blanks: blanksRemaining(body) };
      }),
    [state],
  );

  function setField(key: keyof FleetTemplateFields, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onReset={reset}
      actionsRight={
        <span className="inline-flex items-center gap-2 font-sans text-sm">
          <span className="font-semibold text-near-black">{filledCount}/3</span>
          <span className="text-charcoal/60">fields set</span>
        </span>
      }
    >
      {/* Personalization panel: one pass fills all ten templates */}
      <div className="bg-near-black rounded-lg p-5 sm:p-6 mb-8 text-white">
        <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
          Personalize once
        </p>
        <p className="font-sans text-sm text-white/70 mb-4">
          Type the trip details once and every template below updates as you
          type. Anything still in [brackets] is yours to fill by hand before
          sending.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {FIELD_DEFS.map((f) => (
            <label key={f.key} className="block">
              <span className="font-sans text-xs font-medium text-white/70">
                {f.label}
              </span>
              <input
                type="text"
                value={state[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 font-sans text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-warm-gold"
              />
            </label>
          ))}
        </div>
      </div>

      {/* The ten lifecycle templates */}
      <div className="space-y-5">
        {rendered.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-display text-lg font-semibold text-near-black">
                {t.title}
              </h3>
              <div className="no-print shrink-0">
                <CopyButton text={t.renderedBody} label="Copy message" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="font-sans text-xs text-charcoal/55">{t.purpose}</p>
              <span
                className={[
                  "font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  t.blanks === 0
                    ? "bg-primary-green/10 text-primary-green"
                    : "bg-warm-gold/15 text-charcoal/70",
                ].join(" ")}
              >
                {t.blanks === 0
                  ? "Ready to send"
                  : `${t.blanks} blank${t.blanks === 1 ? "" : "s"} to fill`}
              </span>
            </div>
            <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
              <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
                {t.renderedBody}
              </p>
            </div>
            {t.hostNote && (
              <div className="mt-3 bg-warm-gold/10 border border-warm-gold/30 rounded-md p-3.5">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal/70 mb-1">
                  Host note (don&rsquo;t send)
                </p>
                <p className="font-sans text-sm text-charcoal/85 leading-relaxed">
                  {t.hostNote}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-center font-sans text-xs text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}
