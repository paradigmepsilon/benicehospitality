import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mergeSlots, parseEmailPack, unfilledSlots } from "./emails";
import { STAGE_KEYS } from "./journey";

// docs/ is kept out of the public repo, so the pack is only present on a
// machine that has the working docs. Skip there rather than fail.
const PACK = "docs/co-living-launch-partnership/templates/sales/email_pack.md";
const pack = existsSync(PACK) ? parseEmailPack(readFileSync(PACK, "utf8")) : [];

test("the real email pack parses into sendable drafts tied to real stages", { skip: pack.length === 0 }, () => {
  assert.ok(pack.length >= 20, `only ${pack.length} parsed`);
  for (const t of pack) {
    assert.ok(t.subject && t.body.length > 40, `${t.id} is empty`);
    assert.ok((STAGE_KEYS as readonly string[]).includes(t.stage), `${t.id} → unknown stage "${t.stage}"`);
    assert.ok(!t.body.includes(">"), `${t.id} kept a blockquote marker`);
  }
  assert.equal(pack.find((t) => t.id === "E3")!.stage, "s1_proposed");
});

test("merge fills what the tracker knows and leaves the rest visible", () => {
  const e = { clientName: "Jordan Sample", propertyLabel: "4BR ranch", propertyCity: "Marietta", creditExpiresAt: "2027-09-18" };
  const merged = mergeSlots("Hi [[first name]], about [[property street or city]]: credit ends [[credit expiry date]]. Call at [[time + time zone]].", e);
  assert.equal(merged, "Hi Jordan, about 4BR ranch: credit ends September 18, 2027. Call at [[time + time zone]].");
  assert.deepEqual(unfilledSlots(merged), ["[[time + time zone]]"]);
});

test("a missing fact stays a slot instead of becoming 'null'", () => {
  const merged = mergeSlots("[[credit expiry date]] · [[house name or street]]", { clientName: "A", propertyLabel: null, propertyCity: null, creditExpiresAt: null });
  assert.equal(merged, "[[credit expiry date]] · [[house name or street]]");
});

test("the parser reads the pack's section format", () => {
  const md = "## E9 · Sample\n\n- **Stage:** `decision`\n- **Trigger:** x\n- **Sender:** Della\n- **Subject:** Hello [[first name]]\n\n> Line one.\n>\n> Line two is long enough to count as a real body.\n\n---\n";
  const [t] = parseEmailPack(md);
  assert.equal(t.id, "E9");
  assert.equal(t.stage, "decision");
  assert.equal(t.subject, "Hello [[first name]]");
  assert.equal(t.body, "Line one.\n\nLine two is long enough to count as a real body.");
});
