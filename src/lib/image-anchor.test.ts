import { test } from "node:test";
import assert from "node:assert/strict";
import {
  IMAGE_ANCHORS,
  DEFAULT_IMAGE_ANCHOR,
  IMAGE_ANCHOR_LABELS,
  isImageAnchor,
  coerceImageAnchor,
  objectPositionFor,
} from "./image-anchor";

test("exposes exactly the five supported anchors", () => {
  assert.deepEqual([...IMAGE_ANCHORS], ["center", "top", "bottom", "left", "right"]);
});

test("defaults to center, which is the pre-existing render behavior", () => {
  assert.equal(DEFAULT_IMAGE_ANCHOR, "center");
  assert.equal(objectPositionFor(DEFAULT_IMAGE_ANCHOR), "center");
});

test("guard accepts every supported anchor and rejects everything else", () => {
  for (const a of IMAGE_ANCHORS) assert.equal(isImageAnchor(a), true, a);
  for (const bad of ["", "middle", "TOP", "top-left", "1", null, undefined, 0, {}, []]) {
    assert.equal(isImageAnchor(bad), false, JSON.stringify(bad));
  }
});

test("coerce falls back to the default instead of throwing", () => {
  assert.equal(coerceImageAnchor("top"), "top");
  assert.equal(coerceImageAnchor("nonsense"), "center");
  assert.equal(coerceImageAnchor(null), "center");
  assert.equal(coerceImageAnchor(undefined), "center");
});

test("every anchor maps to a valid CSS object-position keyword", () => {
  const valid = new Set(["center", "top", "bottom", "left", "right"]);
  for (const a of IMAGE_ANCHORS) {
    assert.equal(valid.has(objectPositionFor(a)), true, `${a} -> ${objectPositionFor(a)}`);
  }
});

test("every anchor has a human label for the admin UI", () => {
  for (const a of IMAGE_ANCHORS) {
    assert.equal(typeof IMAGE_ANCHOR_LABELS[a], "string");
    assert.ok(IMAGE_ANCHOR_LABELS[a].length > 0, a);
  }
});
