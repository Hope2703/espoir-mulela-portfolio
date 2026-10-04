import assert from "node:assert/strict";
import fs from "node:fs";
const base = process.argv[2] || "http://127.0.0.1:3002";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))
  throw Error("Local unconfigured server only");
const data = {
  name: "Local QA",
  email: "qa@example.test",
  subject: "project",
  message: "Local verification only. No email should be sent.",
  locale: "fr",
  website: "",
};
const send = (body) =>
  fetch(base + "/api/contact", {
    method: "POST",
    headers: { Origin: base, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const { token, available } = await (await fetch(base + "/api/contact")).json();
assert.equal(
  available,
  false,
  "Disable email delivery before running local checks",
);
assert.ok(
  token,
  "Configure a local CONTACT_SECRET before running signed-token checks",
);
assert.equal((await send({ ...data, token: "invalid" })).status, 400);
assert.equal(
  (await send({ ...data, token, website: "bot.example" })).status,
  400,
);
await new Promise((resolve) => setTimeout(resolve, 1600));
const unavailable = await send({ ...data, token });
assert.equal(
  unavailable.status,
  503,
  "Run only without an email provider configured",
);
assert.equal((await unavailable.json()).error, "delivery-not-configured");
for (let i = 0; i < 4; i++)
  assert.equal((await send({ ...data, token })).status, 503);
assert.equal((await send({ ...data, token })).status, 429);
const result = {
  date: new Date().toISOString(),
  result: "pass",
  checks: [
    "invalid token",
    "honeypot",
    "signed token",
    "honest unconfigured delivery",
    "rate limiting",
  ],
  noEmailSent: true,
};
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
  "artifacts/contact-checks.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
