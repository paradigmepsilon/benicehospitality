"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisListApi, AnalysisSummary, SaveStatus } from "../useResourceAnalysis";
import { currency } from "./ui";

// The "which property am I looking at" bar: pick, create, rename, duplicate,
// delete with undo, and a save-status chip.
//
// Sits above the accordion because the analysis is the document and everything
// below it is that document's contents.

function StatusChip({ status, lastSavedAt }: { status: SaveStatus; lastSavedAt: number | null }) {
  // Every string here says "changes", never a bare "Saved".
  //
  // The tool page also carries the dashboard save button, and that one says
  // "Saved" about a different subject entirely — the tool, not this analysis.
  // Side by side they read as a contradiction ("Saved" next to "Not saved") when
  // they are two true statements about two different things. Naming the subject
  // is cheaper than moving either control.
  const map: Record<SaveStatus, { text: string; className: string }> = {
    idle: { text: "", className: "" },
    saving: { text: "Saving changes…", className: "text-charcoal/50" },
    // A 429 means "you are early", not "your data is gone". Showing red here
    // teaches a member to distrust a save that is about to succeed.
    retrying: { text: "Saving changes…", className: "text-charcoal/50" },
    saved: { text: "Changes saved", className: "text-primary-green" },
    error: {
      text: "Changes not saved — check your connection",
      className: "text-terracotta",
    },
    conflict: { text: "Changed in another tab", className: "text-terracotta" },
  };
  const { text, className } = map[status];
  if (!text) {
    return lastSavedAt ? (
      <span className="font-sans text-xs text-charcoal/45">Changes saved</span>
    ) : null;
  }
  return (
    <span className={`font-sans text-xs ${className}`} aria-live="polite">
      {text}
    </span>
  );
}

export default function AnalysisSwitcher({
  list,
  activeId,
  onSelect,
  saveStatus,
  lastSavedAt,
}: {
  list: AnalysisListApi;
  activeId: number | null;
  onSelect: (id: number) => void;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const active = list.analyses.find((a) => a.id === activeId) ?? null;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function commitRename() {
    const next = draftName.trim();
    if (active && next && next !== active.name) list.rename(active.id, next);
    setRenaming(false);
  }

  function summaryLine(a: AnalysisSummary): string {
    const bits: string[] = [];
    // Address first: with several analyses open, "which building is this" is
    // the question the line has to answer before any of the numbers matter.
    if (a.location) bits.push(a.location);
    if (a.monthlyNet !== null) bits.push(`${currency(a.monthlyNet)}/mo net`);
    if (a.breakEvenMonth !== null) bits.push(`break-even month ${a.breakEvenMonth}`);
    if (bits.length === 0) return "Not filled in yet";
    return bits.join(" · ");
  }

  return (
    <div className="no-print mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {renaming && active ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            maxLength={120}
            aria-label="Analysis name"
            className="flex-1 min-w-[12rem] border border-primary-green bg-white px-3 py-2 text-sm font-medium text-near-black rounded-md focus:outline-none"
          />
        ) : (
          <label className="flex-1 min-w-[12rem]">
            <span className="sr-only">Which property are you working on?</span>
            <select
              value={activeId ?? ""}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full border border-light-gray bg-white px-3 py-2 text-sm font-medium text-near-black rounded-md focus:outline-none focus:border-primary-green"
            >
              {list.analyses.length === 0 && <option value="">No analyses yet</option>}
              {list.analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => list.create()}
          disabled={list.atCap}
          title={list.atCap ? `You can keep up to ${list.cap} analyses.` : undefined}
          className="shrink-0 border border-light-gray bg-white hover:border-primary-green disabled:opacity-45 disabled:hover:border-light-gray text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          New analysis
        </button>

        {active && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Analysis actions"
              className="border border-light-gray bg-white hover:border-primary-green text-near-black px-3 py-2 rounded-md transition-colors"
            >
              ⋮
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-light-gray rounded-md shadow-lg py-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDraftName(active.name);
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 font-sans text-sm text-near-black hover:bg-cream"
                >
                  Rename
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={list.atCap}
                  onClick={async () => {
                    setMenuOpen(false);
                    const copy = await list.duplicate(active.id);
                    if (copy) onSelect(copy.id);
                  }}
                  className="w-full text-left px-3 py-2 font-sans text-sm text-near-black hover:bg-cream disabled:opacity-45"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    const remaining = list.analyses.filter((a) => a.id !== active.id);
                    list.remove(active.id);
                    if (remaining[0]) onSelect(remaining[0].id);
                  }}
                  className="w-full text-left px-3 py-2 font-sans text-sm text-terracotta hover:bg-terracotta/8"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="ml-auto shrink-0">
          <StatusChip status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      {active && (
        <p className="font-sans text-xs text-charcoal/50 mt-1.5">{summaryLine(active)}</p>
      )}

      {list.atCap && (
        <p className="font-sans text-xs text-charcoal/60 mt-2">
          {list.analyses.length} of {list.cap} analyses. Delete one to add another.
        </p>
      )}

      {list.error && (
        <p className="font-sans text-xs text-terracotta mt-2" role="alert">
          {list.error}
        </p>
      )}

      {/* Undo rather than a confirm dialog: the delete has not happened yet. */}
      {list.pendingDelete && (
        <div className="mt-3 flex items-center gap-3 bg-near-black text-white rounded-md px-4 py-2.5">
          <span className="font-sans text-sm flex-1">
            Deleted &ldquo;{list.pendingDelete.name}&rdquo;.
          </span>
          <button
            type="button"
            onClick={list.undoRemove}
            className="font-sans text-sm font-semibold text-warm-gold hover:underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
