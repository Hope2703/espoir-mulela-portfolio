import test from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../src/features/contact/validation.ts";
import { includeEntry } from "../src/lib/content-policy.ts";
test("only published entries are visible", () => {
  assert.equal(includeEntry({ status: "draft" }), false);
  assert.equal(includeEntry({ status: "published" }), true);
});
const valid = {
  name: "Test local",
  email: "qa@example.test",
  subject: "project",
  message: "Ceci est un message de test local, sans envoi réel.",
  token: "test",
  website: "",
  locale: "fr",
};
test("valid form preserves message and normalises whitespace", () => {
  const result = validateContact({ ...valid, name: "  Test local  " });
  assert.equal(result.data.name, "Test local");
  assert.equal(result.data.message, valid.message);
});
test("invalid and overlong input is rejected on the server contract", () => {
  assert.ok(validateContact({ ...valid, email: "invalid" }).errors.email);
  assert.ok(validateContact({ ...valid, message: "short" }).errors.message);
  assert.ok(
    validateContact({ ...valid, message: "x".repeat(5001) }).errors.message,
  );
  assert.ok(validateContact({ ...valid, subject: "invented" }).errors.subject);
  assert.ok(validateContact({ ...valid, name: "a\r\nBcc: other" }).errors.name);
  assert.equal(Object.keys(validateContact(null).errors).length, 4);
});
