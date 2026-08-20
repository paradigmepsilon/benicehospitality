"use client";

import { useState } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  SectionTabStrip,
  TabPanel,
  TabPager,
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";
import { useResourceTool } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  FLEET_TEMPLATES,
  DEFAULT_FIELDS,
  DEFAULT_FORMAT,
  type FleetTemplateFields,
  type FormatId,
} from "@/lib/resources/fleet-guest-message-templates/config";
import { CALC_DISCLAIMER } from "@/lib/resources/vehicle-profitability-calculator/config";
import FleetTemplateScreen from "./FleetTemplateScreen";

const SLUG = "fleet-guest-message-templates";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "fgt";

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

// One tab per message, in trip order. The pill numerals carry the sequence, so
// the strip needs no second row of chrome.
const TABS: TabDef[] = FLEET_TEMPLATES.map((t) => ({
  id: t.id,
  label: t.title,
  shortLabel: t.shortLabel,
}));

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

  const [activeSection, setActiveSection] = useState<string>(TABS[0].id);

  // Which format each message is showing, keyed by template id. Chrome, not
  // saved state: the three personalization fields are the member's work, a
  // preference for shorter wording on message four is not, and persisting it
  // would mark the tool used the first time someone tapped Brief.
  const [formatByTemplate, setFormatByTemplate] = useState<
    Record<string, FormatId>
  >({});

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  function setFormat(templateId: string, format: FormatId) {
    setFormatByTemplate((prev) => ({ ...prev, [templateId]: format }));
  }

  function setField(key: keyof FleetTemplateFields, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const filledCount = FIELD_DEFS.filter((f) => state[f.key].trim()).length;

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
      {/* Personalization panel: one pass fills all ten messages, every format */}
      <div className="bg-near-black rounded-lg p-5 sm:p-6 mb-6 text-white">
        <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
          Personalize once
        </p>
        <p className="font-sans text-sm text-white/70 mb-4">
          Type the trip details once and every message updates as you type,
          whichever format you pick. Anything still in [brackets] is yours to
          fill by hand before sending.
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

      <SectionTabStrip
        tabs={TABS}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel="Trip lifecycle messages"
        gridClassName="grid-cols-2 sm:grid-cols-5"
      />

      {/* Every panel stays mounted and only toggles `hidden`, so Print and
          Save-as-PDF still emit all ten messages no matter which tab is open.
          Do not switch to conditional rendering. */}
      {FLEET_TEMPLATES.map((t, i) => (
        <TabPanel
          key={t.id}
          anchorId={panelAnchor(ANCHOR_PREFIX, t.id)}
          current={activeSection === t.id}
        >
          <FleetTemplateScreen
            template={t}
            index={i}
            total={FLEET_TEMPLATES.length}
            fields={state}
            format={formatByTemplate[t.id] ?? DEFAULT_FORMAT}
            onFormatChange={(f) => setFormat(t.id, f)}
          />
        </TabPanel>
      ))}

      <div className="mt-6">
        <TabPager tabs={TABS} activeId={activeSection} onSelect={goTo} />
      </div>

      <p className="mt-8 text-center font-sans text-xs text-charcoal/50">
        {CALC_DISCLAIMER}
      </p>
    </ResourceToolShell>
  );
}
