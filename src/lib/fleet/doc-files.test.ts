import { test } from "node:test";
import assert from "node:assert/strict";
import { FLEET_DOCS_ROOT, editableSourceFor, resolveServable } from "./doc-files";
import { DOCS_ROOT } from "@/lib/partnership/doc-files";
import { DOCS } from "./journey";

test("the fleet library resolves inside its own folder, not the co-living one", () => {
  const hit = resolveServable(["templates", "operate", "owner_statement.html"]);
  assert.ok(hit);
  assert.ok(hit.file.startsWith(FLEET_DOCS_ROOT));
  assert.ok(!hit.file.startsWith(DOCS_ROOT));
});

test("internal docs, other file types, and traversal are refused", () => {
  assert.equal(resolveServable(["internal", "_html", "00_program_overview.html"]), null);
  assert.equal(resolveServable(["templates", "new_owner_folder.sh"]), null);
  assert.equal(resolveServable(["templates", "..", "internal", "_html", "00_sales_playbook.html"]), null);
  // Traversal out of the fleet root into the co-living docs next door.
  assert.equal(resolveServable(["client", "..", "..", "co-living-launch-partnership", "client", "00_offer_menu.html"]), null);
  assert.equal(resolveServable(["client", "..", "..", "..", ".env.local"]), null);
  assert.equal(resolveServable([]), null);
});

test("no internal doc is ever offered as an editable source", () => {
  for (const d of DOCS) {
    const src = editableSourceFor(d);
    if (d.audience === "internal") assert.equal(src, null, d.key);
    if (src) assert.ok(!src.startsWith("internal/"), d.key);
  }
});
