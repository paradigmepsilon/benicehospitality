"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import ResourceToolShell from "@/components/resources/ResourceToolShell";
import {
  useResourceTool,
  downloadCsv,
  buildCsv,
  parseCsv,
} from "@/components/resources/useResourceTool";
import { getResourceTool } from "@/lib/resources/registry";
import {
  blankContractor,
  CSV_COLUMNS,
  isFilled,
  ratingValue,
  searchHaystack,
  sortContractors,
  SORT_OPTIONS,
  type Contractor,
  type ContractorField,
  type SortKey,
} from "@/lib/resources/contractor-rolodex/config";
import ContractorCard from "./ContractorCard";

const SLUG = "contractor-rolodex";
const TOOL_NAME = getResourceTool(SLUG)!.name;

interface State {
  rows: Contractor[];
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c${performance.now()}${Math.floor(performance.now() % 9973)}`;
  }
}

/**
 * Contractor Rolodex.
 *
 * Rebuilt from a thirteen-column table into a bench you add to one contractor
 * at a time. The old version put every field on one row, which meant ~131rem of
 * minimum width and a sideways scrollbar on every screen ever made; every field
 * now lives in a labelled section that stacks on a phone and goes two-up from
 * 640px, and nothing in this tool scrolls horizontally at any width.
 *
 * The saved row shape and the CSV headers are unchanged from that version, so
 * existing account data and old exports load with no migration.
 */
export default function ContractorRolodexTool({
  canSync = false,
}: {
  /** access.canSync — a logged-in member who is not an admin previewing a tier. */
  canSync?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, setState, reset } = useResourceTool<State>(
    SLUG,
    { rows: [] },
    { sync: canSync },
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("added");

  const rows = state.rows;

  /** Real records. A blank row is a draft, not a contractor. */
  const contractors = useMemo(() => rows.filter(isFilled), [rows]);

  const stats = useMemo(() => {
    const trades = new Set(
      contractors.map((c) => c.specialty.trim().toLowerCase()).filter(Boolean),
    );
    return {
      total: contractors.length,
      trades: trades.size,
      trusted: contractors.filter((c) => ratingValue(c) >= 4).length,
    };
  }, [contractors]);

  /** Specialty filter options, taken from what the operator actually typed. */
  const specialties = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of contractors) {
      const label = c.specialty.trim();
      if (label && !seen.has(label.toLowerCase())) {
        seen.set(label.toLowerCase(), label);
      }
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [contractors]);

  /**
   * Everything that should appear on screen, in sort order: the real records
   * plus whichever blank draft is currently open, so "Add contractor" has
   * something to render before a single character is typed.
   */
  const visible = useMemo(() => {
    const withDraft = rows.filter((c) => isFilled(c) || c._id === openId);
    return sortContractors(withDraft, sort);
  }, [rows, openId, sort]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const spec = specialtyFilter.toLowerCase();
    return (c: Contractor) => {
      // An open draft is never filtered out from under the person typing it.
      if (c._id === openId) return true;
      if (spec && c.specialty.trim().toLowerCase() !== spec) return false;
      if (q && !searchHaystack(c).includes(q)) return false;
      return true;
    };
  }, [query, specialtyFilter, openId]);

  const matchCount = visible.filter(matches).length;
  const filtering = Boolean(query.trim() || specialtyFilter);

  // ---- mutations ----------------------------------------------------------

  function addContractor() {
    const created = blankContractor(newId());
    // Dropping blanks here also clears the all-empty seed row the old table
    // version saved into everyone's state on first visit.
    setState((p) => ({ rows: [...p.rows.filter(isFilled), created] }));
    setOpenId(created._id);
  }

  function updateContractor(id: string, key: ContractorField, value: string) {
    setState((p) => ({
      rows: p.rows.map((c) => (c._id === id ? { ...c, [key]: value } : c)),
    }));
  }

  function deleteContractor(id: string) {
    if (openId === id) setOpenId(null);
    setState((p) => ({ rows: p.rows.filter((c) => c._id !== id) }));
  }

  /** Collapsing is also when an abandoned blank draft gets swept up. */
  function toggleCard(id: string) {
    if (openId === id) {
      setOpenId(null);
      setState((p) => ({ rows: p.rows.filter(isFilled) }));
    } else {
      setOpenId(id);
    }
  }

  // ---- CSV ----------------------------------------------------------------

  function exportCsv() {
    const header = CSV_COLUMNS.map((c) => c.label);
    const body = sortContractors(contractors, sort).map((c) =>
      CSV_COLUMNS.map((col) => c[col.key] ?? ""),
    );
    downloadCsv(
      "contractor-rolodex.csv",
      buildCsv(TOOL_NAME, [header, ...body]),
    );
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const matrix = parseCsv(String(reader.result || "")).filter((r) =>
        r.some((cell) => cell.trim() !== ""),
      );
      if (!matrix.length) return;

      // Accept the current headers and the variants people retype by hand.
      const fieldFor = new Map<string, ContractorField>();
      for (const col of CSV_COLUMNS) {
        fieldFor.set(col.label.toLowerCase(), col.key);
        for (const a of col.aliases ?? []) fieldFor.set(a.toLowerCase(), col.key);
      }

      let headerIdx = matrix.findIndex((r) =>
        r.some((cell) => fieldFor.has(cell.toLowerCase().trim())),
      );
      if (headerIdx < 0) headerIdx = 0;
      const fieldForColumn = matrix[headerIdx].map((h) =>
        fieldFor.get(h.toLowerCase().trim()),
      );

      const imported: Contractor[] = [];
      for (let i = headerIdx + 1; i < matrix.length; i++) {
        const row = blankContractor(newId());
        let any = false;
        matrix[i].forEach((val, idx) => {
          const field = fieldForColumn[idx];
          if (field && val.trim()) {
            row[field] = val.trim();
            any = true;
          }
        });
        if (any) imported.push(row);
      }
      if (imported.length) {
        setState((p) => ({ rows: [...p.rows.filter(isFilled), ...imported] }));
        setOpenId(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ---- render -------------------------------------------------------------

  return (
    <ResourceToolShell
      title={TOOL_NAME}
      onExportCsv={exportCsv}
      onReset={reset}
      actionsRight={
        <span className="font-sans text-sm text-charcoal/60">
          {stats.total} {stats.total === 1 ? "contractor" : "contractors"}
        </span>
      }
    >
      {/*
        Screen-only rule. Filtering hides entries on screen, but a printed
        rolodex must be the whole bench with every field — otherwise the sheet
        you tape inside a utility closet is missing whoever the search box
        happened to be hiding. Collapsed cards use the shared
        `.collapsed-on-screen`, and the placeholder/date/textarea print fixes
        live on `.placeholders-are-examples` in globals.css.
      */}
      <style>{`@media screen { .cr-hidden { display: none; } }`}</style>

      {/* Bench summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <SummaryTile value={stats.total} label="On your bench" />
        <SummaryTile value={stats.trades} label="Trades covered" />
        <SummaryTile
          value={stats.trusted}
          label="Rated 4 or better"
          highlight={stats.trusted > 0}
        />
      </div>

      {/* Add / import */}
      <div className="no-print flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        <button
          type="button"
          onClick={addContractor}
          className="inline-flex items-center gap-1.5 min-h-11 bg-primary-green hover:bg-primary-green-dark text-white font-medium text-sm px-4 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden />
          Add contractor
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center min-h-11 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 rounded-md transition-colors"
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportFile}
          className="hidden"
        />
      </div>

      {/* Search / filter / sort. Pointless until there is a bench to search. */}
      {contractors.length > 1 && (
        <div className="no-print flex flex-wrap items-stretch gap-2 mb-4">
          <div className="relative flex-1 min-w-44">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, trade, contact, notes"
              aria-label="Search your contractors"
              className="w-full min-w-0 min-h-11 border border-light-gray rounded-md bg-white pl-9 pr-3 py-2 font-sans text-base sm:text-sm text-near-black placeholder:text-charcoal/35 focus:border-primary-green focus:outline-none"
            />
          </div>
          {specialties.length > 1 && (
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              aria-label="Filter by specialty"
              className="min-h-11 min-w-0 border border-light-gray rounded-md bg-white px-3 font-sans text-base sm:text-sm text-near-black focus:border-primary-green focus:outline-none"
            >
              <option value="">All trades</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort contractors"
            className="min-h-11 min-w-0 border border-light-gray rounded-md bg-white px-3 font-sans text-base sm:text-sm text-near-black focus:border-primary-green focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* The bench. One column at every width — a rolodex card carries too much
          to read at half of a 660px tool column, and one column is also what
          lets a card expand in place with no grid-span choreography. */}
      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((c) => (
            <div key={c._id} className={matches(c) ? "" : "cr-hidden"}>
              <ContractorCard
                contractor={c}
                open={openId === c._id}
                onToggle={() => toggleCard(c._id)}
                onChange={(key, value) => updateContractor(c._id, key, value)}
                onDelete={() => deleteContractor(c._id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyBench onAdd={addContractor} onImport={() => fileRef.current?.click()} />
      )}

      {filtering && matchCount === 0 && visible.length > 0 && (
        <p className="no-print font-sans text-sm text-charcoal/60 text-center py-8">
          No contractor matches that search.{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSpecialtyFilter("");
            }}
            className="text-primary-green font-medium hover:underline"
          >
            Clear filters
          </button>
        </p>
      )}

      <p className="no-print font-sans text-xs text-charcoal/55 mt-4 leading-relaxed">
        Add contractors one at a time as you meet them, and update the last job
        right after every visit. Export to CSV any time, or import a CSV that
        matches these headings.
        {canSync
          ? " Your rolodex is saved to your account and this browser."
          : " Your rolodex autosaves in this browser. Log in to save it to your account across devices."}
      </p>
    </ResourceToolShell>
  );
}

function SummaryTile({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 border rounded-lg px-2.5 py-3 sm:px-4 text-center ${
        highlight
          ? "bg-warm-gold/10 border-warm-gold/50"
          : "bg-white border-light-gray"
      }`}
    >
      <p className="font-display text-2xl font-semibold text-near-black tabular-nums leading-none">
        {value}
      </p>
      <p className="font-sans text-[11px] text-charcoal/60 mt-1.5 leading-tight">
        {label}
      </p>
    </div>
  );
}

