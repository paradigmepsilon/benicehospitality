import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isUniqueViolation,
  normalizePipelineContactInput,
  upsertContactByEmail,
  type PipelineDb,
} from "./pipeline-contacts";

// A scripted stand-in for the neon tagged template. Each handler is matched
// against the statement text in order; the first hit answers. Every call is
// recorded so a test can assert on what was (and was not) sent.
function fakeDb(
  handlers: Array<[RegExp, (values: unknown[]) => unknown[] | Error]>,
) {
  const calls: Array<{ text: string; values: unknown[] }> = [];
  const db: PipelineDb = async (strings, ...values) => {
    const text = strings.join("?").replace(/\s+/g, " ").trim();
    calls.push({ text, values });
    for (const [pattern, respond] of handlers) {
      if (pattern.test(text)) {
        const out = respond(values);
        if (out instanceof Error) throw out;
        return out;
      }
    }
    throw new Error(`unexpected statement: ${text}`);
  };
  return { db, calls };
}

function uniqueViolation(): Error {
  return Object.assign(new Error("duplicate key value"), { code: "23505" });
}

test("normalize lowercases the email and trims the name", () => {
  const n = normalizePipelineContactInput({
    name: "  Pat Doe ",
    email: "  Pat@Example.COM ",
    source: "contact_form",
  });
  assert.equal(n.email, "pat@example.com");
  assert.equal(n.name, "Pat Doe");
});

test("normalize turns blank optional fields into null so COALESCE keeps the stored value", () => {
  const n = normalizePipelineContactInput({
    name: "Pat",
    email: "pat@example.com",
    source: "booking",
    phone: "",
    hotelName: "   ",
    hotelLocation: undefined,
    roomCount: null,
    company: "",
    notes: "",
  });
  assert.equal(n.phone, null);
  assert.equal(n.hotelName, null);
  assert.equal(n.hotelLocation, null);
  assert.equal(n.roomCount, null);
  assert.equal(n.company, null);
  assert.equal(n.notes, null);
});

test("normalize treats the placeholder hotel names migrate.ts backfills as missing", () => {
  for (const placeholder of ["-", "N/A", "na", " None "]) {
    const n = normalizePipelineContactInput({
      name: "Pat",
      email: "pat@example.com",
      source: "contact_form",
      hotelName: placeholder,
    });
    assert.equal(n.hotelName, null, placeholder);
  }
});

test("normalize keeps real values and stringifies a numeric room count", () => {
  const n = normalizePipelineContactInput({
    name: "Pat",
    email: "pat@example.com",
    source: "manual",
    hotelName: " The Example Inn ",
    roomCount: 42 as unknown as string,
    pipelineStage: "",
  });
  assert.equal(n.hotelName, "The Example Inn");
  assert.equal(n.roomCount, "42");
  assert.equal(n.pipelineStage, "prospect");
});

test("isUniqueViolation only matches SQLSTATE 23505", () => {
  assert.equal(isUniqueViolation(uniqueViolation()), true);
  assert.equal(isUniqueViolation(Object.assign(new Error("x"), { code: "42P10" })), false);
  assert.equal(isUniqueViolation(new Error("x")), false);
  assert.equal(isUniqueViolation(null), false);
});

test("an existing email is updated, never re-inserted, and source is not in the UPDATE", async () => {
  const { db, calls } = fakeDb([
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(email\)/, () => [{ id: 7 }]],
    [/^UPDATE pipeline_contacts/, () => []],
  ]);
  const result = await upsertContactByEmail(
    { name: "Pat", email: "PAT@example.com", source: "booking", phone: "555" },
    db,
  );
  assert.deepEqual(result, { id: 7, outcome: "updated" });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].values[0], "pat@example.com");
  assert.doesNotMatch(calls[1].text, /source/);
  assert.ok(!calls[1].values.includes("booking"));
});

test("a new email is inserted with its first-touch source", async () => {
  const { db, calls } = fakeDb([
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(email\)/, () => []],
    [/^INSERT INTO pipeline_contacts/, () => [{ id: 9 }]],
  ]);
  const result = await upsertContactByEmail(
    { name: "Pat", email: "pat@example.com", source: "contact_form", hotelName: "The Example Inn" },
    db,
  );
  assert.deepEqual(result, { id: 9, outcome: "inserted" });
  assert.ok(calls[1].values.includes("contact_form"));
  assert.doesNotMatch(calls[1].text, /ON CONFLICT/);
});

test("a both-empty property key that collides falls back to the Inbound#id convention", async () => {
  let inserts = 0;
  const { db, calls } = fakeDb([
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(email\)/, () => []],
    [/^WITH new_id AS/, () => [{ id: 13 }]],
    [/^INSERT INTO pipeline_contacts/, () => (inserts++, uniqueViolation())],
  ]);
  const result = await upsertContactByEmail(
    { name: "Pat", email: "pat@example.com", source: "resource:x", hotelName: "" },
    db,
  );
  assert.deepEqual(result, { id: 13, outcome: "inserted" });
  assert.equal(inserts, 1);
  assert.match(calls[2].text, /'Inbound#' \|\| /);
});

test("a named property that collides attaches to the existing property row untouched", async () => {
  const { db, calls } = fakeDb([
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(email\)/, () => []],
    [/^INSERT INTO pipeline_contacts/, () => uniqueViolation()],
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(COALESCE\(website_url/, () => [{ id: 21 }]],
  ]);
  const result = await upsertContactByEmail(
    { name: "Sam", email: "sam@example.com", source: "contact_form", hotelName: "The Example Inn" },
    db,
  );
  assert.deepEqual(result, { id: 21, outcome: "property_match" });
  assert.ok(!calls.some((c) => c.text.startsWith("UPDATE")));
});

test("errors other than a unique violation propagate to the caller", async () => {
  const { db } = fakeDb([
    [/^SELECT id FROM pipeline_contacts WHERE LOWER\(email\)/, () => []],
    [/^INSERT INTO pipeline_contacts/, () => Object.assign(new Error("boom"), { code: "08006" })],
  ]);
  await assert.rejects(
    upsertContactByEmail({ name: "Pat", email: "pat@example.com", source: "manual" }, db),
    /boom/,
  );
});
