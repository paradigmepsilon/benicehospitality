import PlannerCostsAdmin, {
  type AdminCostLine,
} from "@/components/admin/PlannerCostsAdmin";
import { listCostOverrides } from "@/lib/resources/planner-cost-overrides";
import {
  COST_LINES,
  MONTHLY_CATEGORIES,
  ONE_TIME_CATEGORIES,
} from "@/lib/resources/breakeven-analysis-worksheet/costs";
import { editableFields } from "@/lib/resources/breakeven-analysis-worksheet/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Worksheet cost defaults",
};

/**
 * Flattens the static config into the shape the editor renders. The config is
 * the BASELINE — every field here is what the line falls back to when its
 * override is cleared, which is why the client shows these as placeholders
 * rather than as values. Same convention as the member-facing tool, where a
 * grey placeholder means "our estimate" and a typed value means "yours".
 */
function buildAdminLines(): AdminCostLine[] {
  const categoryOf = new Map<string, string[]>();
  for (const c of ONE_TIME_CATEGORIES) {
    for (const id of c.lineIds) {
      categoryOf.set(id, [...(categoryOf.get(id) ?? []), `One-time · ${c.label}`]);
    }
  }
  for (const c of MONTHLY_CATEGORIES) {
    for (const id of c.lineIds) {
      categoryOf.set(id, [...(categoryOf.get(id) ?? []), `Monthly · ${c.label}`]);
    }
  }

  return COST_LINES.map((line) => ({
    id: line.id,
    label: line.label,
    hint: line.hint ?? null,
    scope: line.scope,
    categories: categoryOf.get(line.id) ?? [],
    editable: editableFields(line),
    base: {
      oneTimeCost: line.oneTime?.defaultCost ?? null,
      monthlyCost: line.monthly?.defaultCost ?? null,
      monthlyPercent: line.monthly?.defaultPercent ?? null,
      sourceNote: line.sourceNote ?? null,
      productName: line.product?.productName ?? null,
      affiliateUrl: line.product?.affiliateUrl || null,
      network: line.product?.network ?? null,
      price: line.product?.price ?? null,
      priceCheckedAt: line.product?.priceCheckedAt ?? null,
    },
  }));
}

export default async function PlannerCostsPage() {
  const overrides = await listCostOverrides();
  return <PlannerCostsAdmin lines={buildAdminLines()} initialOverrides={overrides} />;
}
