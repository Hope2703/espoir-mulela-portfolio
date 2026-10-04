import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { routes, href } from "../src/lib/routes.ts";
import { projects } from "../src/content/projects/index.ts";

function sitemap(indexable) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync("src/app/sitemap.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require(name) {
      return {
        "@/lib/seo": { siteUrl: "https://portfolio.example", indexable },
        "@/lib/routes": { href, routes },
        "@/content/projects": { projects },
        "@/content/publications": { publicationEntries: [] },
        "@/content/activities": { activityEntries: [] },
      }[name];
    },
  });
  return exports.default();
}

test("previews have no sitemap entries; production contains the bilingual real routes", () => {
  assert.equal(sitemap(false).length, 0);
  const entries = sitemap(true);
  assert.equal(
    entries.length,
    (Object.keys(routes).length + projects.length) * 2,
  );
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  assert.ok(
    entries.some((entry) => entry.url === "https://portfolio.example/en"),
  );
  for (const entry of entries) {
    assert.ok(entry.alternates.languages.fr && entry.alternates.languages.en);
    assert.ok(
      !/\/cv|\/resume|demo|maliflow|association-web-platform/.test(entry.url),
    );
  }
});