function EmptyBench({
  onAdd,
  onImport,
}: {
  onAdd: () => void;
  onImport: () => void;
}) {
  return (
    <div className="border border-dashed border-light-gray rounded-lg bg-white px-5 py-10 sm:py-12 text-center">
      <Users className="w-8 h-8 mx-auto text-charcoal/25" aria-hidden />
      <h3 className="font-display text-lg font-semibold text-near-black mt-3">
        Your bench is empty
      </h3>
      <p className="font-sans text-sm text-charcoal/65 leading-relaxed mt-2 max-w-md mx-auto">
        When a water heater goes at nine at night, this page is the difference
        between one call and forty minutes of scrolling old texts. Start with
        the trade that has cost you the most sleep.
      </p>
      <div className="no-print flex flex-wrap justify-center gap-2 mt-5">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 min-h-11 bg-primary-green hover:bg-primary-green-dark text-white font-medium text-sm px-5 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden />
          Add your first contractor
        </button>
        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center min-h-11 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-5 rounded-md transition-colors"
        >
          Import CSV
        </button>
      </div>
      <p className="font-sans text-xs text-charcoal/50 mt-5 max-w-md mx-auto leading-relaxed">
        Most operators cover plumbing, electrical, HVAC, cleaning, a handyman,
        and a locksmith before anything else.
      </p>
    </div>
  );
}
