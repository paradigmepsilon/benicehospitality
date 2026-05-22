/**
 * Discovery call duration model.
 *
 * Every discovery call is 45 minutes from the visitor's perspective. On the
 * calendar we reserve a full 60 minutes per booking so there is a built-in
 * 15-minute buffer between back-to-back calls (prep, overrun, notes).
 *
 * `discovery_call_45` is the canonical type for all new CTAs. The two legacy
 * types are aliased to the same numbers so existing audit links, bookmarks,
 * and rows already in the database continue to function.
 */

export const CANONICAL_CALL_TYPE = "discovery_call_45";

export const CALL_VISIBLE_MINUTES: Record<string, number> = {
  discovery_call_45: 45,
  advisory_discovery_60: 45,
  signal_discovery_40: 45,
};

export const CALL_BLOCK_MINUTES: Record<string, number> = {
  discovery_call_45: 60,
  advisory_discovery_60: 60,
  signal_discovery_40: 60,
};

export function visibleMinutesFor(callType: string): number | undefined {
  return CALL_VISIBLE_MINUTES[callType];
}

export function blockMinutesFor(callType: string): number | undefined {
  return CALL_BLOCK_MINUTES[callType];
}

/**
 * User-facing label for the call duration. Same answer for every supported
 * type today, but kept as a function so we can specialize later without
 * touching call sites.
 */
export function callDurationLabel(callType: string): string {
  const mins = CALL_VISIBLE_MINUTES[callType];
  if (!mins) return "45 minutes";
  return `${mins} minutes`;
}
