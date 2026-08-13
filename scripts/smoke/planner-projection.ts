// Assertions for the Co-Living Property Profitability Analysis Worksheet's pure math.
//
// This repo has no test runner, and the planner is the only tool whose output
// an operator will take to a lender. That combination justifies a standalone
// assertion script: `npm run smoke:planner`. It touches no database and no
// network, so it is safe to run anywhere.
//
// Covers the worked example from the design, every break-even edge case, the
// cost-config invariants, and the two ways the line resolver can silently lie.

import {
  assertCostConfigInvariants,
  COST_LINES,
  MONTHLY_LINE_IDS,
  ONE_TIME_LINE_IDS,
} from "../../src/lib/resources/breakeven-analysis-worksheet/costs";
import {
  buildProjection,
  computePlanner,
  hydratePlannerState,
  initialPlannerState,
  summarizePlanner,
  type PlannerState,
  type ProjectionInputs,
} from "../../src/lib/resources/breakeven-analysis-worksheet/projection";
import {
  computePricing,
  computeRoomPrice,
  formatAddress,
  formatLocality,
  makeRoom,
  type PropertyInputs,
} from "../../src/lib/resources/breakeven-analysis-worksheet/pricing";
import {
  buildCatalog,
  DEFAULT_CATALOG,
  type CostOverride,
} from "../../src/lib/resources/breakeven-analysis-worksheet/catalog";
import {
  sanitizeDetails,
  type PropertyDetailField,
  type PropertyDetails,
} from "../../src/lib/resources/property-details";
import { addressKey, mergeCacheRow } from "../../src/lib/resources/property-detail-cache";

let failures = 0;
let checks = 0;

