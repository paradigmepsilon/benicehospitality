import { NextResponse } from "next/server";
import { getSession, requireAuth } from "@/lib/auth";
import {
  deleteCostOverride,
  listCostOverrides,
  upsertCostOverride,
  type OverrideInput,
} from "@/lib/resources/planner-cost-overrides";
import {
  COST_LINE_BY_ID,
} from "@/lib/resources/breakeven-analysis-worksheet/costs";
import { editableFields } from "@/lib/resources/breakeven-analysis-worksheet/catalog";
import { VALID_NETWORKS, type AffiliateNetwork } from "@/lib/marketplace";

// Write side of the planner cost editor.
//
// PUT is a FULL REPLACE of the fields the admin owns for one line, not a patch:
// the form always submits every editable field, and an omitted field means
// "cleared, fall back to the config default". A patch-shaped endpoint could not
// express clearing, because null would be ambiguous with "unchanged".
//
// DELETE drops the row, which returns every field on the line to costs.ts.

interface RouteContext {
  params: Promise<{ lineId: string }>;
}

/** Dollar figures. Generous ceiling; the point is to catch a fat-fingered paste. */
const MAX_DOLLARS = 1_000_000;
const MAX_NOTE = 300;
const MAX_NAME = 160;

type Fail = { error: string };
const isFail = (v: unknown): v is Fail =>
  typeof v === "object" && v !== null && "error" in v;

/** Absent, null, or "" all mean inherit. Anything else must be a valid number. */
function optionalMoney(v: unknown, label: string): number | null | Fail {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return { error: `${label} must be a number` };
  if (n < 0) return { error: `${label} cannot be negative` };
  if (n > MAX_DOLLARS) return { error: `${label} looks wrong (over $1,000,000)` };
  return Math.round(n * 100) / 100;
}

/** Stored as a fraction: the admin types 5, we persist 0.05. */
function optionalPercent(v: unknown): number | null | Fail {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return { error: "Percent must be a number" };
  if (n < 0 || n > 100) return { error: "Percent must be between 0 and 100" };
  return Math.round((n / 100) * 10000) / 10000;
}

function optionalText(v: unknown, max: number, label: string): string | null | Fail {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return { error: `${label} must be text` };
  const s = v.trim();
  if (s === "") return null;
  if (s.length > max) return { error: `${label} must be ${max} characters or fewer` };
  return s;
}

/**
 * An affiliate URL ships to members with rel="sponsored" and gets clicked for
 * money, so a malformed or non-https one is worth rejecting loudly rather than
 * rendering a dead buy pill.
 */
function optionalUrl(v: unknown): string | null | Fail {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return { error: "Affiliate URL must be text" };
  const s = v.trim();
  if (s === "") return null;
  if (s.length > 2000) return { error: "Affiliate URL is too long" };
  let parsed: URL;
  try {
    parsed = new URL(s);
  } catch {
    return { error: "Affiliate URL must be a full URL, e.g. https://…" };
  }
  if (parsed.protocol !== "https:") {
    return { error: "Affiliate URL must start with https://" };
  }
  return s;
}

function optionalNetwork(v: unknown): AffiliateNetwork | null | Fail {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string" || !VALID_NETWORKS.includes(v as AffiliateNetwork)) {
    return { error: `Network must be one of: ${VALID_NETWORKS.join(", ")}` };
  }
  return v as AffiliateNetwork;
}

/**
 * Today in America/New_York. The staleness clock measures "when did a human
 * last look at this price", and that human is in Georgia — stamping a UTC date
 * would read a day early every evening.
 */
function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function PUT(request: Request, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { lineId } = await context.params;
  const line = COST_LINE_BY_ID[lineId];
  if (!line) {
    return NextResponse.json({ error: "Unknown cost line" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const can = editableFields(line);

  const oneTimeCost = can.oneTimeCost
    ? optionalMoney(body.oneTimeCost, "One-time cost")
    : null;
  const monthlyCost = can.monthlyCost ? optionalMoney(body.monthlyCost, "Monthly cost") : null;
  const monthlyPercent = can.monthlyPercent ? optionalPercent(body.monthlyPercent) : null;
  const sourceNote = optionalText(body.sourceNote, MAX_NOTE, "Source note");
  const productName = can.product ? optionalText(body.productName, MAX_NAME, "Product name") : null;
  const affiliateUrl = can.product ? optionalUrl(body.affiliateUrl) : null;
  const network = can.product ? optionalNetwork(body.network) : null;
  const price = can.product ? optionalMoney(body.price, "Price") : null;

  for (const v of [
    oneTimeCost,
    monthlyCost,
    monthlyPercent,
    sourceNote,
    productName,
    affiliateUrl,
    network,
    price,
  ]) {
    if (isFail(v)) return NextResponse.json({ error: v.error }, { status: 400 });
  }

  // Clearing every field is a reset. Storing the all-null row instead would
  // leave the line badged "edited" in the admin list while buildCatalog
  // correctly ignored it — two screens disagreeing about the same row.
  const allCleared =
    oneTimeCost === null &&
    monthlyCost === null &&
    monthlyPercent === null &&
    sourceNote === null &&
    productName === null &&
    affiliateUrl === null &&
    network === null &&
    price === null;
  if (allCleared) {
    await deleteCostOverride(lineId);
    return NextResponse.json({ override: null });
  }

  // priceCheckedAt is never accepted from the client — it is a claim about when
  // a human verified the number, so only the act of changing the number may set
  // it. Re-stamping on an unchanged price (say, while editing only the URL)
  // would silently reset the staleness clock without anyone having looked.
  const existing = (await listCostOverrides()).find((o) => o.lineId === lineId) ?? null;
  const effectivePrice = existing?.price ?? line.product?.price ?? null;
  const newPrice = price as number | null;
  let priceCheckedAt: string | null = existing?.priceCheckedAt ?? null;
  if (can.product && newPrice !== null && newPrice !== effectivePrice) {
    priceCheckedAt = todayEastern();
  } else if (newPrice === null) {
    // Price cleared back to the config default, so the config's own date applies.
    priceCheckedAt = null;
  }

  const session = await getSession();

  const input: OverrideInput = {
    oneTimeCost: oneTimeCost as number | null,
    monthlyCost: monthlyCost as number | null,
    monthlyPercent: monthlyPercent as number | null,
    sourceNote: sourceNote as string | null,
    productName: productName as string | null,
    affiliateUrl: affiliateUrl as string | null,
    network: network as AffiliateNetwork | null,
    price: newPrice,
    priceCheckedAt,
  };

  const override = await upsertCostOverride(lineId, input, session?.email ?? null);
  return NextResponse.json({ override });
}

export async function DELETE(request: Request, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { lineId } = await context.params;
  if (!COST_LINE_BY_ID[lineId]) {
    return NextResponse.json({ error: "Unknown cost line" }, { status: 404 });
  }
  await deleteCostOverride(lineId);
  return NextResponse.json({ ok: true });
}
