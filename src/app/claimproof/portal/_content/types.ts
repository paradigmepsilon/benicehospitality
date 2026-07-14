import type { PortalTier } from "../_lib/access";

/**
 * Claim Command Center content model. Every tool is data, rendered by one
 * ToolRenderer, so the product stays consistent: next action, time estimate,
 * checklist with account-synced persistence, copyable template, common-mistakes
 * callout, and a last-reviewed date on policy-dependent pages.
 *
 * Content conventions:
 *  - Operator voice: one working host talking to another. No hype.
 *  - No em dashes (brand rule). No approval/payout promises anywhere.
 *  - Policy-dependent tools set `policySensitive: true` so the renderer stamps
 *    LAST_REVIEWED on them. Bump LAST_REVIEWED + PRODUCT_VERSION together when
 *    Turo's published rules change.
 */

export const LAST_REVIEWED = "July 2026";
export const PRODUCT_VERSION = "1.0";

export type Step = {
  /** Imperative headline: what to do right now. */
  action: string;
  /** Rough time cost, e.g. "2 min". */
  minutes?: string;
  detail: string;
  /** Common mistakes that sink this exact step. */
  mistakes?: string[];
  /**
   * Concrete sub-tasks that make up this step. When present, the step renders
   * as an expandable checklist: the host ticks each sub-task and the step's
   * own completion rolls up from them. Keep each one a single verifiable
   * action ("Shoot all four corners", not "take good photos").
   */
  subtasks?: string[];
};

export type ToolSection =
  | { kind: "intro"; body: string[] }
  | {
      kind: "steps";
      /**
       * Optional id. When set, the step list becomes trackable: each step gets
       * a checkbox, its sub-tasks are individually checkable, and the state
       * syncs to the account keyed by (tool + this id, claim). Omit for a
       * purely informational step list (no tracking).
       */
      id?: string;
      title?: string;
      items: Step[];
    }
  | {
      kind: "checklist";
      /** Unique within the tool; namespaces the synced payload key. */
      id: string;
      title?: string;
      intro?: string;
      items: string[];
    }
  | {
      kind: "template";
      id: string;
      title: string;
      /** When to use this template. */
      context?: string;
      /** The copyable body. [BRACKETED] tokens are fill-ins. */
      body: string;
    }
  | { kind: "callout"; tone: "warn" | "gold" | "info"; title: string; body: string }
  | { kind: "prose"; title?: string; body: string[] }
  | { kind: "table"; title?: string; headers: string[]; rows: string[][] }
  | {
      kind: "resource";
      title: string;
      description?: string;
      /** Key in CLAIM_PROOF_ASSETS; the download button hits /api/claimproof/asset/<assetKey>. */
      assetKey: string;
      /** What it opens in, e.g. "Google Slides or PowerPoint · .pptx". */
      formatLabel: string;
    }
  | {
      kind: "interactive";
      component:
        | "valuation-worksheet"
        | "comms-log"
        | "downtime-tracker"
        | "economics"
        | "fleet-tracker"
        | "fleet-kpi";
    };

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  /** Estimated time to run the tool, e.g. "10 min". */
  minutes: string;
  /** Stamps the LAST_REVIEWED date; set on anything quoting platform rules. */
  policySensitive?: boolean;
  sections: ToolSection[];
};

export type PackSlug =
  | "emergency"
  | "proof"
  | "valuation"
  | "followup"
  | "fleet-ops";

export type Pack = {
  slug: PackSlug;
  name: string;
  /** Minimum tier that unlocks the pack. */
  access: PortalTier;
  blurb: string;
  tools: Tool[];
};
