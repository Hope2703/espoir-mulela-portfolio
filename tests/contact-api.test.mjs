import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";
import { validateContact } from "../src/features/contact/validation.ts";

const code = ts.transpileModule(
  fs.readFileSync("src/app/api/contact/route.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;

function api(providerStatus = 200, configured = true) {
  let time = 1_000_000;
  const calls = [];
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    Buffer,
    Response,
    AbortSignal,
    URL,
    process: {
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://portfolio.example",
        CONTACT_SECRET: "test-only-shared-signing-secret",
        ...(configured
          ? {
              RESEND_API_KEY: "test-only",
              CONTACT_FROM: "sender@example.test",
              CONTACT_EMAIL: "owner@example.test",
            }
          : {}),
      },
    },
    Date: class extends Date {
      static now() {
        return time;
      }
    },
    require(name) {
      return name === "node:crypto" ? crypto : { validateContact };
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return Response.json({ id: "test-only" }, { status: providerStatus });
    },
  });
  return {
    ...exports,
    calls,
    advance() {
      time += 2000;
    },
  };
}

const request = (token) =>
  new Request("https://portfolio.example/api/contact", {
    method: "POST",
    headers: {
      Origin: "https://portfolio.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Test visitor",
      email: "visitor@example.test",
      subject: "project",
      message: "A sufficiently long verification message.",
      website: "",
      token,
      locale: "en",
    }),
  });

test("shared signing secret works across instances and Resend request uses configured addresses", async () => {
  const issuer = api(),
    receiver = api();
  const { token, available } = await (await issuer.GET()).json();
  assert.equal(available, true);
  receiver.advance();
  const response = await receiver.POST(request(token));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(receiver.calls.length, 1);
  assert.equal(receiver.calls[0].url, "https://api.resend.com/emails");
  const payload = JSON.parse(receiver.calls[0].options.body);
  assert.deepEqual(payload.to, ["owner@example.test"]);
  assert.equal(payload.from, "sender@example.test");
  assert.equal(payload.reply_to, "visitor@example.test");
  assert.ok(receiver.calls[0].options.headers["Idempotency-Key"]);
});

test("provider failure and absent configuration never claim delivery", async () => {
  for (const [configured, status, expected] of [
    [true, 500, 502],
    [false, 200, 503],
  ]) {
    const route = api(status, configured);
    const { token, available } = await (await route.GET()).json();
    assert.equal(available, configured);
    route.advance();
    const response = await route.POST(request(token));
    assert.equal(response.status, expected);
    assert.equal((await response.json()).ok, undefined);
    assert.equal(route.calls.length, configured ? 1 : 0);
  }
});
