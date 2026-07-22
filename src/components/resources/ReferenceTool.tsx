"use client";

import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";

// Generic, config-driven reference tool: renders a sequence of sections, each of
// which can hold an intro, a comparison table, a set of cards (with optional
// copy-to-clipboard bodies and bullet lists), and a highlighted callout. Powers
// the reference-style resources (comparison chart, script bank, posting calendar,
// upsell playbook, legal overviews) the same way DataTableTool powers trackers.

export interface RefItem {
  title?: string;
  meta?: string;
  /** Body text, rendered with preserved line breaks. */
  body?: string;
  /** Show a copy-to-clipboard button for `body`. */
  copy?: boolean;
  copyLabel?: string;
  bullets?: string[];
}

export interface RefSection {
  heading?: string;
  intro?: string;
  table?: { head: string[]; rows: string[][]; highlightCol?: number };
  items?: RefItem[];
  /** Card grid columns (default 1). */
  columns?: 1 | 2;
  callout?: string;
}

export interface ReferenceContent {
  sections: RefSection[];
}

export default function ReferenceTool({
  title,
  content,
}: {
  title: string;
  content: ReferenceContent;
}) {
  return (
    <ResourceToolShell title={title}>
      <div className="space-y-10">
        {content.sections.map((s, si) => (
          <section key={si} className="space-y-4">
            {s.heading && (
              <h2 className="font-display text-2xl font-semibold text-near-black">
                {s.heading}
              </h2>
            )}
            {s.intro && (
              <p className="font-sans text-sm text-charcoal/75 leading-relaxed whitespace-pre-wrap">
                {s.intro}
              </p>
            )}

            {s.table && (
              <div className="overflow-x-auto border border-light-gray rounded-lg bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-off-white">
                      {s.table.head.map((h, i) => (
                        <th
                          key={i}
                          className={`text-left font-sans text-xs font-semibold px-3 py-2.5 border-b border-light-gray whitespace-nowrap ${
                            s.table!.highlightCol === i
                              ? "text-primary-green"
                              : "text-charcoal/70"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, ri) => (
                      <tr key={ri} className="hover:bg-off-white/50">
                        {r.map((c, ci) => (
                          <td
                            key={ci}
                            className={`px-3 py-2.5 border-b border-light-gray/70 align-top text-near-black ${
                              ci === 0 ? "font-medium" : ""
                            } ${
                              s.table!.highlightCol === ci
                                ? "bg-primary-green/5 font-medium"
                                : ""
                            }`}
                          >
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {s.items && (
              <div
                className={`grid gap-4 ${
                  s.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {s.items.map((it, i) => (
                  <div
                    key={i}
                    className="bg-white border border-light-gray rounded-lg p-5 sm:p-6 break-inside-avoid"
                  >
                    {(it.title || (it.copy && it.body)) && (
                      <div className="flex items-start justify-between gap-3 mb-1">
                        {it.title && (
                          <h3 className="font-display text-lg font-semibold text-near-black">
                            {it.title}
                          </h3>
                        )}
                        {it.copy && it.body && (
                          <div className="no-print shrink-0">
                            <CopyButton
                              text={it.body}
                              label={it.copyLabel || "Copy"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {it.meta && (
                      <p className="font-sans text-xs text-charcoal/55 mb-3">
                        {it.meta}
                      </p>
                    )}
                    {it.body && (
                      <div
                        className={
                          it.copy
                            ? "bg-off-white border border-light-gray/70 rounded-md p-4"
                            : ""
                        }
                      >
                        <p className="font-sans text-sm text-near-black leading-relaxed whitespace-pre-wrap">
                          {it.body}
                        </p>
                      </div>
                    )}
                    {it.bullets && (
                      <ul className="mt-3 space-y-1.5">
                        {it.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            className="flex items-start gap-2 font-sans text-sm text-charcoal/85 leading-relaxed"
                          >
                            <span className="text-warm-gold mt-0.5 shrink-0">
                              &bull;
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {s.callout && (
              <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5">
                <p className="font-sans text-sm text-charcoal/85 leading-relaxed whitespace-pre-wrap">
                  {s.callout}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>
    </ResourceToolShell>
  );
}
