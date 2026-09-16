import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_CATEGORY_IDS,
  MARKETPLACE_TAB_IDS,
  RAW_TAG_TO_CATEGORY,
  UNCATEGORIZED_LABEL,
  categoriesForTab,
  categoryLabel,
  findCategory,
  groupByCategory,
  isKnownCategory,
  isTabId,
  normalizeCategory,
  type MarketplaceTabId,
} from "./marketplace-categories";

test("category ids are unique", () => {
  const seen = new Set(MARKETPLACE_CATEGORY_IDS);
  assert.equal(seen.size, MARKETPLACE_CATEGORY_IDS.length);
});

test("every id is already normalized", () => {
  // This is what keeps the database's normalization CHECK
  // (category = lower(btrim(category))) from ever firing in production.
  for (const c of MARKETPLACE_CATEGORIES) {
    assert.equal(normalizeCategory(c.id), c.id, `"${c.id}" is not normalized`);
  }
});

test("every id is URL-safe — ids double as in-page anchors", () => {
  for (const c of MARKETPLACE_CATEGORIES) {
    assert.match(c.id, /^[a-z0-9-]+$/, `"${c.id}" is not anchor-safe`);
  }
});

test("every category belongs to a real tab", () => {
  for (const c of MARKETPLACE_CATEGORIES) {
    assert.ok(isTabId(c.tabId), `"${c.id}" has tab "${c.tabId}"`);
  }
});

test("positions are unique within each tab", () => {
  for (const tab of MARKETPLACE_TAB_IDS) {
    const positions = categoriesForTab(tab).map((c) => c.position);
    assert.equal(new Set(positions).size, positions.length, `duplicate position in "${tab}"`);
  }
});

test("every tab has at least one category", () => {
  for (const tab of MARKETPLACE_TAB_IDS) {
    assert.ok(categoriesForTab(tab).length > 0, `tab "${tab}" has no categories`);
  }
});

test("categoriesForTab returns position order", () => {
  for (const tab of MARKETPLACE_TAB_IDS) {
    const positions = categoriesForTab(tab).map((c) => c.position);
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  }
});

test("every category has a blurb and a tint", () => {
  for (const c of MARKETPLACE_CATEGORIES) {
    assert.ok(c.blurb.length > 0, `"${c.id}" has no blurb`);
    assert.match(c.tint, /^#[0-9A-Fa-f]{6}$/, `"${c.id}" tint is not a hex color`);
  }
});

test("every RAW_TAG_TO_CATEGORY target is a real category", () => {
  for (const [raw, target] of Object.entries(RAW_TAG_TO_CATEGORY)) {
    assert.ok(isKnownCategory(target), `"${raw}" maps to unknown category "${target}"`);
    assert.equal(normalizeCategory(raw), raw, `raw key "${raw}" is not normalized`);
  }
});

test("normalizeCategory trims, lowercases, and collapses whitespace", () => {
  assert.equal(normalizeCategory("  Bedroom  "), "bedroom");
  assert.equal(normalizeCategory("KITCHEN-DINING"), "kitchen-dining");
  assert.equal(normalizeCategory("safety   &   emergency"), "safety & emergency");
  assert.equal(normalizeCategory(null), "");
  assert.equal(normalizeCategory(undefined), "");
  assert.equal(normalizeCategory(42), "");
});

test("findCategory tolerates unnormalized input", () => {
  assert.equal(findCategory("  BEDROOM ")?.id, "bedroom");
  assert.equal(findCategory("nope"), undefined);
});

test("categoryLabel falls back rather than throwing", () => {
  assert.equal(categoryLabel("bedroom"), "Bedroom");
  assert.equal(categoryLabel("does-not-exist"), UNCATEGORIZED_LABEL);
  assert.equal(categoryLabel(""), UNCATEGORIZED_LABEL);
});

// ---------------------------------------------------------------------------
// groupByCategory — the invariant that matters: nothing is ever dropped.
// ---------------------------------------------------------------------------

const item = (category: string, id = category) => ({ category, id });

function totalItems<T>(groups: Array<{ items: T[] }>): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

test("groupByCategory never loses an item", () => {
  const items = [
    item("bedroom", "a"),
    item("bathroom", "b"),
    item("", "c"), // never categorized
    item("typo-category", "d"), // drifted string
    item("vehicle-safety", "e"), // right category, wrong tab
    item("BEDROOM", "f"), // unnormalized but valid
  ];
  const groups = groupByCategory(items, "property");
  assert.equal(totalItems(groups), items.length);

  const emitted = groups.flatMap((g) => g.items.map((i) => i.id)).sort();
  assert.deepEqual(emitted, ["a", "b", "c", "d", "e", "f"]);
});

test("groupByCategory puts unknown, empty, and wrong-tab items in the catch-all", () => {
  const groups = groupByCategory(
    [item("bedroom", "a"), item("", "b"), item("nonsense", "c"), item("books", "d")],
    "property",
  );
  const loose = groups.find((g) => g.category === null);
  assert.ok(loose, "expected a catch-all bucket");
  assert.deepEqual(
    loose.items.map((i) => i.id).sort(),
    ["b", "c", "d"],
    "wrong-tab item 'books' belongs in the catch-all, not silently dropped",
  );
  assert.equal(loose.label, UNCATEGORIZED_LABEL);
});

test("groupByCategory omits empty buckets", () => {
  const groups = groupByCategory([item("bedroom")], "property");
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category?.id, "bedroom");
});

test("groupByCategory emits no catch-all when everything is categorized", () => {
  const groups = groupByCategory([item("bedroom"), item("bathroom")], "property");
  assert.ok(groups.every((g) => g.category !== null));
});

test("groupByCategory returns groups in category position order", () => {
  // Deliberately out of order on input.
  const groups = groupByCategory(
    [item("operations-welcome"), item("bedroom"), item("kitchen-dining")],
    "property",
  );
  const positions = groups.map((g) => g.category?.position ?? Infinity);
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("groupByCategory puts the catch-all last", () => {
  const groups = groupByCategory([item("junk"), item("bedroom")], "property");
  assert.equal(groups[groups.length - 1].category, null);
});

test("groupByCategory anchors are unique and anchor-safe", () => {
  const groups = groupByCategory(
    [item("bedroom"), item("bathroom"), item("junk")],
    "property",
  );
  const anchors = groups.map((g) => g.anchor);
  assert.equal(new Set(anchors).size, anchors.length);
  for (const a of anchors) assert.match(a, /^[a-z0-9-]+$/);
});

test("groupByCategory handles an empty list", () => {
  assert.deepEqual(groupByCategory([], "property"), []);
});

test("groupByCategory preserves input order within a bucket", () => {
  const groups = groupByCategory(
    [item("bedroom", "first"), item("bedroom", "second"), item("bedroom", "third")],
    "property",
  );
  assert.deepEqual(groups[0].items.map((i) => i.id), ["first", "second", "third"]);
});

test("every tab can group its own categories without a catch-all", () => {
  for (const tab of MARKETPLACE_TAB_IDS as readonly MarketplaceTabId[]) {
    const items = categoriesForTab(tab).map((c) => item(c.id));
    const groups = groupByCategory(items, tab);
    assert.equal(totalItems(groups), items.length);
    assert.ok(
      groups.every((g) => g.category !== null),
      `tab "${tab}" produced a catch-all for its own categories`,
    );
  }
});
