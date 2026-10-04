import assert from "node:assert/strict";
import fs from "node:fs";
import { projects } from "../src/content/projects/index.ts";
import { profile } from "../src/data/profile.ts";
const base = process.argv[2] || "http://127.0.0.1:3002";
const pages = [
  "/",
  "/en",
  "/projets",
  "/en/projects",
  "/a-propos",
  "/en/about",
  "/activites",
  "/en/activities",
  "/publications",
  "/en/publications",
  "/contact",
  "/en/contact",
];
for (const { slug } of projects)
  pages.push("/projets/" + slug, "/en/projects/" + slug);
for (const image of [
  ...projects.flatMap((p) => p.media),
  ...(profile.portrait ? [profile.portrait] : []),
]) {
  assert.ok((await fetch(base + image.src)).ok, image.src);
}
for (const [oldSlug, newSlug] of [
  ["maliflow", "maliyaflow"],
  ["association-web-platform", "libiki-lya-kongo"],
]) {
  for (const prefix of ["/projets/", "/en/projects/"]) {
    const response = await fetch(base + prefix + oldSlug, {
      redirect: "manual",
    });
    assert.equal(response.status, 308);
    assert.ok(response.headers.get("location").endsWith(prefix + newSlug));
  }
}
let links = new Set();
for (const route of pages) {
  const res = await fetch(base + route);
  assert.equal(res.status, 200, route);
  const html = await res.text();
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    route + " has one H1",
  );
  assert.match(
    html,
    route.startsWith("/en") ? /<html[^>]+lang="en"/ : /<html[^>]+lang="fr"/,
    route + " locale",
  );
  assert.match(html, /rel="canonical"/, route + " canonical");
  assert.match(html, /hreflang="fr"/i, route + " hreflang");
  assert.ok(
    !html.includes("Contenu de démonstration"),
    route + " production excludes demos",
  );
  assert.ok(
    !html.includes("Demonstration content"),
    route + " production excludes EN demos",
  );
  assert.ok(
    !html.includes("https://makiradrc.com/"),
    route + " excludes temporary URL",
  );
  assert.ok(
    !html.includes("https://sender.makiradrc.com/"),
    route + " excludes temporary URL",
  );
  if (route.includes("projet-institutionnel")) {
    assert.ok(html.includes("FOMIN"), route + " named project");
    assert.ok(
      html.includes("Taprinella Logistic"),
      route + " employer attribution",
    );
  }
  assert.ok(
    !html.includes("Capture du site public · données de démonstration"),
    route + " no internal media label",
  );
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const url = match[1];
    if (!url.startsWith("/_next/") && !url.startsWith("//")) links.add(url);
  }
  console.log("OK", route);
}
for (const route of [
  "/publications/besoin-architecture",
  "/en/publications/besoin-architecture",
  "/activites/atelier-architecture-demo",
  "/projets/inexistant",
  "/cv",
  "/en/resume",
  "/documents/espoir-mulela-cv-fr.pdf",
  "/documents/espoir-mulela-cv-en.pdf",
]) {
  assert.equal(
    (await fetch(base + route)).status,
    404,
    route + " unavailable in production",
  );
}
for (const link of links) {
  assert.ok((await fetch(base + link)).ok, "Link " + link);
}
for (const file of ["/api/og", "/robots.txt", "/sitemap.xml"])
  assert.ok((await fetch(base + file)).ok, file);
const invalid = await fetch(base + "/api/contact", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "",
    email: "bad",
    subject: "wrong",
    message: "short",
  }),
});
assert.equal(invalid.status, 422);
const foreign = await fetch(base + "/api/contact", {
  method: "POST",
  headers: {
    Origin: "https://foreign.example",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(foreign.status, 403);
const oversized = await fetch(base + "/api/contact", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({ message: "x".repeat(25000) }),
});
assert.equal(oversized.status, 413);
const report = {
  date: new Date().toISOString(),
  base,
  pages: pages.length,
  internalLinks: links.size,
  result: "pass",
  checks: [
    "routes",
    "locales",
    "H1",
    "canonical",
    "hreflang",
    "production demo exclusion",
    "FOMIN employer attribution",
    "temporary links excluded",
    "removed CV and OG assets",
    "server validation",
    "origin rejection",
    "body limit",
  ],
};
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync("artifacts/site-checks.json", JSON.stringify(report, null, 2));
console.log(report);
