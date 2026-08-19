"use client";

import { useState } from "react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import {
  SectionTabStrip,
  TabPanel,
  TabPager,
  scrollToPanel,
  panelAnchor,
  type TabDef,
} from "@/components/resources/SectionTabs";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MESSAGE_TEMPLATES,
  GUEST_FAQS,
} from "@/lib/resources/guest-message-templates/config";
import TemplateScreen from "./TemplateScreen";

const SLUG = "guest-message-templates";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "gmt";
const FAQ_TAB_ID = "faqs";

// One flat strip: the six templates in guest-journey order, then the FAQs. A
// nested Templates/FAQs strip would stack two navigations in a column that is
// only ~660px wide on desktop, and the pill numerals already carry the order.
const TABS: TabDef[] = [
  ...MESSAGE_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.title,
    shortLabel: t.shortLabel,
  })),
  {
    id: FAQ_TAB_ID,
    label: "Guest FAQs",
    shortLabel: "FAQs",
    badge: String(GUEST_FAQS.length),
  },
];

export default function GuestTemplatesTool() {
  const [activeSection, setActiveSection] = useState<string>(TABS[0].id);

  // Which wording each template is showing, keyed by template id. Chrome, not
  // saved state: this tool is persistence: "none" and has no useResourceTool
  // loop, so there is nothing to write to and nothing to falsely mark as used.
  const [versionByTemplate, setVersionByTemplate] = useState<
    Record<string, number>
  >({});

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  function newVersion(id: string, count: number) {
    setVersionByTemplate((v) => ({ ...v, [id]: ((v[id] ?? 0) + 1) % count }));
  }

  return (
    <ResourceToolShell title={TOOL_NAME}>
      <SectionTabStrip
        tabs={TABS}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel="Guest correspondence sections"
        gridClassName="grid-cols-4 sm:grid-cols-7"
      />

      {/* Every panel stays mounted and only toggles `hidden`, so Print and
          Save-as-PDF still emit all six templates plus all twenty FAQs no
          matter which tab is open. Do not switch to conditional rendering. */}
      {MESSAGE_TEMPLATES.map((t, i) => (
        <TabPanel
          key={t.id}
          anchorId={panelAnchor(ANCHOR_PREFIX, t.id)}
          current={activeSection === t.id}
        >
          <TemplateScreen
            template={t}
            index={i}
            total={MESSAGE_TEMPLATES.length}
            versionIndex={versionByTemplate[t.id] ?? 0}
            onNewVersion={() => newVersion(t.id, t.variants.length)}
          />
        </TabPanel>
      ))}

      <TabPanel
        anchorId={panelAnchor(ANCHOR_PREFIX, FAQ_TAB_ID)}
        current={activeSection === FAQ_TAB_ID}
      >
        <h2 className="font-display text-2xl font-semibold text-near-black mb-1">
          20 answers to questions guests always ask
        </h2>
        <p className="font-sans text-sm text-charcoal/60 mb-5">
          Written in a host&rsquo;s voice. Copy, tweak the details, and send.
        </p>
        <div className="space-y-3">
          {GUEST_FAQS.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-light-gray rounded-lg p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-sans text-sm font-semibold text-near-black">
                  {i + 1}. {f.q}
                </p>
                <div className="no-print shrink-0">
                  <CopyButton text={f.a} label="Copy" />
                </div>
              </div>
              <p className="font-sans text-sm text-charcoal/85 leading-relaxed mt-1.5">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </TabPanel>

      <div className="mt-6">
        <TabPager tabs={TABS} activeId={activeSection} onSelect={goTo} />
      </div>
    </ResourceToolShell>
  );
}
