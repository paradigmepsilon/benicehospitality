"use client";

import { ReactNode } from "react";
import { useToolSave } from "./ToolSaveContext";

// Shared chrome for a resource tool: an action bar with CSV export, print, and
// reset, plus the tool body. Keeps every tool's controls consistent and gives
// the print stylesheet one predictable wrapper (`.resource-tool`) to isolate.
//
// The `.print-only` header block is hidden on screen and appears only in the
// printed / saved-PDF output, so a printout reads as a clean branded document.

export default function ResourceToolShell({
  title,
  onExportCsv,
  onReset,
  children,
  actionsRight,
  footerNote,
}: {
  /** Tool name, shown in the print-only document header. */
  title?: string;
  onExportCsv?: () => void;
  onReset?: () => void;
  children: ReactNode;
  /** Optional extra content on the right side of the action bar (e.g. a result chip). */
  actionsRight?: ReactNode;
  /**
   * Overrides the footer line entirely. Rarely needed now: the default below
   * asks the save bridge whether this tool is actually writing to the account,
   * rather than assuming. Kept for tools that want to say something else.
   */
  footerNote?: ReactNode;
}) {
  // Null outside ResourceToolLayout, and `registered` is false until a syncing
  // tool publishes its save loop — so this is "is this member's work really
  // going to their account", not "might it".
  const save = useToolSave();
  const accountBacked = save?.registered ?? false;

  return (
    <div className="resource-tool">
      {/* Print-only branded header */}
      {title && (
        <div className="print-only resource-print-header">
          <p className="rp-org">Be Nice Hospitality Group</p>
          <h2 className="rp-title">{title}</h2>
          <p className="rp-date" suppressHydrationWarning>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      <div className="no-print flex flex-wrap items-center gap-3 mb-6">
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
          >
            Export CSV
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-light-gray bg-white hover:border-primary-green text-near-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
        >
          Print / Save PDF
        </button>
        {onReset && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Clear everything you have entered and start over?",
                )
              ) {
                onReset();
              }
            }}
            className="inline-flex items-center gap-2 text-charcoal/60 hover:text-terracotta font-medium text-sm px-3 py-2 rounded-md transition-colors"
          >
            Reset
          </button>
        )}
        {actionsRight && <div className="ml-auto">{actionsRight}</div>}
      </div>

      {children}

      <p className="no-print mt-8 text-center font-sans text-xs text-charcoal/50">
        {footerNote ??
          (accountBacked ? (
            <>
              Your entries save to your account as you work, and to this browser
              as a backup. Export to CSV to keep a copy elsewhere.
            </>
          ) : (
            <>
              Your entries autosave in this browser. Export to CSV to keep a copy
              or move it elsewhere.
            </>
          ))}
      </p>
    </div>
  );
}
