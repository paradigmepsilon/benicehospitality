import path from "node:path";
import { existsSync } from "node:fs";
import type { PartnershipDoc } from "./journey";

export const DOCS_ROOT = path.join(process.cwd(), "docs", "co-living-launch-partnership");

/**
 * The editable HTML behind a library PDF, if there is one, as a path relative
 * to `root` (the fleet library passes its own; see src/lib/fleet/doc-files.ts). HTML forms are the source itself; Markdown templates and
 * agreements are their generated _html twin. Internal docs have none.
 */
export function editableSourceFor(doc: PartnershipDoc, root: string = DOCS_ROOT): string | null {
  if (doc.audience === "internal") return null;
  const rel = doc.pdf.replace(/\.pdf$/, "");
  const candidates = rel.startsWith("templates/")
    ? [`${rel}.html`, rel.replace(/^templates\//, "templates/_html/") + ".html"]
    : [`client/${rel}.html`];
  if (doc.key === "intake") candidates.unshift("templates/intake/client_intake.html");
  return candidates.find((c) => existsSync(path.join(root, c))) ?? null;
}

const SERVABLE: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".csv": "text/csv; charset=utf-8",
};

/**
 * Resolve a requested path to a file this route may serve, or null. Only
 * client/ and templates/ are reachable (never internal/, which holds margins),
 * only the four static types above, and the resolved path must still sit
 * inside the root after normalisation, which is what stops "../".
 */
export function resolveServable(segments: string[], root: string = DOCS_ROOT): { file: string; type: string } | null {
  const file = path.resolve(root, segments.join("/"));
  // Test the path AFTER normalisation: "templates/../internal/x.html" starts
  // with an allowed folder and still lands in internal/.
  const rel = path.relative(root, file).split(path.sep).join("/");
  if (!/^(client|templates)\//.test(rel)) return null;
  const type = SERVABLE[path.extname(rel).toLowerCase()];
  if (!type) return null;
  return { file, type };
}
