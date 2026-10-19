import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:8000";
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/, "Local QA only");
const output = "artifacts/ux-refinement";
fs.mkdirSync(output, { recursive: true });
const sizes = [
    [360, 667],
    [375, 812],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 800],
    [1440, 900],
];
const paths = [
    "/",
    "/projets",
    "/a-propos",
    "/activites",
    "/publications",
    "/contact",
    "/en",
    "/en/projects",
    "/en/about",
    "/en/activities",
    "/en/publications",
    "/en/contact",
];
const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
});
const errors = [],
    results = [];
try {
    for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({ colorScheme: theme });
        const page = await context.newPage();
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
            if (m.type() === "error") errors.push(m.text());
        });
        for (const [width, height] of sizes) {
            await page.setViewportSize({ width, height });
            for (const path of paths) {
                const response = await page.goto(base + path, {
                    waitUntil: "networkidle",
                });
                assert.equal(response.status(), 200, path);
                await page.waitForTimeout(700);
                const metrics = await page.evaluate(() => {
                    const rect = (selector) => {
                        const el = document.querySelector(selector);
                        if (!el) return null;
                        const r = el.getBoundingClientRect();
                        return {
                            top: Math.round(r.top),
                            height: Math.round(r.height),
                        };
                    };
                    return {
                        width: document.documentElement.clientWidth,
                        scroll: document.documentElement.scrollWidth,
                        theme: document.documentElement.dataset.theme,
                        portrait: rect(".hero-portrait"),
                        intro: rect(".hero-intro"),
                        project: rect(".index-project"),
                        form: rect(".contact-form"),
                        images: [...document.images]
                            .filter(
                                (i) =>
                                    i.getClientRects().length &&
                                    i.complete &&
                                    !i.naturalWidth,
                            )
                            .map((i) => i.src),
                    };
                });
                const label = `${path} ${width}×${height} ${theme}`;
                assert.ok(
                    metrics.scroll <= metrics.width + 1,
                    label + " overflow",
                );
                assert.equal(metrics.theme, theme, label);
                assert.deepEqual(metrics.images, [], label);
                if (metrics.portrait && width <= 700) {
                    assert.ok(
                        metrics.portrait.top < height - 140,
                        label + " portrait too low",
                    );
                    assert.ok(
                        metrics.portrait.top < metrics.intro.top,
                        label + " portrait must precede long copy",
                    );
                    assert.ok(
                        metrics.portrait.height >= 350,
                        label + " preserve portrait size",
                    );
                }
                if (metrics.form && width === 390) {
                    assert.ok(
                        metrics.form.top < height - 60,
                        label + " form start below viewport",
                    );
                }
                if (metrics.project) {
                    assert.ok(
                        metrics.project.top < height - 100,
                        label + " first project too low",
                    );
                }
                results.push({ path, width, height, theme, ...metrics });
                if ([390, 1440].includes(width)) {
                    await page.screenshot({
                        path: `${output}/${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}-${width}-${theme}.png`,
                    });
                }
            }
        }
        // Public resources are available before media; confidential projects expose none.
        for (const locale of ["fr", "en"]) {
            const prefix = locale === "fr" ? "/projets/" : "/en/projects/";
            await page.goto(base + prefix + "the-agency-drc");
            const action = page.locator(".case-actions a");
            assert.equal(await action.count(), 1);
            assert.equal(
                await action.getAttribute("href"),
                "https://theagency.axumindustries.com/",
            );
            assert.equal(await action.getAttribute("target"), "_blank");
            assert.ok(
                (await action.boundingBox()).y <
                    (await page.locator(".case-media").boundingBox()).y,
            );
            assert.equal(
                await page
                    .locator(".case-story > section > h2")
                    .first()
                    .textContent(),
                locale === "fr" ? "Le contexte du projet." : "Project context.",
            );
            const email = page.locator(".site-footer a[href^='mailto:']");
            assert.equal(
                (await email.textContent()).trim(),
                (await email.getAttribute("href")).slice(7),
            );
            await page.goto(base + prefix + "projet-institutionnel");
            assert.equal(await page.locator(".case-actions a").count(), 0);
        }
        // Short and tall phones, reduced motion, focus, disabled feedback and a long email.
        for (const height of [667, 932]) {
            await page.setViewportSize({ width: 390, height });
            await page.goto(base);
            assert.ok(
                (await page.locator(".hero-portrait").boundingBox()).y <
                    height - 140,
            );
        }
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(base);
        assert.equal(
            await page
                .locator(".hero-portrait")
                .evaluate((el) => getComputedStyle(el).opacity),
            "1",
        );
        assert.ok(
            await page
                .locator(".hero-portrait")
                .evaluate(
                    (el) =>
                        parseFloat(getComputedStyle(el).animationDuration) <=
                        0.001,
                ),
        );
        await page.keyboard.press("Tab");
        assert.equal(
            await page
                .locator(".skip-link")
                .evaluate((el) => el === document.activeElement),
            true,
        );
        await page.keyboard.press("Enter");
        assert.equal(
            await page
                .locator("#main")
                .evaluate((el) => el === document.activeElement),
            true,
        );
        await page.goto(base + "/contact");
        await page.locator("#name").focus();
        assert.notEqual(
            await page
                .locator("#name")
                .evaluate((el) => getComputedStyle(el).outlineStyle),
            "none",
        );
        const button = page.locator(".contact-form button[type=submit]");
        await button.hover();
        assert.equal(
            await button.evaluate((el) => getComputedStyle(el).transform),
            "none",
            "Reduced motion must suppress button hover translation",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await button.evaluate((el) => {
            el.disabled = true;
        });
        await button.hover({ force: true });
        assert.equal(
            await button.evaluate((el) => getComputedStyle(el).transform),
            "none",
        );
        await page
            .locator(".site-footer a[href^='mailto:'] span")
            .evaluate((el) => {
                el.textContent =
                    "long-professional-address-for-layout-check@example.test";
            });
        assert.ok(
            (
                await page
                    .locator(".site-footer a[href^='mailto:']")
                    .boundingBox()
            ).width >=
                (await page.locator(".site-footer .social-links").boundingBox())
                    .width -
                    1,
            "The footer email must span the social links row on mobile",
        );
        assert.ok(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
        );
        await context.close();
    }
    // The production SSR keeps content readable without JavaScript.
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const page = await noJS.newPage();
    for (const path of [
        "/",
        "/en",
        "/contact",
        "/en/contact",
        "/projets/the-agency-drc",
    ]) {
        await page.goto(base + path);
        assert.equal(
            await page.locator("h1").count(),
            1,
            path + " SSR heading",
        );
        assert.equal(await page.locator("h1").isVisible(), true);
        const hidden = await page
            .locator("[data-reveal]")
            .evaluateAll(
                (elements) =>
                    elements.filter(
                        (el) => getComputedStyle(el).opacity === "0",
                    ).length,
            );
        assert.equal(hidden, 0, path + " no-JS content");
    }
    await noJS.close();
    assert.deepEqual(errors, [], "Browser errors");
    fs.writeFileSync(
        `${output}/checks.json`,
        JSON.stringify({ results, errors }, null, 2),
    );
    console.log(
        `${results.length} FR/EN responsive/theme checks; resources, confidentiality, keyboard, reduced motion, long email and no-JS SSR: OK`,
    );
} finally {
    await browser.close();
}
