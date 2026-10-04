import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:3002";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))
  throw Error("Local QA server only");
fs.mkdirSync("artifacts", { recursive: true });
assert.equal(
  (await (await fetch(base + "/api/contact")).json()).available,
  false,
  "Disable email delivery before running local browser checks",
);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_CHANNEL }
    : {}),
});
const errors = [];
const results = [];
const widths = process.argv.includes("--interactions")
  ? []
  : [375, 390, 430, 768, 820, 1024, 1440];
async function select(page, id, label) {
  await page.locator(`#${id}`).click();
  await page.getByRole("option", { name: label, exact: true }).click();
}
const routes = [
  "/",
  "/projets",
  "/a-propos",
  "/contact",
  "/activites",
  "/publications",
  "/projets/maliyaflow",
  "/projets/projet-institutionnel",
];
try {
  await Promise.all(
    ["light", "dark"].map(async (theme) => {
      const context = await browser.newContext({
        colorScheme: theme,
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" ||
          /script tag|scroll-behavior/.test(message.text())
        ) {
          const detail = `${page.url()}: ${message.text()} (${message.location().url})`;
          errors.push(detail);
          console.error(detail);
        }
      });
      for (const width of widths) {
        await page.setViewportSize({ width, height: 960 });
        for (const route of routes) {
          await page.goto(base + route, { waitUntil: "networkidle" });
          await page.waitForTimeout(1600);
          for (
            let y = 0;
            y < (await page.evaluate(() => document.body.scrollHeight));
            y += 800
          ) {
            await page.evaluate(
              (y) => window.scrollTo({ top: y, behavior: "instant" }),
              y,
            );
            await page.waitForTimeout(35);
          }
          await page.waitForFunction(() =>
            [...document.images].every(
              (image) => !image.getClientRects().length || image.complete,
            ),
          );
          const check = await page.evaluate(() => ({
            width: document.documentElement.clientWidth,
            scroll: document.documentElement.scrollWidth,
            theme: document.documentElement.dataset.theme,
            html: document.querySelectorAll("html").length,
            body: document.querySelectorAll("body").length,
            broken: [...document.images]
              .filter(
                (image) => image.getClientRects().length && !image.naturalWidth,
              )
              .map((image) => image.src),
          }));
          assert.ok(
            check.scroll <= check.width + 1,
            `${route} ${width} ${theme} overflow: ${check.scroll}`,
          );
          assert.equal(check.theme, theme);
          assert.equal(check.html, 1);
          assert.equal(check.body, 1);
          assert.deepEqual(check.broken, [], route);
          results.push({ route, width, theme, pass: true });
          await page.evaluate(() =>
            window.scrollTo({ top: 0, behavior: "instant" }),
          );
          const capture =
            route === "/" && [390, 1440].includes(width)
              ? `home-${width === 390 ? "mobile" : "desktop"}-${theme}`
              : width === 1440 &&
                  theme === "light" &&
                  ["/projets", "/a-propos", "/contact"].includes(route)
                ? route.slice(1)
                : null;
          if (capture) {
            await page.waitForTimeout(850);
            await page.screenshot({
              path: `artifacts/${capture}.png`,
              fullPage: true,
            });
          }
        }
        console.log(`Responsive ${width}px ${theme}: passed`);
      }
      await context.close();
    }),
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /script tag|scroll-behavior/.test(message.text())
    )
      errors.push(
        `${page.url()}: ${message.text()} (${message.location().url})`,
      );
  });
  await page.goto(base, { waitUntil: "networkidle" });
  const skip = page.locator(".skip-link");
  assert.ok(await skip.evaluate((el) => el.getBoundingClientRect().bottom < 0));
  await page.keyboard.press("Tab");
  assert.equal(
    await skip.evaluate(
      (el) => el === document.activeElement && el.matches(":focus-visible"),
    ),
    true,
  );
  await page.keyboard.press("Tab");
  assert.ok(await skip.evaluate((el) => el.getBoundingClientRect().bottom < 0));
  assert.equal(
    await page
      .locator('[data-sequence="process"]')
      .getAttribute("data-revealed"),
    "false",
  );
  await page.evaluate(() => {
    document.documentElement.dataset.processStarts = "0";
    document.addEventListener("animationstart", (event) => {
      if (
        event.target instanceof Element &&
        event.target.matches('[data-sequence="process"] > li')
      ) {
        document.documentElement.dataset.processStarts = String(
          Number(document.documentElement.dataset.processStarts) + 1,
        );
      }
    });
  });
  await page.locator('[data-sequence="process"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-sequence="process"]')
        ?.getAttribute("data-revealed") === "true",
  );
  await page.waitForTimeout(900);
  const firstStart = await page
    .locator("html")
    .getAttribute("data-process-starts");
  assert.ok(Number(firstStart) >= 5);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
  await page.locator('[data-sequence="process"]').scrollIntoViewIfNeeded();
  assert.equal(
    await page.locator("html").getAttribute("data-process-starts"),
    firstStart,
    "Process plays once",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page
    .getByRole("button", { name: "Retour en haut" })
    .waitFor({ state: "hidden" });
  assert.equal(
    await page.locator("html").getAttribute("data-scroll-behavior"),
    "smooth",
  );
  assert.equal(await page.locator("select").count(), 0);
  assert.equal(
    await page.getByRole("button", { name: "Retour en haut" }).isVisible(),
    false,
  );
  await page.getByLabel("Ouvrir le menu").click();
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), true);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
  assert.equal(
    await page
      .getByLabel("Ouvrir le menu")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.getByLabel("Ouvrir le menu").click();
  await page
    .locator("dialog")
    .getByRole("link", { name: /Contact/ })
    .click();
  await page.waitForURL("**/contact");
  for (const route of ["/activites", "/publications", "/"]) {
    await page.locator(`.site-footer nav a[href="${route}"]`).click();
    await page.waitForURL(base + route);
    await page.locator("h1").waitFor();
  }
  await page.locator("#footer-theme").focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("End");
  assert.equal(
    await page.locator("#footer-theme").getAttribute("aria-activedescendant"),
    "footer-theme-option-2",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#footer-theme").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page
      .locator("#footer-theme")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await select(page, "footer-theme", "Clair");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await select(page, "footer-theme", "Système");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "light",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await page.getByRole("button", { name: "Retour en haut" }).click();
  await page.waitForFunction(() => window.scrollY === 0);
  assert.equal(
    await skip.evaluate((el) => el === document.activeElement),
    false,
  );
  assert.ok(await skip.evaluate((el) => el.getBoundingClientRect().bottom < 0));
  assert.equal(new URL(page.url()).hash, "");
  for (const method of ["keyboard", "touch"]) {
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    const top = page.getByRole("button", { name: "Retour en haut" });
    await top.waitFor({ state: "visible" });
    if (method === "keyboard") {
      await top.focus();
      await page.keyboard.press("Enter");
    } else await top.tap();
    await page.waitForFunction(() => window.scrollY === 0);
    assert.ok(
      await skip.evaluate((el) => el.getBoundingClientRect().bottom < 0),
    );
    assert.equal(new URL(page.url()).hash, "");
  }
  assert.equal(
    await page
      .locator(".hero-first-line")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.locator('[data-sequence="process"]').scrollIntoViewIfNeeded();
  assert.equal(
    await page
      .locator('[data-sequence="process"] > li')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.equal(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
    "auto",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page
      .locator(".hero-first-line")
      .evaluate((el) => getComputedStyle(el).animationDelay),
    "0.08s",
  );
  assert.equal(
    await page
      .locator(".hero-portrait")
      .evaluate((el) => getComputedStyle(el).animationDelay),
    "0.46s",
  );
  await page.locator('.hero .actions a[href="/projets"]').click();
  await page.waitForURL("**/projets");
  await page.goBack();
  await page.locator(".hero-first-line").waitFor();
  assert.equal(new URL(page.url()).pathname, "/");
  await page.goto(base + "/projets/maliyaflow", { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Calendrier des tâches et sélection du jour" })
    .click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".gallery-caption").count(), 0);
  assert.equal(await page.locator(".maliya-media a").count(), 0);
  await page.locator(".locale-switch").click();
  await page.waitForURL("**/en/projects/maliyaflow");
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily.includes("manrope")),
    true,
  );
  await select(page, "footer-language", "Français");
  await page.waitForURL("**/projets/maliyaflow");
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  await page.goto(base + "/contact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  assert.equal(
    await page.locator("#name").getAttribute("aria-invalid"),
    "true",
  );
  await page.locator("#name").fill("Local QA");
  await page.locator("#email").fill("qa@example.test");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  assert.equal(
    await page
      .locator("#subject")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press("Enter");
  await page.keyboard.press("p");
  await page.keyboard.press("r");
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator('input[name="subject"]').inputValue(),
    "project",
  );
  const message = "Local verification only. No email service is configured.";
  await page.locator("#message").fill(message);
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "L’envoi est indisponible" })
    .waitFor();
  assert.equal(await page.locator("#message").inputValue(), message);
  await context.close();
  // Theme initialization is checked without hydration: it must run before the body is parsed.
  const prepaint = await browser.newContext({ colorScheme: "light" });
  const raw = await prepaint.newPage();
  await raw.addInitScript(() => localStorage.setItem("espoir-theme", "dark"));
  await raw.route("**/_next/**/*.js*", (route) => route.abort());
  await raw.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await raw.locator("html").getAttribute("data-theme"), "dark");
  assert.ok(await raw.locator("h1").isVisible());
  await prepaint.close();
  const blockedStorage = await browser.newContext({ colorScheme: "dark" });
  const blockedPage = await blockedStorage.newPage();
  await blockedPage.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await blockedPage.goto(base, { waitUntil: "networkidle" });
  assert.equal(
    await blockedPage.locator("html").getAttribute("data-theme"),
    "dark",
  );
  await select(blockedPage, "footer-theme", "Clair");
  assert.equal(
    await blockedPage.locator("html").getAttribute("data-theme"),
    "light",
  );
  await blockedStorage.close();
  fs.writeFileSync(
    "artifacts/browser-checks.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        results,
        errors,
        interactions: "pass",
        preHydrationTheme: "pass",
      },
      null,
      2,
    ),
  );
  assert.deepEqual(errors, [], "Browser console and runtime");
  console.log(
    `${results.length} responsive checks, interactions and pre-hydration theme passed.`,
  );
} finally {
  await browser.close();
}
