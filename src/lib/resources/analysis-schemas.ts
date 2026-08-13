// Which resource tools support named analyses, and how each one is validated
// and summarized.
//
// This map — not the registry — is the real gate. A slug can be in
// RESOURCE_TOOLS and still 404 from every /analyses route, which is what stops
// the generic resource_analyses table rotting into a dumping ground: adding a
// tool here is a deliberate four-field entry, never an accident.

import {
  PLANNER_SCHEMA_VERSION,
  hydratePlannerState,
  summarizePlanner,
} from "./breakeven-analysis-worksheet/projection";
import {
  buildCatalog,
  type CostCatalog,
} from "./breakeven-analysis-worksheet/catalog";
import { listCostOverrides } from "./planner-cost-overrides";
import type { SummaryFields } from "./analyses";

// Server-only: listCostOverrides pulls in @/lib/db. Every importer of this
// module is a route handler or a server page — keep it that way.

export interface AnalysisToolSpec {
  /**
   * Sanitizes an incoming payload. Deliberately NOT a bouncer — it strips
   * unknown keys and fills missing ones, and never rejects. A member with a
   * stale JS bundle mid-session must not have an hour of work 400'd because we
   * tightened a shape. The only 400s come from the route-level body schema,
   * which checks structure ("is this an object") rather than content.
   */
  sanitize: (raw: unknown) => unknown;
  version: number;
  /**
   * Anything `summarize` needs from the database, fetched once per write. The
   * planner uses it to apply the admin's cost overrides, so a shelf card cannot
   * quote a monthly net computed from a default the admin has since changed.
   * Typed `unknown` because this map is tool-generic; each tool casts its own
   * context back in its own summarize.
   */
  loadContext?: () => Promise<unknown>;
  /** Recomputed server-side on every write. Never accepted from the client. */
  summarize: (data: unknown, context?: unknown) => SummaryFields;
  defaultName: (existingCount: number) => string;
}

export const ANALYSIS_TOOLS: Record<string, AnalysisToolSpec> = {
  "breakeven-analysis-worksheet": {
    sanitize: (raw) => hydratePlannerState(raw),
    version: PLANNER_SCHEMA_VERSION,
    loadContext: async () => buildCatalog(await listCostOverrides()),
    summarize: (data, context) => summarizePlanner(data, context as CostCatalog | undefined),
    defaultName: (n) => (n === 0 ? "My first property" : `Property ${n + 1}`),
  },
};

export const ANALYSIS_TOOL_SLUGS = Object.keys(ANALYSIS_TOOLS);

export function getAnalysisTool(slug: string): AnalysisToolSpec | null {
  return ANALYSIS_TOOLS[slug] ?? null;
}
