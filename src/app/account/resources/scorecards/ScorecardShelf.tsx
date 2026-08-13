"use client";

// The manageable list of a member's saved Co-living Viability Calculator
// scorecards. Rename in place, remove with an undo window, open the full report
// at its public token URL.
//
// Deliberately NOT a copy of the planner's analysis switcher: a scorecard is a
// finished, immutable report, so there is nothing to load into an editor and no
// revision to race. The only mutable field is the nickname.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Pencil, Undo2, X } from "lucide-react";
import type { ScorecardSummary } from "@/lib/scorecard/saved";
import { BAND_CHIP, BAND_LABEL } from "@/lib/scorecard/bands";

/** How long a removed scorecard can be brought back before the DELETE fires. */
const UNDO_WINDOW_MS = 8000;

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function reportHref(token: string): string {
  return `/resources/co-living-viability-calculator/results/${token}`;
}

export default function ScorecardShelf({
  initial,
}: {
  initial: ScorecardSummary[];
}) {
  const [scorecards, setScorecards] = useState(initial);
  const [pendingRemoval, setPendingRemoval] = useState<ScorecardSummary | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A pending removal that never commits is a scorecard the member thinks is
  // gone and the server thinks is there. Commit it on unmount rather than
  // letting a navigation quietly cancel the delete.
  const commitRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      commitRef.current?.();
    };
  }, []);

  function removeLater(card: ScorecardSummary) {
    // Only one undo at a time: a second removal commits the first immediately,
    // which is what the banner disappearing already implies.
    commitRef.current?.();
    if (undoTimer.current) clearTimeout(undoTimer.current);

    setError(null);
    setScorecards((prev) => prev.filter((s) => s.id !== card.id));
    setPendingRemoval(card);

    const commit = () => {
      commitRef.current = null;
      setPendingRemoval((p) => (p?.id === card.id ? null : p));
      void fetch(`/api/scorecard/saved/${card.id}`, { method: "DELETE" }).catch(
        () => {
          // The row is already off the member's screen and the server still has
          // it, so the next page load puts it back. Say so rather than silently
          // disagreeing with the database.
          setScorecards((prev) =>
            prev.some((s) => s.id === card.id) ? prev : [card, ...prev],
          );
          setError("Could not remove that scorecard. It is still on your shelf.");
        },
      );
    };

    commitRef.current = commit;
    undoTimer.current = setTimeout(commit, UNDO_WINDOW_MS);
  }

  function undoRemoval() {
    if (!pendingRemoval) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    commitRef.current = null;
    setScorecards((prev) =>
      [pendingRemoval, ...prev].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      ),
    );
    setPendingRemoval(null);
  }

  async function rename(card: ScorecardSummary, nickname: string) {
    const clean = nickname.trim();
    if (!clean || clean === card.propertyNickname) return;

    // Optimistic: the only failure worth a round trip is a 401, and the shelf
    // reverts on it.
    setScorecards((prev) =>
      prev.map((s) =>
        s.id === card.id ? { ...s, propertyNickname: clean } : s,
      ),
    );
    setError(null);

    try {
      const res = await fetch(`/api/scorecard/saved/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_nickname: clean }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setScorecards((prev) =>
        prev.map((s) =>
          s.id === card.id
            ? { ...s, propertyNickname: card.propertyNickname }
            : s,
        ),
      );
      setError("Could not rename that scorecard. Please try again.");
    }
  }

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="font-sans text-sm text-terracotta bg-terracotta/10 border border-terracotta/30 rounded-md px-4 py-3 mb-4"
        >
          {error}
        </p>
      )}

      {pendingRemoval && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center gap-3 bg-warm-gold/10 border border-warm-gold/40 rounded-md px-4 py-3 mb-4"
        >
          <p className="font-sans text-sm text-charcoal/85">
            Removed <strong>{pendingRemoval.propertyNickname}</strong> from your
            dashboard. The report link still works.
          </p>
          <button
            type="button"
            onClick={undoRemoval}
            className="ml-auto inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-primary-green hover:text-primary-green-dark"
          >
            <Undo2 className="w-4 h-4" aria-hidden />
            Undo
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {scorecards.map((card) => (
          <ScorecardRow
            key={card.id}
            card={card}
            onRename={(name) => rename(card, name)}
            onRemove={() => removeLater(card)}
          />
        ))}
      </ul>
    </div>
  );
}

function ScorecardRow({
  card,
  onRename,
  onRemove,
}: {
  card: ScorecardSummary;
  onRename: (nickname: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.propertyNickname);

  function commit() {
    onRename(draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(card.propertyNickname);
    setEditing(false);
  }

  return (
    <li className="bg-white border border-light-gray rounded-lg px-5 py-4 hover:border-primary-green/50 transition-colors">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        {editing ? (
          <form
            className="flex items-center gap-2 min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
          >
            <label htmlFor={`nickname-${card.id}`} className="sr-only">
              Property name
            </label>
            <input
              id={`nickname-${card.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel();
              }}
              maxLength={120}
              autoFocus
              className="min-w-0 flex-1 font-display text-lg font-semibold text-deep-teal bg-off-white border border-light-gray rounded px-2 py-1 focus:outline-none focus:border-primary-green"
            />
            <button
              type="submit"
              aria-label="Save name"
              className="p-1.5 rounded text-primary-green hover:bg-primary-green/10"
            >
              <Check className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={cancel}
              aria-label="Cancel rename"
              className="p-1.5 rounded text-charcoal/50 hover:bg-charcoal/5"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </form>
        ) : (
          <>
            <Link
              href={reportHref(card.token)}
              className="font-display text-lg font-semibold text-deep-teal hover:text-warm-gold transition-colors inline-flex items-start gap-1.5"
            >
              {card.propertyNickname}
              <ArrowUpRight className="w-4 h-4 mt-1 shrink-0" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Rename ${card.propertyNickname}`}
              className="p-1 rounded text-charcoal/40 hover:text-primary-green hover:bg-primary-green/10"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden />
            </button>
          </>
        )}

        <span
          className={`inline-block font-sans text-xs font-semibold px-2.5 py-1 rounded ${BAND_CHIP[card.band]}`}
        >
          {BAND_LABEL[card.band]}
        </span>
        <span className="font-sans text-sm text-charcoal/70 tabular-nums">
          {card.overallPct}% overall
        </span>
        <span className="ml-auto font-sans text-xs text-charcoal/45 tabular-nums">
          scored {when(card.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-light-gray">
        <Link
          href={reportHref(card.token)}
          className="font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark"
        >
          Open the full report →
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto font-sans text-xs font-semibold text-charcoal/45 hover:text-terracotta"
        >
          Remove from dashboard
        </button>
      </div>
    </li>
  );
}