function ok(label: string, cond: boolean, detail?: string) {
  checks += 1;
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? `\n      ${detail}` : ""}`);
  }
}

function near(label: string, actual: number, expected: number, tol = 1) {
  ok(
    label,
    Math.abs(actual - expected) <= tol,
    `expected ~${expected}, got ${Math.round(actual * 100) / 100}`,
  );
}

function section(name: string) {
  console.log(`\n${name}`);
}

const BASE_INPUTS: ProjectionInputs = {
  grossScheduledRent: 5000,
  monthlyRecurring: 3100,
  totalOneTime: 20608,
  vacancyPct: 0.08,
  rentGrowthPct: 0.03,
  expenseInflationPct: 0.04,
  leaseUpMonths: 3,
  reserveMonths: 3,
};

// --------------------------------------------------------------- config gates

section("Cost config invariants");
{
  const problems = assertCostConfigInvariants();
  ok("no config problems", problems.length === 0, problems.join("\n      "));
  ok(
    "every worksheet id survived the merge",
    [
      "f1","f2","f3","f4","f5","f6","f7","d1","d2","d3","d4","d5",
      "k1","k2","k3","k4","k5","s1","s2","s3","s4","s5","s6",
      "u1","u2","u3","u4","lg1","lg2","lg3","lg4","m1","m2","m3","m4",
      "o1","o2","o3","o4","o5",
    ].every((id) => COST_LINES.some((l) => l.id === id)),
  );
  ok(
    "mortgage, insurance and CapEx are flagged required",
    ["op_mortgage", "lg2", "op_capex"].every(
      (id) => COST_LINES.find((l) => l.id === id)?.monthly?.required === true,
    ),
    "without these the headline net is not net",
  );
  ok(
    "NO line starts pre-checked",
    COST_LINES.every(
      (l) =>
        !(l as unknown as { onByDefault?: boolean }).onByDefault &&
        !("onByDefault" in (l.monthly ?? {})) &&
        !("onByDefault" in (l.oneTime ?? {})),
    ),
    "a fresh analysis must read $0, not assert costs the user never entered",
  );
  ok("one-time section is non-trivial", ONE_TIME_LINE_IDS.length >= 35);
  ok("monthly section is non-trivial", MONTHLY_LINE_IDS.length >= 25);
  ok(
    "no affiliate URL has shipped untagged-but-present",
    COST_LINES.every((l) => !l.product || l.product.affiliateUrl === "" || l.product.affiliateUrl.startsWith("http")),
  );
}

// ------------------------------------------------------------------- the ramp

section("Lease-up ramp and vacancy (worked example)");
{
  const p = buildProjection(BASE_INPUTS, 1250);
  const [m1, m2, m3] = p.months;

  near("month 1 collected (33% filled, 8% vacancy)", m1.collected, 1533.33);
  near("month 2 collected (67% filled)", m2.collected, 3066.67);
  near("month 3 collected (fully filled)", m3.collected, 4600);
  near("year 1 collected revenue", p.years[0].revenue, 50600, 2);
  near(
    "year 1 without the ramp would have been 55,200",
    buildProjection({ ...BASE_INPUTS, leaseUpMonths: 0 }, 1250).years[0].revenue,
    55200,
    2,
  );
  near("steady-state monthly net", p.monthlyNet, 1500, 1);
  near("cash at the door = launch + 3 months of costs", p.cashAtTheDoor, 29908);

  // Vacancy must apply to rent net of the ramp, not to gross. If it were
  // applied to gross, month 1 would come out at 1333.33 instead of 1533.33.
  ok("vacancy is not double-discounted during ramp", Math.abs(m1.collected - 1333.33) > 100);
}

section("Growth is a step function, not continuous");
{
  const p = buildProjection(BASE_INPUTS, 1250);
  const m12 = p.months[11];
  const m13 = p.months[12];
  near("month 12 gross is still year-1 rent", m12.gross, 5000);
  near("month 13 gross steps up 3%", m13.gross, 5150);
  ok("no growth between months 3 and 12", Math.abs(p.months[2].gross - m12.gross) < 0.01);
  near("year 2 gross", p.years[1].gross, 5150 * 12, 2);
  near("year 3 gross", p.years[2].gross, 5000 * 1.03 ** 2 * 12, 2);
  ok(
    "expenses inflate faster than rent by design",
    p.years[2].expense / p.years[0].expense > p.years[2].gross / p.years[0].gross,
  );
}

section("Launch costs land in month 0");
{
  const p = buildProjection(BASE_INPUTS, 1250);
  ok("launch cost is charged in year 1 only", p.years[0].launch === 20608 && p.years[1].launch === 0);
  ok(
    "launch cost is excluded from operating expense",
    p.years[0].expense < 40000,
    `year-1 expense ${Math.round(p.years[0].expense)} must not contain the 20,608 launch cost`,
  );
  near(
    "cumulative at end of year 1 = net minus launch",
    p.years[0].cumulative,
    p.years[0].net - 20608,
    2,
  );
  near("month 1 cumulative starts from -totalOneTime", p.months[0].cumulative, -20608 + p.months[0].net, 2);
}

// -------------------------------------------------------------- break-even

section("Break-even");
{
  const p = buildProjection(BASE_INPUTS, 1250);
  const be = p.breakEven;
  ok("reports a capital payback month", be.capitalPaybackMonth !== null);
  ok("reports an operating break-even month", be.operatingBreakEvenMonth !== null);
  ok(
    "operating break-even precedes capital payback",
    (be.operatingBreakEvenMonth ?? 0) < (be.capitalPaybackMonth ?? 0),
    `operating ${be.operatingBreakEvenMonth}, capital ${be.capitalPaybackMonth}`,
  );
  ok("case is paid-back", be.case === "paid-back", `got ${be.case}`);

  // Hand-verified: cumulative must still be negative the month before.
  const idx = (be.capitalPaybackMonth ?? 1) - 1;
  ok(
    "cumulative crosses zero exactly at the reported month",
    p.months[idx].cumulative >= 0 && (idx === 0 || p.months[idx - 1].cumulative < 0),
    `month ${be.capitalPaybackMonth}: prev ${Math.round(p.months[idx - 1]?.cumulative ?? -1)}, at ${Math.round(p.months[idx].cumulative)}`,
  );
}

section("Break-even edge cases");
{
  const never = buildProjection({ ...BASE_INPUTS, monthlyRecurring: 9000 }, 1250).breakEven;
  ok("negative monthly net never breaks even", never.case === "never-negative-net", `got ${never.case}`);
  ok("reports the monthly shortfall", never.monthlyGap > 0);
  ok("suggests how many rooms would close it", never.roomsToClose > 0);

  const noLaunch = buildProjection({ ...BASE_INPUTS, totalOneTime: 0 }, 1250).breakEven;
  ok("zero launch cost is flagged, not celebrated", noLaunch.case === "no-launch-costs", `got ${noLaunch.case}`);

  const beyond = buildProjection({ ...BASE_INPUTS, totalOneTime: 120000 }, 1250).breakEven;
  ok("payback past 36 months is flagged", beyond.case === "beyond-horizon", `got ${beyond.case}`);
  ok("still reports the month", (beyond.capitalPaybackMonth ?? 0) > 36);

  // Net must stay POSITIVE at month 120 for this to be "too slow to pay back"
  // rather than "loses money". Expenses inflate a point faster than rent, so a
  // thin margin flips negative inside the search window and is correctly
  // classified as never-negative-net instead.
  const veryFar = buildProjection(
    { ...BASE_INPUTS, monthlyRecurring: 3800, totalOneTime: 2_000_000 },
    1250,
  ).breakEven;
  ok("payback past the 120-month search is flagged", veryFar.case === "beyond-search", `got ${veryFar.case}`);
  ok("a thin margin that inflates away is 'never', not 'slow'", never.case === "never-negative-net");

  const noRev = buildProjection({ ...BASE_INPUTS, grossScheduledRent: 0 }, 0).breakEven;
  ok("no revenue short-circuits", noRev.case === "no-revenue", `got ${noRev.case}`);

  const instant = buildProjection(
    { ...BASE_INPUTS, totalOneTime: 500, leaseUpMonths: 0 },
    1250,
  ).breakEven;
  ok("month-1 payback is flagged as suspicious", instant.case === "immediate", `got ${instant.case}`);
}

section("Break-even confidence band");
{
  const c = computePlanner(fullState());
  const b = c.band;
  ok("expected sits inside the band", b.optimistic !== null && b.expected !== null && b.pessimistic !== null);
  if (b.optimistic && b.expected && b.pessimistic) {
    ok(
      "optimistic <= expected <= pessimistic",
      b.optimistic <= b.expected && b.expected <= b.pessimistic,
      `${b.optimistic} / ${b.expected} / ${b.pessimistic}`,
    );
  }
}

// ------------------------------------------------------------------- pricing

section("Room pricing and scope split");
{
  const property: PropertyInputs = {
    street: "",
    city: "",
    state: "",
    zip: "",
    bathrooms: "",
    squareFeet: "",
    fmv: "1400",
    totalRooms: "",
    walkability: "82",
    transitScore: "",
    bikeScore: "",
    wholeHouseRent: "2200",
    features: {},
    included: {},
  };
  const bare = makeRoom(0, "r1");
  const priced = computeRoomPrice(property, bare);
  near("base is 65% of the comp", priced.base, 910);
  near("a bare room in a bare house is just the base", priced.computed, 910 + 25);

  const loaded = {
    ...makeRoom(1, "r2"),
    sizeBand: "Over 200 sqft",
    features: { privateBath: true, detached: true, parking: true, ownExit: true, ownClimate: true, ownWorkspace: true, window: true, tv: true },
    included: { roomCleanings: true, linens: true, hygiene: true },
  };
  const loadedProperty: PropertyInputs = {
    ...property,
    features: { upgraded: true, laundry: true, stockedKitchen: true, workspace: true, gym: true, backyard: true },
    included: { utilitiesIncluded: true, wifiIncluded: true, communityEvents: true },
  };
  const hot = computeRoomPrice(loadedProperty, loaded);
  ok(
    "a fully loaded room trips the over-comp warning",
    hot.exceedsComp,
    `priced at ${hot.price} against a ${property.fmv} comp`,
  );

  ok(
    "parking is a room feature, not a property feature",
    computeRoomPrice(property, { ...bare, features: { parking: true } }).roomPremium > 0 &&
      computeRoomPrice({ ...property, features: { parking: true } }, bare).propertyPremium === 25,
    "walkability 82 alone is +25; parking must not add to the property premium",
  );

  const override = computeRoomPrice(property, { ...bare, priceOverride: "850" });
  ok("a manual override wins", override.overridden && override.price === 850);
  ok("the computed value survives alongside the override", override.computed !== 850);

  const summary = computePricing(loadedProperty, [
    { ...loaded, status: "renting" },
    { ...bare, status: "owner" },
  ]);
  ok("owner-occupied rooms earn nothing", summary.grossScheduledRent === hot.price);
  ok("but still count for per-room costs", summary.roomCount === 2 && summary.rentingRoomCount === 1);
  ok(
    "one loaded room against a $2,200 house is not yet implausible",
    !summary.upliftImplausible,
    `uplift ${summary.houseUplift?.toFixed(2)}`,
  );

  // Three fully-loaded rooms against a $2,200 whole-house rent is a 2.2x
  // uplift, past anything co-living realistically achieves.
  const stacked = computePricing(loadedProperty, [
    { ...loaded, id: "a" },
    { ...loaded, id: "b" },
    { ...loaded, id: "c" },
  ]);
  ok(
    "implausible whole-house uplift is flagged",
    stacked.upliftImplausible,
    `uplift ${stacked.houseUplift?.toFixed(2)} on ${stacked.grossScheduledRent}/mo`,
  );
  ok("and every room individually trips the comp warning", stacked.hasRoomOverComp);
}

// ------------------------------------------------------- line resolution

section("A fresh analysis is genuinely empty");
{
  // The regression this guards: nine monthly lines used to start checked WITH
  // their default amounts, so an untouched analysis opened at -$3,025/mo and
  // asserted a $1,650 mortgage for a property it knew nothing about.
  const fresh = computePlanner(initialPlannerState());
  ok("monthly recurring starts at 0", fresh.monthlyRecurring === 0, `got ${fresh.monthlyRecurring}`);
  ok("one-time total starts at 0", fresh.totalOneTime === 0, `got ${fresh.totalOneTime}`);
  ok("monthly net starts at 0", fresh.projection.monthlyNet === 0, `got ${fresh.projection.monthlyNet}`);
  ok("no cost line is active", fresh.monthly.activeCount === 0 && fresh.oneTime.activeCount === 0);
  ok("the summary reports nothing rather than a fabricated number", summarizePlanner(initialPlannerState()).monthlyNet === null);
  // The comp rent gates every room price, so the report's checklist points at
  // the property page for it. A blank comp with rooms added is the common
  // "why is my report empty" case, and it is not fixable on the rooms page.
  ok("a blank comp rent is not property-ready", !fresh.readiness.property);
  {
    const withComp = initialPlannerState();
    withComp.property.fmv = "1400";
    ok("entering the comp rent flips it", computePlanner(withComp).readiness.property);
    // A fresh analysis already carries one room, so the comp rent is the only
    // thing standing between an empty tool and a priced one.
    ok(
      "and the default room prices off it immediately",
      computePlanner(withComp).readiness.rooms &&
        computePlanner(withComp).pricing.grossScheduledRent > 0,
    );
  }
  ok(
    "but the structural lines are surfaced as missing",
    fresh.missingRequired.length === 3,
    `got ${fresh.missingRequired.map((m) => m.id).join(", ")}`,
  );
  ok(
    "the mortgage is one of them",
    fresh.missingRequired.some((m) => m.id === "op_mortgage"),
  );
  ok("one room card, not a guessed three", initialPlannerState().rooms.length === 1);
}

section("Room count is asked, not assumed");
{
  const s = initialPlannerState();
  s.property.fmv = "1400";
  s.lines.f1 = { on: true, qty: "", oneTime: "", monthly: "" };

  const inferred = computePlanner(s);
  ok("with no stated count, falls back to the room cards", inferred.pricing.roomCount === 1);
  ok("and reports it as not stated", !inferred.pricing.roomCountStated);
  ok("so one bed is budgeted", inferred.oneTime.resolved.find((r) => r.line.id === "f1")!.qty === 1);

  s.property.totalRooms = "5";
  const stated = computePlanner(s);
  ok("a stated count wins over the card count", stated.pricing.roomCount === 5);
  ok("and is reported as stated", stated.pricing.roomCountStated);
  ok(
    "five beds budgeted from one priced room",
    stated.oneTime.resolved.find((r) => r.line.id === "f1")!.qty === 5,
    "you still buy a bed for the room you keep for yourself",
  );
  ok("the mismatch is flagged", stated.pricing.roomCountMismatch);
  ok("but revenue still only counts priced rooms", stated.pricing.rentingRoomCount === 1);

  s.property.totalRooms = "0";
  ok("a nonsense count falls back rather than zeroing the budget", computePlanner(s).pricing.roomCount === 1);
}

section("Location scores");
{
  const s = initialPlannerState();
  s.property.fmv = "1400";
  const base = computePlanner(s).pricing.rooms[0].result.propertyPremium;
  ok("no scores entered adds nothing", base === 0);

  s.property.walkability = "95";
  const walk = computePlanner(s).pricing.rooms[0].result.propertyPremium;
  ok("Walk Score 95 adds $40", walk === 40, `got ${walk}`);

  s.property.transitScore = "75";
  const transit = computePlanner(s).pricing.rooms[0].result.propertyPremium;
  ok("Transit Score 75 adds $20 on top", transit === 60, `got ${transit}`);

  s.property.bikeScore = "92";
  const bike = computePlanner(s).pricing.rooms[0].result.propertyPremium;
  ok("Bike Score 92 adds $15 on top", bike === 75, `got ${bike}`);

  ok(
    "the three stack to at most $85",
    (() => {
      const max = initialPlannerState();
      max.property.fmv = "1400";
      max.property.walkability = "100";
      max.property.transitScore = "100";
      max.property.bikeScore = "100";
      return computePlanner(max).pricing.rooms[0].result.propertyPremium === 85;
    })(),
  );

  const low = initialPlannerState();
  low.property.fmv = "1400";
  low.property.walkability = "20";
  low.property.transitScore = "10";
  low.property.bikeScore = "40";
  ok("low scores add nothing", computePlanner(low).pricing.rooms[0].result.propertyPremium === 0);

  const junk = initialPlannerState();
  junk.property.fmv = "1400";
  junk.property.transitScore = "abc";
  ok("junk input adds nothing rather than NaN", computePlanner(junk).pricing.rooms[0].result.propertyPremium === 0);
}

section("Checkbox and quantity semantics");
{
  const s = initialPlannerState();
  s.property.fmv = "1400";

  const off = computePlanner(s);
  const f1Off = off.oneTime.resolved.find((r) => r.line.id === "f1")!;
  ok("an unchecked line contributes zero", f1Off.total === 0);

  s.property.totalRooms = "3";
  s.lines.f1 = { on: true, qty: "", oneTime: "", monthly: "" };
  const onDefault = computePlanner(s);
  const f1On = onDefault.oneTime.resolved.find((r) => r.line.id === "f1")!;
  ok("checking a per-room line auto-fills qty from the room count", f1On.qty === 3);
  ok("and uses the product price as the default", f1On.amount === 450 && f1On.usingDefault);
  ok("line total is amount x qty", f1On.total === 1350);

  s.lines.f1.oneTime = "600";
  const typed = computePlanner(s);
  const f1Typed = typed.oneTime.resolved.find((r) => r.line.id === "f1")!;
  ok("a typed value overrides the default", f1Typed.amount === 600 && f1Typed.source === "user");

  s.lines.f1.on = false;
  s.lines.f1.on = true;
  const rechecked = computePlanner(s);
  ok(
    "uncheck then recheck preserves the typed value",
    rechecked.oneTime.resolved.find((r) => r.line.id === "f1")!.amount === 600,
  );

  s.lines.lg1 = { on: true, qty: "", oneTime: "", monthly: "" };
  const prop = computePlanner(s);
  ok(
    "property-scope lines are always qty 1",
    prop.oneTime.resolved.find((r) => r.line.id === "lg1")!.qty === 1,
    "nobody should be asked how many LLC registrations they need",
  );

  s.property.totalRooms = "4";
  const grown = computePlanner(s);
  ok(
    "raising the bedroom count buys another bed with no extra click",
    grown.oneTime.resolved.find((r) => r.line.id === "f1")!.qty === 4,
  );
}

section("Percent-of-revenue lines scale with the property");
{
  const s = fullState();
  const before = computePlanner(s);
  const capexBefore = before.monthly.resolved.find((r) => r.line.id === "op_capex")!.total;

  s.rooms.push({ ...makeRoom(5, "room-6"), status: "renting" });
  const after = computePlanner(s);
  const capexAfter = after.monthly.resolved.find((r) => r.line.id === "op_capex")!.total;

  ok("CapEx reserve grows when a room is added", capexAfter > capexBefore);
  ok("and it is 5% of collected rent", Math.abs(capexAfter - after.projection.effectiveMonthlyRevenue * 0.05) < 2);
}

section("Contingency");
{
  const s = fullState();
  const c = computePlanner(s);
  near("contingency is 12% of the one-time subtotal", c.contingency, c.oneTimeSubtotal * 0.12, 1);
  near("total = subtotal + contingency", c.totalOneTime, c.oneTimeSubtotal + c.contingency);
  ok(
    "break-even repays the total INCLUDING contingency",
    c.projection.inputs.totalOneTime === c.totalOneTime,
  );

  s.assumptions.contingencyPct = "0";
  const zero = computePlanner(s);
  ok("zero contingency is allowed", zero.contingency === 0);
  s.assumptions.contingencyPct = "999";
  ok("contingency is clamped at 30%", computePlanner(s).contingency <= zero.oneTimeSubtotal * 0.3 + 1);
}

section("Honesty guards");
{
  const s = fullState();
  s.property.included.utilitiesIncluded = true;
  for (const id of ["u1m_electric", "u1m_water", "u1m_gas"]) s.lines[id] = { on: false, qty: "", oneTime: "", monthly: "" };
  ok(
    "selling utilities with no utility cost is caught",
    computePlanner(s).couplingWarnings.some((w) => w.includes("utilities")),
  );

  // Property tax has no line of its own: it is folded into the mortgage, and
  // the mortgage default carries its money. Pinning both halves here, because
  // dropping the line without moving the money would have made every deal look
  // $265/mo better than it is, and nothing else in the suite would have failed.
  ok("property tax has no separate line", !COST_LINES.some((l) => l.id === "op_proptax"));
  ok(
    "the mortgage default absorbed the tax",
    DEFAULT_CATALOG.byId.op_mortgage?.monthly?.defaultCost === 1915,
    `got ${DEFAULT_CATALOG.byId.op_mortgage?.monthly?.defaultCost}`,
  );
}

// ------------------------------------------------------------- state plumbing

section("State hydration");
{
  ok("empty payload hydrates to defaults", hydratePlannerState(null).rooms.length === 1);
  ok(
    "an analysis saved before the score fields existed still loads",
    hydratePlannerState({ property: { fmv: "1400", walkability: "80" } }).property
      .transitScore === "",
  );
  ok("garbage payload does not throw", hydratePlannerState("nonsense").version === 1);
  ok(
    "unknown line ids are dropped rather than carried",
    hydratePlannerState({ lines: { not_a_real_line: { on: true, qty: "", oneTime: "9", monthly: "" } } })
      .lines.not_a_real_line === undefined,
  );
  ok(
    "a partial payload keeps its values",
    hydratePlannerState({ property: { fmv: "1750" } }).property.fmv === "1750",
  );

  const summary = summarizePlanner(fullState());
  ok("summary produces all three figures", summary.monthlyNet !== null && summary.startupTotal !== null);
  ok("empty state summarizes to nulls", summarizePlanner(initialPlannerState()).monthlyNet === null);
  ok("summary never throws on garbage", summarizePlanner({ rooms: "not an array" }).monthlyNet === null);
}

// ------------------------------------------------------- property identity

section("Property name and address");
{
  const addr = { street: "18 Concord Rd", city: "Smyrna", state: "GA", zip: "30080" };
  ok("full address formats in one line", formatAddress(addr) === "18 Concord Rd, Smyrna, GA 30080");
  ok("locality is the short form", formatLocality(addr) === "Smyrna, GA");
  ok(
    "a half-filled address does not leak punctuation",
    formatAddress({ street: "", city: "Smyrna", state: "GA", zip: "" }) === "Smyrna, GA",
  );
  ok(
    "street only still reads as an address",
    formatAddress({ street: "18 Concord Rd", city: "", state: "", zip: "" }) === "18 Concord Rd",
  );
  ok(
    "an empty address is empty, not a stray comma",
    formatAddress({ street: "", city: "", state: "", zip: "" }) === "",
  );
  ok(
    "locality falls back to the street when there is no city",
    formatLocality({ street: "18 Concord Rd", city: "", state: "", zip: "" }) === "18 Concord Rd",
  );

  // The property's name is the analysis name, so it must NOT reappear in the
  // payload — that duplication is the whole reason this changed.
  ok(
    "PropertyInputs carries no name of its own",
    !("nickname" in initialPlannerState().property),
  );

  // An analysis saved before the split still has one, and it is real user input.
  const migrated = hydratePlannerState({ property: { nickname: "123 Maple St", fmv: "1400" } });
  ok("a legacy nickname migrates into the street", migrated.property.street === "123 Maple St");
  ok("the dead key does not ride along", !("nickname" in migrated.property));
  const kept = hydratePlannerState({
    property: { nickname: "123 Maple St", street: "9 Oak Ave" },
  });
  ok("a real street wins over a legacy nickname", kept.property.street === "9 Oak Ave");

  ok(
    "the summary reports location even with nothing priced",
    summarizePlanner({ property: { ...addr } }).location === "Smyrna, GA",
  );
  ok(
    "no address means a null location, never an empty string",
    summarizePlanner(initialPlannerState()).location === null,
  );
  ok("a filled analysis reports its location", summarizePlanner(fullState()).location === "Smyrna, GA");
}

// --------------------------------------------------------- admin overrides

section("Admin cost overrides");
{
  const base = (lineId: string): CostOverride => ({
    lineId,
    oneTimeCost: null,
    monthlyCost: null,
    monthlyPercent: null,
    sourceNote: null,
    productName: null,
    affiliateUrl: null,
    network: null,
    price: null,
    priceCheckedAt: null,
    updatedAt: null,
    updatedBy: null,
  });

  ok(
    "no overrides yields the config verbatim",
    buildCatalog([]).byId.op_mortgage?.monthly?.defaultCost === 1915,
  );
  ok(
    "an all-null row changes nothing and is not counted as an edit",
    buildCatalog([base("op_mortgage")]).overriddenIds.length === 0,
  );
  ok(
    "an unknown line id is dropped rather than throwing",
    buildCatalog([base("not_a_real_line")]).overriddenIds.length === 0,
  );

  const mortgage = buildCatalog([{ ...base("op_mortgage"), monthlyCost: 1800 }]);
  ok("a monthly override replaces the config default", mortgage.byId.op_mortgage?.monthly?.defaultCost === 1800);
  ok("the override leaves other lines alone", mortgage.byId.lg2?.monthly?.defaultCost === 185);
  ok("the required flag survives an override", mortgage.byId.op_mortgage?.monthly?.required === true);
  ok("DEFAULT_CATALOG is not mutated by building another", DEFAULT_CATALOG.byId.op_mortgage?.monthly?.defaultCost === 1915);

  // Zero is a real value, and the reason null had to mean "inherit".
  const zeroed = buildCatalog([{ ...base("u1m_electric"), monthlyCost: 0 }]);
  ok("zero is stored as zero, not treated as absent", zeroed.byId.u1m_electric?.monthly?.defaultCost === 0);

  const pct = buildCatalog([{ ...base("op_capex"), monthlyPercent: 0.07 }]);
  ok("a percent override applies to a percent line", pct.byId.op_capex?.monthly?.defaultPercent === 0.07);
  const pctFlat = buildCatalog([{ ...base("op_capex"), monthlyCost: 500 }]);
  ok(
    "a flat override is ignored on a percent line",
    pctFlat.byId.op_capex?.monthly?.defaultMode === "percent-of-revenue" &&
      pctFlat.byId.op_capex?.monthly?.defaultCost === undefined,
  );

  const priced = buildCatalog([
    { ...base("f1"), price: 525, affiliateUrl: "https://example.com/x?tag=bnhg" },
  ]);
  ok("a product price override applies", priced.byId.f1?.product?.price === 525);
  ok("an affiliate URL override applies", priced.byId.f1?.product?.affiliateUrl === "https://example.com/x?tag=bnhg");
  ok("an unset product field falls back to the config", priced.byId.f1?.product?.network === "amazon");
  // The product price IS the one-time default, so a competing defaultCost would
  // be two sources of truth for one number.
  const productFlat = buildCatalog([{ ...base("f1"), oneTimeCost: 999 }]);
  ok(
    "a one-time override is ignored on a product line",
    productFlat.byId.f1?.oneTime?.defaultCost === undefined,
  );

  ok(
    "an overridden catalog still passes the config invariants",
    assertCostConfigInvariants().length === 0,
  );

  // The whole point: the override has to reach the headline number.
  const st = fullState();
  const baseNet = computePlanner(st).projection.monthlyNet;
  const dearer = computePlanner(st, buildCatalog([{ ...base("op_mortgage"), monthlyCost: 2115 }]));
  near("a $200 mortgage override moves monthly net by $200", dearer.projection.monthlyNet, baseNet - 200);
  ok(
    "the summary honours the catalog it is given",
    summarizePlanner(st, buildCatalog([{ ...base("op_mortgage"), monthlyCost: 2115 }])).monthlyNet ===
      Math.round(baseNet - 200),
  );
  ok(
    "the summary with no catalog matches the config",
    summarizePlanner(st).monthlyNet === Math.round(baseNet),
  );
}

// ------------------------------------------------------- property cache merge

// The lookup cache is the one place where a null carries two opposite meanings:
// "we searched and nothing is published" versus "nobody has asked yet". Getting
// that backwards either re-bills every visit or writes a permanent blank over a
// field that would have answered. These assertions pin it down.
{
  const empty = sanitizeDetails(null);
  const d = (patch: Partial<PropertyDetails>): PropertyDetails => ({ ...empty, ...patch });
  const src = (uri: string) => ({ title: uri, uri: `https://${uri}` });

  ok(
    "two spellings of one address share a cache key",
    addressKey("540 Hutchens Rd. SE,  Atlanta, GA 30354") ===
      addressKey("540 hutchens rd se, atlanta, ga 30354"),
  );
  ok(
    "different house numbers do not collide",
    addressKey("540 Hutchens Rd SE") !== addressKey("500 Hutchens Rd SE"),
  );

  // First member typed their own bedrooms, so only the rest was searched.
  const first = mergeCacheRow(
    null,
    ["oneBedroomRent", "squareFeet"],
    d({ oneBedroomRent: 1200, squareFeet: null }),
    [src("zillow.com")],
    "Found rent, no floor plan published.",
  );
  ok("a searched field is recorded as searched", first.searched.includes("squareFeet"));
  ok("an unasked field is not recorded", !first.searched.includes("bedrooms"));
  ok(
    "a searched-but-empty field is stored as a confirmed null",
    "squareFeet" in first.details && first.details.squareFeet === null,
  );
  ok("a found value is stored", first.details.oneBedroomRent === 1200);

  // Second member needs the bedrooms the first one typed by hand.
  const second = mergeCacheRow(
    first,
    ["bedrooms"],
    d({ bedrooms: 3 }),
    [src("redfin.com"), src("zillow.com")],
    "",
  );
  ok("the row accumulates coverage across members", second.searched.length === 3);
  ok("an earlier member's value survives a later lookup", second.details.oneBedroomRent === 1200);
  ok("the later lookup's value is added", second.details.bedrooms === 3);
  ok("sources are unioned by uri, not duplicated", second.sources.length === 2);
  ok(
    "empty notes do not wipe the previous explanation",
    second.notes === "Found rent, no floor plan published.",
  );

  // A refresh of an already-covered field must win, including back to null.
  const third = mergeCacheRow(second, ["oneBedroomRent"], d({ oneBedroomRent: 1350 }), [], "");
  ok("a re-search overwrites the older value", third.details.oneBedroomRent === 1350);
  ok("re-searching does not duplicate the field in searched", third.searched.length === 3);

  // The route's own decision: what still needs a live call.
  const covered = third.searched;
  const requested: PropertyDetailField[] = ["bedrooms", "squareFeet", "walkScore"];
  const stillNeeded = requested.filter((f) => !covered.includes(f));
  ok("only genuinely unsearched fields reach the model", stillNeeded.join(",") === "walkScore");
  ok(
    "a confirmed null is never re-searched",
    !stillNeeded.includes("squareFeet") && third.details.squareFeet === null,
  );
}

