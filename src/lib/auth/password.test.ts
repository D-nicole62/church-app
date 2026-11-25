import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_SEED_PASSWORD,
  isDefaultSeedPassword,
  passwordChangeError,
} from "./password";

test("recognises the seeded setup password", () => {
  assert.equal(isDefaultSeedPassword(DEFAULT_SEED_PASSWORD), true);
  assert.equal(isDefaultSeedPassword("E2eAdmin!2026"), false);
});

test("rejects short, default, and mismatched passwords", () => {
  assert.match(passwordChangeError("short", "short") ?? "", /10 characters/);
  assert.match(
    passwordChangeError(DEFAULT_SEED_PASSWORD, DEFAULT_SEED_PASSWORD) ?? "",
    /original setup password/,
  );
  assert.match(passwordChangeError("long-enough-1", "long-enough-2") ?? "", /do not match/);
  assert.equal(passwordChangeError("long-enough-1", "long-enough-1"), null);
});
