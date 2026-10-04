import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { projects } from "../src/content/projects/index.ts";
import { profile } from "../src/data/profile.ts";

test("project slugs are unique and local media exist with bilingual alternatives", () => {
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  for (const p of projects) {
    assert.match(p.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(p.title.fr && p.title.en);
    for (const image of p.media) {
      assert.ok(fs.existsSync(`public${image.src}`), image.src);
      assert.ok(image.alt.fr && image.alt.en);
      assert.ok(image.width > 0 && image.height > 0);
    }
  }
  assert.ok(fs.existsSync(`public${profile.portrait.src}`));
});

test("official project identities and confidential boundaries remain intact", () => {
  assert.equal(
    projects.find((p) => p.slug === "maliyaflow").title.fr,
    "MaliyaFlow",
  );
  assert.equal(
    projects.find((p) => p.slug === "libiki-lya-kongo").title.en,
    "Libiki Lya Kongo",
  );
  for (const p of projects.filter((p) => p.confidential)) {
    assert.deepEqual(p.links, []);
    assert.ok(
      !/https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(JSON.stringify(p)),
    );
  }
});
