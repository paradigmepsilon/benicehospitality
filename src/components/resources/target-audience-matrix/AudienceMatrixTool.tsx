"use client";

import ResourceToolShell from "@/components/resources/ResourceToolShell";
import CopyButton from "@/components/resources/CopyButton";
import { downloadCsv, buildCsv } from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  MATRIX_TABLES,
  type MatrixTable,
} from "@/lib/resources/target-audience-matrix/config";

const SLUG = "target-audience-matrix";
const TOOL_NAME = getResourceTool(SLUG)!.name;

function tableToTsv(t: MatrixTable): string {
  return [t.columns.join("\t"), ...t.rows.map((r) => r.join("\t"))].join("\n");
}

/**
 * One table row rendered as a segment card. Column 0 is the card title,
 * column 1 the subtitle, the table's highlightColumn (if any) becomes the
 * emphasized block at the bottom, and everything else is a labeled field.
 * Cards replaced the old wide <table> so no column ever hides behind a
 * horizontal scroll.
 */
function SegmentCard({ table, row }: { table: MatrixTable; row: string[] }) {
  const highlightIdx = table.highlightColumn
    ? table.columns.indexOf(table.highlightColumn)
    : -1;

  const fields = table.columns
    .map((label, i) => ({ label, value: row[i], i }))
    .filter(({ i }) => i > 1 && i !== highlightIdx);

  return (
    <article className="bg-white border border-light-gray rounded-lg p-5 flex flex-col">
      <header className="mb-3 pb-3 border-b border-light-gray/70">
        <h4 className="font-display text-base font-semibold text-near-black">
          {row[0]}
        </h4>
        <p className="font-sans text-xs text-charcoal/60 mt-0.5">
          <span className="font-semibold">{table.columns[1]}:</span> {row[1]}
        </p>
      </header>

      <dl className="space-y-2.5">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-charcoal/50">
              {label}
            </dt>
            <dd className="font-sans text-sm text-charcoal/85 leading-relaxed mt-0.5">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {highlightIdx >= 0 && (
        <div className="mt-auto pt-3">
          <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-md px-3 py-2.5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-charcoal/55">
              {table.columns[highlightIdx]}
            </p>
            <p className="font-sans text-sm text-charcoal/90 leading-relaxed mt-0.5">
              {row[highlightIdx]}
            </p>
          </div>
        </div>
      )}
    </article>
  );
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
      <div className="space-y-10">
        {MATRIX_TABLES.map((t) => (
          <section key={t.id}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-lg font-semibold text-near-black">
                {t.label}
              </h3>
              {/* Copies the original tabular form for pasting into a sheet. */}
              <div className="no-print">
                <CopyButton text={tableToTsv(t)} label="Copy table" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.rows.map((row) => (
                <SegmentCard key={row[0]} table={t} row={row} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ResourceToolShell>
  );
}
