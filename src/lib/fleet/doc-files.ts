import path from "node:path";
import {
  editableSourceFor as editableSourceIn,
  resolveServable as resolveServableIn,
} from "@/lib/partnership/doc-files";
import type { FleetDoc } from "./journey";

/**
 * The fleet doc library's folder. Same layout rules as the co-living one
 * (client/, templates/, internal/, dist/), so the path logic is shared and
 * only the root differs. Git-ignored: this repo is public.
 */
export const FLEET_DOCS_ROOT = path.join(process.cwd(), "docs", "fleet-management");

export function editableSourceFor(doc: FleetDoc): string | null {
  return editableSourceIn(doc, FLEET_DOCS_ROOT);
}

export function resolveServable(segments: string[]): { file: string; type: string } | null {
  return resolveServableIn(segments, FLEET_DOCS_ROOT);
}
