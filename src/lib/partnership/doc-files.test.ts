import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveServable, editableSourceFor } from "./doc-files";
import { DOCS } from "./journey";

test("forms and their assets are servable", () => {
  assert.ok(resolveServable(["templates", "sales", "proposal_order_form.html"]));
  assert.ok(resolveServable(["client", "assets", "partnership.css"]));
  assert.ok(resolveServable(["client", "assets", "logo-mark.png"]));
});

test("internal docs, other file types, and traversal are refused", () => {
  assert.equal(resolveServable(["internal", "_html", "00_program_overview.html"]), null);
  assert.equal(resolveServable(["templates", "strategy_packet", "sample_client.json"]), null);
  assert.equal(resolveServable(["templates", "strategy_packet", "build_packet.mjs"]), null);
  assert.equal(resolveServable(["templates", "..", "internal", "_html", "00_program_overview.html"]), null);
  assert.equal(resolveServable(["client", "..", "..", "..", ".env.local"]), null);
  assert.equal(resolveServable(["client", "%2e%2e", "render.sh"]), null);
  assert.equal(resolveServable([]), null);
});

test("no internal doc is ever offered as an editable source", () => {
  for (const d of DOCS) {
    const src = editableSourceFor(d);
    if (d.audience === "internal") assert.equal(src, null, d.key);
    if (src) assert.ok(!src.startsWith("internal/"), d.key);
  }
});
