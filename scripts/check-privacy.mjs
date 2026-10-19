import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:8002";
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/, "Local QA only");
const paths = [
    "/",
    "/en",
    "/projets",
    "/en/projects",
    "/a-propos",
    "/en/about",
    "/contact",
    "/en/contact",
    "/projets/projet-institutionnel",
    "/en/projects/projet-institutionnel",
];
const forbidden =
    /PRIVATE-QA-|private-qa\.example\.test|fomin|redevance|mining royalty/i;
const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
});
const results = [],
    errors = [];
fs.mkdirSync("artifacts/privacy-qa", { recursive: true });
try {
    const context = await browser.newContext({ javaScriptEnabled: false });
    for (const path of paths) {
        const response = await context.request.get(base + path);
        assert.equal(response.status(), 200, path);
        const html = await response.text();
        assert.doesNotMatch(html, forbidden, path + " raw SSR HTML");
        assert.equal(
            (html.match(/<h1(?:\s|>)/g) ?? []).length,
            1,
            path + " production SSR",
        );
        const payload = JSON.parse(
            html.match(
                /<script data-page="app" type="application\/json">([\s\S]*?)<\/script>/,
            )?.[1] ?? "null",
        );
        assert.ok(payload?.version, "Inertia payload and version required");
        const inertia = await context.request.get(base + path, {
            headers: {
                "X-Inertia": "true",
                "X-Inertia-Version": payload.version,
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        assert.equal(inertia.status(), 200);
        assert.equal(inertia.headers()["x-inertia"], "true");
        assert.doesNotMatch(
            await inertia.text(),
            forbidden,
            path + " Inertia JSON",
        );
        if (path.endsWith("projet-institutionnel")) {
            assert.deepEqual(payload.props.project.media, []);
            assert.deepEqual(payload.props.project.links, []);
            assert.equal(payload.props.project.role, null);
            assert.equal(
                payload.props.meta.jsonLd["@graph"][2].itemListElement[2].name,
                payload.props.project.title[payload.props.locale],
            );
        }
        results.push({
            path,
            ssr: true,
            inertia: true,
            privateMarkersAbsent: true,
        });
    }
    for (const path of [
        "/storage/uploads/project/private-qa.txt",
        "/storage/images/projects/fomin/fomin-dashboard.png",
        "/images/projects/fomin/fomin-dashboard.png",
    ]) {
        assert.equal(
            (await context.request.get(base + path)).status(),
            404,
            path,
        );
        assert.equal(
            (await context.request.head(base + path)).status(),
            404,
            path,
        );
    }
    await context.close();
    for (const theme of ["light", "dark"]) {
        const visual = await browser.newContext({ colorScheme: theme });
        const page = await visual.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        for (const width of [390, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            for (const path of [
                "/projets/projet-institutionnel",
                "/en/projects/projet-institutionnel",
                "/a-propos",
                "/en/about",
            ]) {
                await page.goto(base + path, { waitUntil: "networkidle" });
                await page.waitForTimeout(800);
                assert.doesNotMatch(await page.content(), forbidden);
                assert.ok(
                    await page
                        .locator("html")
                        .evaluate(
                            (element) =>
                                element.scrollWidth <= element.clientWidth + 1,
                        ),
                    path + " overflow",
                );
                if (path.includes("projet-institutionnel"))
                    assert.equal(
                        await page.locator(".case-media img").count(),
                        0,
                    );
                // Reveal the existing scroll animations before full-page visual QA.
                const height = await page
                    .locator("body")
                    .evaluate((element) => element.scrollHeight);
                for (let top = 0; top < height; top += 600) {
                    await page
                        .locator("html")
                        .evaluate(
                            (element, y) =>
                                element.scrollTo({
                                    top: y,
                                    behavior: "instant",
                                }),
                            top,
                        );
                    await page.waitForTimeout(80);
                }
                await page
                    .locator("html")
                    .evaluate((element) =>
                        element.scrollTo({ top: 0, behavior: "instant" }),
                    );
                await page.waitForTimeout(600);
                await page.screenshot({
                    path: `artifacts/privacy-qa/${path.replaceAll("/", "-").slice(1)}-${width}-${theme}.png`,
                    fullPage: true,
                });
                results.push({ path, width, theme, hydrated: true });
            }
        }
        await visual.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(
        "artifacts/privacy-qa/checks.json",
        JSON.stringify({ results, errors }, null, 2),
    );
    console.log(
        `${paths.length} FR/EN SSR and Inertia checks, private media GET/HEAD and 16 browser views: OK`,
    );
} finally {
    await browser.close();
}
