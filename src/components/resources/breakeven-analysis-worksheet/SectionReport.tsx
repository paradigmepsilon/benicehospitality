"use client";

import Link from "next/link";
import type {
  PlannerAssumptions,
  PlannerComputation,
  SectionId,
} from "@/lib/resources/breakeven-analysis-worksheet/projection";
import CumulativeChart from "./CumulativeChart";
import { Field, Warning, currency, signedCurrency } from "./ui";

// Section 4. Everything above resolves into this.

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-light-gray rounded-lg p-3">
      <p className="font-sans text-[10px] font-semibold tracking-[0.14em] uppercase text-warm-gold mb-1">
        {label}
      </p>
      <p className="font-display text-2xl font-semibold text-near-black tabular-nums leading-tight">
        {value}
      </p>
      {sub && <p className="font-sans text-xs text-charcoal/55 mt-0.5 leading-snug">{sub}</p>}
    </div>
  );
}

function BreakEvenBand({ c }: { c: PlannerComputation }) {
  const be = c.projection.breakEven;
  const band = c.band;
  const gap = Math.round(be.monthlyGap);

  const tone =
    be.case === "never-negative-net"
      ? "bg-terracotta/10 border-terracotta/30"
      : be.case === "paid-back"
        ? "bg-primary-green/10 border-primary-green/30"
        : "bg-warm-gold/12 border-warm-gold/35";

  let headline: React.ReactNode;
  let body: React.ReactNode = null;

  switch (be.case) {
    case "never-negative-net":
      headline = "This property does not break even.";
      body = (
        <>
          At these numbers you lose <strong>{currency(gap)}</strong> every month,
          so what you spent to open is never repaid. You would need about{" "}
          <strong>{currency(gap)}</strong> more per month — roughly{" "}
          <strong>{be.roomsToClose}</strong> more{" "}
          {be.roomsToClose === 1 ? "room" : "rooms"} at today&rsquo;s prices, or{" "}
          {currency(gap)} cut from your monthly costs.
        </>
      );
      break;
    case "no-launch-costs":
      headline = "You are profitable from month 1.";
      body = (
        <>
          But you have not entered any launch costs, so there is nothing to pay
          back yet. Fill in Section 2 for a real break-even date.
        </>
      );
      break;
    case "immediate":
      headline = "Break-even in your first month.";
      body = (
        <>
          Worth a second look at Section 2 — a co-living launch with real
          furniture rarely repays itself that fast.
        </>
      );
      break;
    case "beyond-horizon":
      headline = `Break-even lands in month ${be.capitalPaybackMonth}.`;
      body = (
        <>
          That is year {Math.ceil((be.capitalPaybackMonth ?? 0) / 12)}, past the
          three-year window below. At the end of year 3 you are still{" "}
          <strong>{currency(Math.abs(be.cumulativeAtHorizon))}</strong> down.
        </>
      );
      break;
    case "beyond-search":
      headline = "Break-even is more than ten years out.";
      body = (
        <>
          Net cash flow is positive but too thin to repay{" "}
          <strong>{currency(c.totalOneTime)}</strong> in a decade.
        </>
      );
      break;
    case "no-revenue":
      headline = "Price at least one room to see a break-even date.";
      break;
    default:
      headline = `Your launch costs are paid back in month ${be.capitalPaybackMonth}.`;
      body = (
        <>
          {be.operatingBreakEvenMonth !== null && (
            <>
              Your property covers its own bills from{" "}
              <strong>month {be.operatingBreakEvenMonth}</strong>.{" "}
            </>
          )}
          {band.optimistic !== null && band.pessimistic !== null && (
            <>
              Realistically somewhere between{" "}
              <strong>month {band.optimistic}</strong> and{" "}
              <strong>month {band.pessimistic}</strong> — that range is what the
              same numbers give if things go a bit better or a bit worse than
              planned.
            </>
          )}
        </>
      );
  }

  return (
    <div className={`border rounded-lg p-5 mt-5 ${tone}`}>
      <p className="font-display text-xl sm:text-2xl font-semibold text-near-black leading-snug">
        {headline}
      </p>
      {body && (
        <p className="font-sans text-sm text-charcoal/80 mt-2 leading-relaxed">{body}</p>
      )}
    </div>
  );
}

