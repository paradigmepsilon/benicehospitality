// Co-Living Profit Calculator — state keys and P&L math.
//
// THE BASELINE IS A FALLBACK LAYER, NOT A ONE-TIME COPY. The optional baseline
// screen captures one typical month. Rather than stamping those numbers into
// twelve columns, every read of a month cell falls back to the baseline when
// that cell is empty:
//
//     effective(line, month) = state[`${line}_${m}`]   if the member typed one
//                           ?? state[`base_${line}`]   otherwise
//
// So correcting the mortgage on the baseline screen corrects every month the
// member has not touched, and a month they HAVE typed into stays theirs. It
// also makes the projected-year figure fall out for free: unfilled months
// already carry baseline values, so the annual total *is* the projection.
//
// Two consequences worth stating, because the UI depends on both:
//   · Clearing a month field returns it to the baseline. To record a real zero,
//     type 0 — an entered "0" is entered, and does not fall back.
//   · A figure the member never typed still moves the totals, so every
//     baseline-derived value must render differently from an entered one. That
//     is what `fromBaseline` on each cell is for.
//
// Month keys are `${lineId}_${monthIndex}`, unchanged from the original
// spreadsheet build, so work members have already saved still loads. Baseline
// keys are `base_${lineId}`; no line id starts with `base_`, and a month index
// is always numeric, so the two namespaces cannot collide.

import {
  MONTHS,
  REVENUE_LINES,
  OPEX_LINES,
  OTHER_LINES,
  PNL_ALL_LINES,
  type PnlLine,
} from "./config";

export type PnlState = Record<string, string>;

export function monthKey(lineId: string, month: number): string {
  return `${lineId}_${month}`;
}

export function baselineKey(lineId: string): string {
  return `base_${lineId}`;
}

/** A field counts as filled only if it holds something other than whitespace. */
function filled(raw: string | undefined): boolean {
  return raw !== undefined && raw.trim() !== "";
}

function toNumber(raw: string | undefined): number {
  const n = parseFloat(raw ?? "");
  return Number.isFinite(n) ? n : 0;
}

export interface Cell {
  /** The value the P&L should use, baseline fallback already applied. */
  n: number;
  /** Did the member type into this specific month? */
  entered: boolean;
  /** Is `n` coming from the baseline rather than this month? */
  fromBaseline: boolean;
  /** The baseline behind this line, or null if none was entered. */
  baseline: number | null;
}

export function cell(state: PnlState, lineId: string, month: number): Cell {
  const raw = state[monthKey(lineId, month)];
  const baseRaw = state[baselineKey(lineId)];
  const baseline = filled(baseRaw) ? toNumber(baseRaw) : null;

  if (filled(raw)) {
    return { n: toNumber(raw), entered: true, fromBaseline: false, baseline };
  }
  if (baseline !== null) {
    return { n: baseline, entered: false, fromBaseline: true, baseline };
  }
  return { n: 0, entered: false, fromBaseline: false, baseline: null };
}

/** The raw string for an input's `value` — never the baseline, which is a placeholder. */
export function rawMonthValue(state: PnlState, lineId: string, month: number): string {
  return state[monthKey(lineId, month)] ?? "";
}

export function baselineOf(state: PnlState, lineId: string): number | null {
  const raw = state[baselineKey(lineId)];
  return filled(raw) ? toNumber(raw) : null;
}

export function hasAnyBaseline(state: PnlState): boolean {
  return PNL_ALL_LINES.some((l) => filled(state[baselineKey(l.id)]));
}

function sumLines(state: PnlState, lines: PnlLine[], month: number): number {
  return lines.reduce((total, l) => total + cell(state, l.id, month).n, 0);
}

export interface Totals {
  revenue: number;
  opex: number;
  other: number;
  noi: number;
  net: number;
}

export interface YearCalc {
  /** Per-month totals, index 0 = January. */
  revenue: number[];
  opex: number[];
  other: number[];
  noi: number[];
  net: number[];
  /** Did the member type anything at all into that month? */
  entered: boolean[];
  /** Full-year totals, baseline fallback included. */
  annual: Totals;
  /** How many of the twelve months are standing entirely on the baseline. */
  monthsFromBaseline: number;
  /** Annual total for one line, used by the year grid's right-hand column. */
  lineAnnual: (lineId: string) => number;
  /** Totals for January through `month` inclusive. */
  through: (month: number) => Totals;
  /** Totals for a single month. */
  at: (month: number) => Totals;
}

export function computeYear(state: PnlState): YearCalc {
  const revenue: number[] = [];
  const opex: number[] = [];
  const other: number[] = [];
  const noi: number[] = [];
  const net: number[] = [];
  const entered: boolean[] = [];

  MONTHS.forEach((_, m) => {
    const r = sumLines(state, REVENUE_LINES, m);
    const o = sumLines(state, OPEX_LINES, m);
    const x = sumLines(state, OTHER_LINES, m);
    revenue.push(r);
    opex.push(o);
    other.push(x);
    noi.push(r - o);
    net.push(r - o - x);
    entered.push(PNL_ALL_LINES.some((l) => filled(state[monthKey(l.id, m)])));
  });

  const sumRange = (from: number, to: number): Totals => {
    let r = 0, o = 0, x = 0;
    for (let m = from; m <= to; m++) {
      r += revenue[m];
      o += opex[m];
      x += other[m];
    }
    return { revenue: r, opex: o, other: x, noi: r - o, net: r - o - x };
  };

  return {
    revenue,
    opex,
    other,
    noi,
    net,
    entered,
    annual: sumRange(0, MONTHS.length - 1),
    monthsFromBaseline: entered.filter((e) => !e).length,
    lineAnnual: (lineId) =>
      MONTHS.reduce((total, _, m) => total + cell(state, lineId, m).n, 0),
    through: (month) => sumRange(0, Math.min(month, MONTHS.length - 1)),
    at: (month) => sumRange(month, month),
  };
}
