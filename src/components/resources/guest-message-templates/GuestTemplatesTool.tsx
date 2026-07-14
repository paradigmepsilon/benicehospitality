"use client";

import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MESSAGE_TEMPLATES,
  GUEST_FAQS,
} from "@/lib/resources/guest-message-templates/config";

const SLUG = "guest-message-templates";
const TOOL_NAME = getResourceTool(SLUG)!.name;

export default function GuestTemplatesTool() {
  return (
    <ResourceToolShell title={TOOL_NAME}>
      {/* Message templates */}
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

      {/* FAQs */}
      <div className="mt-10">
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
      </div>
    </ResourceToolShell>
  );
}