export default function SectionReport({
  c,
  assumptions,
  onAssumption,
  onJumpTo,
  propertyName,
  address,
}: {
  c: PlannerComputation;
  assumptions: PlannerAssumptions;
  onAssumption: (patch: Partial<PlannerAssumptions>) => void;
  onJumpTo: (id: SectionId) => void;
  /** The analysis name. Stamps the report so a printout identifies itself. */
  propertyName: string;
  /** Formatted street/city/state/ZIP, or "" when none was entered. */
  address: string;
}) {
  const { readiness, projection } = c;

  // Visible but inert until a room is priced. Not locked — showing the shape of
  // what is coming pulls harder than a padlock, and a checklist teaches what is
  // missing where a lock only says no.
  if (!readiness.rooms) {
    const steps: { done: boolean; label: string; count: string; section: SectionId }[] = [
      // The comp rent comes first and points at the property page, because it
      // is the usual reason no room has a price. Sending someone to the rooms
      // page to fix a blank field that lives on the property page is the kind
      // of dead end a checklist exists to prevent.
      {
        done: readiness.property,
        label: "Enter a comparable 1-bedroom rent",
        count: "",
        section: "property",
      },
      { done: readiness.rooms, label: "Price at least one room", count: "", section: "rooms" },
      {
        done: readiness.oneTime,
        label: "Add your one-time launch costs",
        count: `${c.oneTime.activeCount} lines`,
        section: "one-time",
      },
      {
        done: readiness.monthly,
        label: "Add your monthly costs",
        count: `${c.monthly.activeCount} lines`,
        section: "monthly",
      },
    ];
    return (
      <div className="border-2 border-dashed border-light-gray rounded-lg bg-cream p-6">
        <p className="font-display text-lg font-semibold text-near-black mb-4">
          Your report builds itself as you fill these in.
        </p>
        <ul className="space-y-2">
          {steps.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => onJumpTo(s.section)}
                className="w-full flex items-center gap-3 text-left font-sans text-sm py-1.5 group"
              >
                <span
                  aria-hidden="true"
                  className={s.done ? "text-primary-green" : "text-charcoal/30"}
                >
                  {s.done ? "✓" : "○"}
                </span>
                <span className={s.done ? "text-charcoal/60" : "text-near-black"}>{s.label}</span>
                <span className="ml-auto text-charcoal/45 tabular-nums">{s.count}</span>
                <span className="text-primary-green opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const y = projection.years;
  const rows: { label: string; values: number[]; strong?: boolean; negative?: boolean }[] = [
    { label: "Gross scheduled rent", values: y.map((r) => r.gross) },
    { label: "Vacancy & collection loss", values: y.map((r) => -r.vacancyLoss), negative: true },
    { label: "Lease-up ramp (year 1)", values: y.map((r) => -r.rampLoss), negative: true },
    { label: "Collected revenue", values: y.map((r) => r.revenue), strong: true },
    { label: "Monthly costs × 12", values: y.map((r) => -r.expense), negative: true },
    { label: "Net operating cash flow", values: y.map((r) => r.net), strong: true },
    { label: "Launch costs (month 0)", values: y.map((r) => -r.launch), negative: true },
    { label: "Net after launch costs", values: y.map((r) => r.netAfterLaunch), strong: true },
    { label: "Cumulative position", values: y.map((r) => r.cumulative), strong: true },
  ];

  return (
    <div className="plp-report">
      {c.monthly.activeCount === 0 ? (
        <div className="mb-5">
          <Warning>
            You have not entered any monthly costs, so this report currently says
            you keep <strong>100% of the rent</strong>, which is never true.{" "}
            <strong>The break-even below is not real yet.</strong>
          </Warning>
        </div>
      ) : (
        c.missingRequired.length > 0 && (
          <div className="mb-5">
            <Warning>
              Your monthly costs are missing{" "}
              <strong>{c.missingRequired.map((m) => m.label).join(", ")}</strong>
              . Those are usually the largest numbers in the model, so the net
              and break-even below are optimistic until you add them.
            </Warning>
          </div>
        )
      )}

      {/* ------------------------------------------------- headline card */}
      <div className="bg-near-black rounded-lg p-6 text-white">
        {/* Which building this is about. On screen it is orientation; on paper
            it is the whole point, because a printed page of numbers with no
            address on it is not a document anyone can act on. */}
        {(propertyName || address) && (
          <div className="mb-3 pb-3 border-b border-white/15">
            {propertyName && (
              <p className="font-display text-xl font-semibold leading-tight">{propertyName}</p>
            )}
            {address && <p className="font-sans text-sm text-white/60 mt-0.5">{address}</p>}
          </div>
        )}
        <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-warm-gold mb-1">
          Expected monthly net
        </p>
        <p
          className={[
            "font-display text-4xl sm:text-5xl font-semibold",
            projection.monthlyNet < 0 ? "text-terracotta" : "",
          ].join(" ")}
        >
          {signedCurrency(projection.monthlyNet)}
        </p>
        <p className="font-sans text-sm text-white/60 mt-1">
          at {c.pricing.rentingRoomCount}{" "}
          {c.pricing.rentingRoomCount === 1 ? "room" : "rooms"} ·{" "}
          {assumptions.vacancyPct}% vacancy · once the house is full
        </p>

        <div className="border-t border-white/15 mt-4 pt-4 space-y-1.5 font-sans text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-white/70">Gross scheduled rent</span>
            <span className="tabular-nums">{currency(c.pricing.grossScheduledRent)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/70">
              Vacancy &amp; collection loss ({assumptions.vacancyPct}%)
            </span>
            <span className="tabular-nums text-terracotta">
              −{currency(c.pricing.grossScheduledRent - projection.effectiveMonthlyRevenue)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/70">Monthly recurring costs</span>
            <span className="tabular-nums text-terracotta">−{currency(c.monthlyRecurring)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/15 pt-1.5 font-semibold">
            <span>Monthly net</span>
            <span className="tabular-nums">{signedCurrency(projection.monthlyNet)}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <Tile
          label="Cash to open"
          value={currency(c.totalOneTime)}
          sub={`incl. ${assumptions.contingencyPct}% contingency`}
        />
        <Tile
          label="Cash at the door"
          value={currency(projection.cashAtTheDoor)}
          sub={`with ${assumptions.reserveMonths} months of reserve`}
        />
        <Tile
          label="Break-even"
          value={
            projection.breakEven.capitalPaybackMonth
              ? `Month ${projection.breakEven.capitalPaybackMonth}`
              : "Never"
          }
          sub={
            projection.breakEven.capitalPaybackMonth
              ? `year ${Math.ceil(projection.breakEven.capitalPaybackMonth / 12)}`
              : "at these numbers"
          }
        />
        <Tile
          label="Year-1 net"
          value={signedCurrency(y[0]?.net ?? 0)}
          sub="before launch costs"
        />
      </div>

      <p className="font-sans text-xs text-charcoal/60 mt-2">
        <span className="font-semibold text-near-black">Cash at the door</span>{" "}
        is what you need on hand — launch cost plus{" "}
        {assumptions.reserveMonths} months of bills while the rooms fill.
      </p>

      {/* ----------------------------------------------------- 3-year table */}
      <div className="overflow-x-auto mt-5">
        <table className="w-full min-w-104 font-sans text-sm tabular-nums">
          <thead>
            <tr className="border-b border-light-gray">
              <th className="text-left font-semibold text-charcoal/60 py-2 pr-3 font-sans text-xs uppercase tracking-wide">
                Line
              </th>
              {y.map((r) => (
                <th
                  key={r.year}
                  className="text-right font-semibold text-charcoal/60 py-2 pl-3 font-sans text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  Year {r.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-light-gray/60">
                <td
                  className={[
                    "py-1.5 pr-3 leading-snug",
                    row.strong ? "font-semibold text-near-black" : "text-charcoal/75",
                  ].join(" ")}
                >
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={[
                      "py-1.5 pl-3 text-right whitespace-nowrap",
                      row.strong ? "font-semibold" : "",
                      v < 0 ? "text-terracotta" : "text-near-black",
                    ].join(" ")}
                  >
                    {v === 0 && row.negative ? "—" : signedCurrency(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-sans text-xs text-charcoal/60 mt-2">
        Year 1 is months 1-12 from your first tenant, not a calendar year.
      </p>

      <BreakEvenBand c={c} />

      <CumulativeChart projection={projection} />

      {/* ---------------------------------------------------- assumptions */}
      <details className="mt-5 border border-light-gray rounded-lg overflow-hidden group">
        {/* Left closed, so print shows only this summary line — which is the
            right amount of assumption for a document: the five numbers, not
            five input boxes. The two affordances that mean "you can change
            this" are screen-only. */}
        <summary className="cursor-pointer list-none px-4 py-3 bg-cream/60 hover:bg-cream font-sans text-sm text-charcoal/80 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="no-print text-charcoal/40 group-open:rotate-90 transition-transform"
          >
            ▸
          </span>
          <span>
            {assumptions.rentGrowthPct}% rent growth ·{" "}
            {assumptions.expenseInflationPct}% expense inflation ·{" "}
            {assumptions.vacancyPct}% vacancy · {assumptions.leaseUpMonths}-month
            lease-up · {assumptions.contingencyPct}% contingency
          </span>
          <span className="no-print ml-auto text-primary-green font-medium shrink-0">
            adjust
          </span>
        </summary>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Vacancy loss"
            suffix="%"
            value={assumptions.vacancyPct}
            onChange={(v) => onAssumption({ vacancyPct: v })}
            explain={
              <>
                Rent you never collect. Five rooms turning once a year with
                three weeks empty each is about 6%; add the tenant who skips a
                last month and 8% is honest for co-living.
              </>
            }
          />
          <Field
            label="Months to fill"
            value={assumptions.leaseUpMonths}
            onChange={(v) => onAssumption({ leaseUpMonths: v })}
            explain={
              <>
                Nobody fills a five-room house on day one. Three months is
                typical, and pretending otherwise overstates your first year by
                roughly 8%.
              </>
            }
          />
          <Field
            label="Rent growth"
            suffix="%/yr"
            value={assumptions.rentGrowthPct}
            onChange={(v) => onAssumption({ rentGrowthPct: v })}
            explain={
              <>
                Applied at renewal, so rents step up at months 13 and 25 rather
                than creeping every month.
              </>
            }
          />
          <Field
            label="Expense inflation"
            suffix="%/yr"
            value={assumptions.expenseInflationPct}
            onChange={(v) => onAssumption({ expenseInflationPct: v })}
            explain={
              <>
                Set a point above rent growth on purpose. Insurance and
                reassessed taxes have run hotter than rents, and being slightly
                conservative in year 3 is the right direction to be wrong.
              </>
            }
          />
          <Field
            label="Operating reserve"
            suffix="mo"
            value={assumptions.reserveMonths}
            onChange={(v) => onAssumption({ reserveMonths: v })}
            explain={<>Held, not spent. Only affects the cash-at-the-door figure.</>}
          />
        </div>
      </details>

      <div className="mt-5 border-t border-light-gray pt-4 space-y-2">
        <p className="font-sans text-xs text-charcoal/60 leading-relaxed">
          These are asking prices, and net here is pre-tax cash flow — income
          tax is not modelled.
        </p>
        <p className="no-print font-sans text-sm text-charcoal/80">
          Your plan is set. Once the property is running,{" "}
          <Link
            href="/resources/co-living-profit-calculator"
            className="text-primary-green font-medium hover:underline"
          >
            track what actually happens month by month →
          </Link>
        </p>
        <p className="print-only font-sans text-[10px] text-charcoal/60 leading-snug pt-2">
          Projections are estimates based on the figures entered and the
          assumptions stated above. Not financial, tax, or investment advice. Be
          Nice Hospitality Group · benicehospitality.com
        </p>
      </div>
    </div>
  );
}
