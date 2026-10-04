import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://127.0.0.1:8000";
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/, "Local QA only");
fs.mkdirSync("artifacts/laravel", { recursive: true });
const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
});
const errors = [],
    results = [];
try {
    for (const theme of process.argv.includes("--admin-only")
        ? []
        : ["light", "dark"]) {
        const context = await browser.newContext({ colorScheme: theme });
        const page = await context.newPage();
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
            if (m.type() === "error") errors.push(page.url() + ": " + m.text());
        });
        for (const width of process.argv.includes("--quick")
            ? [390, 1440]
            : [375, 390, 430, 768, 820, 1024, 1440]) {
            await page.setViewportSize({ width, height: 960 });
            for (const path of process.argv.includes("--quick")
                ? ["/", "/contact"]
                : [
                      "/",
                      "/en",
                      "/projets",
                      "/a-propos",
                      "/contact",
                      "/activites",
                      "/publications",
                      "/projets/maliyaflow",
                      "/projets/projet-institutionnel",
                      "/projets/the-agency-drc",
                      "/login",
                      "/forgot-password",
                  ]) {
                await page.goto(base + path, { waitUntil: "networkidle" });
                await page.waitForTimeout(850);
                for (
                    let y = 0;
                    y < (await page.evaluate(() => document.body.scrollHeight));
                    y += 700
                ) {
                    await page.evaluate(
                        (y) => window.scrollTo({ top: y, behavior: "instant" }),
                        y,
                    );
                    await page.waitForTimeout(20);
                }
                await page.waitForTimeout(450);
                await page.waitForFunction(() =>
                    [...document.images].every(
                        (image) =>
                            !image.getClientRects().length || image.complete,
                    ),
                );
                const metrics = await page.evaluate(() => ({
                    width: document.documentElement.clientWidth,
                    scroll: document.documentElement.scrollWidth,
                    theme: document.documentElement.dataset.theme,
                    images: [...document.images]
                        .filter(
                            (i) => i.getClientRects().length && !i.naturalWidth,
                        )
                        .map((i) => i.src),
                    html: document.querySelectorAll("html").length,
                    body: document.querySelectorAll("body").length,
                    h1: document.querySelectorAll("h1").length,
                    heroAnimation: document.querySelector(".hero-portrait")
                        ? getComputedStyle(
                              document.querySelector(".hero-portrait"),
                          ).animationName
                        : null,
                }));
                assert.ok(
                    metrics.scroll <= metrics.width + 1,
                    path + " " + width + " overflow " + metrics.scroll,
                );
                assert.equal(metrics.theme, theme);
                assert.equal(metrics.html, 1);
                assert.equal(metrics.body, 1);
                assert.equal(metrics.h1, 1);
                assert.deepEqual(metrics.images, []);
                if (metrics.heroAnimation !== null)
                    assert.notEqual(
                        metrics.heroAnimation,
                        "none",
                        "Hero motion tokens must be applied",
                    );
                results.push({ path, width, theme, pass: true });
                if ([390, 1440].includes(width)) {
                    await page.evaluate(() =>
                        window.scrollTo({ top: 0, behavior: "instant" }),
                    );
                    await page.waitForTimeout(600);
                    await page.screenshot({
                        path:
                            "artifacts/laravel/" +
                            (path === "/"
                                ? "home"
                                : path.replaceAll("/", "-").slice(1)) +
                            "-" +
                            width +
                            "-" +
                            theme +
                            ".png",
                        fullPage: true,
                    });
                }
            }
        }
        // Inertia navigation, translated project locale, keyboard controls, theme persistence and mobile focus.
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(base + "/projets/maliyaflow");
        await page.locator(".locale-switch").click();
        await page.waitForURL("**/en/projects/maliyaflow");
        await page.waitForLoadState("networkidle");
        if ((await page.locator("html").getAttribute("data-theme")) !== "dark")
            await page.locator("button.theme-toggle").click();
        await page.reload();
        assert.equal(
            await page.locator("html").getAttribute("data-theme"),
            "dark",
        );
        await page.locator(".mobile-trigger").click();
        assert.ok(await page.locator("dialog").isVisible());
        await page.keyboard.press("Escape");
        await page
            .locator("dialog")
            .waitFor({ state: "hidden", timeout: 5000 });
        assert.ok(!(await page.locator("dialog").isVisible()));
        await context.close();
    }
    if (process.argv.includes("--admin")) {
        const localEnv = fs.readFileSync(".env", "utf8");
        const value = (key) =>
            localEnv
                .match(new RegExp("^" + key + "=(.*)$", "m"))?.[1]
                ?.trim()
                .replace(/^['"]|['"]$/g, "");
        const credentials = {
            email: process.env.E2E_ADMIN_EMAIL ?? value("ADMIN_EMAIL"),
            password: process.env.E2E_ADMIN_PASSWORD ?? value("ADMIN_PASSWORD"),
        };
        assert.ok(
            credentials.email && credentials.password,
            "Configure local E2E admin credentials",
        );
        const context = await browser.newContext();
        const page = await context.newPage();
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + "/login");
        await page.locator("#email").fill(credentials.email);
        await page.locator("#password").fill(credentials.password);
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("**/admin");
        for (const theme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: theme });
            await page.goto(base + "/admin");
            if (
                (await page.locator("html").getAttribute("data-theme")) !==
                theme
            )
                await page.locator("button.theme-toggle").click();
            for (const width of process.argv.includes("--quick")
                ? [390, 1440]
                : [375, 390, 430, 768, 820, 1024, 1440]) {
                await page.setViewportSize({ width, height: 960 });
                for (const path of [
                    "/admin",
                    "/admin/projects",
                    "/admin/projects/1/edit",
                    "/admin/publications/create",
                    "/admin/activities/create",
                    "/admin/experiences",
                    "/admin/education",
                    "/admin/skill-categories",
                    "/admin/education/1/edit",
                    "/admin/experiences/create",
                    "/admin/skills/create",
                    "/admin/certifications/create",
                    "/admin/social-links/1/edit",
                    "/admin/settings",
                    "/admin/messages",
                    "/admin/media",
                    "/admin/profile",
                    "/admin/publications",
                    "/admin/activities",
                    "/admin/certifications",
                    "/admin/skills",
                    "/admin/social-links",
                ]) {
                    await page.goto(base + path, { waitUntil: "networkidle" });
                    const metrics = await page.evaluate(() => ({
                        width: document.documentElement.clientWidth,
                        scroll: document.documentElement.scrollWidth,
                    }));
                    assert.ok(
                        metrics.scroll <= metrics.width + 1,
                        path + " " + width + " overflow " + metrics.scroll,
                    );
                    assert.equal(
                        await page.locator("select").count(),
                        0,
                        "No native selects in admin",
                    );
                    assert.equal(
                        await page.locator("html").getAttribute("data-theme"),
                        theme,
                    );
                    if (width <= 900) {
                        await page
                            .getByRole("button", { name: "Menu", exact: true })
                            .click();
                        assert.ok(
                            await page.locator("dialog[open]").isVisible(),
                        );
                        assert.equal(
                            await page.evaluate(
                                () => document.body.style.overflow,
                            ),
                            "hidden",
                        );
                        const active = await page.evaluate(
                            () =>
                                document.activeElement.closest("dialog") !==
                                null,
                        );
                        assert.ok(active);
                        await page.keyboard.press("Escape");
                        await page
                            .locator(".admin-drawer")
                            .waitFor({ state: "hidden" });
                        assert.equal(
                            await page.evaluate(
                                () => document.body.style.overflow,
                            ),
                            "",
                        );
                    }
                    if (path.includes("/create")) {
                        const select = page.getByRole("combobox").first();
                        if (await select.count()) {
                            await select.click();
                            assert.ok(
                                await page.getByRole("listbox").isVisible(),
                            );
                            await page.keyboard.press("Escape");
                        }
                    }
                    if (path === "/admin/projects") {
                        await page
                            .getByRole("button", {
                                name: "Autres actions",
                                exact: true,
                            })
                            .first()
                            .click();
                        assert.ok(await page.getByRole("menu").isVisible());
                        await page.keyboard.press("Escape");
                        await page
                            .getByRole("button", {
                                name: "Autres actions",
                                exact: true,
                            })
                            .first()
                            .click();
                        await page
                            .getByRole("menuitem", {
                                name: "Supprimer",
                                exact: true,
                            })
                            .click();
                        assert.ok(
                            await page
                                .getByRole("dialog", {
                                    name: "Supprimer ce contenu ?",
                                })
                                .isVisible(),
                        );
                        await page
                            .getByRole("button", {
                                name: "Annuler",
                                exact: true,
                            })
                            .click();
                        assert.equal(
                            await page.evaluate(
                                () => document.body.style.overflow,
                            ),
                            "",
                        );
                    }
                    results.push({ path, width, theme, pass: true });
                    if (path === "/admin" && [390, 1440].includes(width))
                        await page.screenshot({
                            path:
                                "artifacts/laravel/admin-" +
                                width +
                                "-" +
                                theme +
                                ".png",
                            fullPage: true,
                        });
                }
            }
        }
        await context.close();
    }
    assert.deepEqual(errors, [], "Browser errors");
    fs.writeFileSync(
        "artifacts/browser-checks.json",
        JSON.stringify({ results, errors }, null, 2),
    );
    console.log(
        results.length +
            " responsive/theme checks and navigation interactions: OK",
    );
} finally {
    await browser.close();
}
