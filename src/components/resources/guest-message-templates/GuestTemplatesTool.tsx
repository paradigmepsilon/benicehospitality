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

const SLUG = "guest-message-templates";
const TOOL_NAME = getResourceTool(SLUG)!.name;
const ANCHOR_PREFIX = "gmt";

// Only two groups and no per-item state (this is pure reference content, no
// checkable/fillable fields), so the tabs are hardcoded here rather than
// invented as a generic {id,label,items}[] shape in config.ts with one real
// consumer.
const TABS: TabDef[] = [
  {
    id: "templates",
    label: "Message Templates",
    shortLabel: "Templates",
    badge: String(MESSAGE_TEMPLATES.length),
  },
  {
    id: "faqs",
    label: "Guest FAQs",
    shortLabel: "FAQs",
    badge: String(GUEST_FAQS.length),
  },
];

export default function GuestTemplatesTool() {
  const [activeSection, setActiveSection] = useState<string>(TABS[0].id);

  function goTo(id: string) {
    setActiveSection(id);
    scrollToPanel(panelAnchor(ANCHOR_PREFIX, id));
  }

  return (
    <ResourceToolShell title={TOOL_NAME}>
      <SectionTabStrip
        tabs={TABS}
        activeId={activeSection}
        onSelect={goTo}
        ariaLabel="Guest correspondence sections"
        gridClassName="grid-cols-2"
      />

      {/* Both panels stay mounted (for Print/Save-as-PDF), only the active
          one visible on screen. */}
      <TabPanel
        anchorId={panelAnchor(ANCHOR_PREFIX, "templates")}
        current={activeSection === "templates"}
      >
        <div className="space-y-5">
          {MESSAGE_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-light-gray rounded-lg p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display text-lg font-semibold text-near-black">
                  {t.title}
                </h3>
                <div className="no-print shrink-0">
                  <CopyButton text={t.body} label="Copy message" />
                </div>
              </div>
              <p className="font-sans text-xs text-charcoal/55 mb-3">{t.purpose}</p>
              <div className="bg-off-white border border-light-gray/70 rounded-md p-4">
                <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </TabPanel>

      <TabPanel
        anchorId={panelAnchor(ANCHOR_PREFIX, "faqs")}
        current={activeSection === "faqs"}
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
