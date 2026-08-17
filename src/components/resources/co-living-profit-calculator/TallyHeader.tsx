"use client";

import { MONTHS, MONTH_NAMES } from "@/lib/resources/co-living-profit-calculator/config";
import type { YearCalc } from "@/lib/resources/co-living-profit-calculator/model";
import { money } from "./Fields";

// The running tally. Sticky under the site header (which is `fixed top-0`, and
// condenses on scroll), so the year is always in view while a single month is
// being filled in — the whole point of splitting the spreadsheet into screens
// was not to lose sight of the total while you do it.

export default function TallyHeader({
  calc,
  month,
  view,
  onJump,
  onToggleView,
}: {
  calc: YearCalc;
  /** Which month the flow is on. Ignored in year view. */
  month: number;
  view: "flow" | "year";
  /** Jumping from year view also returns to the month flow. */
  onJump: (month: number) => void;
  onToggleView: () => void;
}) {
  const inFlow = view === "flow";
  const ytd = calc.through(month);
  const thisMonth = calc.at(month);
  const { annual, monthsFromBaseline } = calc;

  // One scale for all twelve bars, so their heights are comparable to each
  // other rather than each being full-height. Guarded against an all-zero year.
  const peak = Math.max(...calc.net.map((n) => Math.abs(n)), 1);
  /** Pixels available above (and below) the midline. */
  const ARM = 18;
  /** Explicit pixels, not percentages: a % height against a flex-sized parent
   *  has no definite basis to resolve against, and every bar collapsed. */
  const arm = (net: number) => Math.round((Math.min(Math.abs(net), peak) / peak) * ARM);

  const stats: {
    label: string;
    value: number;
    note: string;
    /** Dropped below `sm`, where three figures cannot share a row legibly. */
    phoneHide?: boolean;
  }[] = inFlow
    ? [
        {
          label: `${MONTH_NAMES[month]} net`,
          value: thisMonth.net,
          note: `${money(thisMonth.revenue)} in, ${money(thisMonth.opex + thisMonth.other)} out`,
        },
        {
          label: month === 0 ? "Year to date (Jan)" : `Year to date (Jan–${MONTHS[month]})`,
          value: ytd.net,
          note: `${month + 1} of 12 months`,
          // Three figures in a 390px viewport truncate every label. This is the
          // one a phone can spare: the bars already show the run-up to here.
          phoneHide: true,
        },
        {
          label: "Projected year",
          value: annual.net,
          note:
            monthsFromBaseline > 0
              ? `${monthsFromBaseline} month${monthsFromBaseline === 1 ? "" : "s"} from baseline`
              : "All 12 months entered",
        },
      ]
    : [
        { label: "Annual revenue", value: annual.revenue, note: "All sources" },
        { label: "NOI", value: annual.noi, note: "Before other expenses", phoneHide: true },
        {
          label: "Net profit",
          value: annual.net,
          note:
            monthsFromBaseline > 0
              ? `${monthsFromBaseline} month${monthsFromBaseline === 1 ? "" : "s"} from baseline`
              : "All 12 months entered",
        },
      ];

  // top-20 clears the site header, which is `fixed` and condenses to 72px once
  // scrolled. z-30 stays under its z-50 so the nav still wins the overlap.
  return (
    <div className="no-print sticky top-20 z-30 -mx-1 mb-6">
      <div className="bg-near-black rounded-lg px-3 sm:px-5 py-4 shadow-lg shadow-near-black/10">
        {/* Row one: the numbers. Row two: the twelve bars, full width — they
            need the room for a legible month label under each one. */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`min-w-0 ${s.phoneHide ? "hidden sm:block" : ""}`}
              >
                <p className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.1em] uppercase text-warm-gold truncate">
                  {s.label}
                </p>
                <p
                  className={[
                    "font-display text-lg sm:text-2xl font-semibold tabular-nums leading-tight",
                    s.value < 0 ? "text-terracotta" : "text-white",
                  ].join(" ")}
                >
                  {money(s.value)}
                </p>
                <p className="font-sans text-[10px] text-white/45 truncate">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onToggleView}
              className="min-h-11 px-3 sm:px-4 border border-white/25 rounded-md font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10 hover:border-white/40 transition-colors"
            >
              {inFlow ? "Year view" : "Back to months"}
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-stretch gap-[3px] sm:gap-1">
              {MONTHS.map((label, m) => {
                const net = calc.net[m];
                const h = arm(net);
                const active = inFlow && m === month;
                const derived = !calc.entered[m];
                const full = MONTH_NAMES[m];

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onJump(m)}
                    aria-current={active ? "true" : undefined}
                    aria-label={`${full}: net ${money(net)}${derived ? ", from baseline" : ""}`}
                    title={`${full} · ${money(net)}${derived ? " (baseline)" : ""}`}
                    className={[
                      // The active month is marked by a gold rule under its
                      // slot, not a filled block — a block that size reads as a
                      // thirteenth bar and fights the twelve real ones.
                      "group flex-1 rounded-sm px-[1px] pt-1 pb-1 border-b-2 transition-colors",
                      active
                        ? "border-warm-gold"
                        : "border-transparent hover:bg-white/10",
                    ].join(" ")}
                  >
                    <span className="block">
                      <span
                        className="flex items-end justify-center"
                        style={{ height: ARM }}
                      >
                        <span
                          style={{ height: net > 0 ? h : 0 }}
                          className={[
                            "block w-full rounded-t-[2px] transition-all",
                            derived ? "bg-primary-green/40" : "bg-primary-green",
                          ].join(" ")}
                        />
                      </span>
                      <span className="block h-px bg-white/30" />
                      <span
                        className="flex items-start justify-center"
                        style={{ height: ARM }}
                      >
                        <span
                          style={{ height: net < 0 ? h : 0 }}
                          className={[
                            "block w-full rounded-b-[2px] transition-all",
                            derived ? "bg-terracotta/40" : "bg-terracotta",
                          ].join(" ")}
                        />
                      </span>
                    </span>
                    <span
                      className={[
                        "block font-sans text-[9px] sm:text-[10px] mt-1 tracking-wide",
                        active ? "text-warm-gold font-semibold" : "text-white/45",
                      ].join(" ")}
                    >
                      <span className="sm:hidden">{label[0]}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
