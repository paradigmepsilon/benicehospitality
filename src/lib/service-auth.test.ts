import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyServiceApiKey } from "./service-auth";

const ENV_VAR = "TEST_SERVICE_API_KEY";

function requestWithKey(headerValue: string | null): Request {
  const headers = new Headers();
  if (headerValue !== null) headers.set("x-api-key", headerValue);
  return new Request("http://localhost/test", { headers });
}

test("accepts the correct key", () => {
  process.env[ENV_VAR] = "correct-key-value";
  assert.equal(verifyServiceApiKey(requestWithKey("correct-key-value"), ENV_VAR), true);
  delete process.env[ENV_VAR];
});

test("rejects an incorrect key", () => {
  process.env[ENV_VAR] = "correct-key-value";
  assert.equal(verifyServiceApiKey(requestWithKey("wrong-key"), ENV_VAR), false);
  delete process.env[ENV_VAR];
});

test("rejects a missing header", () => {
  process.env[ENV_VAR] = "correct-key-value";
  assert.equal(verifyServiceApiKey(requestWithKey(null), ENV_VAR), false);
  delete process.env[ENV_VAR];
});

test("rejects every request when the env var itself is unset, rather than throwing", () => {
  delete process.env[ENV_VAR];
  assert.equal(verifyServiceApiKey(requestWithKey("anything"), ENV_VAR), false);
});

test("a key of different length than expected is rejected, not compared unsafely", () => {
  process.env[ENV_VAR] = "a-fairly-long-correct-key";
  assert.equal(verifyServiceApiKey(requestWithKey("short"), ENV_VAR), false);
  delete process.env[ENV_VAR];
});
