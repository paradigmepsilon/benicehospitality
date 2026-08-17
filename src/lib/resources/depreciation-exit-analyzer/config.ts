// Depreciation & Exit Analyzer - the five year hold picture for one car, and
// the course's exit rule: when the year's expected true net goes negative
// (cash net below that year's depreciation), the car costs more to hold than
// it pays. Sell it or reprice it.
//
// The earnings input is annual CASH net (before depreciation), so total
// position = value + cumulative cash net - price counts depreciation exactly
// once: inside the declining value estimate. Feeding true net here would
// subtract it twice. Depreciation is declining-balance: each year loses dep%
// of the value remaining at the start of that year.

export const HOLD_YEARS = 5;

export interface ExitInputs {
  /** All inputs kept as strings - they are text-field values. */
  price: string;
  /** Declining-balance depreciation, % of current value per year. */
  depreciationPct: string;
  /** Annual cash net, before depreciation: what hits the bank each year. */
  annualCashNet: string;
  /** Optional: today's loan payoff, for the equity column. */
  loanBalance: string;
}

export const DEFAULT_EXIT_INPUTS: ExitInputs = {
  price: "15000",
  depreciationPct: "15",
  annualCashNet: "5000",
  loanBalance: "",
};

export interface YearRow {
  year: number;
  /** Estimated value at year end: price x (1 - dep)^year. */
  valueEnd: number;
  /** Value lost during this year: price x dep x (1 - dep)^(year - 1). */
  depreciationThisYear: number;
  /** Cash net minus this year's depreciation: the year's true net. */
  trueNetThisYear: number;
  cumulativeCashNet: number;
  /** valueEnd + cumulativeCashNet - price. */
  totalPosition: number;
  /** True while the year's true net is non-negative (cash net covers dep). */
  holds: boolean;
  /** valueEnd minus the entered loan balance; null when no balance entered. */
  equityAfterLoan: number | null;
}

export interface ExitResults {
  rows: YearRow[];
  /**
   * First year whose depreciation the cash net covers. Depreciation declines
   * every year while we hold cash net flat, so the pattern is contiguous:
   * null = no year clears (or inputs missing), 1 = every year clears.
   */
  firstHoldYear: number | null;
  /** Year with the best total position, for the exit conversation. */
  bestExitYear: number | null;
  /** First year the estimated value drops below the entered loan balance. */
  underwaterFromYear: number | null;
}

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function computeExit(inputs: ExitInputs): ExitResults {
  const price = num(inputs.price);
  const dep = Math.min(num(inputs.depreciationPct), 100) / 100;
  const cashNet = num(inputs.annualCashNet);
  const loan = num(inputs.loanBalance);
  const hasLoan = inputs.loanBalance.trim() !== "" && loan > 0;

  const rows: YearRow[] = [];
  for (let year = 1; year <= HOLD_YEARS; year++) {
    const valueStart = price * Math.pow(1 - dep, year - 1);
    const valueEnd = price * Math.pow(1 - dep, year);
    const depreciationThisYear = valueStart - valueEnd;
    const cumulativeCashNet = cashNet * year;
    rows.push({
      year,
      valueEnd,
      depreciationThisYear,
      trueNetThisYear: cashNet - depreciationThisYear,
      cumulativeCashNet,
      totalPosition: valueEnd + cumulativeCashNet - price,
      holds: cashNet >= depreciationThisYear,
      equityAfterLoan: hasLoan ? valueEnd - loan : null,
    });
  }

  const valid = price > 0;
  const firstHold = valid ? rows.find((r) => r.holds) : undefined;
  const best = valid
    ? rows.reduce((a, b) => (b.totalPosition > a.totalPosition ? b : a), rows[0])
    : undefined;
  const underwater = valid && hasLoan ? rows.find((r) => r.valueEnd < loan) : undefined;

  return {
    rows,
    firstHoldYear: firstHold ? firstHold.year : null,
    bestExitYear: best ? best.year : null,
    underwaterFromYear: underwater ? underwater.year : null,
  };
}

/** The course's exit rule, quoted wherever the verdict needs explaining. */
export const EXIT_RULE =
  "When the year's expected true net goes negative (cash net below that year's depreciation), the car costs more to hold than it pays. Sell it or reprice it.";