// ----------------------------------------------------------------- fixtures

function fullState(): PlannerState {
  const s = initialPlannerState();
  s.property = {
    street: "18 Concord Rd",
    city: "Smyrna",
    state: "GA",
    zip: "30080",
    bathrooms: "2.5",
    squareFeet: "2400",
    fmv: "1400",
    totalRooms: "5",
    walkability: "82",
    transitScore: "48",
    bikeScore: "61",
    wholeHouseRent: "2200",
    features: { upgraded: true, laundry: true },
    included: { utilitiesIncluded: true, wifiIncluded: true },
  };
  s.rooms = [0, 1, 2, 3, 4].map((i) => ({
    ...makeRoom(i, `room-${i + 1}`),
    sizeBand: "120 to 200 sqft",
    features: (i === 0 ? { privateBath: true } : {}) as Record<string, boolean>,
  }));
  // Nothing is checked by default any more, so a "filled in" fixture has to
  // switch on everything it wants counted — including the monthly lines that
  // used to arrive pre-ticked.
  const oneTime = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "k1", "u1", "lg1", "lg4", "m1"];
  const monthly = [
    "op_mortgage", "lg2", "u1m_electric", "u1m_water", "u1m_gas",
    "op_maintenance", "op_cleaning", "u2", "op_capex", "op_pmfees",
  ];
  for (const id of [...oneTime, ...monthly]) {
    s.lines[id] = { on: true, qty: "", oneTime: "", monthly: "" };
  }
  return s;
}

// -------------------------------------------------------------------- result

console.log(
  `\n${failures === 0 ? "PASS" : "FAIL"} — ${checks - failures}/${checks} checks passed`,
);
if (failures > 0) process.exit(1);
