/* global document, window */
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
// This workflow writes disposable records. Never point it at the daily-use app.
const base = process.argv[2];
assert.equal(
    base,
    "http://127.0.0.1:8001",
    "Dedicated local test server required",
);
assert.equal(
    process.env.E2E_DISPOSABLE,
    "true",
    "Confirm isolated test database",
);
const env = fs.readFileSync(".env", "utf8");
const credentials = process.env.E2E_CREDENTIALS_FILE
    ? JSON.parse(fs.readFileSync(process.env.E2E_CREDENTIALS_FILE, "utf8"))
    : null;
const value = (key) =>
    credentials?.[key === "ADMIN_EMAIL" ? "email" : "password"] ??
    [...env.matchAll(new RegExp("^" + key + "=(.*)$", "gm"))]
        .at(-1)?.[1]
        .trim()
        .replace(/^['"]|['"]$/g, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const go = async (url) => {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
        await document.fonts.ready;
    });
};
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const select = async (id, label) => {
    await page.locator("#" + id).click();
    await page.getByRole("option", { name: label, exact: true }).click();
};
const lang = async (l) => {
    await page
        .locator("#session-language")
        .getByRole("button", { name: l.toUpperCase(), exact: true })
        .click();
    await page.waitForFunction((l) => document.documentElement.lang === l, l);
};
const save = async (target) => {
    const submitted = page.waitForResponse(
        (response) =>
            ["POST", "PUT"].includes(response.request().method()) &&
            new URL(response.url()).pathname.startsWith("/admin/"),
    );
    await page
        .getByRole("button", { name: "Enregistrer ↗", exact: true })
        .click();
    await submitted;
    await page.waitForLoadState("networkidle");
    await go(base + target);
};
try {
    await go(base + "/login");
    await page.locator("#email").fill(value("ADMIN_EMAIL"));
    await page.locator("#password").fill(value("ADMIN_PASSWORD"));
    await page.getByRole("button", { name: /Se connecter/ }).click();
    await page.waitForURL(base + "/admin", { timeout: 15000 });
    // Multiple pages, active/disabled links, filtering and reset.
    await go(base + "/admin/projects");
    await page
        .getByRole("navigation", { name: "Pagination" })
        .getByRole("link", { name: "2", exact: true })
        .click();
    await page.waitForURL("**page=2");
    assert.equal(
        await page
            .getByRole("navigation", { name: "Pagination" })
            .getByRole("link", { name: "2", exact: true })
            .getAttribute("aria-current"),
        "page",
    );
    await page.getByRole("button", { name: "Réinitialiser" }).click();
    await page.waitForURL(base + "/admin/projects");
    await page.locator("#search").fill("Pagination automatique");
    await select("status", "Brouillon");
    await page.getByRole("button", { name: "Filtrer", exact: true }).click();
    await page.waitForURL("**status=draft");
    assert.equal(await page.locator("tbody tr").count(), 8);
    await page.getByRole("button", { name: "Réinitialiser" }).click();
    await page.waitForURL(base + "/admin/projects");
    assert.equal(await page.locator("#search").inputValue(), "");
    for (const type of ["projects", "activities", "publications"]) {
        const slug = "automatic-ui-" + type + "-" + Date.now();
        await go(base + "/admin/" + type + "/create");
        for (const l of ["fr", "en"]) {
            const tab = page.getByRole("button", {
                name: l === "fr" ? "Français" : "English",
                exact: true,
            });
            if ((await tab.getAttribute("aria-pressed")) !== "true")
                await tab.click();
            for (const [key, text] of [
                ["title", "Automatic UI " + slug + " " + l],
                ["slug", slug + "-" + l],
                [
                    type === "activities" ? "summary" : "excerpt",
                    "Disposable local browser verification.",
                ],
                [
                    type === "publications" ? "body" : "description",
                    "## Verification\n\n**Text**, [link](https://example.com), inline code \\`draft\\`.\n\n- First item\n- Second item",
                ],
            ])
                await page.locator('[id="' + key + "." + l + '"]').fill(text);
        }
        if (type === "activities")
            await page.locator("#event_date").fill("2026-10-03");
        await lang("en");
        assert.equal(
            await page.locator('[id="title.en"]').inputValue(),
            "Automatic UI " + slug + " en",
        );
        await lang("fr");
        await select("publication-status", "Publié");
        await save("/admin/" + type);
        const row = page
            .locator("tbody tr")
            .filter({ hasText: "Automatic UI " + slug + " fr" });
        await row.getByRole("link", { name: "Modifier", exact: true }).click();
        await page.waitForURL("**/edit");
        const edit = page.url();
        const id = edit.match(/\/(\d+)\/edit$/)[1];
        await page
            .locator('[id="title.fr"]')
            .fill("Edited automatic UI " + slug);
        await save("/admin/" + type);
        const segment = {
            projects: "projets",
            activities: "activites",
            publications: "publications",
        }[type];
        await go(base + "/" + segment + "/" + slug + "-fr");
        assert.ok(
            await page
                .getByRole("heading", {
                    name: "Edited automatic UI " + slug,
                    exact: true,
                })
                .isVisible(),
        );
        await go(base + "/admin/" + type);
        const updated = page
            .locator("tbody tr")
            .filter({ hasText: "Edited automatic UI " + slug });
        await updated.getByRole("button", { name: "Autres actions" }).click();
        await page
            .getByRole("menuitem", { name: "Archiver", exact: true })
            .click();
        await page.waitForLoadState("networkidle");
        await go(base + "/" + segment + "/" + slug + "-fr");
        assert.ok(
            await page
                .getByRole("heading", { name: /introuvable/i })
                .isVisible(),
        );
        await go(base + "/admin/" + type);
        await page
            .locator("tbody tr")
            .filter({ hasText: "Edited automatic UI " + slug })
            .getByRole("button", { name: "Autres actions" })
            .click();
        await page
            .getByRole("menuitem", { name: "Supprimer", exact: true })
            .click();
        const deleted = page.waitForResponse(
            (response) => response.request().method() === "DELETE",
        );
        await page
            .getByRole("dialog")
            .getByRole("button", { name: "Supprimer", exact: true })
            .click();
        await deleted;
        await updated.waitFor({ state: "hidden" });
        await page.waitForLoadState("networkidle");
        assert.equal(
            await page
                .locator("tbody tr")
                .filter({ hasText: "Edited automatic UI " + slug })
                .count(),
            0,
            id + " removed",
        );
    }
    // MailHog only: exercise the current contact and branded SMTP path.
    const mail = async () => {
        const r = await context.request.get(
            "http://127.0.0.1:8025/api/v2/messages",
        );
        assert.equal(r.status(), 200);
        return r.json();
    };
    const before = (await mail()).total;
    const contactName = "Automatic isolated QA " + Date.now();
    await go(base + "/contact");
    await page.locator("#name").fill(contactName);
    await page.locator("#email").fill("automatic@example.test");
    await select("subject", "Autre");
    await page
        .locator("#message")
        .fill(
            "Disposable contact message for isolated local QA and MailHog verification.",
        );
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await page.locator(".form-status").waitFor();
    const after = await mail();
    assert.equal(after.total, before + 2);
    assert.ok(
        after.items
            .slice(0, 2)
            .every((m) => /role=(?:3D)?"presentation"/.test(m.Content.Body)),
    );
    await go(base + "/admin/messages");
    const message = page.locator("tbody tr").filter({ hasText: contactName });
    await message.getByRole("link", { name: "Lire", exact: true }).click();
    await page.waitForURL(/\/admin\/messages\/\d+$/);
    await page.getByRole("button", { name: "Archiver", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Autres actions" }).click();
    await page
        .getByRole("menuitem", { name: "Supprimer", exact: true })
        .click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Supprimer", exact: true })
        .click();
    await page.waitForURL(base + "/admin/messages");
    // Absolute back-to-top with and without reduced motion.
    for (const motion of ["no-preference", "reduce"]) {
        await page.emulateMedia({ reducedMotion: motion });
        await go(base + "/a-propos");
        await page.evaluate(() =>
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "instant",
            }),
        );
        await page.locator(".back-to-top").click();
        await page.waitForFunction(() => window.scrollY === 0);
        assert.equal(await page.evaluate(() => window.scrollY), 0);
    }
    assert.deepEqual(errors, []);
    fs.mkdirSync("artifacts/laravel", { recursive: true });
    fs.writeFileSync(
        "artifacts/admin-workflows.json",
        JSON.stringify(
            {
                passed: true,
                workflows: [
                    "pagination/filter/reset",
                    "project/activity/publication CRUD/archive",
                    "session FR/EN preserves input",
                    "contact/MailHog",
                    "message read/archive/delete",
                    "back-to-top exact zero/reduced motion",
                ],
                errors,
            },
            null,
            2,
        ),
    );
    console.log(
        "Isolated admin workflows, pagination, MailHog and back-to-top: OK",
    );
} catch (error) {
    await page.screenshot({
        path: "artifacts/laravel/workflow-failure.png",
        fullPage: true,
    });
    console.log(
        await page.locator('.form-error,[role="alert"]').allTextContents(),
    );
    throw error;
} finally {
    await browser.close();
}
