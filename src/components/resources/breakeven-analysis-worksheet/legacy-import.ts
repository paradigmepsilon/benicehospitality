"use client";

import type { PlannerState } from "@/lib/resources/breakeven-analysis-worksheet/projection";
import { COST_LINE_BY_ID } from "@/lib/resources/breakeven-analysis-worksheet/costs";

// One-shot import of work left behind in the two retired tools' localStorage.
//
// Only HALF of this is worth building, and the halves are asymmetric:
//
//   Start-Up Cost Worksheet — maps 1:1. Its state is {costs, qty, purchased}
//   keyed by exactly the ids this planner still uses, because the config module
//   moved here rather than being rewritten. Someone who filled in forty line
//   items will not do it twice, so this gets an explicit prompt.
//
//   Room Rental Price Calculator — does NOT map. Its state is ONE room's
//   inputs; section 1 is multi-room. Importing it yields one room out of five
//   and a half-populated analysis that looks broken. Only `fmv` and
//   `walkability` survive the scope change cleanly (both are property-level),
//   so those two are carried silently and everything else is dropped.

const LEGACY_STARTUP_KEY = "bnhg-resource:startup-cost-calculator";
const LEGACY_PRICE_KEY = "bnhg-resource:room-rental-price-calculator";
const DONE_KEY = "bnhg-resource:planner-import-done";

interface LegacyStartupState {
  costs?: Record<string, string>;
  qty?: Record<string, string>;
  purchased?: Record<string, boolean>;
}

interface LegacyPriceState {
  fmv?: string;
  walkability?: string;
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** True when there is worksheet data worth offering to import. */
export function hasLegacyWorksheet(): boolean {
  try {
    if (window.localStorage.getItem(DONE_KEY)) return false;
  } catch {
    return false;
  }
  const legacy = read<LegacyStartupState>(LEGACY_STARTUP_KEY);
  if (!legacy) return false;
  const costs = legacy.costs ?? {};
  return Object.values(costs).some((v) => String(v).trim() !== "");
}

/**
 * Folds the old worksheet's line items into the given state. Identity mapping
 * on ids — no translation table, which is exactly why the config was moved
 * rather than rewritten.
 */
export function importLegacyState(state: PlannerState): PlannerState {
  const legacy = read<LegacyStartupState>(LEGACY_STARTUP_KEY);
  const price = read<LegacyPriceState>(LEGACY_PRICE_KEY);

  const next: PlannerState = {
    ...state,
    property: { ...state.property },
    lines: { ...state.lines },
  };

  if (price) {
    // Property-level and scope-safe. Carried without asking.
    if (price.fmv && !next.property.fmv) next.property.fmv = String(price.fmv);
    if (price.walkability && !next.property.walkability) {
      next.property.walkability = String(price.walkability);
    }
  }

  if (legacy) {
    const costs = legacy.costs ?? {};
    const qty = legacy.qty ?? {};
    for (const [id, cost] of Object.entries(costs)) {
      // Ids retired since the merge are dropped rather than carried as dead
      // state. c1 in particular is gone — contingency is a computed row now.
      if (!COST_LINE_BY_ID[id]?.oneTime) continue;
      const value = String(cost).trim();
      if (value === "") continue;
      next.lines[id] = {
        on: true,
        qty: String(qty[id] ?? "").trim(),
        oneTime: value,
        monthly: next.lines[id]?.monthly ?? "",
      };
    }
  }

  return next;
}

/** Purge both legacy keys after one attempt, whatever the outcome. */
export function clearLegacy(): void {
  try {
    window.localStorage.removeItem(LEGACY_STARTUP_KEY);
    window.localStorage.removeItem(LEGACY_PRICE_KEY);
    window.localStorage.setItem(DONE_KEY, "1");
  } catch {
    /* storage blocked — nothing to clean up */
  }
}
