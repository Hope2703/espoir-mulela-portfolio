import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
// Avoid an Undici parser regression in Node 24 when Laravel closes connections.
function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const transport = url.startsWith("https:") ? https : http;
        const request = transport.get(url, { agent: false }, (response) => {
            const chunks = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("error", reject);
            response.on("end", () => {
                if (
                    response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.headers.location &&
                    options.redirect !== "manual"
                ) {
                    resolve(
                        fetch(
                            new URL(response.headers.location, url).href,
                            options,
                        ),
                    );
                    return;
                }
                resolve({
                    status: response.statusCode,
                    ok: response.statusCode >= 200 && response.statusCode < 300,
                    headers: {
                        get: (key) => response.headers[key.toLowerCase()],
                    },
                    text: async () => Buffer.concat(chunks).toString("utf8"),
                });
            });
        });
        request.on("error", reject);
        request.setTimeout(30000, () =>
            request.destroy(new Error("HTTP check timeout: " + url)),
        );
    });
}
const base = process.argv[2] ?? "http://127.0.0.1:8000";

const projects = JSON.parse(
    fs.readFileSync("database/seeders/data/portfolio.json", "utf8"),
).projects;
const expectedPages = 12 + projects.length * 2;
const routes = [
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
    ...projects.flatMap((p) => [
        "/projets/" + p.slug,
        "/en/projects/" + p.slug,
    ]),
];
const results = [];
for (const path of routes) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal(
        (html.match(/<h1(?:\s|>)/g) ?? []).length,
        1,
        path + " SSR H1",
    );
    assert.match(html, /rel="canonical"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(
        html,
        new RegExp(
            '<html[^>]+lang="' + (path.startsWith("/en") ? "en" : "fr") + '"',
        ),
    );
    assert.ok(/hreflang="fr"/i.test(html), path + " FR alternate");
    assert.ok(/hreflang="en"/i.test(html), path + " EN alternate");
    results.push({ path, status: response.status, ssr: true });
}
for (const path of [
    "/cv",
    "/resume",
    "/register",
    "/projets/does-not-exist",
    "/publications/missing",
])
    assert.equal((await fetch(base + path)).status, 404, path);
assert.equal(
    (await fetch(base + "/admin", { redirect: "manual" })).status,
    302,
);
for (const [from, to] of [
    ["maliflow", "maliyaflow"],
    ["association-web-platform", "libiki-lya-kongo"],
]) {
    const response = await fetch(base + "/projets/" + from, {
        redirect: "manual",
    });
    assert.equal(response.status, 301);
    assert.ok(response.headers.get("location").endsWith("/projets/" + to));
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<loc>/g) ?? []).length, expectedPages);
assert.ok(!sitemap.includes("/admin"));
for (const image of projects.flatMap((p) => p.media))
    assert.ok((await fetch(base + "/storage" + image.src)).ok, image.src);
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
    "artifacts/site-checks.json",
    JSON.stringify(results, null, 2),
);
console.log(
    expectedPages +
        " pages FR/EN, SSR, SEO, 404, redirections, sitemap et médias : OK",
);
