/**
 * Shared data for the management bin. BNHG is the contracting party on every
 * owner-facing surface, so nothing here names an operating company. Fees are
 * env-gated: getManagementFeeModel returns null until Alex sets real numbers,
 * and the offer pages render structure-only copy in that state. No invented
 * fee ever renders.
 */

export type ManagedAsset = "car" | "rooms";

export const SERVICE_AREA_STATES = [
  { code: "GA", name: "Georgia" },
  { code: "FL", name: "Florida" },
  { code: "SC", name: "South Carolina" },
  { code: "NC", name: "North Carolina" },
  { code: "AL", name: "Alabama" },
  { code: "TN", name: "Tennessee" },
] as const;

export const SERVICE_AREA_LABEL = SERVICE_AREA_STATES.map((s) => s.code).join(" · ");

export function isServiceAreaState(code: string): boolean {
  if (!code) return false;
  const upper = code.trim().toUpperCase();
  return SERVICE_AREA_STATES.some((s) => s.code === upper);
}

export interface ManagementOffer {
  asset: ManagedAsset;
  slug: string;
  name: string;
  promise: string;
  handles: string[];
  ownerKeeps: string[];
  operator: { name: string; blurb: string };
}

export const MANAGEMENT_OFFERS: Record<ManagedAsset, ManagementOffer> = {
  car: {
    asset: "car",
    slug: "fleet",
    name: "Fleet Management",
    promise: "Your vehicle earns without becoming your second job.",
    handles: [
      "Listing and photography",
      "Pricing and calendar",
      "Turnover and cleaning",
      "Damage claims and disputes",
      "Maintenance coordination",
      "Renter communication",
    ],
    ownerKeeps: [
      "Title and registration",
      "Insurance policy and carrier choice",
      "Capital decisions, including when to buy or sell",
      // Section 8.2 of the vehicle agreement lets BNHG proceed without approval
      // for safety, legal, and damage-prevention work, and treats silence as a
      // yes. "Any major repair" with no qualifier promised more than it signs.
      "Final say on major repairs, with the safety and legal exceptions your agreement spells out",
    ],
    operator: {
      name: "Alex Henry",
      blurb:
        "Alex runs the fleet side day to day and built the systems this service runs on.",
    },
  },
  rooms: {
    asset: "rooms",
    slug: "co-living",
    name: "Co-living Management",
    promise: "Your spare rooms earn without becoming your second job.",
    handles: [
      "Listing and photography",
      "Tenant screening",
      "Leases and renewals",
      "Rent collection",
      "House rules and conflict resolution",
      "Turnover between tenants",
      "Maintenance coordination",
      "Tenant communication",
    ],
    ownerKeeps: [
      "Title and mortgage",
      "Insurance policy and carrier choice",
      "Capital decisions, including refinance and sale",
      "Final say on any major repair",
    ],
    operator: {
      name: "Della Henry",
      blurb:
        "Della runs the co-living side day to day across the Southeast U.S..",
    },
  },
};

export interface FeeModel {
  grossPct: number;
  onboardingUsd: number;
  minimumTermMonths: number;
}

/**
 * Null until every value is configured. Partial configuration is treated as
 * unconfigured on purpose: a page showing a percentage but no minimum term
 * would be a worse promise than one that says "we cover this on the call".
 */
export function getManagementFeeModel(asset: ManagedAsset): FeeModel | null {
  const suffix = asset === "car" ? "CAR" : "ROOMS";
  const pct = process.env[`MANAGEMENT_FEE_${suffix}_PCT`];
  const onboarding = process.env[`MANAGEMENT_FEE_${suffix}_ONBOARDING_USD`];
  const term = process.env[`MANAGEMENT_FEE_${suffix}_MIN_TERM_MONTHS`];
  if (!pct || !onboarding || !term) return null;
  const parsed = {
    grossPct: Number(pct),
    onboardingUsd: Number(onboarding),
    minimumTermMonths: Number(term),
  };
  if (Object.values(parsed).some((n) => !Number.isFinite(n))) return null;
  return parsed;
}

/**
 * FeeModel.grossPct is a whole percent (Alex sets MANAGEMENT_FEE_CAR_PCT=20
 * to mean 20%), and that is the correct unit for owner-facing copy:
 * ManagementOffer.tsx renders `${fees.grossPct}% of gross` directly,
 * unconverted. src/lib/estimate/model.ts's estimate() wants the opposite
 * unit, a decimal fraction, guarded by `fee > 0 && fee < 1`. This is the one
 * blessed conversion between the two: every estimator call site (the car and
 * room earnings-estimator pages) must run grossPct through this before
 * passing it to estimate() as feePct. Do not pass grossPct to estimate()
 * unconverted, and do not convert getManagementFeeModel's own return value,
 * that would break the offer pages instead. See
 * src/lib/management/constants.test.ts for the test that pins both
 * consumers to one env value.
 */
export function managementFeeAsDecimal(grossPct: number): number {
  return grossPct / 100;
}
