/**
 * Course nurture sequences are code, not rows. A sequence is an ordered list
 * of steps; each step knows how long after the previous send it goes out and
 * how to render itself for one subscriber. The engine (engine.ts) owns the
 * database side: who is enrolled, which step is next, what was sent.
 */

export type NurtureSequenceKey =
  | "rrr_welcome"
  | "rrr_book"
  | "crr_ebook"
  | "crr_calculator"
  | "crr_waitlist";

export const NURTURE_SEQUENCE_KEYS: readonly NurtureSequenceKey[] = [
  "rrr_welcome",
  "rrr_book",
  "crr_ebook",
  "crr_calculator",
  "crr_waitlist",
] as const;

export const RRR_SEQUENCE_KEYS: readonly NurtureSequenceKey[] = [
  "rrr_welcome",
  "rrr_book",
];

export const CRR_SEQUENCE_KEYS: readonly NurtureSequenceKey[] = [
  "crr_ebook",
  "crr_calculator",
  "crr_waitlist",
];

export type CarsToday = "0" | "1" | "2-4" | "5+";

/** What a step gets to render with. Everything optional except the basics. */
export interface NurtureContext {
  email: string;
  firstName?: string;
  metro?: string;
  carsToday?: CarsToday;
  /** Site base URL without a trailing slash. */
  baseUrl: string;
  /** One-click unsubscribe link for this address. */
  unsubscribeUrl: string;
}

/** The subset of context stored on the enrollment row at enroll time. */
export type StoredNurtureContext = Pick<
  NurtureContext,
  "firstName" | "metro" | "carsToday"
>;

export interface NurtureStep {
  /** Hours after the previous send (or after enrollment for step 0). */
  delayHours: number;
  subject: string;
  preheader: string;
  html: (ctx: NurtureContext) => string;
}

export interface NurtureSequence {
  key: NurtureSequenceKey;
  /** Resolved at send time so env-based from addresses stay live. */
  from: () => string;
  steps: NurtureStep[];
}
