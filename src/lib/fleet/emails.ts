import { parseEmailPack, unfilledSlots, type EmailTemplate } from "@/lib/partnership/emails";
import { monthLabel, previousMonth, vehicleLabel } from "./journey";
import type { EngagementDetail } from "./engagements";

// docs/fleet-management/templates/sales/email_pack.md uses the co-living pack's
// format, so the parser is shared. Only the slots differ.
export { parseEmailPack, unfilledSlots };
export type { EmailTemplate };

function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

type MergeSource = Pick<EngagementDetail, "clientName" | "marketCity" | "termEndsAt"> & {
  vehicles: Pick<EngagementDetail["vehicles"][number], "year" | "make" | "model" | "status">[];
};

/**
 * Fill the slots the tracker can answer. Everything else stays as a visible
 * [[slot]] on purpose: the send route refuses a message that still has one,
 * so a half-merged email cannot reach an owner. Declined vehicles are left
 * out of the vehicle slots; an email about "your vehicles" should not name a
 * car BNHG turned down. `today` is YYYY-MM-DD.
 */
export function mergeSlots(text: string, e: MergeSource, today: string): string {
  const first = e.clientName.trim().split(/\s+/)[0];
  const labels = e.vehicles.filter((v) => v.status !== "declined").map((v) => vehicleLabel(v));
  const fills: Record<string, string | null> = {
    "first name": first || null,
    "vehicle or vehicles": labels.length === 0 ? null : labels.length === 1 ? `your ${labels[0]}` : `your ${labels.length} vehicles`,
    "vehicle list": labels.length === 0 ? null : labels.join(", "),
    "market city": e.marketCity,
    "term end date": e.termEndsAt ? longDate(e.termEndsAt) : null,
    "statement month": monthLabel(previousMonth(today)),
  };
  return text.replace(/\[\[([^\]]+)\]\]/g, (whole, name: string) => fills[name.trim()] ?? whole);
}
