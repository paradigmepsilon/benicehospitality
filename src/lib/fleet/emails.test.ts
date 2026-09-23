import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mergeSlots, parseEmailPack, unfilledSlots } from "./emails";
import { STAGE_KEYS } from "./journey";

// docs/ is kept out of the public repo, so the pack is only present on a
// machine that has the working docs. Skip there rather than fail.
const PACK = "docs/fleet-management/templates/sales/email_pack.md";
const pack = existsSync(PACK) ? parseEmailPack(readFileSync(PACK, "utf8")) : [];

test("the real email pack parses into sendable drafts tied to real stages", { skip: pack.length === 0 }, () => {
  assert.ok(pack.length >= 12, `only ${pack.length} parsed`);
  for (const t of pack) {
    assert.ok(t.subject && t.body.length > 40, `${t.id} is empty`);
    assert.ok((STAGE_KEYS as readonly string[]).includes(t.stage), `${t.id} → unknown stage "${t.stage}"`);
    assert.ok(!/[–—]/.test(t.subject + t.body), `${t.id} has a dash the house style bans`);
  }
});

const owner = {
  clientName: "Jordan Sample",
  marketCity: "Marietta",
  termEndsAt: "2027-09-20",
  vehicles: [
    { year: 2021, make: "Toyota", model: "Camry", status: "live" as const },
    { year: 2019, make: "Honda", model: "CR-V", status: "declined" as const },
  ],
};

test("merge fills what the tracker knows and leaves the rest visible", () => {
  const merged = mergeSlots("Hi [[first name]], [[vehicle or vehicles]] in [[market city]]: term ends [[term end date]]. [[statement month]] statement attached. Pay here: [[payment link]]", owner, "2026-10-08");
  assert.equal(merged, "Hi Jordan, your 2021 Toyota Camry in Marietta: term ends September 20, 2027. September 2026 statement attached. Pay here: [[payment link]]");
  assert.deepEqual(unfilledSlots(merged), ["[[payment link]]"]);
});

test("a declined vehicle is never named, and several vehicles become a count", () => {
  assert.equal(mergeSlots("[[vehicle list]]", owner, "2026-10-08"), "2021 Toyota Camry");
  const two = { ...owner, vehicles: [owner.vehicles[0], { year: 2022, make: "Kia", model: "Soul", status: "onboarding" as const }] };
  assert.equal(mergeSlots("[[vehicle or vehicles]]", two, "2026-10-08"), "your 2 vehicles");
  assert.equal(mergeSlots("[[vehicle list]]", two, "2026-10-08"), "2021 Toyota Camry, 2022 Kia Soul");
});

test("a missing fact stays a slot instead of becoming 'null'", () => {
  const bare = { clientName: "A", marketCity: null, termEndsAt: null, vehicles: [] };
  assert.equal(mergeSlots("[[market city]] · [[term end date]] · [[vehicle list]]", bare, "2026-10-08"), "[[market city]] · [[term end date]] · [[vehicle list]]");
});
