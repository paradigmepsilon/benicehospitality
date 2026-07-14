"use client";

import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import { downloadCsv, buildCsv } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MATRIX_TABLES,
  MATRIX_HOWTO,
  type MatrixTable,
} from "@/lib/resources/target-audience-matrix/config";

const SLUG = "target-audience-matrix";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function tableToTsv(t: MatrixTable): string {
  return [t.columns.join("\t"), ...t.rows.map((r) => r.join("\t"))].join("\n");
}

export default function AudienceMatrixTool() {
  function exportCsv() {
    const rows: (string | number)[][] = [];
    for (const t of MATRIX_TABLES) {
      rows.push([t.label]);
      rows.push(t.columns);
      t.rows.forEach((r) => rows.push(r));
      rows.push([]);
    }
    downloadCsv("target-audience-matrix.csv", buildCsv(TOOL_NAME, rows));
  }

  return (
    <ResourceToolShell title={TOOL_NAME} onExportCsv={exportCsv}>
      <div className="space-y-8">
        {MATRIX_TABLES.map((t) => (
          <div key={t.id}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-lg font-semibold text-near-black">
                {t.label}
              </h3>
              <div className="no-print">
                <CopyButton text={tableToTsv(t)} label="Copy table" />
              </div>
            </div>
            <div className="overflow-x-auto border border-light-gray rounded-lg bg-white">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-off-white">
                    {t.columns.map((c) => (
                      <th
                        key={c}
                        className="text-left font-sans text-xs font-semibold text-charcoal/70 px-3 py-2.5 border-b border-light-gray align-bottom min-w-[9rem]"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, ri) => (
                    <tr key={ri} className="hover:bg-off-white/50 align-top">
                      {r.map((cell, ci) => (
                        <td
                          key={ci}
                          className={[
                            "px-3 py-2.5 border-b border-light-gray/70 font-sans text-sm leading-relaxed",
                            ci === 0
                              ? "font-semibold text-near-black whitespace-nowrap"
                              : "text-charcoal/85",
                          ].join(" ")}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* How to use */}
        <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-lg p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-near-black mb-3">
            How to use this matrix
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5">
            {MATRIX_HOWTO.map((h, i) => (
              <li
                key={i}
                className="font-sans text-sm text-charcoal/85 leading-relaxed"
              >
                {h}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ResourceToolShell>
  );
}
