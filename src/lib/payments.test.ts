import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { paymentsEnabled } from "./payments";

const original = process.env.PAYMENTS_ENABLED;

afterEach(() => {
  if (original === undefined) {
    delete process.env.PAYMENTS_ENABLED;
  } else {
    process.env.PAYMENTS_ENABLED = original;
  }
});

test("payments are off when PAYMENTS_ENABLED is unset", () => {
  delete process.env.PAYMENTS_ENABLED;
  assert.equal(paymentsEnabled(), false);
});

test("payments stay off for blank and unexpected values", () => {
  for (const value of ["", "   ", "false", "0", "no", "off", "enabled"]) {
    process.env.PAYMENTS_ENABLED = value;
    assert.equal(paymentsEnabled(), false, value);
  }
});

test("payments turn on only for explicit true values", () => {
  for (const value of ["true", "TRUE", "1", "yes", "on", "  On  "]) {
    process.env.PAYMENTS_ENABLED = value;
    assert.equal(paymentsEnabled(), true, value);
  }
});
