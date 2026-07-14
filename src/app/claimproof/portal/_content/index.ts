import type { Pack, PackSlug, Tool } from "./types";
import { EMERGENCY } from "./emergency";
import { PROOF } from "./proof";
import { VALUATION } from "./valuation";
import { FOLLOWUP } from "./followup";
import { FLEET_OPS } from "./fleet-ops";

/** Display order: urgency first, then the defense layers, then fleet. */
export const PACKS: Pack[] = [EMERGENCY, PROOF, VALUATION, FOLLOWUP, FLEET_OPS];

export function getPack(slug: string): Pack | undefined {
  return PACKS.find((p) => p.slug === slug);
}

export function getTool(
  packSlug: string,
  toolSlug: string,
): { pack: Pack; tool: Tool } | undefined {
  const pack = getPack(packSlug);
  const tool = pack?.tools.find((t) => t.slug === toolSlug);
  return pack && tool ? { pack, tool } : undefined;
}

/**
 * The four buyer situations on the dashboard. Each routes to the tool that
 * answers "what do I do in the next 20 minutes?" for that state.
 */
export const STAGES: Array<{
  slug: string;
  label: string;
  sub: string;
  href: `/claimproof/portal/${PackSlug}/${string}`;
  urgent?: boolean;
}> = [
  {
    slug: "prepare",
    label: "I am preparing before a claim",
    sub: "Build the repeatable pre-trip and return-photo system.",
    href: "/claimproof/portal/proof/pretrip-standard",
  },
  {
    slug: "today",
    label: "I found damage today",
    sub: "Run the filing sequence before the window closes.",
    href: "/claimproof/portal/emergency/quick-start",
    urgent: true,
  },
  {
    slug: "underpaid",
    label: "My claim was approved too low",
    sub: "Compare the appraisal to the shop estimate and build a supplement.",
    href: "/claimproof/portal/valuation/gap-worksheet",
  },
  {
    slug: "stuck",
    label: "My claim is stuck",
    sub: "Diagnose the stall, log everything, escalate professionally.",
    href: "/claimproof/portal/followup/escalation-map",
  },
];
